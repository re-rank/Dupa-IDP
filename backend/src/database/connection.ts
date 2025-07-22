/**
 * Database Connection Manager
 * 
 * Handles SQLite database connection and schema initialization
 */

import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs/promises';
import { logger } from '../utils/logger';

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

/**
 * Initialize the database connection and schema
 */
export const initializeDatabase = async (): Promise<Database<sqlite3.Database, sqlite3.Statement>> => {
  try {
    const dbPath = process.env.DATABASE_PATH || './data/atlas.db';
    const dbDir = path.dirname(dbPath);

    // Create data directory if it doesn't exist
    try {
      await fs.access(dbDir);
    } catch {
      await fs.mkdir(dbDir, { recursive: true });
      logger.info(`Created database directory: ${dbDir}`);
    }

    // Open database connection
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Configure database for optimal performance
    await db.exec('PRAGMA foreign_keys = ON');
    await db.exec('PRAGMA journal_mode = WAL');
    await db.exec('PRAGMA synchronous = NORMAL');
    await db.exec('PRAGMA cache_size = -2000'); // 2MB cache
    await db.exec('PRAGMA temp_store = MEMORY');

    // Initialize database schema
    await initializeSchema();

    // Run migrations if needed
    await runMigrations();

    logger.info(`✅ Database initialized successfully at ${dbPath}`);
    return db;
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    throw error;
  }
};

/**
 * Initialize the database schema from schema.sql
 */
const initializeSchema = async () => {
  if (!db) throw new Error('Database not initialized');

  try {
    // Read schema from file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf-8');
    
    // Execute schema
    await db.exec(schema);
    
    logger.info('Database schema initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize schema:', error);
    throw error;
  }
};

/**
 * Run database migrations
 */
const runMigrations = async () => {
  if (!db) throw new Error('Database not initialized');

  // Create migrations table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Get list of applied migrations
  const appliedMigrations = await db.all<{ name: string }>(
    'SELECT name FROM migrations ORDER BY id'
  );
  const applied = new Set(appliedMigrations.map(m => m.name));

  // Read migration files
  const migrationsDir = path.join(__dirname, 'migrations');
  
  try {
    await fs.access(migrationsDir);
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort();

    // Apply new migrations
    for (const file of migrationFiles) {
      if (!applied.has(file)) {
        logger.info(`Applying migration: ${file}`);
        const migrationPath = path.join(migrationsDir, file);
        const migration = await fs.readFile(migrationPath, 'utf-8');
        
        await db.exec('BEGIN TRANSACTION');
        try {
          await db.exec(migration);
          await db.run('INSERT INTO migrations (name) VALUES (?)', file);
          await db.exec('COMMIT');
          logger.info(`✅ Migration applied: ${file}`);
        } catch (error) {
          await db.exec('ROLLBACK');
          throw error;
        }
      }
    }

    logger.info('All database migrations completed successfully');
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      logger.info('No migrations directory found, skipping migrations');
    } else {
      logger.error('Failed to run migrations:', error);
      throw error;
    }
  }
};

/**
 * Get the database instance
 */
export const getDatabase = (): Database<sqlite3.Database, sqlite3.Statement> => {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
};

/**
 * Close the database connection
 */
export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.close();
    db = null;
    logger.info('Database connection closed');
  }
};

/**
 * Check database health
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    if (!db) return false;
    
    const result = await db.get('SELECT 1 as health');
    return result?.health === 1;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
};

/**
 * Get database statistics
 */
export const getDatabaseStats = async (): Promise<any> => {
  try {
    if (!db) throw new Error('Database not initialized');
    
    const [projects, analysisResults, analysisJobs] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM projects'),
      db.get('SELECT COUNT(*) as count FROM analysis_results'),
      db.get('SELECT COUNT(*) as count FROM analysis_jobs')
    ]);

    return {
      projects: projects?.count || 0,
      analysisResults: analysisResults?.count || 0,
      analysisJobs: analysisJobs?.count || 0
    };
  } catch (error) {
    logger.error('Failed to get database stats:', error);
    return {
      projects: 0,
      analysisResults: 0,
      analysisJobs: 0
    };
  }
};