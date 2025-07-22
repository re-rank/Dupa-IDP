import { getDatabase } from '../database/connection';
import { AnalysisStatus as AnalysisStatusType } from '../../../shared/types';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class AnalysisStatusModel {
  static async create(data: {
    projectId: string;
    status?: 'pending' | 'cloning' | 'scanning' | 'analyzing' | 'generating' | 'completed' | 'failed';
    progress?: number;
  }): Promise<AnalysisStatusType & { id: string }> {
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
          'Initializing analysis',
          now.toISOString()
        ]
      );

      logger.info(`Created analysis status for project: ${data.projectId}`);
      const status = await this.findByProjectId(data.projectId);
      return { ...status!, id };
    } catch (error) {
      logger.error(`Failed to create analysis status for project ${data.projectId}:`, error);
      throw error;
    }
  }

  static async findByProjectId(projectId: string): Promise<(AnalysisStatusType & { id: string }) | null> {
    const db = getDatabase();
    
    try {
      const row = await db.get(
        'SELECT * FROM analysis_status WHERE project_id = ? ORDER BY started_at DESC LIMIT 1',
        [projectId]
      );

      return row ? this.mapRowToStatus(row) : null;
    } catch (error) {
      logger.error(`Failed to fetch analysis status for project ${projectId}:`, error);
      throw error;
    }
  }

  static async update(statusId: string, data: Partial<{
    status: 'pending' | 'cloning' | 'scanning' | 'analyzing' | 'generating' | 'completed' | 'failed';
    progress: number;
    currentStep: string;
    error: string | null;
    startedAt?: Date;
    completedAt?: Date;
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
        updates.push('error_message = ?');
        values.push(data.error);
      }

      if (data.status === 'completed' || data.status === 'failed') {
        updates.push('completed_at = ?');
        values.push(new Date().toISOString());
      }

      if (updates.length === 0) {
        const row = await db.get('SELECT * FROM analysis_status WHERE id = ?', [statusId]);
        return row ? this.mapRowToStatus(row) : null;
      }

      if (data.startedAt !== undefined) {
        updates.push('started_at = ?');
        values.push(data.startedAt.toISOString());
      }

      if (data.completedAt !== undefined) {
        updates.push('completed_at = ?');
        values.push(data.completedAt.toISOString());
      }

      values.push(statusId);

      await db.run(
        `UPDATE analysis_status SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      const row = await db.get('SELECT * FROM analysis_status WHERE id = ?', [statusId]);
      return row ? this.mapRowToStatus(row) : null;
    } catch (error) {
      logger.error(`Failed to update analysis status ${statusId}:`, error);
      throw error;
    }
  }

  static async deleteByProjectId(projectId: string): Promise<boolean> {
    const db = getDatabase();
    
    try {
      const result = await db.run(
        'DELETE FROM analysis_status WHERE project_id = ?',
        [projectId]
      );

      const deleted = (result.changes || 0) > 0;
      if (deleted) {
        logger.info(`Deleted analysis status for project: ${projectId}`);
      }

      return deleted;
    } catch (error) {
      logger.error(`Failed to delete analysis status for project ${projectId}:`, error);
      throw error;
    }
  }

  static async findActiveAnalyses(): Promise<AnalysisStatusType[]> {
    const db = getDatabase();
    
    try {
      const rows = await db.all(
        `SELECT * FROM analysis_status 
         WHERE status IN ('pending', 'cloning', 'scanning', 'analyzing', 'generating')
         ORDER BY started_at ASC`
      );

      return rows.map(this.mapRowToStatus);
    } catch (error) {
      logger.error('Failed to fetch active analyses:', error);
      throw error;
    }
  }

  private static mapRowToStatus(row: any): AnalysisStatusType & { id: string } {
    return {
      id: row.id,
      projectId: row.project_id,
      status: row.status,
      progress: row.progress,
      currentStep: row.current_step,
      startedAt: new Date(row.started_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      error: row.error_message || undefined
    };
  }
}