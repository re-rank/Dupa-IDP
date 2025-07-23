import { logger } from '../../utils/logger';
import { ProjectModel } from '../../models/Project';
import { AnalysisStatusModel } from '../../models/AnalysisStatus';
import { AnalysisResultModel } from '../../models/AnalysisResult';
import { getGitService } from '../git/gitService';
import { repositoryAnalyzer, RepositoryAnalyzer } from './repositoryAnalyzer';
import { FrameworkDetector } from './frameworkDetector';
import { DependencyExtractor } from './dependencyExtractor';
import { AnalysisOptions, AnalysisData, AnalysisJob, RepositoryStructure, DependencyNode, DependencyEdge } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

// In-memory job tracking (in production, use Redis or database)
const activeJobs = new Map<string, AnalysisJob>();

export class AnalysisService {
  
  static async performAnalysis(
    projectId: string, 
    options: AnalysisOptions = {}
  ): Promise<AnalysisJob> {
    const jobId = `job_${uuidv4()}`;
    
    const job: AnalysisJob = {
      id: jobId,
      projectId,
      type: 'full_analysis',
      status: 'pending',
      progress: 0,
      data: options,
      createdAt: new Date()
    };

    activeJobs.set(jobId, job);
    
    // Start analysis in background
    this.runAnalysis(job).catch(error => {
      logger.error(`Analysis job ${jobId} failed:`, error);
      job.status = 'failed';
      job.error = error.message;
      job.completedAt = new Date();
    });

    return job;
  }

  static getJobStatus(jobId: string): AnalysisJob | null {
    return activeJobs.get(jobId) || null;
  }

  static async getActiveJobs(): Promise<AnalysisJob[]> {
    return Array.from(activeJobs.values()).filter(job => 
      job.status === 'pending' || job.status === 'active'
    );
  }

  private static async runAnalysis(job: AnalysisJob): Promise<void> {
    const { projectId, data: options } = job;
    
    try {
      // Update job status
      job.status = 'active';
      job.startedAt = new Date();
      job.progress = 0;

      // Create or update analysis status
      await AnalysisStatusModel.updateByProjectId(projectId, {
        status: 'in_progress',
        progress: 0,
        currentStep: 'Initializing analysis'
      });

      // Update project status
      await ProjectModel.update(projectId, { status: 'analyzing' });

      logger.info(`Starting analysis for project: ${projectId}`);

      // Step 1: Get project details
      const project = await ProjectModel.findById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      job.progress = 10;
      await AnalysisStatusModel.updateByProjectId(projectId, {
        progress: 10,
        currentStep: 'Cloning repository'
      });

      // Step 2: Clone repository
      const tempDir = path.join(process.cwd(), 'temp', `analysis_${projectId}_${Date.now()}`);
      await fs.mkdir(tempDir, { recursive: true });

      try {
        const gitService = getGitService();
        const repoPath = await gitService.cloneRepository(
          project.repositoryUrl,
          tempDir,
          {
            branch: options.branch || project.branch || 'main',
            depth: options.depth || 1
          }
        );

        job.progress = 30;
        await AnalysisStatusModel.updateByProjectId(projectId, {
          progress: 30,
          currentStep: 'Scanning repository structure'
        });

        // Step 3: Analyze repository structure
        const rawStructure = await repositoryAnalyzer.analyzeRepository(project, repoPath);
        
        // Convert to match RepositoryStructure type from types/index.ts
        const importantFiles = RepositoryAnalyzer.findImportantFiles(rawStructure.files);
        const structure: RepositoryStructure = {
          rootPath: rawStructure.rootPath,
          totalFiles: rawStructure.stats.totalFiles,
          totalSize: rawStructure.stats.totalSize,
          languageDistribution: rawStructure.stats.languageDistribution,
          fileTypeDistribution: rawStructure.stats.fileTypeDistribution,
          directories: rawStructure.directories,
          importantFiles: {
            entry: importantFiles.entry || [],
            configuration: importantFiles.configuration || [],
            documentation: importantFiles.documentation || [],
            tests: importantFiles.tests || [],
            build: importantFiles.build || []
          }
        };

        job.progress = 50;
        await AnalysisStatusModel.updateByProjectId(projectId, {
          progress: 50,
          currentStep: 'Detecting frameworks and technologies'
        });

        // Step 4: Detect frameworks
        const frameworks = await FrameworkDetector.detectFrameworks(repoPath, rawStructure.files);

        job.progress = 60;
        await AnalysisStatusModel.updateByProjectId(projectId, {
          progress: 60,
          currentStep: 'Analyzing dependencies'
        });

        // Step 5: Extract dependencies
        const [dependencies, apiCalls, databaseConnections, environmentVariables] = await Promise.all([
          DependencyExtractor.extractDependencies(repoPath, rawStructure.files),
          DependencyExtractor.extractAPICalls(repoPath, rawStructure.files),
          DependencyExtractor.extractDatabaseConnections(repoPath, rawStructure.files),
          DependencyExtractor.extractEnvironmentVariables(repoPath, rawStructure.files)
        ]);

        job.progress = 80;
        await AnalysisStatusModel.updateByProjectId(projectId, {
          progress: 80,
          currentStep: 'Building dependency graph'
        });

        // Step 6: Build dependency graph
        const dependencyGraph = await this.buildDependencyGraph({
          frameworks,
          dependencies,
          apiCalls,
          databaseConnections,
          environmentVariables
        });

        job.progress = 90;
        await AnalysisStatusModel.updateByProjectId(projectId, {
          progress: 90,
          currentStep: 'Calculating metrics'
        });

        // Step 7: Calculate metrics and create summary
        const projectStack = await FrameworkDetector.detectProjectStack(repoPath, rawStructure.files, frameworks);
        
        const metrics = this.calculateMetrics({
          structure,
          frameworks,
          dependencies,
          apiCalls,
          databaseConnections
        });

        const summary = {
          projectType: projectStack.stack,
          primaryLanguage: projectStack.primaryLanguage,
          stack: projectStack.stack,
          confidence: frameworks.length > 0 ? Math.max(...frameworks.map(f => f.confidence)) : 0.5,
          description: `${projectStack.primaryLanguage} ${projectStack.stack} project with ${frameworks.length} detected frameworks`
        };

        // Step 8: Create analysis result
        const analysisData: AnalysisData = {
          summary,
          structure,
          frameworks,
          dependencies,
          apiCalls,
          databaseConnections,
          environmentVariables,
          dependencyGraph,
          metrics
        };

        await AnalysisResultModel.create({
          projectId,
          analysisData
        });

        job.progress = 100;
        job.status = 'completed';
        job.result = analysisData;
        job.completedAt = new Date();

        // Update final status
        await AnalysisStatusModel.updateByProjectId(projectId, {
          status: 'completed',
          progress: 100,
          currentStep: 'Analysis completed',
          completedAt: new Date()
        });

        await ProjectModel.update(projectId, { 
          status: 'completed',
          lastAnalyzedAt: new Date()
        });

        logger.info(`Analysis completed for project: ${projectId}`);

      } finally {
        // Cleanup temporary directory
        try {
          await fs.rm(tempDir, { recursive: true, force: true });
        } catch (cleanupError) {
          logger.warn(`Failed to cleanup temp directory ${tempDir}:`, cleanupError);
        }
      }

    } catch (error) {
      logger.error(`Analysis failed for project ${projectId}:`, error);
      
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.completedAt = new Date();

      await AnalysisStatusModel.updateByProjectId(projectId, {
        status: 'failed',
        error: job.error,
        completedAt: new Date()
      });

      await ProjectModel.update(projectId, { status: 'failed' });
      
      throw error;
    }
  }

  private static async buildDependencyGraph(data: {
    frameworks: any[];
    dependencies: any[];
    apiCalls: any[];
    databaseConnections: any[];
    environmentVariables: any[];
  }) {
    const nodes: DependencyNode[] = [];
    const edges: DependencyEdge[] = [];

    // Add framework nodes
    for (const framework of data.frameworks) {
      nodes.push({
        id: `framework_${framework.name.toLowerCase().replace(/\s+/g, '_')}`,
        label: framework.name,
        type: 'service' as const,
        technology: framework.name,
        metadata: {
          type: framework.type,
          confidence: framework.confidence,
          version: framework.version
        }
      });
    }

    // Add database nodes from connections
    const databases = new Set();
    for (const conn of data.databaseConnections) {
      if (!databases.has(conn.database)) {
        databases.add(conn.database);
        nodes.push({
          id: `database_${conn.database.toLowerCase().replace(/\s+/g, '_')}`,
          label: conn.database,
          type: 'database' as const,
          technology: conn.database,
          metadata: {
            type: conn.type,
            confidence: conn.confidence
          }
        });
      }
    }

    // Add external API nodes
    const externalAPIs = new Set();
    for (const api of data.apiCalls) {
      if (api.endpoint && api.endpoint.startsWith('http')) {
        try {
          const url = new URL(api.endpoint);
          const domain = url.hostname;
          if (!externalAPIs.has(domain)) {
            externalAPIs.add(domain);
            nodes.push({
              id: `external_${domain.replace(/\./g, '_')}`,
              label: domain,
              type: 'external' as const,
              metadata: {
                endpoint: api.endpoint,
                method: api.method
              }
            });
          }
        } catch (urlError) {
          // Skip invalid URLs
        }
      }
    }

    return { nodes, edges };
  }

  private static calculateMetrics(data: {
    structure: RepositoryStructure;
    frameworks: any[];
    dependencies: any[];
    apiCalls: any[];
    databaseConnections: any[];
  }) {
    const totalFiles = data.structure.totalFiles;
    const totalLines = Object.values(data.structure.languageDistribution || {}).reduce((a: number, b: any) => Number(a) + Number(b), 0);
    
    // Simple complexity calculation based on various factors
    let complexityScore = 0;
    complexityScore += Math.min(data.frameworks.length * 10, 50); // Framework complexity
    complexityScore += Math.min(data.dependencies.length * 2, 100); // Dependency complexity
    complexityScore += Math.min(data.apiCalls.length * 5, 100); // API complexity
    complexityScore += Math.min(data.databaseConnections.length * 15, 75); // Database complexity
    
    // Normalize to 0-100 scale
    complexityScore = Math.min(complexityScore, 100);

    // Simple maintainability index (inverse of complexity with some adjustments)
    const maintainabilityIndex = Math.max(100 - complexityScore - (totalFiles > 1000 ? 20 : 0), 0);

    // Technical debt ratio (simplified calculation)
    const technicalDebtRatio = Math.min(
      (data.dependencies.filter(d => d.type === 'development').length / Math.max(data.dependencies.length, 1)) * 100 +
      (data.apiCalls.filter(a => a.confidence < 0.7).length / Math.max(data.apiCalls.length, 1)) * 50,
      100
    );

    return {
      totalFiles,
      totalLines,
      totalAPICalls: data.apiCalls.length,
      totalDatabaseConnections: data.databaseConnections.length,
      totalDependencies: data.dependencies.length,
      totalFrameworks: data.frameworks.length,
      complexityScore,
      maintainabilityIndex,
      technicalDebtRatio
    };
  }

  static async cancelAnalysis(jobId: string): Promise<boolean> {
    const job = activeJobs.get(jobId);
    if (!job || job.status === 'completed' || job.status === 'failed') {
      return false;
    }

    job.status = 'failed';
    job.error = 'Analysis cancelled by user';
    job.completedAt = new Date();

    await AnalysisStatusModel.updateByProjectId(job.projectId, {
      status: 'failed',
      error: 'Analysis cancelled',
      completedAt: new Date()
    });

    await ProjectModel.update(job.projectId, { status: 'failed' });

    logger.info(`Analysis cancelled for job: ${jobId}`);
    return true;
  }

  static async cleanupOldJobs(hoursOld: number = 24): Promise<number> {
    const cutoffTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000);
    let cleanedCount = 0;

    for (const [jobId, job] of activeJobs.entries()) {
      if (job.completedAt && job.completedAt < cutoffTime) {
        activeJobs.delete(jobId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      logger.info(`Cleaned up ${cleanedCount} old analysis jobs`);
    }

    return cleanedCount;
  }
}

// Legacy exports for backward compatibility
export const performAnalysis = AnalysisService.performAnalysis.bind(AnalysisService);
export const getJobStatus = AnalysisService.getJobStatus.bind(AnalysisService);