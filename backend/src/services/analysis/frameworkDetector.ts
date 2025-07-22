import fs from 'fs/promises';
import path from 'path';
import { FileInfo } from '../git/gitService';
import { logger } from '../../utils/logger';

export interface FrameworkInfo {
  name: string;
  type: 'frontend' | 'backend' | 'fullstack' | 'library' | 'tool';
  confidence: number;
  version?: string;
  configFiles: string[];
  indicators: string[];
}

export class FrameworkDetector {
  private static frameworkPatterns: Record<string, {
    configFiles: string[];
    packagePatterns?: string[];
    filePatterns?: string[];
    type: 'frontend' | 'backend' | 'fullstack' | 'library' | 'tool';
  }> = {
    // JavaScript/TypeScript Frameworks
    'React': {
      configFiles: ['package.json'],
      packagePatterns: ['react', 'react-dom'],
      filePatterns: ['.jsx', '.tsx', 'App.js', 'App.tsx'],
      type: 'frontend'
    },
    'Vue.js': {
      configFiles: ['package.json', 'vue.config.js'],
      packagePatterns: ['vue', '@vue/cli'],
      filePatterns: ['.vue', 'App.vue'],
      type: 'frontend'
    },
    'Angular': {
      configFiles: ['angular.json', 'package.json'],
      packagePatterns: ['@angular/core'],
      filePatterns: ['.component.ts', '.module.ts'],
      type: 'frontend'
    },
    'Next.js': {
      configFiles: ['next.config.js', 'next.config.mjs', 'package.json'],
      packagePatterns: ['next'],
      filePatterns: ['pages/', 'app/'],
      type: 'fullstack'
    },
    'Nuxt.js': {
      configFiles: ['nuxt.config.js', 'nuxt.config.ts', 'package.json'],
      packagePatterns: ['nuxt'],
      type: 'fullstack'
    },
    'Svelte': {
      configFiles: ['svelte.config.js', 'package.json'],
      packagePatterns: ['svelte'],
      filePatterns: ['.svelte'],
      type: 'frontend'
    },
    'Express.js': {
      configFiles: ['package.json'],
      packagePatterns: ['express'],
      type: 'backend'
    },
    'NestJS': {
      configFiles: ['nest-cli.json', 'package.json'],
      packagePatterns: ['@nestjs/core'],
      type: 'backend'
    },
    'Fastify': {
      configFiles: ['package.json'],
      packagePatterns: ['fastify'],
      type: 'backend'
    },
    'Koa': {
      configFiles: ['package.json'],
      packagePatterns: ['koa'],
      type: 'backend'
    },
    'Gatsby': {
      configFiles: ['gatsby-config.js', 'gatsby-config.ts', 'package.json'],
      packagePatterns: ['gatsby'],
      type: 'frontend'
    },
    'Vite': {
      configFiles: ['vite.config.js', 'vite.config.ts'],
      packagePatterns: ['vite'],
      type: 'tool'
    },
    'Webpack': {
      configFiles: ['webpack.config.js', 'webpack.config.ts'],
      packagePatterns: ['webpack'],
      type: 'tool'
    },
    
    // Python Frameworks
    'Django': {
      configFiles: ['manage.py', 'settings.py', 'requirements.txt', 'pyproject.toml'],
      packagePatterns: ['django'],
      filePatterns: ['models.py', 'views.py', 'urls.py'],
      type: 'fullstack'
    },
    'Flask': {
      configFiles: ['app.py', 'requirements.txt', 'pyproject.toml'],
      packagePatterns: ['flask'],
      type: 'backend'
    },
    'FastAPI': {
      configFiles: ['main.py', 'requirements.txt', 'pyproject.toml'],
      packagePatterns: ['fastapi'],
      type: 'backend'
    },
    'Pyramid': {
      configFiles: ['setup.py', 'requirements.txt'],
      packagePatterns: ['pyramid'],
      type: 'backend'
    },
    
    // Java Frameworks
    'Spring Boot': {
      configFiles: ['pom.xml', 'build.gradle', 'application.properties', 'application.yml'],
      packagePatterns: ['spring-boot'],
      filePatterns: ['@SpringBootApplication'],
      type: 'backend'
    },
    'Spring': {
      configFiles: ['pom.xml', 'build.gradle', 'applicationContext.xml'],
      packagePatterns: ['springframework'],
      type: 'backend'
    },
    
    // PHP Frameworks
    'Laravel': {
      configFiles: ['composer.json', 'artisan'],
      packagePatterns: ['laravel/framework'],
      filePatterns: ['routes/web.php', 'app/Http/Controllers'],
      type: 'fullstack'
    },
    'Symfony': {
      configFiles: ['composer.json', 'symfony.lock'],
      packagePatterns: ['symfony/framework-bundle'],
      type: 'fullstack'
    },
    'CodeIgniter': {
      configFiles: ['composer.json', 'spark'],
      packagePatterns: ['codeigniter4/framework'],
      type: 'fullstack'
    },
    
    // Ruby Frameworks
    'Ruby on Rails': {
      configFiles: ['Gemfile', 'config.ru', 'Rakefile'],
      packagePatterns: ['rails'],
      filePatterns: ['app/controllers', 'app/models', 'app/views'],
      type: 'fullstack'
    },
    'Sinatra': {
      configFiles: ['Gemfile', 'config.ru'],
      packagePatterns: ['sinatra'],
      type: 'backend'
    },
    
    // Go Frameworks
    'Gin': {
      configFiles: ['go.mod'],
      packagePatterns: ['github.com/gin-gonic/gin'],
      type: 'backend'
    },
    'Echo': {
      configFiles: ['go.mod'],
      packagePatterns: ['github.com/labstack/echo'],
      type: 'backend'
    },
    'Fiber': {
      configFiles: ['go.mod'],
      packagePatterns: ['github.com/gofiber/fiber'],
      type: 'backend'
    },
    
    // .NET Frameworks
    'ASP.NET Core': {
      configFiles: ['.csproj', 'Program.cs', 'Startup.cs'],
      packagePatterns: ['Microsoft.AspNetCore'],
      type: 'fullstack'
    },
    
    // Mobile Frameworks
    'React Native': {
      configFiles: ['package.json', 'app.json'],
      packagePatterns: ['react-native'],
      type: 'frontend'
    },
    'Flutter': {
      configFiles: ['pubspec.yaml', 'pubspec.lock'],
      filePatterns: ['.dart', 'lib/main.dart'],
      type: 'frontend'
    },
    'Ionic': {
      configFiles: ['ionic.config.json', 'package.json'],
      packagePatterns: ['@ionic/angular', '@ionic/react', '@ionic/vue'],
      type: 'frontend'
    }
  };

  public static async detectFrameworks(
    repoPath: string,
    files: FileInfo[]
  ): Promise<FrameworkInfo[]> {
    const detectedFrameworks: FrameworkInfo[] = [];
    const fileNames = files.filter(f => !f.isDirectory).map(f => f.name);
    const filePaths = files.filter(f => !f.isDirectory).map(f => f.relativePath);

    for (const [frameworkName, pattern] of Object.entries(this.frameworkPatterns)) {
      const indicators: string[] = [];
      let confidence = 0;

      // Check for config files
      const foundConfigFiles = pattern.configFiles.filter(configFile => {
        return fileNames.includes(configFile) || 
               filePaths.some(path => path.endsWith(configFile));
      });

      if (foundConfigFiles.length > 0) {
        confidence += 0.5;
        indicators.push(...foundConfigFiles.map(f => `Config: ${f}`));
      }

      // Check package dependencies
      if (pattern.packagePatterns && pattern.packagePatterns.length > 0) {
        const packageConfidence = await this.checkPackageDependencies(
          repoPath,
          files,
          pattern.packagePatterns
        );
        
        if (packageConfidence > 0) {
          confidence += packageConfidence;
          indicators.push(...pattern.packagePatterns.map(p => `Package: ${p}`));
        }
      }

      // Check file patterns
      if (pattern.filePatterns) {
        const filePatternMatches = pattern.filePatterns.filter(filePattern => {
          if (filePattern.includes('/')) {
            return filePaths.some(path => path.includes(filePattern));
          } else if (filePattern.startsWith('.')) {
            return fileNames.some(name => name.endsWith(filePattern));
          } else if (filePattern.startsWith('@')) {
            // Check for decorators in files (would need file content analysis)
            return false; // TODO: Implement content analysis
          } else {
            return fileNames.includes(filePattern);
          }
        });

        if (filePatternMatches.length > 0) {
          confidence += 0.3;
          indicators.push(...filePatternMatches.map(p => `File pattern: ${p}`));
        }
      }

      if (confidence > 0.4) {
        const version = await this.detectFrameworkVersion(
          repoPath,
          files,
          frameworkName,
          pattern.packagePatterns
        );

        detectedFrameworks.push({
          name: frameworkName,
          type: pattern.type,
          confidence: Math.min(confidence, 1),
          version,
          configFiles: foundConfigFiles,
          indicators
        });
      }
    }

    return detectedFrameworks.sort((a, b) => b.confidence - a.confidence);
  }

  private static async checkPackageDependencies(
    repoPath: string,
    files: FileInfo[],
    packagePatterns: string[]
  ): Promise<number> {
    let confidence = 0;

    // Check package.json
    const packageJsonFile = files.find(f => f.name === 'package.json' && !f.isDirectory);
    if (packageJsonFile) {
      try {
        const content = await fs.readFile(packageJsonFile.path, 'utf-8');
        const packageJson = JSON.parse(content);
        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
          ...packageJson.peerDependencies
        };

        for (const pattern of packagePatterns) {
          if (Object.keys(allDeps).some(dep => dep.includes(pattern))) {
            confidence += 0.5;
          }
        }
      } catch (error) {
        logger.warn('Failed to parse package.json', error);
      }
    }

    // Check requirements.txt
    const requirementsFile = files.find(f => f.name === 'requirements.txt' && !f.isDirectory);
    if (requirementsFile) {
      try {
        const content = await fs.readFile(requirementsFile.path, 'utf-8');
        const lines = content.split('\n');

        for (const pattern of packagePatterns) {
          if (lines.some(line => line.toLowerCase().includes(pattern.toLowerCase()))) {
            confidence += 0.5;
          }
        }
      } catch (error) {
        logger.warn('Failed to read requirements.txt', error);
      }
    }

    // Check pom.xml
    const pomFile = files.find(f => f.name === 'pom.xml' && !f.isDirectory);
    if (pomFile) {
      try {
        const content = await fs.readFile(pomFile.path, 'utf-8');
        for (const pattern of packagePatterns) {
          if (content.includes(pattern)) {
            confidence += 0.5;
          }
        }
      } catch (error) {
        logger.warn('Failed to read pom.xml', error);
      }
    }

    // Check go.mod
    const goModFile = files.find(f => f.name === 'go.mod' && !f.isDirectory);
    if (goModFile) {
      try {
        const content = await fs.readFile(goModFile.path, 'utf-8');
        for (const pattern of packagePatterns) {
          if (content.includes(pattern)) {
            confidence += 0.5;
          }
        }
      } catch (error) {
        logger.warn('Failed to read go.mod', error);
      }
    }

    return Math.min(confidence, 0.5);
  }

  private static async detectFrameworkVersion(
    repoPath: string,
    files: FileInfo[],
    frameworkName: string,
    packagePatterns?: string[]
  ): Promise<string | undefined> {
    if (!packagePatterns || packagePatterns.length === 0) {
      return undefined;
    }

    // Check package.json
    const packageJsonFile = files.find(f => f.name === 'package.json' && !f.isDirectory);
    if (packageJsonFile) {
      try {
        const content = await fs.readFile(packageJsonFile.path, 'utf-8');
        const packageJson = JSON.parse(content);
        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies
        };

        for (const pattern of packagePatterns) {
          for (const [dep, version] of Object.entries(allDeps)) {
            if (dep.includes(pattern)) {
              return this.cleanVersion(version as string);
            }
          }
        }
      } catch (error) {
        logger.warn('Failed to detect version from package.json', error);
      }
    }

    return undefined;
  }

  private static cleanVersion(version: string): string {
    // Remove version prefixes like ^, ~, >=, etc.
    return version.replace(/^[\^~>=<]+/, '');
  }

  public static async detectProjectStack(
    repoPath: string,
    files: FileInfo[],
    frameworks: FrameworkInfo[]
  ): Promise<{
    primaryLanguage: string;
    stack: 'frontend' | 'backend' | 'fullstack' | 'unknown';
    frameworks: string[];
    buildTools: string[];
    databases: string[];
  }> {
    const frontend = frameworks.filter(f => f.type === 'frontend');
    const backend = frameworks.filter(f => f.type === 'backend');
    const fullstack = frameworks.filter(f => f.type === 'fullstack');
    const tools = frameworks.filter(f => f.type === 'tool');

    let stack: 'frontend' | 'backend' | 'fullstack' | 'unknown' = 'unknown';
    
    if (fullstack.length > 0) {
      stack = 'fullstack';
    } else if (frontend.length > 0 && backend.length > 0) {
      stack = 'fullstack';
    } else if (frontend.length > 0) {
      stack = 'frontend';
    } else if (backend.length > 0) {
      stack = 'backend';
    }

    // Detect primary language
    const languageStats = this.getLanguageDistribution(files);
    const primaryLanguage = languageStats.length > 0 ? languageStats[0].language : 'Unknown';

    // Detect databases (basic detection)
    const databases = await this.detectDatabases(files);

    return {
      primaryLanguage,
      stack,
      frameworks: [...frontend, ...backend, ...fullstack].map(f => f.name),
      buildTools: tools.map(t => t.name),
      databases
    };
  }

  private static getLanguageDistribution(files: FileInfo[]): Array<{ language: string; count: number }> {
    const stats = new Map<string, number>();

    for (const file of files.filter(f => !f.isDirectory)) {
      const ext = file.extension.toLowerCase();
      let language = 'Other';

      if (['.js', '.jsx', '.mjs', '.cjs'].includes(ext)) language = 'JavaScript';
      else if (['.ts', '.tsx', '.mts', '.cts'].includes(ext)) language = 'TypeScript';
      else if (['.py', '.pyw'].includes(ext)) language = 'Python';
      else if (['.java'].includes(ext)) language = 'Java';
      else if (['.cs'].includes(ext)) language = 'C#';
      else if (['.go'].includes(ext)) language = 'Go';
      else if (['.rb'].includes(ext)) language = 'Ruby';
      else if (['.php'].includes(ext)) language = 'PHP';
      else if (['.rs'].includes(ext)) language = 'Rust';
      else if (['.cpp', '.cc', '.cxx', '.c++'].includes(ext)) language = 'C++';
      else if (['.c', '.h'].includes(ext)) language = 'C';
      else if (['.swift'].includes(ext)) language = 'Swift';
      else if (['.kt', '.kts'].includes(ext)) language = 'Kotlin';
      else if (['.dart'].includes(ext)) language = 'Dart';

      if (language !== 'Other') {
        stats.set(language, (stats.get(language) || 0) + 1);
      }
    }

    return Array.from(stats.entries())
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count);
  }

  private static async detectDatabases(files: FileInfo[]): Promise<string[]> {
    const databases: Set<string> = new Set();
    
    // Check for database config files
    const dbIndicators = {
      'PostgreSQL': ['postgresql', 'postgres', 'pg_', 'psql'],
      'MySQL': ['mysql', 'mariadb'],
      'MongoDB': ['mongodb', 'mongoose'],
      'Redis': ['redis'],
      'SQLite': ['sqlite', '.db', '.sqlite'],
      'Elasticsearch': ['elasticsearch', 'elastic'],
      'DynamoDB': ['dynamodb'],
      'Cassandra': ['cassandra'],
      'Neo4j': ['neo4j'],
      'Firebase': ['firebase'],
      'Supabase': ['supabase']
    };

    for (const file of files.filter(f => !f.isDirectory)) {
      const fileName = file.name.toLowerCase();
      const filePath = file.relativePath.toLowerCase();

      for (const [db, indicators] of Object.entries(dbIndicators)) {
        if (indicators.some(ind => fileName.includes(ind) || filePath.includes(ind))) {
          databases.add(db);
        }
      }
    }

    return Array.from(databases);
  }
}