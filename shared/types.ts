// Shared types for Project Atlas

export interface Project {
  id: string;
  name: string;
  repositoryUrl: string;
  repositoryType: 'single' | 'multi';
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  lastAnalyzedAt?: Date;
  description?: string;
  tags?: string[];
  visibility: 'public' | 'private';
  owner?: string;
}

export interface AnalysisStatus {
  id: string;
  projectId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  currentStep?: string;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}

export interface AnalysisResult {
  id: string;
  projectId: string;
  version: string;
  data: AnalysisData;
  createdAt: Date;
}

export interface AnalysisData {
  projectId: string;
  structure: RepositoryStructure;
  frameworks: FrameworkInfo[];
  dependencies: Dependency[];
  apiCalls: APICall[];
  databaseConnections: DatabaseConnection[];
  environmentVariables: EnvironmentVariable[];
  projectStack: ProjectStack;
  dependencyGraph: DependencyGraph;
  metrics: ProjectMetrics;
  performance: PerformanceMetrics;
  security?: SecurityAnalysis;
  quality?: QualityMetrics;
}

export interface RepositoryStructure {
  rootPath: string;
  files: FileInfo[];
  stats: RepositoryStats;
  directories: string[];
  importantFiles: Record<string, string[]>;
  projectType: { type: string; confidence: number };
}

export interface RepositoryStats {
  totalFiles: number;
  totalSize: number;
  languageDistribution: Record<string, number>;
  fileTypeDistribution: Record<string, number>;
  largestFiles: Array<{ path: string; size: number }>;
  configurationFiles: string[];
  documentationFiles: string[];
  testFiles: string[];
  binaryFiles: string[];
}

export interface FileInfo {
  name: string;
  path: string;
  relativePath: string;
  size: number;
  extension: string;
  isDirectory: boolean;
  lastModified: Date;
  content?: string;
  language?: string;
  category?: 'source' | 'config' | 'docs' | 'test' | 'build' | 'asset' | 'other';
}

export interface FrameworkInfo {
  name: string;
  type: 'frontend' | 'backend' | 'fullstack' | 'library' | 'tool' | 'database' | 'testing';
  confidence: number;
  version?: string;
  configFiles: string[];
  indicators: string[];
  category?: string;
  ecosystem?: string;
}

export interface Dependency {
  name: string;
  version?: string;
  type: 'production' | 'development' | 'peer' | 'optional';
  source: 'npm' | 'pip' | 'maven' | 'gradle' | 'gem' | 'go' | 'cargo' | 'composer' | 'other';
  license?: string;
  vulnerabilities?: SecurityVulnerability[];
  outdated?: boolean;
  latestVersion?: string;
}

export interface APICall {
  type: 'http' | 'graphql' | 'websocket' | 'grpc' | 'rest';
  method?: string;
  endpoint?: string;
  file: string;
  line: number;
  confidence: number;
  framework?: string;
  authentication?: string;
  parameters?: string[];
  responseType?: string;
}

export interface DatabaseConnection {
  type: 'sql' | 'nosql' | 'cache' | 'search' | 'graph';
  database: string;
  connectionString?: string;
  file: string;
  line: number;
  confidence: number;
  operations?: string[];
  tables?: string[];
  indexes?: string[];
}

export interface EnvironmentVariable {
  name: string;
  usedIn: string[];
  possibleType?: 'api_key' | 'database_url' | 'api_endpoint' | 'config' | 'secret' | 'feature_flag';
  required?: boolean;
  defaultValue?: string;
  description?: string;
}

export interface ProjectStack {
  primaryLanguage: string;
  stack: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'desktop' | 'cli' | 'library' | 'unknown';
  frameworks: string[];
  buildTools: string[];
  databases: string[];
  cloudServices: string[];
  architecture: 'monolith' | 'microservices' | 'serverless' | 'jamstack' | 'unknown';
  deployment: string[];
}

export interface DependencyGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    totalNodes: number;
    totalEdges: number;
    generatedAt: string;
    layout?: string;
  };
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'service' | 'database' | 'api' | 'framework' | 'library' | 'external';
  category: string;
  confidence?: number;
  version?: string;
  metadata?: Record<string, any>;
  position?: { x: number; y: number };
  size?: number;
  color?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: 'api_call' | 'database_connection' | 'dependency' | 'import' | 'inheritance';
  weight?: number;
  confidence?: number;
  metadata?: Record<string, any>;
  label?: string;
  color?: string;
}

export interface ProjectMetrics {
  totalFiles: number;
  totalLines: number;
  totalAPICalls: number;
  totalDependencies: number;
  complexity: 'low' | 'medium' | 'high';
  maintainabilityIndex: number;
  technicalDebt: number;
  testCoverage?: number;
  duplicateCode?: number;
  codeSmells?: number;
}

export interface PerformanceMetrics {
  analysisTime: number;
  memoryUsage: number;
  cpuUsage?: number;
  diskUsage?: number;
  networkRequests?: number;
}

export interface SecurityAnalysis {
  vulnerabilities: SecurityVulnerability[];
  secrets: DetectedSecret[];
  permissions: Permission[];
  riskScore: number;
  recommendations: string[];
}

export interface SecurityVulnerability {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  file?: string;
  line?: number;
  cwe?: string;
  cvss?: number;
  fixRecommendation?: string;
}

export interface DetectedSecret {
  type: 'api_key' | 'password' | 'token' | 'certificate' | 'private_key';
  file: string;
  line: number;
  confidence: number;
  masked: string;
}

export interface Permission {
  type: string;
  scope: string;
  file: string;
  line: number;
  risk: 'low' | 'medium' | 'high';
}

export interface QualityMetrics {
  codeQuality: number;
  maintainability: number;
  reliability: number;
  security: number;
  testability: number;
  documentation: number;
  overall: number;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: Record<string, any>;
}

// WebSocket Message Types
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
  id?: string;
}

export interface AnalysisProgressMessage extends WebSocketMessage {
  type: 'analysis:progress';
  payload: {
    projectId: string;
    progress: number;
    currentStep: string;
    estimatedTime?: number;
  };
}

export interface AnalysisCompleteMessage extends WebSocketMessage {
  type: 'analysis:complete';
  payload: {
    projectId: string;
    result: AnalysisData;
  };
}

export interface AnalysisErrorMessage extends WebSocketMessage {
  type: 'analysis:error';
  payload: {
    projectId: string;
    error: string;
  };
}

// Export and Import Types
export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf' | 'png' | 'svg';
  sections?: string[];
  includeMetadata?: boolean;
  template?: string;
}

export interface ImportOptions {
  source: 'github' | 'gitlab' | 'bitbucket' | 'local';
  credentials?: {
    token?: string;
    username?: string;
    password?: string;
  };
  options?: {
    branch?: string;
    depth?: number;
    includePrivate?: boolean;
  };
}

// Configuration Types
export interface AnalysisConfig {
  maxFileSize: number;
  maxAnalysisTime: number;
  excludePatterns: string[];
  includePatterns: string[];
  languages: string[];
  frameworks: string[];
  enableSecurity: boolean;
  enablePerformance: boolean;
  enableQuality: boolean;
  parallelism: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    browser: boolean;
    slack: boolean;
  };
  dashboard: {
    defaultView: string;
    refreshInterval: number;
    showMetrics: boolean;
  };
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
  timestamp: string;
}

export interface ValidationError extends AppError {
  field: string;
  value: any;
  constraint: string;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Event Types
export interface ProjectEvent {
  type: 'created' | 'updated' | 'deleted' | 'analyzed' | 'exported';
  projectId: string;
  userId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface SystemEvent {
  type: 'startup' | 'shutdown' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}