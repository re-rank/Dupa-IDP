/**
 * Repository Analyzer
 * 
 * Implements the RepositoryAnalyzer interface from design.md
 * Handles Git repository analysis and structure detection
 */

import path from 'path';
import fs from 'fs/promises';
import { gitService, FileInfo } from '../git/gitService';
import { FileTypeDetector, FileType } from './fileTypeDetector';
import { FrameworkDetector, FrameworkInfo } from './frameworkDetector';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../middlewares/errorHandler';

/**
 * Project interface
 */
interface Project {
  id: string;
  name: string;
  repositoryUrl: string;
  branch?: string;
}

/**
 * Repository statistics
 */
export interface RepositoryStats {
  totalFiles: number;
  totalSize: number;
  languageDistribution: Record<string, number>;
  fileTypeDistribution: Record<string, number>;
  largestFiles: Array<{ path: string; size: number }>;
  configurationFiles: string[];
  documentationFiles: string[];
}

/**
 * Repository structure
 */
export interface RepositoryStructure {
  rootPath: string;
  files: FileInfo[];
  stats: RepositoryStats;
  directories: string[];
  frameworks: Framework[];
  projectType: { type: string; confidence: number };
}

/**
 * Framework detection result (aligns with design.md)
 */
export interface Framework {
  name: string;
  version?: string;
  type: 'frontend' | 'backend' | 'database' | 'build' | 'test' | 'deployment';
  confidence: number;
  files: string[];
  indicators: string[];
}

/**
 * Dependency information (aligns with design.md)
 */
export interface Dependency {
  id: string;
  source: string;
  target: string;
  type: 'api' | 'database' | 'service' | 'library';
  method?: string;
  endpoint?: string;
  confidence: number;
  metadata?: any;
}

/**
 * Repository Analyzer implementation
 */
export class RepositoryAnalyzer {
  private tempDir: string;
  private maxFileSize: number;
  private ignoredPatterns: string[];

  constructor() {
    this.tempDir = process.env.TEMP_DIR || path.join(process.cwd(), 'temp', 'repos');
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '52428800', 10); // 50MB default
    this.ignoredPatterns = [
      'node_modules/**',
      '.git/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '**/*.min.js',
      '**/*.map',
      '**/vendor/**',
      '**/__pycache__/**',
      '**/.venv/**',
      '**/venv/**'
    ];
  }

  /**
   * Clone a Git repository (implements design.md interface)
   */
  async cloneRepository(url: string, branch: string = 'main'): Promise<string> {
    const repoId = uuidv4();
    const repoPath = path.join(this.tempDir, repoId);

    try {
      // Use existing gitService for cloning
      await gitService.cloneRepository(url, repoPath, branch);
      return repoPath;
    } catch (error: any) {
      throw new AppError(`Failed to clone repository: ${error.message}`, 500, 'CLONE_FAILED');
    }
  }

  /**
   * Scan directory and build file structure (implements design.md interface)
   */
  async scanDirectory(path: string): Promise<FileStructure> {
    const files = await gitService.scanRepository(path);
    const stats = this.calculateStats(files);
    const directories = this.extractDirectories(files);

    return {
      root: path,
      directories: this.buildDirectoryStructure(files),
      files: files.filter(f => !f.isDirectory),
      totalFiles: stats.totalFiles,
      totalDirectories: directories.length,
      totalSize: stats.totalSize
    };
  }

  /**
   * Detect frameworks (implements design.md interface)
   */
  async detectFrameworks(files: FileInfo[]): Promise<Framework[]> {
    const frameworkDetector = new FrameworkDetector();
    const detections = await frameworkDetector.detectFrameworks(
      files.map(f => f.relativePath)
    );

    // Convert to design.md Framework format
    return detections.map(detection => ({
      name: detection.name,
      version: detection.version,
      type: this.mapFrameworkType(detection.type),
      confidence: detection.confidence,
      files: detection.configFiles || [],
      indicators: detection.patterns || []
    }));
  }

  /**
   * Extract dependencies (implements design.md interface)
   */
  async extractDependencies(files: FileInfo[]): Promise<Dependency[]> {
    // This will be implemented with language parsers
    logger.info('Extracting dependencies from files');
    return [];
  }

  /**
   * Analyze repository (existing method enhanced)
   */
  async analyzeRepository(
    project: Project,
    repoPath: string
  ): Promise<RepositoryStructure> {
    logger.info(`Starting repository analysis for project: ${project.id}`);

    const files = await gitService.scanRepository(repoPath);
    const stats = this.calculateStats(files);
    const directories = this.extractDirectories(files);
    const frameworks = await this.detectFrameworks(files);
    const projectType = await this.detectProjectType(files);

    const structure: RepositoryStructure = {
      rootPath: repoPath,
      files,
      stats,
      directories,
      frameworks,
      projectType
    };

    logger.info(`Repository analysis completed. Found ${files.length} files`);
    return structure;
  }

  /**
   * Calculate repository statistics
   */
  private calculateStats(files: FileInfo[]): RepositoryStats {
    const stats: RepositoryStats = {
      totalFiles: 0,
      totalSize: 0,
      languageDistribution: {},
      fileTypeDistribution: {},
      largestFiles: [],
      configurationFiles: [],
      documentationFiles: []
    };

    const fileList = files.filter(f => !f.isDirectory);
    stats.totalFiles = fileList.length;

    const sizeMap = new Map<string, number>();

    for (const file of fileList) {
      stats.totalSize += file.size;
      sizeMap.set(file.relativePath, file.size);

      const fileTypeInfo = FileTypeDetector.detectFileType(file.name);
      
      if (fileTypeInfo.language !== 'Other') {
        stats.languageDistribution[fileTypeInfo.language] = 
          (stats.languageDistribution[fileTypeInfo.language] || 0) + 1;
      }

      stats.fileTypeDistribution[fileTypeInfo.type] = 
        (stats.fileTypeDistribution[fileTypeInfo.type] || 0) + 1;

      if (fileTypeInfo.isConfiguration) {
        stats.configurationFiles.push(file.relativePath);
      }

      if (fileTypeInfo.isDocumentation) {
        stats.documentationFiles.push(file.relativePath);
      }
    }

    const sortedFiles = Array.from(sizeMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    stats.largestFiles = sortedFiles.map(([path, size]) => ({ path, size }));

    return stats;
  }

  /**
   * Extract directory list
   */
  private extractDirectories(files: FileInfo[]): string[] {
    const directories = files
      .filter(f => f.isDirectory)
      .map(f => f.relativePath)
      .sort();

    return directories;
  }

  /**
   * Build directory structure for design.md FileStructure
   */
  private buildDirectoryStructure(files: FileInfo[]): Directory[] {
    const dirMap = new Map<string, Directory>();
    
    // Create directory objects
    for (const file of files.filter(f => f.isDirectory)) {
      dirMap.set(file.relativePath, {
        path: file.path,
        name: path.basename(file.path),
        files: [],
        subdirectories: []
      });
    }

    // Build hierarchy
    for (const [dirPath, dir] of dirMap) {
      const parentPath = path.dirname(dirPath);
      if (parentPath !== '.' && dirMap.has(parentPath)) {
        dirMap.get(parentPath)!.subdirectories.push(dir);
      }
    }

    // Add files to directories
    for (const file of files.filter(f => !f.isDirectory)) {
      const dirPath = path.dirname(file.relativePath);
      if (dirMap.has(dirPath)) {
        dirMap.get(dirPath)!.files.push(file);
      }
    }

    // Return root directories
    return Array.from(dirMap.values()).filter(dir => {
      const parentPath = path.dirname(dir.path);
      return parentPath === '.' || !dirMap.has(parentPath);
    });
  }

  /**
   * Map framework type to design.md types
   */
  private mapFrameworkType(type: string): Framework['type'] {
    const typeMap: Record<string, Framework['type']> = {
      'frontend': 'frontend',
      'backend': 'backend',
      'database': 'database',
      'build': 'build',
      'test': 'test',
      'deployment': 'deployment',
      'framework': 'backend',
      'library': 'backend'
    };

    return typeMap[type.toLowerCase()] || 'backend';
  }

  /**
   * Detect project type
   */
  async detectProjectType(
    files: FileInfo[]
  ): Promise<{ type: string; confidence: number }> {
    const configFiles = files.filter(f => !f.isDirectory).map(f => f.name);
    
    if (configFiles.includes('package.json')) {
      return { type: 'Node.js', confidence: 1.0 };
    }
    
    if (configFiles.includes('requirements.txt') || configFiles.includes('setup.py') || 
        configFiles.includes('pyproject.toml') || configFiles.includes('Pipfile')) {
      return { type: 'Python', confidence: 1.0 };
    }
    
    if (configFiles.includes('pom.xml')) {
      return { type: 'Java (Maven)', confidence: 1.0 };
    }
    
    if (configFiles.includes('build.gradle') || configFiles.includes('build.gradle.kts')) {
      return { type: 'Java (Gradle)', confidence: 1.0 };
    }
    
    if (configFiles.includes('go.mod')) {
      return { type: 'Go', confidence: 1.0 };
    }
    
    if (configFiles.includes('Cargo.toml')) {
      return { type: 'Rust', confidence: 1.0 };
    }
    
    if (configFiles.includes('Gemfile')) {
      return { type: 'Ruby', confidence: 1.0 };
    }
    
    if (configFiles.includes('composer.json')) {
      return { type: 'PHP', confidence: 1.0 };
    }

    const stats = FileTypeDetector.getLanguageStats(configFiles);
    const dominantLanguage = Array.from(stats.entries())
      .sort((a, b) => b[1] - a[1])[0];

    if (dominantLanguage) {
      const totalFiles = Array.from(stats.values()).reduce((a, b) => a + b, 0);
      const confidence = dominantLanguage[1] / totalFiles;
      return { type: dominantLanguage[0], confidence };
    }

    return { type: 'Unknown', confidence: 0 };
  }

  /**
   * Find important files in the repository
   */
  findImportantFiles(files: FileInfo[]): Record<string, string[]> {
    const importantFiles: Record<string, string[]> = {
      entry: [],
      configuration: [],
      documentation: [],
      tests: [],
      build: []
    };

    for (const file of files) {
      if (file.isDirectory) continue;

      const fileName = file.name.toLowerCase();
      const relativePath = file.relativePath;

      // Entry points
      if (fileName === 'index.js' || fileName === 'index.ts' || 
          fileName === 'main.js' || fileName === 'main.ts' ||
          fileName === 'app.js' || fileName === 'app.ts' ||
          fileName === 'server.js' || fileName === 'server.ts' ||
          fileName === 'main.py' || fileName === 'app.py' ||
          fileName === 'main.go' || fileName === 'main.rs') {
        importantFiles.entry.push(relativePath);
      }

      // Configuration files
      if (FileTypeDetector.isConfigurationFile(fileName)) {
        importantFiles.configuration.push(relativePath);
      }

      // Documentation
      if (fileName === 'readme.md' || fileName === 'readme.txt' || 
          fileName.startsWith('readme.')) {
        importantFiles.documentation.push(relativePath);
      }

      // Tests
      if (relativePath.includes('test') || relativePath.includes('spec') ||
          fileName.includes('.test.') || fileName.includes('.spec.')) {
        importantFiles.tests.push(relativePath);
      }

      // Build files
      if (fileName === 'dockerfile' || fileName === 'docker-compose.yml' ||
          fileName === 'makefile' || fileName === 'webpack.config.js' ||
          fileName === 'vite.config.js' || fileName === 'rollup.config.js') {
        importantFiles.build.push(relativePath);
      }
    }

    return importantFiles;
  }

  /**
   * Clean up temporary repository files
   */
  async cleanup(repoPath: string): Promise<void> {
    try {
      await fs.rm(repoPath, { recursive: true, force: true });
      logger.info(`Cleaned up temporary repository: ${repoPath}`);
    } catch (error) {
      logger.error(`Failed to clean up repository: ${repoPath}`, error);
    }
  }
}

// Interfaces from design.md for FileStructure
interface Directory {
  path: string;
  name: string;
  files: FileInfo[];
  subdirectories: Directory[];
}

interface FileStructure {
  root: string;
  directories: Directory[];
  files: FileInfo[];
  totalFiles: number;
  totalDirectories: number;
  totalSize: number;
}

export const repositoryAnalyzer = new RepositoryAnalyzer();