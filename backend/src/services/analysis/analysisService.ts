import { gitService } from '../git/gitService';
import { repositoryAnalyzer } from './repositoryAnalyzer';
import { FrameworkDetector } from './frameworkDetector';
import { DependencyExtractor } from './dependencyExtractor';
import { DependencyGraphBuilder } from './dependencyGraphBuilder';
import { ProjectModel } from '../../models/Project';
import { AnalysisStatusModel } from '../../models/AnalysisStatus';
import { AnalysisResultModel } from '../../models/AnalysisResult';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

interface AnalysisOptions {
  branch?: string;
  depth?: number;
  force?: boolean;
}

interface AnalysisJob {
  id: string;
  projectId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

// In-memory job tracking for development (when Redis is not available)
const activeJobs = new Map<string, AnalysisJob>();

export async function performAnalysis(
  projectId: string,
  options: AnalysisOptions = {}
): Promise<AnalysisJob> {
  const jobId = `job_${uuidv4()}`;
  const job: AnalysisJob = {
    id: jobId,
    projectId,
    status: 'pending',
    progress: 0
  };

  activeJobs.set(jobId, job);

  // Run analysis asynchronously
  runAnalysis(projectId, jobId, options).catch(error => {
    logger.error(`Analysis failed for project ${projectId}:`, error);
    const job = activeJobs.get(jobId);
    if (job) {
      job.status = 'failed';
      job.error = error.message;
    }
  });

  return job;
}

async function runAnalysis(
  projectId: string,
  jobId: string,
  options: AnalysisOptions
): Promise<void> {
  const job = activeJobs.get(jobId);
  if (!job) return;

  job.status = 'running';
  
  try {
    // Get project details
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    // Create or update analysis status
    let status = await AnalysisStatusModel.findByProjectId(projectId);
    if (!status) {
      status = await AnalysisStatusModel.create({
        projectId,
        status: 'cloning',
        progress: 0
      });
    } else {
      await AnalysisStatusModel.update(status.id, {
        status: 'cloning',
        progress: 0,
        error: null,
        startedAt: new Date()
      });
    }

    job.progress = 10;

    // Clone repository
    logger.info(`Cloning repository: ${project.repositoryUrl}`);
    const repoPath = await gitService.cloneRepository(
      project.repositoryUrl,
      projectId,
      {
        branch: options.branch,
        depth: options.depth || 10,
        single: true
      }
    );

    await AnalysisStatusModel.update(status.id, {
      status: 'scanning',
      progress: 20
    });
    job.progress = 20;

    // Scan repository structure
    logger.info(`Scanning repository structure for project: ${projectId}`);
    const structure = await repositoryAnalyzer.analyzeRepository(project as any, repoPath);

    await AnalysisStatusModel.update(status.id, {
      status: 'analyzing',
      progress: 40,
      currentStep: 'Detecting frameworks and languages'
    });
    job.progress = 40;

    // Detect project type and frameworks
    const projectType = await repositoryAnalyzer.detectProjectType(structure.files);
    const importantFiles = repositoryAnalyzer.findImportantFiles(structure.files);
    const frameworks = await FrameworkDetector.detectFrameworks(repoPath, structure.files);
    const projectStack = await FrameworkDetector.detectProjectStack(repoPath, structure.files, frameworks);

    await AnalysisStatusModel.update(status.id, {
      progress: 60,
      currentStep: 'Extracting dependencies and API calls'
    });
    job.progress = 60;

    // Extract dependencies and API calls
    const [apiCalls, databaseConnections, dependencies, environmentVariables] = await Promise.all([
      DependencyExtractor.extractAPICalls(repoPath, structure.files),
      DependencyExtractor.extractDatabaseConnections(repoPath, structure.files),
      DependencyExtractor.extractDependencies(repoPath, structure.files),
      DependencyExtractor.extractEnvironmentVariables(repoPath, structure.files)
    ]);

    await AnalysisStatusModel.update(status.id, {
      status: 'generating',
      progress: 80,
      currentStep: 'Generating dependency graph'
    });
    job.progress = 80;

    // Build dependency graph
    const graphBuilder = new DependencyGraphBuilder();
    const dependencyGraph = graphBuilder.buildGraph(
      structure.files,
      apiCalls,
      databaseConnections,
      dependencies,
      frameworks
    );

    await AnalysisStatusModel.update(status.id, {
      progress: 90,
      currentStep: 'Finalizing analysis report'
    });
    job.progress = 90;

    // Prepare analysis data
    const analysisData = {
      structure: {
        totalFiles: structure.stats.totalFiles,
        totalSize: structure.stats.totalSize,
        directories: structure.directories.slice(0, 100),
        languageDistribution: structure.stats.languageDistribution,
        fileTypeDistribution: structure.stats.fileTypeDistribution
      },
      projectType,
      importantFiles,
      configurationFiles: structure.stats.configurationFiles.slice(0, 50),
      documentationFiles: structure.stats.documentationFiles.slice(0, 50),
      largestFiles: structure.stats.largestFiles,
      frameworks,
      projectStack,
      apiCalls: apiCalls.slice(0, 200), // Limit to prevent huge data
      databaseConnections,
      dependencies: dependencies.slice(0, 500),
      environmentVariables: environmentVariables.filter(v => v.possibleType !== 'secret'),
      dependencyGraph,
      metrics: {
        totalAPICalls: apiCalls.length,
        totalDependencies: dependencies.length,
        totalDatabaseConnections: databaseConnections.length,
        totalFrameworks: frameworks.length,
        complexity: calculateComplexity(structure, frameworks, apiCalls, dependencies)
      },
      analyzedAt: new Date()
    };

    // Save analysis results
    await AnalysisResultModel.create({
      projectId,
      data: analysisData
    });

    // Update project status
    await ProjectModel.update(projectId, {
      status: 'completed',
      lastAnalyzedAt: new Date()
    });

    // Update analysis status
    await AnalysisStatusModel.update(status.id, {
      status: 'completed',
      progress: 100,
      completedAt: new Date()
    });

    job.progress = 100;
    job.status = 'completed';

    // Cleanup repository
    await gitService.cleanupRepository(projectId);

    logger.info(`Analysis completed for project: ${projectId}`);

  } catch (error) {
    logger.error(`Analysis failed for project ${projectId}:`, error);
    
    // Update status to failed
    const status = await AnalysisStatusModel.findByProjectId(projectId);
    if (status) {
      await AnalysisStatusModel.update(status.id, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date()
      });
    }

    // Update project status
    await ProjectModel.update(projectId, {
      status: 'failed'
    });

    job.status = 'failed';
    job.error = error instanceof Error ? error.message : 'Unknown error';

    // Cleanup on failure
    try {
      await gitService.cleanupRepository(projectId);
    } catch (cleanupError) {
      logger.error(`Failed to cleanup repository for project ${projectId}:`, cleanupError);
    }

    throw error;
  }
}

// Helper function to calculate project complexity
function calculateComplexity(
  structure: any,
  frameworks: any[],
  apiCalls: any[],
  dependencies: any[]
): 'low' | 'medium' | 'high' | 'very_high' {
  let score = 0;

  // File count factor
  if (structure.stats.totalFiles > 1000) score += 3;
  else if (structure.stats.totalFiles > 500) score += 2;
  else if (structure.stats.totalFiles > 100) score += 1;

  // Framework count factor
  if (frameworks.length > 5) score += 3;
  else if (frameworks.length > 3) score += 2;
  else if (frameworks.length > 1) score += 1;

  // API calls factor
  if (apiCalls.length > 100) score += 3;
  else if (apiCalls.length > 50) score += 2;
  else if (apiCalls.length > 20) score += 1;

  // Dependencies factor
  if (dependencies.length > 100) score += 3;
  else if (dependencies.length > 50) score += 2;
  else if (dependencies.length > 20) score += 1;

  // Language diversity factor
  const languages = Object.keys(structure.stats.languageDistribution || {});
  if (languages.length > 5) score += 2;
  else if (languages.length > 3) score += 1;

  if (score >= 10) return 'very_high';
  if (score >= 7) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

export function getJobStatus(jobId: string): AnalysisJob | null {
  return activeJobs.get(jobId) || null;
}

export function getActiveJobs(): AnalysisJob[] {
  return Array.from(activeJobs.values());
}

// Clean up completed jobs after 1 hour
setInterval(() => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [jobId, job] of activeJobs.entries()) {
    if (job.status === 'completed' || job.status === 'failed') {
      activeJobs.delete(jobId);
    }
  }
}, 60 * 60 * 1000);