import { getDatabase } from '../database/connection';
import { Project as ProjectType } from '../../../shared/types';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class ProjectModel {
  static async create(data: {
    name: string;
    repositoryUrl: string;
    repositoryType?: 'single' | 'multi';
  }): Promise<ProjectType> {
    const db = getDatabase();
    const id = `proj_${uuidv4()}`;
    const now = new Date();

    try {
      await db.run(
        `INSERT INTO projects (id, name, repository_url, repository_type, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          data.name,
          data.repositoryUrl,
          data.repositoryType || 'single',
          'pending',
          now.toISOString(),
          now.toISOString()
        ]
      );

      const project = await this.findById(id);
      if (!project) {
        throw new Error('Failed to create project');
      }

      logger.info(`Created project: ${data.name} (${id})`);
      return project;
    } catch (error) {
      logger.error('Failed to create project:', error);
      throw error;
    }
  }

  static async findAll(): Promise<ProjectType[]> {
    const db = getDatabase();
    
    try {
      const rows = await db.all(
        'SELECT * FROM projects ORDER BY created_at DESC'
      );

      return rows.map(this.mapRowToProject);
    } catch (error) {
      logger.error('Failed to fetch projects:', error);
      throw error;
    }
  }

  static async findById(id: string): Promise<ProjectType | null> {
    const db = getDatabase();
    
    try {
      const row = await db.get(
        'SELECT * FROM projects WHERE id = ?',
        [id]
      );

      return row ? this.mapRowToProject(row) : null;
    } catch (error) {
      logger.error(`Failed to fetch project ${id}:`, error);
      throw error;
    }
  }

  static async update(id: string, data: Partial<{
    name: string;
    status: 'pending' | 'analyzing' | 'completed' | 'failed';
    lastAnalyzedAt: Date;
  }>): Promise<ProjectType | null> {
    const db = getDatabase();
    const now = new Date();

    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (data.name !== undefined) {
        updates.push('name = ?');
        values.push(data.name);
      }

      if (data.status !== undefined) {
        updates.push('status = ?');
        values.push(data.status);
      }

      if (data.lastAnalyzedAt !== undefined) {
        updates.push('last_analyzed_at = ?');
        values.push(data.lastAnalyzedAt.toISOString());
      }

      updates.push('updated_at = ?');
      values.push(now.toISOString());
      values.push(id);

      await db.run(
        `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      return await this.findById(id);
    } catch (error) {
      logger.error(`Failed to update project ${id}:`, error);
      throw error;
    }
  }

  static async delete(id: string): Promise<boolean> {
    const db = getDatabase();
    
    try {
      const result = await db.run(
        'DELETE FROM projects WHERE id = ?',
        [id]
      );

      const deleted = (result.changes || 0) > 0;
      if (deleted) {
        logger.info(`Deleted project: ${id}`);
      }

      return deleted;
    } catch (error) {
      logger.error(`Failed to delete project ${id}:`, error);
      throw error;
    }
  }

  static async findByStatus(status: 'pending' | 'analyzing' | 'completed' | 'failed'): Promise<ProjectType[]> {
    const db = getDatabase();
    
    try {
      const rows = await db.all(
        'SELECT * FROM projects WHERE status = ? ORDER BY created_at DESC',
        [status]
      );

      return rows.map(this.mapRowToProject);
    } catch (error) {
      logger.error(`Failed to fetch projects with status ${status}:`, error);
      throw error;
    }
  }

  private static mapRowToProject(row: any): ProjectType {
    return {
      id: row.id,
      name: row.name,
      repositoryUrl: row.repository_url,
      repositoryType: row.repository_type,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      lastAnalyzedAt: row.last_analyzed_at ? new Date(row.last_analyzed_at) : undefined
    };
  }
}