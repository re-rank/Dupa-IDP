import { getDatabase } from '../database/connection';
import { AnalysisResult as AnalysisResultType, AnalysisData, AnalysisMetrics } from '../types';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class AnalysisResultModel {
  static async create(data: {
    projectId: string;
    analysisData: AnalysisData;
  }): Promise<AnalysisResultType> {
    const db = getDatabase();
    const id = `result_${uuidv4()}`;
    const now = new Date();

    try {
      await db.run(
        `INSERT INTO analysis_results (id, project_id, data, created_at)
         VALUES (?, ?, ?, ?)`,
        [
          id,
          data.projectId,
          JSON.stringify(data.analysisData),
          now.toISOString()
        ]
      );

      const result = await this.findById(id);
      if (!result) {
        throw new Error('Failed to create analysis result');
      }

      logger.info(`Created analysis result: ${id} for project: ${data.projectId}`);
      return result;
    } catch (error) {
      logger.error('Failed to create analysis result:', error);
      throw error;
    }
  }

  static async findById(id: string): Promise<AnalysisResultType | null> {
    const db = getDatabase();
    
    try {
      const row = await db.get(
        'SELECT * FROM analysis_results WHERE id = ?',
        [id]
      );

      return row ? this.mapRowToAnalysisResult(row) : null;
    } catch (error) {
      logger.error(`Failed to fetch analysis result ${id}:`, error);
      throw error;
    }
  }

  static async findByProjectId(projectId: string, options?: {
    limit?: number;
    offset?: number;
  }): Promise<AnalysisResultType[]> {
    const db = getDatabase();
    
    try {
      const { limit = 10, offset = 0 } = options || {};
      
      const rows = await db.all(
        `SELECT * FROM analysis_results 
         WHERE project_id = ? 
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`,
        [projectId, limit, offset]
      );

      return rows.map(this.mapRowToAnalysisResult);
    } catch (error) {
      logger.error(`Failed to fetch analysis results for project ${projectId}:`, error);
      throw error;
    }
  }

  static async findLatestByProjectId(projectId: string): Promise<AnalysisResultType | null> {
    const db = getDatabase();
    
    try {
      const row = await db.get(
        `SELECT * FROM analysis_results 
         WHERE project_id = ? 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [projectId]
      );

      return row ? this.mapRowToAnalysisResult(row) : null;
    } catch (error) {
      logger.error(`Failed to fetch latest analysis result for project ${projectId}:`, error);
      throw error;
    }
  }

  static async delete(id: string): Promise<boolean> {
    const db = getDatabase();
    
    try {
      const result = await db.run(
        'DELETE FROM analysis_results WHERE id = ?',
        [id]
      );

      const deleted = (result.changes || 0) > 0;
      if (deleted) {
        logger.info(`Deleted analysis result: ${id}`);
      }

      return deleted;
    } catch (error) {
      logger.error(`Failed to delete analysis result ${id}:`, error);
      throw error;
    }
  }

  static async deleteByProjectId(projectId: string): Promise<number> {
    const db = getDatabase();
    
    try {
      const result = await db.run(
        'DELETE FROM analysis_results WHERE project_id = ?',
        [projectId]
      );

      const deletedCount = result.changes || 0;
      if (deletedCount > 0) {
        logger.info(`Deleted ${deletedCount} analysis results for project: ${projectId}`);
      }

      return deletedCount;
    } catch (error) {
      logger.error(`Failed to delete analysis results for project ${projectId}:`, error);
      throw error;
    }
  }

  static async getProjectMetrics(projectId: string): Promise<AnalysisMetrics | null> {
    try {
      const latestResult = await this.findLatestByProjectId(projectId);
      
      if (!latestResult || !latestResult.data.metrics) {
        return null;
      }

      return latestResult.data.metrics;
    } catch (error) {
      logger.error(`Failed to get project metrics for ${projectId}:`, error);
      throw error;
    }
  }

  static async getAnalysisHistory(projectId: string, days: number = 30): Promise<Array<{
    date: string;
    metrics: AnalysisMetrics;
  }>> {
    const db = getDatabase();
    
    try {
      const rows = await db.all(
        `SELECT data, created_at FROM analysis_results 
         WHERE project_id = ? 
         AND created_at > datetime('now', '-${days} days')
         ORDER BY created_at ASC`,
        [projectId]
      );

      return rows.map((row: any) => {
        const data = JSON.parse(row.data) as AnalysisData;
        return {
          date: row.created_at,
          metrics: data.metrics
        };
      }).filter(item => item.metrics);
    } catch (error) {
      logger.error(`Failed to get analysis history for project ${projectId}:`, error);
      throw error;
    }
  }

  static async getGlobalStats(): Promise<{
    totalAnalyses: number;
    totalProjects: number;
    averageComplexity: number;
    topLanguages: Array<{ language: string; count: number }>;
    topFrameworks: Array<{ framework: string; count: number }>;
  }> {
    const db = getDatabase();
    
    try {
      const totalAnalyses = await db.get('SELECT COUNT(*) as count FROM analysis_results');
      const totalProjects = await db.get('SELECT COUNT(DISTINCT project_id) as count FROM analysis_results');
      
      // Get all analysis results to calculate aggregated stats
      const allResults = await db.all('SELECT data FROM analysis_results');
      
      const languageStats = new Map<string, number>();
      const frameworkStats = new Map<string, number>();
      let totalComplexity = 0;
      let complexityCount = 0;

      for (const row of allResults) {
        try {
          const data = JSON.parse(row.data) as AnalysisData;
          
          // Aggregate language stats
          if (data.structure?.languageDistribution) {
            for (const [lang, count] of Object.entries(data.structure.languageDistribution)) {
              languageStats.set(lang, (languageStats.get(lang) || 0) + count);
            }
          }
          
          // Aggregate framework stats
          if (data.frameworks) {
            for (const framework of data.frameworks) {
              frameworkStats.set(framework.name, (frameworkStats.get(framework.name) || 0) + 1);
            }
          }
          
          // Aggregate complexity
          if (data.metrics?.complexityScore) {
            totalComplexity += data.metrics.complexityScore;
            complexityCount++;
          }
        } catch (parseError) {
          logger.warn('Failed to parse analysis data for stats:', parseError);
        }
      }

      const topLanguages = Array.from(languageStats.entries())
        .map(([language, count]) => ({ language, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const topFrameworks = Array.from(frameworkStats.entries())
        .map(([framework, count]) => ({ framework, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalAnalyses: totalAnalyses?.count || 0,
        totalProjects: totalProjects?.count || 0,
        averageComplexity: complexityCount > 0 ? totalComplexity / complexityCount : 0,
        topLanguages,
        topFrameworks
      };
    } catch (error) {
      logger.error('Failed to get global stats:', error);
      throw error;
    }
  }

  static async cleanupOldResults(projectId: string, keepCount: number = 10): Promise<number> {
    const db = getDatabase();
    
    try {
      // Keep only the latest N results for the project
      const result = await db.run(`
        DELETE FROM analysis_results 
        WHERE project_id = ? 
        AND id NOT IN (
          SELECT id FROM analysis_results 
          WHERE project_id = ? 
          ORDER BY created_at DESC 
          LIMIT ?
        )
      `, [projectId, projectId, keepCount]);

      const deletedCount = result.changes || 0;
      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} old analysis results for project: ${projectId}`);
      }

      return deletedCount;
    } catch (error) {
      logger.error(`Failed to cleanup old results for project ${projectId}:`, error);
      throw error;
    }
  }

  private static mapRowToAnalysisResult(row: any): AnalysisResultType {
    let data: AnalysisData;
    
    try {
      data = JSON.parse(row.data);
    } catch (error) {
      logger.error(`Failed to parse analysis data for result ${row.id}:`, error);
      // Return a minimal valid structure
      data = {
        summary: {
          projectType: 'Unknown',
          primaryLanguage: 'Unknown',
          stack: 'unknown',
          confidence: 0
        },
        structure: {
          rootPath: '',
          totalFiles: 0,
          totalSize: 0,
          languageDistribution: {},
          fileTypeDistribution: {},
          directories: [],
          importantFiles: {
            entry: [],
            configuration: [],
            documentation: [],
            tests: [],
            build: []
          }
        },
        frameworks: [],
        dependencies: [],
        apiCalls: [],
        databaseConnections: [],
        environmentVariables: [],
        dependencyGraph: {
          nodes: [],
          edges: []
        },
        metrics: {
          totalFiles: 0,
          totalLines: 0,
          totalAPICalls: 0,
          totalDatabaseConnections: 0,
          totalDependencies: 0,
          totalFrameworks: 0,
          complexityScore: 0,
          maintainabilityIndex: 0,
          technicalDebtRatio: 0
        }
      };
    }

    return {
      id: row.id,
      projectId: row.project_id,
      data,
      createdAt: new Date(row.created_at)
    };
  }
}