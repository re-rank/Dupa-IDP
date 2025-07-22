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

// Frontend-specific types
export interface UIState {
  loading: boolean;
  error: string | null;
  success: string | null;
}

export interface ProjectListState extends UIState {
  projects: Project[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  filters: {
    status?: string;
    search?: string;
  };
}

export interface ProjectDetailState extends UIState {
  project: Project | null;
  analysis: AnalysisData | null;
  analysisStatus: AnalysisStatus | null;
}

export interface VisualizationState {
  selectedNode: string | null;
  selectedEdge: string | null;
  filters: {
    nodeTypes: string[];
    edgeTypes: string[];
    technologies: string[];
  };
  layout: 'force' | 'hierarchical' | 'circular';
  zoom: number;
  center: { x: number; y: number };
}

// API Response types
export interface APIError {
  code: string;
  message: string;
  details?: any;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  timestamp: string;
}

// Form types
export interface CreateProjectForm {
  name: string;
  repositoryUrl: string;
  repositoryType: 'single' | 'multi';
  branch?: string;
}

export interface AnalysisOptionsForm {
  branch?: string;
  depth?: number;
  includeTests?: boolean;
  excludePatterns?: string[];
  languages?: string[];
  frameworks?: string[];
}

// Chart data types
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

export interface MetricTrend {
  date: string;
  value: number;
  label?: string;
}

// Navigation types
export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  badge?: string | number;
  children?: NavItem[];
}

// Theme types
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
}

// Component props types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'url';
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Hook types
export interface UseAPIOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: APIError) => void;
}

export interface UseAPIResult<T> {
  data: T | null;
  loading: boolean;
  error: APIError | null;
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

// Store types (for state management)
export interface AppStore {
  // UI state
  theme: Theme;
  sidebarOpen: boolean;
  notifications: Notification[];
  
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Project state
  projects: Project[];
  currentProject: Project | null;
  
  // Analysis state
  currentAnalysis: AnalysisData | null;
  analysisHistory: AnalysisResult[];
  
  // Actions
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  setCurrentProject: (project: Project | null) => void;
  setCurrentAnalysis: (analysis: AnalysisData | null) => void;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    notifications: boolean;
  };
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Event types
export interface AnalysisProgressEvent {
  projectId: string;
  progress: number;
  currentStep: string;
  timestamp: Date;
}

export interface AnalysisCompleteEvent {
  projectId: string;
  result: AnalysisData;
  timestamp: Date;
}

export interface AnalysisErrorEvent {
  projectId: string;
  error: string;
  timestamp: Date;
}