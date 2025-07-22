import Bull from 'bull';
import path from 'path';
import { gitService } from '../git/gitService';
import { repositoryAnalyzer, RepositoryAnalyzer } from '../analysis/repositoryAnalyzer';
import { FrameworkDetector } from '../analysis/frameworkDetector';
import { DependencyExtractor } from '../analysis/dependencyExtractor';
import { ProjectModel } from '../../models/Project';
import { AnalysisStatusModel } from '../../models/AnalysisStatus';
import { AnalysisResultModel } from '../../models/AnalysisResult';
import { logger } from '../../utils/logger';
import { isRedisConnected } from '../redis/redisClient';
import { AnalysisData } from '../../types';

interface AnalysisJobData {
  projectId: string;
  options?: {
    branch?: string;
    depth?: number;
    force?: boolean;
  };
}

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Create the analysis queue (will be null if Redis is not available)
let analysisQueue: Bull.Queue<AnalysisJobData> | null = null;

try {
  if (process.env.REDIS_ENABLED !== 'false') {
    analysisQueue = new Bull<AnalysisJobData>('analysis', REDIS_URL, {
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        },
        removeOnComplete: 100,
        removeOnFail: 50
      }
    });

    // Process analysis jobs
    analysisQueue.process(async (job) => {
      const { projectId, options = {} } = job.data;
      
      logger.info(`Starting analysis job for project: ${projectId}`);
      
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
            status: 'in_progress',
            progress: 0
          });
        } else {
          await AnalysisStatusModel.update(status.id, {
            status: 'in_progress',
            progress: 0,
            error: undefined,
            startedAt: new Date()
          });
        }

        // Update job progress
        await job.progress(10);

        // Clone repository
        logger.info(`Cloning repository: ${project.repositoryUrl}`);
        const tempDir = path.join(process.cwd(), 'temp', 'repos', projectId);
        const repoPath = await gitService.cloneRepository(
          project.repositoryUrl,
          tempDir,
          {
            branch: options.branch,
            depth: options.depth || 10
          }
        );

        await AnalysisStatusModel.update(status.id, {
          status: 'in_progress',
          progress: 20,
          currentStep: 'Scanning repository structure'
        });
        await job.progress(20);

        // Scan repository structure
        logger.info(`Scanning repository structure for project: ${projectId}`);
        const structure = await repositoryAnalyzer.analyzeRepository(project as any, repoPath);

        await AnalysisStatusModel.update(status.id, {
          status: 'in_progress',
          progress: 40,
          currentStep: 'Detecting frameworks and languages'
        });
        await job.progress(40);

        // Detect project type and frameworks
        const projectType = await RepositoryAnalyzer.detectProjectType(structure.files);
        const importantFiles = RepositoryAnalyzer.findImportantFiles(structure.files);
        const frameworks = await FrameworkDetector.detectFrameworks(repoPath, structure.files);
        const projectStack = await FrameworkDetector.detectProjectStack(repoPath, structure.files, frameworks);

        await AnalysisStatusModel.update(status.id, {
          progress: 60,
          currentStep: 'Extracting dependencies and API calls'
        });
        await job.progress(60);

        // Extract dependencies and API calls
        const [apiCalls, databaseConnections, dependencies, environmentVariables] = await Promise.all([
          DependencyExtractor.extractAPICalls(repoPath, structure.files),
          DependencyExtractor.extractDatabaseConnections(repoPath, structure.files),
          DependencyExtractor.extractDependencies(repoPath, structure.files),
          DependencyExtractor.extractEnvironmentVariables(repoPath, structure.files)
        ]);

        await AnalysisStatusModel.update(status.id, {
          status: 'in_progress',
          progress: 80,
          currentStep: 'Generating analysis report'
        });
        await job.progress(80);

        // Prepare analysis data
        const analysisData: AnalysisData = {
          summary: {
            projectType: projectType.type,
            primaryLanguage: projectStack.primaryLanguage || 'Unknown',
            stack: projectStack.stack || 'unknown',
            confidence: projectType.confidence,
            description: `${projectStack.primaryLanguage || 'Unknown'} ${projectStack.stack || 'unknown'} project`
          },
          structure: {
            rootPath: repoPath,
            totalFiles: structure.stats.totalFiles,
            totalSize: structure.stats.totalSize,
            languageDistribution: structure.stats.languageDistribution,
            fileTypeDistribution: structure.stats.fileTypeDistribution,
            directories: structure.directories.slice(0, 100),
            importantFiles: {
            entry: importantFiles.entry || [],
            configuration: importantFiles.configuration || [],
            documentation: importantFiles.documentation || [],
            tests: importantFiles.tests || [],
            build: importantFiles.build || []
          }
          },
          frameworks,
          dependencies: dependencies.slice(0, 500),
          apiCalls: apiCalls.slice(0, 200), // Limit to prevent huge data
          databaseConnections,
          environmentVariables: environmentVariables.filter(v => v.possibleType !== 'secret'),
          dependencyGraph: {
            nodes: [],
            edges: []
          },
          metrics: {
            totalFiles: structure.stats.totalFiles,
            totalLines: 0, // This should be calculated if needed
            totalAPICalls: apiCalls.length,
            totalDatabaseConnections: databaseConnections.length,
            totalDependencies: dependencies.length,
            totalFrameworks: frameworks.length,
            complexityScore: calculateComplexity(structure, frameworks, apiCalls, dependencies),
            maintainabilityIndex: 0, // This should be calculated if needed
            technicalDebtRatio: 0 // This should be calculated if needed
          },
          projectStack
        };

        // Save analysis results
        await AnalysisResultModel.create({
          projectId,
          analysisData
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

        await job.progress(100);

        // Cleanup repository
        await gitService.cleanupRepository(projectId);

        logger.info(`Analysis completed for project: ${projectId}`);
        
        return {
          projectId,
          status: 'completed',
          metrics: analysisData.metrics
        };

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

        // Cleanup on failure
        try {
          await gitService.cleanupRepository(projectId);
        } catch (cleanupError) {
          logger.error(`Failed to cleanup repository for project ${projectId}:`, cleanupError);
        }

        throw error;
      }
    });

    // Queue event handlers
    analysisQueue.on('completed', (job, result) => {
      logger.info(`Analysis job completed for project: ${result.projectId}`);
    });

    analysisQueue.on('failed', (job, err) => {
      logger.error(`Analysis job failed for project ${job.data.projectId}:`, err);
    });

    analysisQueue.on('stalled', (job) => {
      logger.warn(`Analysis job stalled for project: ${job.data.projectId}`);
    });
  }
} catch (error) {
  logger.warn('Redis not available - running without job queue functionality');
  analysisQueue = null;
}

// Helper function to calculate project complexity
function calculateComplexity(
  structure: any,
  frameworks: any[],
  apiCalls: any[],
  dependencies: any[]
): number {
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

  // Normalize score to 0-100 scale
  return Math.min(score * 10, 100);
}

// Queue management functions
export async function addAnalysisJob(
  projectId: string,
  options?: AnalysisJobData['options']
): Promise<Bull.Job<AnalysisJobData> | null> {
  if (!analysisQueue) {
    logger.warn('Analysis queue not available - Redis is disabled');
    return null;
  }

  const job = await analysisQueue.add({
    projectId,
    options
  }, {
    jobId: `analysis-${projectId}-${Date.now()}`
  });

  logger.info(`Added analysis job for project: ${projectId}, job ID: ${job.id}`);
  return job;
}

export async function getJobStatus(jobId: string): Promise<{
  status: string;
  progress: number;
  error?: string;
}> {
  if (!analysisQueue) {
    throw new Error('Analysis queue not available');
  }

  const job = await analysisQueue.getJob(jobId);
  
  if (!job) {
    throw new Error('Job not found');
  }

  const state = await job.getState();
  const progress = job.progress();

  return {
    status: state,
    progress: typeof progress === 'number' ? progress : 0,
    error: job.failedReason
  };
}

export async function getQueueStats(): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}> {
  if (!analysisQueue) {
    return { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 };
  }

  const [waiting, active, completed, failed, delayed] = await Promise.all([
    analysisQueue.getWaitingCount(),
    analysisQueue.getActiveCount(),
    analysisQueue.getCompletedCount(),
    analysisQueue.getFailedCount(),
    analysisQueue.getDelayedCount()
  ]);

  return { waiting, active, completed, failed, delayed };
}

export async function cleanupQueue(): Promise<void> {
  if (!analysisQueue) {
    return;
  }

  await analysisQueue.clean(24 * 60 * 60 * 1000); // Clean jobs older than 24 hours
  await analysisQueue.obliterate({ force: true }); // Remove all jobs if needed
}

// Check if queue is available
export function isQueueAvailable(): boolean {
  return analysisQueue !== null && isRedisConnected();
}