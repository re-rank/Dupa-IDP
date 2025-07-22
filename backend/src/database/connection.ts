import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '../utils/logger';

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export const initializeDatabase = async (): Promise<Database<sqlite3.Database, sqlite3.Statement>> => {
  try {
    const dbPath = process.env.DATABASE_URL || './data/atlas.db';
    const dbDir = path.dirname(dbPath);
    
    // Ensure database directory exists
    await fs.mkdir(dbDir, { recursive: true });
    
    // Open database connection
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');
    
    // Run migrations
    await runMigrations(db);
    
    logger.info(`✅ Database initialized successfully at ${dbPath}`);
    return db;
  } catch (error) {
    logger.error('❌ Failed to initialize database:', error);
    throw error;
  }
};

export const getDatabase = (): Database<sqlite3.Database, sqlite3.Statement> => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
};

export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.close();
    db = null;
    logger.info('Database connection closed');
  }
};

const runMigrations = async (database: Database<sqlite3.Database, sqlite3.Statement>): Promise<void> => {
  try {
    // Create migrations table if it doesn't exist
    await database.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Define migrations
    const migrations = [
      {
        name: '001_create_projects_table',
        sql: `
          CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            repository_url TEXT NOT NULL,
            repository_type TEXT CHECK(repository_type IN ('single', 'multi')) DEFAULT 'single',
            status TEXT CHECK(status IN ('pending', 'analyzing', 'completed', 'failed')) DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_analyzed_at DATETIME
          );
          
          CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
          CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
        `
      },
      {
        name: '002_create_analysis_results_table',
        sql: `
          CREATE TABLE IF NOT EXISTS analysis_results (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            result_data TEXT NOT NULL, -- JSON data
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
          );
          
          CREATE INDEX IF NOT EXISTS idx_analysis_results_project_id ON analysis_results(project_id);
          CREATE INDEX IF NOT EXISTS idx_analysis_results_created_at ON analysis_results(created_at);
        `
      },
      {
        name: '003_create_dependencies_table',
        sql: `
          CREATE TABLE IF NOT EXISTS dependencies (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            source TEXT NOT NULL,
            target TEXT NOT NULL,
            type TEXT NOT NULL,
            method TEXT,
            endpoint TEXT,
            confidence REAL,
            source_file TEXT,
            line_number INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
          );
          
          CREATE INDEX IF NOT EXISTS idx_dependencies_project_id ON dependencies(project_id);
          CREATE INDEX IF NOT EXISTS idx_dependencies_type ON dependencies(type);
          CREATE INDEX IF NOT EXISTS idx_dependencies_source ON dependencies(source);
          CREATE INDEX IF NOT EXISTS idx_dependencies_target ON dependencies(target);
        `
      },
      {
        name: '004_create_analysis_status_table',
        sql: `
          CREATE TABLE IF NOT EXISTS analysis_status (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            status TEXT CHECK(status IN ('pending', 'cloning', 'scanning', 'analyzing', 'generating', 'completed', 'failed')) DEFAULT 'pending',
            progress INTEGER DEFAULT 0,
            current_step TEXT,
            started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            completed_at DATETIME,
            error_message TEXT,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
          );
          
          CREATE INDEX IF NOT EXISTS idx_analysis_status_project_id ON analysis_status(project_id);
          CREATE INDEX IF NOT EXISTS idx_analysis_status_status ON analysis_status(status);
        `
      }
    ];

    // Execute migrations
    for (const migration of migrations) {
      const existing = await database.get(
        'SELECT name FROM migrations WHERE name = ?',
        migration.name
      );

      if (!existing) {
        logger.info(`Running migration: ${migration.name}`);
        await database.exec(migration.sql);
        await database.run(
          'INSERT INTO migrations (name) VALUES (?)',
          migration.name
        );
        logger.info(`✅ Migration completed: ${migration.name}`);
      }
    }

    logger.info('All database migrations completed successfully');
  } catch (error) {
    logger.error('Failed to run database migrations:', error);
    throw error;
  }
};