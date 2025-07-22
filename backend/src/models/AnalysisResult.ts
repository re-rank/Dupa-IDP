import { getDatabase } from '../database/connection';
import { AnalysisResult as AnalysisResultType } from '../../../shared/types';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class AnalysisResultModel {
  static async create(data: {
    projectId: string;
    data: any;
  }): Promise<string> {
    const db = getDatabase();
    const id = `result_${uuidv4()}`;

    try {
      await db.run(
        `INSERT INTO analysis_results (id, project_id, result_data, created_at)
         VALUES (?, ?, ?, ?)`,
        [
          id,
          data.projectId,
          JSON.stringify(data.data),
          new Date().toISOString()
        ]
      );

      logger.info(`Created analysis result for project: ${data.projectId}`);
      return id;
    } catch (error) {
      logger.error(`Failed to create analysis result for project ${data.projectId}:`, error);
      throw error;
    }
  }

  static async findLatestByProjectId(projectId: string): Promise<{ data: any } | null> {
    const db = getDatabase();
    
    try {
      const row = await db.get(
        'SELECT * FROM analysis_results WHERE project_id = ? ORDER BY created_at DESC LIMIT 1',
        [projectId]
      );

      if (!row) {
        return null;
      }

      return { data: JSON.parse(row.result_data) };
    } catch (error) {
      logger.error(`Failed to fetch analysis result for project ${projectId}:`, error);
      throw error;
    }
  }

  static async findLatestResults(limit: number = 10): Promise<Array<{
    projectId: string;
    result: AnalysisResultType;
    createdAt: Date;
  }>> {
    const db = getDatabase();
    
    try {
      const rows = await db.all(
        'SELECT * FROM analysis_results ORDER BY created_at DESC LIMIT ?',
        [limit]
      );

      return rows.map(row => ({
        projectId: row.project_id,
        result: JSON.parse(row.result_data) as AnalysisResultType,
        createdAt: new Date(row.created_at)
      }));
    } catch (error) {
      logger.error('Failed to fetch latest analysis results:', error);
      throw error;
    }
  }

  static async deleteByProjectId(projectId: string): Promise<boolean> {
    const db = getDatabase();
    
    try {
      const result = await db.run(
        'DELETE FROM analysis_results WHERE project_id = ?',
        [projectId]
      );

      const deleted = (result.changes || 0) > 0;
      if (deleted) {
        logger.info(`Deleted analysis results for project: ${projectId}`);
      }

      return deleted;
    } catch (error) {
      logger.error(`Failed to delete analysis results for project ${projectId}:`, error);
      throw error;
    }
  }

  static async getProjectMetrics(projectId: string): Promise<{
    totalFiles: number;
    totalLines: number;
    apiEndpoints: number;
    databaseConnections: number;
    dependencies: number;
    frameworks: number;
  } | null> {
    const result = await this.findLatestByProjectId(projectId);
    
    if (!result) {
      return null;
    }

    return {
      totalFiles: result.data.structure?.files?.length || 0,
      totalLines: 0, // TODO: Implement line counting
      apiEndpoints: result.data.apis?.length || 0,
      databaseConnections: result.data.databases?.length || 0,
      dependencies: result.data.dependencies?.length || 0,
      frameworks: result.data.frameworks?.length || 0
    };
  }
}