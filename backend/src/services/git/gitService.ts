import { simpleGit, SimpleGit, CleanOptions } from 'simple-git';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../utils/logger';

export interface FileInfo {
  name: string;
  path: string;
  relativePath: string;
  extension: string;
  size: number;
  isDirectory: boolean;
  lastModified: Date;
}

export interface CloneOptions {
  branch?: string;
  depth?: number;
  timeout?: number;
}

export interface GitInfo {
  branch: string;
  commit: string;
  author: string;
  message: string;
  timestamp: Date;
}

export class GitService {
  private git: SimpleGit;
  private readonly timeout: number;

  constructor() {
    this.timeout = parseInt(process.env.GIT_TIMEOUT || '30000');
    
    // Windows 환경에서 Git 실행 파일 경로 설정
    const gitOptions: any = {
      timeout: {
        block: this.timeout
      }
    };
    
    // Windows에서 Git 경로를 명시적으로 설정
    if (process.platform === 'win32') {
      gitOptions.binary = 'git';
      gitOptions.config = [];
    }
    
    this.git = simpleGit(gitOptions);
  }

  async cloneRepository(
    repositoryUrl: string,
    targetPath: string,
    options: CloneOptions = {}
  ): Promise<string> {
    const {
      branch = 'main',
      depth = 1,
      timeout = this.timeout
    } = options;

    try {
      logger.info(`Cloning repository: ${repositoryUrl} to ${targetPath}`);

      // Ensure target directory exists and is empty
      await fs.mkdir(targetPath, { recursive: true });
      
      // Check if directory is empty
      const files = await fs.readdir(targetPath);
      if (files.length > 0) {
        throw new Error(`Target directory ${targetPath} is not empty`);
      }

      const cloneOptions = [
        '--branch', branch,
        '--depth', depth.toString(),
        '--single-branch'
      ];

      // Add timeout option
      const gitOptions: any = {
        timeout: { block: timeout }
      };
      
      // Windows에서 Git 경로를 명시적으로 설정
      if (process.platform === 'win32') {
        gitOptions.binary = 'git';
        gitOptions.config = [];
      }
      
      const git = simpleGit(gitOptions);

      await git.clone(repositoryUrl, targetPath, cloneOptions);

      logger.info(`Successfully cloned repository to ${targetPath}`);
      return targetPath;

    } catch (error) {
      logger.error(`Failed to clone repository ${repositoryUrl}:`, error);
      logger.error('Clone error details:', {
        repositoryUrl,
        targetPath,
        branch,
        depth,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : error
      });
      
      // Cleanup on failure
      try {
        await fs.rm(targetPath, { recursive: true, force: true });
      } catch (cleanupError) {
        logger.warn(`Failed to cleanup failed clone directory:`, cleanupError);
      }
      
      throw new Error(`Failed to clone repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRepositoryInfo(repoPath: string): Promise<GitInfo> {
    try {
      const git = simpleGit(repoPath);
      
      const [branch, log] = await Promise.all([
        git.branch(),
        git.log({ maxCount: 1 })
      ]);

      const latestCommit = log.latest;
      if (!latestCommit) {
        throw new Error('No commits found in repository');
      }

      return {
        branch: branch.current || 'unknown',
        commit: latestCommit.hash,
        author: latestCommit.author_name,
        message: latestCommit.message,
        timestamp: new Date(latestCommit.date)
      };

    } catch (error) {
      logger.error(`Failed to get repository info for ${repoPath}:`, error);
      throw error;
    }
  }

  async scanRepository(repoPath: string, options?: {
    excludePatterns?: string[];
    includePatterns?: string[];
    maxFileSize?: number;
  }): Promise<FileInfo[]> {
    const {
      excludePatterns = [
        'node_modules/**',
        '.git/**',
        'dist/**',
        'build/**',
        'coverage/**',
        '*.log',
        '.DS_Store',
        'Thumbs.db'
      ],
      includePatterns = [],
      maxFileSize = 10 * 1024 * 1024 // 10MB
    } = options || {};

    try {
      logger.info(`Scanning repository: ${repoPath}`);
      
      const files: FileInfo[] = [];
      
      await this.scanDirectory(repoPath, repoPath, files, {
        excludePatterns,
        includePatterns,
        maxFileSize
      });

      logger.info(`Found ${files.length} files in repository`);
      return files;

    } catch (error) {
      logger.error(`Failed to scan repository ${repoPath}:`, error);
      throw error;
    }
  }

  private async scanDirectory(
    dirPath: string,
    rootPath: string,
    files: FileInfo[],
    options: {
      excludePatterns: string[];
      includePatterns: string[];
      maxFileSize: number;
    }
  ): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.relative(rootPath, fullPath);

        // Check exclude patterns
        if (this.matchesPatterns(relativePath, options.excludePatterns)) {
          continue;
        }

        // Check include patterns (if specified)
        if (options.includePatterns.length > 0 && 
            !this.matchesPatterns(relativePath, options.includePatterns)) {
          continue;
        }

        try {
          const stats = await fs.stat(fullPath);

          if (entry.isDirectory()) {
            files.push({
              name: entry.name,
              path: fullPath,
              relativePath,
              extension: '',
              size: 0,
              isDirectory: true,
              lastModified: stats.mtime
            });

            // Recursively scan subdirectory
            await this.scanDirectory(fullPath, rootPath, files, options);
          } else {
            // Skip files that are too large
            if (stats.size > options.maxFileSize) {
              logger.warn(`Skipping large file: ${relativePath} (${stats.size} bytes)`);
              continue;
            }

            files.push({
              name: entry.name,
              path: fullPath,
              relativePath,
              extension: path.extname(entry.name),
              size: stats.size,
              isDirectory: false,
              lastModified: stats.mtime
            });
          }
        } catch (statError) {
          logger.warn(`Failed to get stats for ${fullPath}:`, statError);
        }
      }
    } catch (error) {
      logger.warn(`Failed to read directory ${dirPath}:`, error);
    }
  }

  private matchesPatterns(filePath: string, patterns: string[]): boolean {
    return patterns.some(pattern => {
      // Simple glob pattern matching
      const regex = new RegExp(
        pattern
          .replace(/\*\*/g, '.*')
          .replace(/\*/g, '[^/]*')
          .replace(/\?/g, '[^/]')
      );
      return regex.test(filePath);
    });
  }

  async validateRepositoryUrl(repositoryUrl: string): Promise<{
    isValid: boolean;
    isAccessible: boolean;
    error?: string;
  }> {
    try {
      // Basic URL validation
      if (!repositoryUrl.match(/^https?:\/\/.+\.git$|^git@.+:.+\.git$/)) {
        return {
          isValid: false,
          isAccessible: false,
          error: 'Invalid Git repository URL format'
        };
      }

      // Try to get remote info (this will check accessibility)
      const git = simpleGit({
        timeout: { block: 10000 } // 10 second timeout for validation
      });

      await git.listRemote([repositoryUrl]);

      return {
        isValid: true,
        isAccessible: true
      };

    } catch (error) {
      logger.warn(`Repository validation failed for ${repositoryUrl}:`, error);
      
      return {
        isValid: true, // URL format might be valid
        isAccessible: false,
        error: error instanceof Error ? error.message : 'Repository not accessible'
      };
    }
  }

  async getBranches(repositoryUrl: string): Promise<string[]> {
    try {
      const git = simpleGit({
        timeout: { block: 15000 }
      });

      const result = await git.listRemote(['--heads', repositoryUrl]);
      
      const branches = result
        .split('\n')
        .filter(line => line.includes('refs/heads/'))
        .map(line => line.split('refs/heads/')[1])
        .filter(branch => branch && branch.trim());

      return branches;

    } catch (error) {
      logger.error(`Failed to get branches for ${repositoryUrl}:`, error);
      throw new Error(`Failed to get repository branches: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRepositorySize(repositoryUrl: string): Promise<number> {
    try {
      // This is a rough estimation - in practice, you might want to use Git APIs
      const tempDir = path.join(process.cwd(), 'temp', `size_check_${Date.now()}`);
      
      try {
        await this.cloneRepository(repositoryUrl, tempDir, { depth: 1 });
        
        const size = await this.getDirectorySize(tempDir);
        
        // Cleanup
        await fs.rm(tempDir, { recursive: true, force: true });
        
        return size;
      } catch (cloneError) {
        // Cleanup on error
        try {
          await fs.rm(tempDir, { recursive: true, force: true });
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
        throw cloneError;
      }

    } catch (error) {
      logger.error(`Failed to get repository size for ${repositoryUrl}:`, error);
      throw error;
    }
  }

  private async getDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0;

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          totalSize += await this.getDirectorySize(fullPath);
        } else {
          const stats = await fs.stat(fullPath);
          totalSize += stats.size;
        }
      }
    } catch (error) {
      logger.warn(`Failed to calculate size for directory ${dirPath}:`, error);
    }

    return totalSize;
  }

  async cleanup(): Promise<void> {
    // Cleanup any temporary files or connections
    logger.info('Git service cleanup completed');
  }

  async cleanupRepository(projectId: string): Promise<void> {
    try {
      const tempDir = path.join(process.cwd(), 'temp', 'repos', projectId);
      await fs.rm(tempDir, { recursive: true, force: true });
      logger.info(`Cleaned up repository for project: ${projectId}`);
    } catch (error) {
      logger.warn(`Failed to cleanup repository for project ${projectId}:`, error);
    }
  }

  async getFileContent(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return content;
    } catch (error) {
      logger.error(`Failed to read file ${filePath}:`, error);
      throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Create singleton instance
let _gitService: GitService | null = null;

export const getGitService = (): GitService => {
  if (!_gitService) {
    _gitService = new GitService();
  }
  return _gitService;
};

// For backward compatibility
export const gitService = getGitService();