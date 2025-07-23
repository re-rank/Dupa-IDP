-- Migration: Create analysis_status table with correct schema
-- Created: 2025-07-23

-- Create the table with correct CHECK constraint and all required columns
CREATE TABLE IF NOT EXISTS analysis_status (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status TEXT CHECK(status IN ('pending', 'cloning', 'scanning', 'analyzing', 'generating', 'completed', 'failed', 'in_progress')) NOT NULL,
  progress INTEGER DEFAULT 0,
  current_step TEXT,
  error TEXT,
  error_details JSON,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata JSON
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_analysis_status_project_id ON analysis_status(project_id);
CREATE INDEX IF NOT EXISTS idx_analysis_status_status ON analysis_status(status);
CREATE INDEX IF NOT EXISTS idx_analysis_status_started_at ON analysis_status(started_at);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_analysis_status_updated_at;
CREATE TRIGGER update_analysis_status_updated_at
AFTER UPDATE ON analysis_status
BEGIN
  UPDATE analysis_status SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;