-- Project Atlas Database Schema
-- Based on design.md specifications

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
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

-- Create indexes for projects
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- Analysis results table
CREATE TABLE IF NOT EXISTS analysis_results (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version INTEGER DEFAULT 1,
  structure JSON NOT NULL,
  dependencies JSON NOT NULL,
  apis JSON NOT NULL,
  databases JSON NOT NULL,
  frameworks JSON NOT NULL,
  metrics JSON NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_id, version)
);

-- Create index for analysis results
CREATE INDEX IF NOT EXISTS idx_analysis_results_project_id ON analysis_results(project_id);

-- Dependencies table for efficient querying
CREATE TABLE IF NOT EXISTS dependencies (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  analysis_result_id TEXT REFERENCES analysis_results(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  target TEXT NOT NULL,
  type TEXT CHECK(type IN ('api', 'database', 'service', 'library')) NOT NULL,
  method TEXT,
  endpoint TEXT,
  confidence REAL DEFAULT 1.0,
  metadata JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for dependencies
CREATE INDEX IF NOT EXISTS idx_dependencies_project_id ON dependencies(project_id);
CREATE INDEX IF NOT EXISTS idx_dependencies_source_target ON dependencies(source, target);
CREATE INDEX IF NOT EXISTS idx_dependencies_type ON dependencies(type);

-- API endpoints table for quick lookups
CREATE TABLE IF NOT EXISTS api_endpoints (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  analysis_result_id TEXT REFERENCES analysis_results(id) ON DELETE CASCADE,
  method TEXT CHECK(method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS')) NOT NULL,
  path TEXT NOT NULL,
  source_file TEXT NOT NULL,
  line_number INTEGER,
  parameters JSON,
  responses JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for API endpoints
CREATE INDEX IF NOT EXISTS idx_api_endpoints_project_id ON api_endpoints(project_id);
CREATE INDEX IF NOT EXISTS idx_api_endpoints_method_path ON api_endpoints(method, path);

-- Analysis status table for real-time tracking
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

-- Analysis jobs table for tracking
CREATE TABLE IF NOT EXISTS analysis_jobs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status TEXT CHECK(status IN ('queued', 'running', 'completed', 'failed', 'cancelled')) DEFAULT 'queued',
  priority INTEGER DEFAULT 0,
  started_at DATETIME,
  completed_at DATETIME,
  error_message TEXT,
  error_details JSON,
  progress INTEGER DEFAULT 0,
  total_steps INTEGER,
  current_step TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for analysis jobs
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_project_id ON analysis_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_status ON analysis_jobs(status);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_created_at ON analysis_jobs(created_at);

-- Framework detections table
CREATE TABLE IF NOT EXISTS framework_detections (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  analysis_result_id TEXT REFERENCES analysis_results(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  version TEXT,
  type TEXT CHECK(type IN ('frontend', 'backend', 'database', 'build', 'test', 'deployment')) NOT NULL,
  confidence REAL DEFAULT 1.0,
  detected_files JSON NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for framework detections
CREATE INDEX IF NOT EXISTS idx_framework_detections_project_id ON framework_detections(project_id);
CREATE INDEX IF NOT EXISTS idx_framework_detections_name ON framework_detections(name);

-- Update triggers for updated_at
CREATE TRIGGER IF NOT EXISTS update_projects_updated_at
AFTER UPDATE ON projects
BEGIN
  UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_analysis_jobs_updated_at
AFTER UPDATE ON analysis_jobs
BEGIN
  UPDATE analysis_jobs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Views for common queries
CREATE VIEW IF NOT EXISTS v_project_status AS
SELECT 
  p.id,
  p.name,
  p.repository_url,
  p.status as project_status,
  aj.status as job_status,
  aj.progress,
  aj.total_steps,
  aj.current_step,
  p.last_analyzed_at,
  COUNT(DISTINCT ar.id) as analysis_count
FROM projects p
LEFT JOIN analysis_jobs aj ON p.id = aj.project_id AND aj.id = (
  SELECT id FROM analysis_jobs WHERE project_id = p.id ORDER BY created_at DESC LIMIT 1
)
LEFT JOIN analysis_results ar ON p.id = ar.project_id
GROUP BY p.id;

CREATE VIEW IF NOT EXISTS v_project_dependencies AS
SELECT 
  p.id as project_id,
  p.name as project_name,
  d.source,
  d.target,
  d.type,
  d.method,
  d.endpoint,
  d.confidence
FROM projects p
JOIN dependencies d ON p.id = d.project_id;

CREATE VIEW IF NOT EXISTS v_framework_summary AS
SELECT 
  p.id as project_id,
  p.name as project_name,
  fd.name as framework_name,
  fd.version,
  fd.type,
  fd.confidence,
  COUNT(fd.id) as detection_count
FROM projects p
JOIN framework_detections fd ON p.id = fd.project_id
GROUP BY p.id, fd.name, fd.type;