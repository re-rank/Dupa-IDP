// Project Types
export interface Project {
  id: string;
  name: string;
  repositoryUrl: string;
  repositoryType: 'single' | 'multi';
  branch?: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  lastAnalyzedAt?: Date;
}

// Analysis Types
export interface AnalysisStatus {
  id: string;
  projectId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  currentStep?: string;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

export interface AnalysisResult {
  id: string;
  projectId: string;
  data: AnalysisData;
  createdAt: Date;
}

export interface AnalysisData {
  summary: ProjectSummary;
  structure: RepositoryStructure;
  frameworks: FrameworkInfo[];
  dependencies: Dependency[];
  apiCalls: APICall[];
  databaseConnections: DatabaseConnection[];
  environmentVariables: EnvironmentVariable[];
  dependencyGraph: DependencyGraph;
  metrics: AnalysisMetrics;
  projectStack?: any;
}

// Repository Structure Types
export interface RepositoryStructure {
  rootPath: string;
  totalFiles: number;
  totalSize: number;
  languageDistribution: Record<string, number>;
  fileTypeDistribution: Record<string, number>;
  directories: string[];
  importantFiles: {
    entry: string[];
    configuration: string[];
    documentation: string[];
    tests: string[];
    build: string[];
  };
}

// Framework Detection Types
export interface FrameworkInfo {
  name: string;
  type: 'frontend' | 'backend' | 'fullstack' | 'library' | 'tool';
  confidence: number;
  version?: string;
  configFiles: string[];
  indicators: string[];
}

// Dependency Types
export interface Dependency {
  name: string;
  version?: string;
  type: 'production' | 'development' | 'peer' | 'optional';
  source: 'npm' | 'pip' | 'maven' | 'gradle' | 'gem' | 'go' | 'cargo' | 'other';
}

// API Call Types
export interface APICall {
  type: 'http' | 'graphql' | 'websocket' | 'grpc';
  method?: string;
  endpoint?: string;
  file: string;
  line: number;
  confidence: number;
  framework?: string;
}

// Database Connection Types
export interface DatabaseConnection {
  type: 'sql' | 'nosql' | 'cache' | 'search';
  database: string;
  connectionString?: string;
  file: string;
  line: number;
  confidence: number;
}

// Environment Variable Types
export interface EnvironmentVariable {
  name: string;
  usedIn: string[];
  possibleType?: 'api_key' | 'database_url' | 'api_endpoint' | 'config' | 'secret';
}

// Dependency Graph Types
export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
}

export interface DependencyNode {
  id: string;
  label: string;
  type: 'service' | 'database' | 'external' | 'config';
  technology?: string;
  metadata?: Record<string, any>;
}

export interface DependencyEdge {
  id: string;
  source: string;
  target: string;
  type: 'api_call' | 'database_connection' | 'file_import' | 'config_reference';
  label?: string;
  metadata?: Record<string, any>;
}

// Project Summary Types
export interface ProjectSummary {
  projectType: string;
  primaryLanguage: string;
  stack: 'frontend' | 'backend' | 'fullstack' | 'unknown';
  confidence: number;
  description?: string;
}

// Analysis Metrics Types
export interface AnalysisMetrics {
  totalFiles: number;
  totalLines: number;
  totalAPICalls: number;
  totalDatabaseConnections: number;
  totalDependencies: number;
  totalFrameworks: number;
  complexityScore: number;
  maintainabilityIndex: number;
  technicalDebtRatio: number;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };
  timestamp: string;
}

// File System Types
export interface FileInfo {
  name: string;
  path: string;
  relativePath: string;
  extension: string;
  size: number;
  isDirectory: boolean;
  lastModified: Date;
}

// Git Types
export interface GitInfo {
  branch: string;
  commit: string;
  author: string;
  message: string;
  timestamp: Date;
}

// Configuration Types
export interface AnalysisOptions {
  branch?: string;
  depth?: number;
  includeTests?: boolean;
  excludePatterns?: string[];
  includePatterns?: string[];
  languages?: string[];
  frameworks?: string[];
  maxFileSize?: number;
  timeout?: number;
}

// Export and Report Types
export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf' | 'png' | 'svg';
  sections?: string[];
  includeCharts?: boolean;
  includeDetails?: boolean;
}

export interface ReportData {
  project: Project;
  analysis: AnalysisData;
  generatedAt: Date;
  options: ExportOptions;
}

// Error Types
export interface AppErrorType {
  name: string;
  message: string;
  statusCode: number;
  isOperational: boolean;
  stack?: string;
}

// Job Queue Types
export interface AnalysisJob {
  id: string;
  projectId: string;
  type: 'full_analysis' | 'incremental_analysis' | 'dependency_update';
  status: 'pending' | 'active' | 'completed' | 'failed';
  progress: number;
  data: AnalysisOptions;
  result?: AnalysisData;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'analysis_progress' | 'analysis_complete' | 'analysis_error' | 'project_update';
  projectId: string;
  data: any;
  timestamp: Date;
}

// Multi-Repository Types
export interface MultiRepositoryProject extends Project {
  repositories: Repository[];
  relationships: RepositoryRelationship[];
}

export interface Repository {
  id: string;
  name: string;
  url: string;
  branch: string;
  type: 'frontend' | 'backend' | 'shared' | 'config' | 'docs';
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
}

export interface RepositoryRelationship {
  id: string;
  sourceRepo: string;
  targetRepo: string;
  type: 'api_dependency' | 'shared_library' | 'config_reference';
  confidence: number;
  evidence: string[];
}