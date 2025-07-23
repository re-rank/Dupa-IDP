-- Migration: Ensure projects table has updated_at column
-- Created: 2025-07-23

-- Check if updated_at column exists in projects table, if not add it
-- Since SQLite doesn't support conditional ALTER TABLE, we'll recreate the table

-- Create backup of projects table
DROP TABLE IF EXISTS projects_backup;
CREATE TABLE projects_backup AS SELECT * FROM projects;

-- Drop and recreate projects table with all required columns
DROP TABLE IF EXISTS projects;

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  repository_url TEXT NOT NULL,
  repository_type TEXT CHECK(repository_type IN ('single', 'multi')) DEFAULT 'single',
  branch TEXT DEFAULT 'main',
  status TEXT CHECK(status IN ('pending', 'analyzing', 'completed', 'failed')) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_analyzed_at DATETIME,
  metadata JSON
);

-- Restore data with proper column mapping
INSERT INTO projects (id, name, repository_url, repository_type, branch, status, created_at, updated_at, last_analyzed_at, metadata)
SELECT 
  id,
  name,
  repository_url,
  COALESCE(repository_type, 'single') as repository_type,
  COALESCE(branch, 'main') as branch,
  status,
  created_at,
  COALESCE(created_at, CURRENT_TIMESTAMP) as updated_at,
  last_analyzed_at,
  metadata
FROM projects_backup;

-- Drop backup table
DROP TABLE projects_backup;

-- Create indexes for projects
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- Update trigger for updated_at
CREATE TRIGGER IF NOT EXISTS update_projects_updated_at
AFTER UPDATE ON projects
BEGIN
  UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;