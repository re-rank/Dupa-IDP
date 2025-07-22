import { getDatabase } from '../database/connection';
import { AnalysisStatus as AnalysisStatusType } from '../types';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class AnalysisStatusModel {
  static async create(data: {
    projectId: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'failed';
    progress?: number;
    currentStep?: string;
  }): Promise<AnalysisStatusType> {
    const db = getDatabase();
    const id = `status_${uuidv4()}`;
    const now = new Date();

    try {
      await db.run(
        `INSERT INTO analysis_status (id, project_id, status, progress, current_step, started_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          data.projectId,
          data.status || 'pending',
          data.progress || 0,
          data.currentStep || null,
          now.toISOString()
        ]
      );

      const status = await this.findById(id);
      if (!status) {
        throw new Error('Failed to create analysis status');
      }

      logger.info(`Created analysis status: ${id} for project: ${data.projectId}`);
      return status;
    } catch (error) {
      logger.error('Failed to create analysis status:', error);
      throw error;
    }
  }

  static async findById(id: string): Promise<AnalysisStatusType | null> {
    const db = getDatabase();
    
    try {
      const row = await db.get(
        'SELECT * FROM analysis_status WHERE id = ?',
        [id]
      );

      return row ? this.mapRowToAnalysisStatus(row) : null;
    } catch (error) {
      logger.error(`Failed to fetch analysis status ${id}:`, error);
      throw error;
    }
  }

  static async findByProjectId(projectId: string): Promise<AnalysisStatusType | null> {
    const db = getDatabase();
    
    try {
      const row = await db.get(
        `SELECT * FROM analysis_status 
         WHERE project_id = ? 
         ORDER BY started_at DESC 
         LIMIT 1`,
        [projectId]
      );

      return row ? this.mapRowToAnalysisStatus(row) : null;
    } catch (error) {
      logger.error(`Failed to fetch analysis status for project ${projectId}:`, error);
      throw error;
    }
  }

  static async update(id: string, data: Partial<{
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    progress: number;
    currentStep: string;
    error: string;
    completedAt: Date;
    startedAt?: Date;
  }>): Promise<AnalysisStatusType | null> {
    const db = getDatabase();

    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (data.status !== undefined) {
        updates.push('status = ?');
        values.push(data.status);
      }

      if (data.progress !== undefined) {
        updates.push('progress = ?');
        values.push(data.progress);
      }

      if (data.currentStep !== undefined) {
        updates.push('current_step = ?');
        values.push(data.currentStep);
      }

      if (data.error !== undefined) {
        updates.push('error = ?');
        values.push(data.error);
      }

      if (data.completedAt !== undefined) {
        updates.push('completed_at = ?');
        values.push(data.completedAt.toISOString());
      }

      if (data.startedAt !== undefined) {
        updates.push('started_at = ?');
        values.push(data.startedAt.toISOString());
      }

      if (updates.length === 0) {
        return await this.findById(id);
      }

      values.push(id);

      const result = await db.run(
        `UPDATE analysis_status SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      if (result.changes === 0) {
        return null;
      }

      return await this.findById(id);
    } catch (error) {
      logger.error(`Failed to update analysis status ${id}:`, error);
      throw error;
    }
  }

  static async updateByProjectId(projectId: string, data: Partial<{
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    progress: number;
    currentStep: string;
    error: string;
    completedAt: Date;
    startedAt?: Date;
  }>): Promise<AnalysisStatusType | null> {
    const db = getDatabase();

    try {
      // Find the latest status for the project
      const existingStatus = await this.findByProjectId(projectId);
      
      if (!existingStatus) {
        // Create new status if none exists
        return await this.create({
          projectId,
          ...data
        });
      }

      return await this.update(existingStatus.id, data);
    } catch (error) {
      logger.error(`Failed to update analysis status for project ${projectId}:`, error);
      throw error;
    }
  }

  static async delete(id: string): Promise<boolean> {
    const db = getDatabase();
    
    try {
      const result = await db.run(
        'DELETE FROM analysis_status WHERE id = ?',
        [id]
      );

      const deleted = (result.changes || 0) > 0;
      if (deleted) {
        logger.info(`Deleted analysis status: ${id}`);
      }

      return deleted;
    } catch (error) {
      logger.error(`Failed to delete analysis status ${id}:`, error);
      throw error;
    }
  }

  static async deleteByProjectId(projectId: string): Promise<number> {
    const db = getDatabase();
    
    try {
      const result = await db.run(
        'DELETE FROM analysis_status WHERE project_id = ?',
        [projectId]
      );

      const deletedCount = result.changes || 0;
      if (deletedCount > 0) {
        logger.info(`Deleted ${deletedCount} analysis statuses for project: ${projectId}`);
      }

      return deletedCount;
    } catch (error) {
      logger.error(`Failed to delete analysis statuses for project ${projectId}:`, error);
      throw error;
    }
  }

  static async findActiveAnalyses(): Promise<AnalysisStatusType[]> {
    const db = getDatabase();
    
    try {
      const rows = await db.all(
        `SELECT * FROM analysis_status 
         WHERE status IN ('pending', 'in_progress') 
         ORDER BY started_at ASC`
      );

      return rows.map(this.mapRowToAnalysisStatus);
    } catch (error) {
      logger.error('Failed to fetch active analyses:', error);
      throw error;
    }
  }

  static async getAnalysisStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    averageProgress: number;
    oldestActive: Date | null;
  }> {
    const db = getDatabase();
    
    try {
      const [totalResult, statusResults, progressResult, oldestActiveResult] = await Promise.all([
        db.get('SELECT COUNT(*) as count FROM analysis_status'),
        db.all('SELECT status, COUNT(*) as count FROM analysis_status GROUP BY status'),
        db.get('SELECT AVG(progress) as avg FROM analysis_status WHERE status = "in_progress"'),
        db.get(`SELECT MIN(started_at) as oldest FROM analysis_status 
                WHERE status IN ('pending', 'in_progress')`)
      ]);

      const byStatus: Record<string, number> = {};
      statusResults.forEach((row: any) => {
        byStatus[row.status] = row.count;
      });

      return {
        total: totalResult?.count || 0,
        byStatus,
        averageProgress: progressResult?.avg || 0,
        oldestActive: oldestActiveResult?.oldest ? new Date(oldestActiveResult.oldest) : null
      };
    } catch (error) {
      logger.error('Failed to get analysis stats:', error);
      throw error;
    }
  }

  static async cleanupCompletedStatuses(daysOld: number = 7): Promise<number> {
    const db = getDatabase();
    
    try {
      const result = await db.run(`
        DELETE FROM analysis_status 
        WHERE status IN ('completed', 'failed') 
        AND completed_at < datetime('now', '-${daysOld} days')
      `);

      const deletedCount = result.changes || 0;
      if (deletedCount > 0) {
        logger.info(`Cleaned up ${deletedCount} old analysis statuses`);
      }

      return deletedCount;
    } catch (error) {
      logger.error('Failed to cleanup old analysis statuses:', error);
      throw error;
    }
  }

  private static mapRowToAnalysisStatus(row: any): AnalysisStatusType {
    return {
      id: row.id,
      projectId: row.project_id,
      status: row.status,
      progress: row.progress,
      currentStep: row.current_step,
      error: row.error,
      startedAt: new Date(row.started_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined
    };
  }
}