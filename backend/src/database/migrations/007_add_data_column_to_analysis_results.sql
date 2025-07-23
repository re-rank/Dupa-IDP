-- Migration: Add data column to analysis_results table
-- Created: 2025-07-23

-- Add data column to store the complete analysis data as JSON
ALTER TABLE analysis_results ADD COLUMN data JSON;

-- Update existing rows to populate the data column from individual columns
UPDATE analysis_results SET data = json_object(
  'summary', json_object(
    'projectType', 'Unknown',
    'primaryLanguage', 'Unknown', 
    'stack', 'unknown',
    'confidence', 0
  ),
  'structure', structure,
  'dependencies', dependencies,
  'frameworks', frameworks,
  'apis', apis,
  'databases', databases,
  'metrics', metrics,
  'apiCalls', json('[]'),
  'databaseConnections', json('[]'),
  'environmentVariables', json('[]'),
  'dependencyGraph', json_object('nodes', json('[]'), 'edges', json('[]'))
) WHERE data IS NULL;