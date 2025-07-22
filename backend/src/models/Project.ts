import { getDatabase } from '../database/connection';
import { Project as ProjectType } from '../types';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class ProjectModel {
  static async create(data: {
    name: string;
    repositoryUrl: string;
    repositoryType?: 'single' | 'multi';
    branch?: string;
  }): Promise<ProjectType> {
    const db = getDatabase();
    const id = `proj_${uuidv4()}`;
    const now = new Date();

    try {
      await db.run(
        `INSERT INTO projects (id, name, repository_url, repository_type, branch, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          data.name,
          data.repositoryUrl,
          data.repositoryType || 'single',
          data.branch || 'main',
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

  static async findAll(options?: {
    limit?: number;
    offset?: number;
    orderBy?: 'created_at' | 'updated_at' | 'name';
    order?: 'ASC' | 'DESC';
  }): Promise<ProjectType[]> {
    const db = getDatabase();
    
    try {
      const {
        limit = 100,
        offset = 0,
        orderBy = 'created_at',
        order = 'DESC'
      } = options || {};

      const query = `
        SELECT * FROM projects 
        ORDER BY ${orderBy} ${order}
        LIMIT ? OFFSET ?
      `;

      const rows = await db.all(query, [limit, offset]);
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

  static async findByRepositoryUrl(repositoryUrl: string): Promise<ProjectType | null> {
    const db = getDatabase();
    
    try {
      const row = await db.get(
        'SELECT * FROM projects WHERE repository_url = ?',
        [repositoryUrl]
      );

      return row ? this.mapRowToProject(row) : null;
    } catch (error) {
      logger.error(`Failed to fetch project by repository URL ${repositoryUrl}:`, error);
      throw error;
    }
  }

  static async update(id: string, data: Partial<{
    name: string;
    status: 'pending' | 'analyzing' | 'completed' | 'failed';
    branch: string;
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

      if (data.branch !== undefined) {
        updates.push('branch = ?');
        values.push(data.branch);
      }

      if (data.lastAnalyzedAt !== undefined) {
        updates.push('last_analyzed_at = ?');
        values.push(data.lastAnalyzedAt.toISOString());
      }

      if (updates.length === 0) {
        return await this.findById(id);
      }

      updates.push('updated_at = ?');
      values.push(now.toISOString());
      values.push(id);

      const result = await db.run(
        `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      if (result.changes === 0) {
        return null;
      }

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

  static async getProjectStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    recentlyCreated: number;
    recentlyAnalyzed: number;
  }> {
    const db = getDatabase();
    
    try {
      const [totalResult, statusResults, typeResults, recentCreated, recentAnalyzed] = await Promise.all([
        db.get('SELECT COUNT(*) as count FROM projects'),
        db.all('SELECT status, COUNT(*) as count FROM projects GROUP BY status'),
        db.all('SELECT repository_type, COUNT(*) as count FROM projects GROUP BY repository_type'),
        db.get("SELECT COUNT(*) as count FROM projects WHERE created_at > datetime('now', '-7 days')"),
        db.get("SELECT COUNT(*) as count FROM projects WHERE last_analyzed_at > datetime('now', '-7 days')")
      ]);

      const byStatus: Record<string, number> = {};
      statusResults.forEach((row: any) => {
        byStatus[row.status] = row.count;
      });

      const byType: Record<string, number> = {};
      typeResults.forEach((row: any) => {
        byType[row.repository_type] = row.count;
      });

      return {
        total: totalResult?.count || 0,
        byStatus,
        byType,
        recentlyCreated: recentCreated?.count || 0,
        recentlyAnalyzed: recentAnalyzed?.count || 0
      };
    } catch (error) {
      logger.error('Failed to get project stats:', error);
      throw error;
    }
  }

  static async searchProjects(query: string, options?: {
    limit?: number;
    offset?: number;
  }): Promise<ProjectType[]> {
    const db = getDatabase();
    
    try {
      const { limit = 50, offset = 0 } = options || {};
      
      const searchQuery = `%${query.toLowerCase()}%`;
      const rows = await db.all(`
        SELECT * FROM projects 
        WHERE LOWER(name) LIKE ? OR LOWER(repository_url) LIKE ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `, [searchQuery, searchQuery, limit, offset]);

      return rows.map(this.mapRowToProject);
    } catch (error) {
      logger.error(`Failed to search projects with query "${query}":`, error);
      throw error;
    }
  }

  private static mapRowToProject(row: any): ProjectType {
    return {
      id: row.id,
      name: row.name,
      repositoryUrl: row.repository_url,
      repositoryType: row.repository_type,
      branch: row.branch,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      lastAnalyzedAt: row.last_analyzed_at ? new Date(row.last_analyzed_at) : undefined
    };
  }
}