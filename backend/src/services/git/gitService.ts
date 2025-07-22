import simpleGit, { SimpleGit } from 'simple-git';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../utils/logger';
import { AppError } from '../../middlewares/errorHandler';

export interface CloneOptions {
  depth?: number;
  branch?: string;
  single?: boolean;
}

export interface FileInfo {
  path: string;
  name: string;
  size: number;
  extension: string;
  isDirectory: boolean;
  relativePath: string;
}

export class GitService {
  private git: SimpleGit;
  private reposDir: string;

  constructor() {
    this.git = simpleGit();
    this.reposDir = path.join(process.cwd(), 'temp', 'repos');
    this.ensureReposDirectory();
  }

  private async ensureReposDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.reposDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create repos directory', error);
    }
  }

  public async cloneRepository(
    repoUrl: string,
    projectId: string,
    options: CloneOptions = {}
  ): Promise<string> {
    const repoPath = path.join(this.reposDir, projectId);

    try {
      await fs.rm(repoPath, { recursive: true, force: true });

      const cloneOptions: string[] = [];
      if (options.depth) {
        cloneOptions.push('--depth', options.depth.toString());
      }
      if (options.branch) {
        cloneOptions.push('--branch', options.branch);
      }
      if (options.single) {
        cloneOptions.push('--single-branch');
      }

      logger.info(`Cloning repository ${repoUrl} to ${repoPath}`);
      await this.git.clone(repoUrl, repoPath, cloneOptions);

      return repoPath;
    } catch (error) {
      logger.error(`Failed to clone repository: ${repoUrl}`, error);
      throw new AppError('Failed to clone repository', 500);
    }
  }

  public async scanRepository(repoPath: string): Promise<FileInfo[]> {
    const files: FileInfo[] = [];
    const gitignore = await this.loadGitignore(repoPath);

    await this.scanDirectory(repoPath, repoPath, files, gitignore);

    return files;
  }

  private async scanDirectory(
    basePath: string,
    currentPath: string,
    files: FileInfo[],
    gitignore: Set<string>
  ): Promise<void> {
    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        const relativePath = path.relative(basePath, fullPath);

        if (this.shouldIgnore(relativePath, entry.name, gitignore)) {
          continue;
        }

        if (entry.isDirectory()) {
          files.push({
            path: fullPath,
            name: entry.name,
            size: 0,
            extension: '',
            isDirectory: true,
            relativePath
          });

          await this.scanDirectory(basePath, fullPath, files, gitignore);
        } else {
          const stats = await fs.stat(fullPath);
          const extension = path.extname(entry.name).toLowerCase();

          if (stats.size > 100 * 1024 * 1024) {
            logger.warn(`Skipping large file: ${relativePath} (${stats.size} bytes)`);
            continue;
          }

          files.push({
            path: fullPath,
            name: entry.name,
            size: stats.size,
            extension,
            isDirectory: false,
            relativePath
          });
        }
      }
    } catch (error) {
      logger.error(`Error scanning directory: ${currentPath}`, error);
    }
  }

  private async loadGitignore(repoPath: string): Promise<Set<string>> {
    const gitignorePath = path.join(repoPath, '.gitignore');
    const ignored = new Set<string>([
      '.git',
      'node_modules',
      '.env',
      '.env.local',
      '.env.production',
      '.env.development',
      '*.log',
      'dist',
      'build',
      'coverage',
      '.vscode',
      '.idea',
      '.DS_Store',
      'Thumbs.db',
      '*.pyc',
      '__pycache__',
      'venv',
      '.venv',
      '*.egg-info',
      '.pytest_cache',
      '.mypy_cache'
    ]);

    try {
      const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
      const lines = gitignoreContent.split('\n');

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          ignored.add(trimmed);
        }
      }
    } catch (error) {
      logger.info('No .gitignore file found, using default ignore patterns');
    }

    return ignored;
  }

  private shouldIgnore(
    relativePath: string,
    fileName: string,
    gitignore: Set<string>
  ): boolean {
    if (gitignore.has(fileName)) {
      return true;
    }

    for (const pattern of gitignore) {
      if (pattern.includes('*')) {
        const regex = new RegExp(
          '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
        );
        if (regex.test(fileName) || regex.test(relativePath)) {
          return true;
        }
      } else if (relativePath.includes(pattern)) {
        return true;
      }
    }

    return false;
  }

  public async getFileContent(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      logger.error(`Failed to read file: ${filePath}`, error);
      throw new AppError('Failed to read file', 500);
    }
  }

  public async cleanupRepository(projectId: string): Promise<void> {
    const repoPath = path.join(this.reposDir, projectId);
    
    try {
      await fs.rm(repoPath, { recursive: true, force: true });
      logger.info(`Cleaned up repository: ${projectId}`);
    } catch (error) {
      logger.error(`Failed to cleanup repository: ${projectId}`, error);
    }
  }
}

export const gitService = new GitService();