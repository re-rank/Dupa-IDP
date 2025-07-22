import path from 'path';
import { gitService, FileInfo } from '../git/gitService';
import { FileTypeDetector, FileType } from './fileTypeDetector';
import { FrameworkDetector, FrameworkInfo } from './frameworkDetector';
import { logger } from '../../utils/logger';
interface Project {
  id: string;
  name: string;
  repositoryUrl: string;
}

export interface RepositoryStats {
  totalFiles: number;
  totalSize: number;
  languageDistribution: Record<string, number>;
  fileTypeDistribution: Record<string, number>;
  largestFiles: Array<{ path: string; size: number }>;
  configurationFiles: string[];
  documentationFiles: string[];
}

export interface RepositoryStructure {
  rootPath: string;
  files: FileInfo[];
  stats: RepositoryStats;
  directories: string[];
}

export class RepositoryAnalyzer {
  public async analyzeRepository(
    project: Project,
    repoPath: string
  ): Promise<RepositoryStructure> {
    logger.info(`Starting repository analysis for project: ${project.id}`);

    const files = await gitService.scanRepository(repoPath);
    const stats = this.calculateStats(files);
    const directories = this.extractDirectories(files);

    const structure: RepositoryStructure = {
      rootPath: repoPath,
      files,
      stats,
      directories
    };

    logger.info(`Repository analysis completed. Found ${files.length} files`);
    return structure;
  }

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

  private extractDirectories(files: FileInfo[]): string[] {
    const directories = files
      .filter(f => f.isDirectory)
      .map(f => f.relativePath)
      .sort();

    return directories;
  }

  public async detectProjectType(
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

  public findImportantFiles(files: FileInfo[]): Record<string, string[]> {
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

      if (fileName === 'index.js' || fileName === 'index.ts' || 
          fileName === 'main.js' || fileName === 'main.ts' ||
          fileName === 'app.js' || fileName === 'app.ts' ||
          fileName === 'server.js' || fileName === 'server.ts' ||
          fileName === 'main.py' || fileName === 'app.py' ||
          fileName === 'main.go' || fileName === 'main.rs') {
        importantFiles.entry.push(relativePath);
      }

      if (FileTypeDetector.isConfigurationFile(fileName)) {
        importantFiles.configuration.push(relativePath);
      }

      if (fileName === 'readme.md' || fileName === 'readme.txt' || 
          fileName.startsWith('readme.')) {
        importantFiles.documentation.push(relativePath);
      }

      if (relativePath.includes('test') || relativePath.includes('spec') ||
          fileName.includes('.test.') || fileName.includes('.spec.')) {
        importantFiles.tests.push(relativePath);
      }

      if (fileName === 'dockerfile' || fileName === 'docker-compose.yml' ||
          fileName === 'makefile' || fileName === 'webpack.config.js' ||
          fileName === 'vite.config.js' || fileName === 'rollup.config.js') {
        importantFiles.build.push(relativePath);
      }
    }

    return importantFiles;
  }
}

export const repositoryAnalyzer = new RepositoryAnalyzer();