// Core data models for Project Atlas

export interface Project {
  id: string;
  name: string;
  repositoryUrl: string;
  repositoryType: 'single' | 'multi';
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  lastAnalyzedAt?: Date;
}

export interface AnalysisResult {
  projectId: string;
  structure: ProjectStructure;
  dependencies: Dependency[];
  apis: APIEndpoint[];
  databases: DatabaseConnection[];
  frameworks: Framework[];
  metrics: ProjectMetrics;
}

export interface ProjectStructure {
  directories: Directory[];
  files: FileInfo[];
  languages: LanguageStats[];
  frameworks: Framework[];
}

export interface Directory {
  path: string;
  name: string;
  type: 'frontend' | 'backend' | 'database' | 'config' | 'docs' | 'tests' | 'other';
  children: string[];
}

export interface FileInfo {
  path: string;
  name: string;
  extension: string;
  size: number;
  language: string;
  framework?: string;
  type: 'source' | 'config' | 'test' | 'documentation' | 'asset';
}

export interface LanguageStats {
  language: string;
  fileCount: number;
  lineCount: number;
  percentage: number;
}

export interface Dependency {
  id: string;
  source: string;
  target: string;
  type: 'api' | 'database' | 'service' | 'library';
  method?: string;
  endpoint?: string;
  confidence: number;
  sourceFile: string;
  lineNumber: number;
}

export interface APIEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  source: string;
  lineNumber: number;
  parameters?: Parameter[];
  responses?: Response[];
  framework?: string;
}

export interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export interface Response {
  statusCode: number;
  description?: string;
  schema?: any;
}

export interface DatabaseConnection {
  id: string;
  type: 'mysql' | 'postgresql' | 'mongodb' | 'redis' | 'sqlite' | 'other';
  host?: string;
  port?: number;
  database?: string;
  source: string;
  lineNumber: number;
  orm?: string;
}

export interface Framework {
  name: string;
  version?: string;
  type: 'frontend' | 'backend' | 'database' | 'build' | 'test';
  confidence: number;
  files: string[];
}

export interface ProjectMetrics {
  totalFiles: number;
  totalLines: number;
  apiEndpoints: number;
  databaseConnections: number;
  dependencies: number;
  frameworks: number;
  complexity: 'low' | 'medium' | 'high';
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface AnalysisStatus {
  projectId: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

// Visualization data types
export interface DependencyGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'service' | 'database' | 'api' | 'library';
  framework?: string;
  size: number;
  color: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: 'api' | 'database' | 'service' | 'library';
  weight: number;
  label?: string;
}

// Error types
export interface AnalysisError {
  code: string;
  message: string;
  file?: string;
  lineNumber?: number;
  details?: any;
}

export interface PartialAnalysisResult {
  completed: string[];
  failed: string[];
  results: Partial<AnalysisResult>;
  errors: AnalysisError[];
}

// Configuration types
export interface AnalysisConfig {
  includeTests: boolean;
  includeDocs: boolean;
  maxFileSize: number;
  excludePatterns: string[];
  languageSupport: string[];
  frameworkDetection: boolean;
}