import fs from 'fs/promises';
import path from 'path';
import { FileInfo } from '../git/gitService';
import { logger } from '../../utils/logger';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import { Node } from '@babel/types';

export interface APICall {
  type: 'http' | 'graphql' | 'websocket' | 'grpc';
  method?: string;
  endpoint?: string;
  file: string;
  line: number;
  confidence: number;
  framework?: string;
}

export interface DatabaseConnection {
  type: 'sql' | 'nosql' | 'cache' | 'search';
  database: string;
  connectionString?: string;
  file: string;
  line: number;
  confidence: number;
}

export interface Dependency {
  name: string;
  version?: string;
  type: 'production' | 'development' | 'peer' | 'optional';
  source: 'npm' | 'pip' | 'maven' | 'gradle' | 'gem' | 'go' | 'cargo' | 'other';
}

export interface EnvironmentVariable {
  name: string;
  usedIn: string[];
  possibleType?: 'api_key' | 'database_url' | 'api_endpoint' | 'config' | 'secret';
}

export class DependencyExtractor {
  
  public static async extractAPICalls(
    repoPath: string,
    files: FileInfo[]
  ): Promise<APICall[]> {
    const apiCalls: APICall[] = [];
    const codeFiles = files.filter(f => 
      !f.isDirectory && 
      ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rb', '.php'].includes(f.extension)
    );

    for (const file of codeFiles) {
      try {
        const content = await fs.readFile(file.path, 'utf-8');
        const fileCalls = await this.extractAPICallsFromFile(content, file);
        apiCalls.push(...fileCalls);
      } catch (error) {
        logger.warn(`Failed to extract API calls from ${file.relativePath}`, error);
      }
    }

    return apiCalls;
  }

  private static async extractAPICallsFromFile(
    content: string,
    file: FileInfo
  ): Promise<APICall[]> {
    const apiCalls: APICall[] = [];

    if (['.js', '.jsx', '.ts', '.tsx'].includes(file.extension)) {
      apiCalls.push(...this.extractJavaScriptAPICalls(content, file));
    } else if (file.extension === '.py') {
      apiCalls.push(...this.extractPythonAPICalls(content, file));
    } else if (file.extension === '.java') {
      apiCalls.push(...this.extractJavaAPICalls(content, file));
    } else if (file.extension === '.go') {
      apiCalls.push(...this.extractGoAPICalls(content, file));
    }

    return apiCalls;
  }

  private static extractJavaScriptAPICalls(content: string, file: FileInfo): APICall[] {
    const apiCalls: APICall[] = [];

    // Common patterns for API calls in JavaScript
    const patterns = [
      // fetch API
      /fetch\s*\(\s*['"`]([^'"`]+)['"`]/g,
      // axios
      /axios\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
      /axios\s*\(\s*\{\s*url:\s*['"`]([^'"`]+)['"`]/g,
      // jQuery ajax
      /\$\.(ajax|get|post|put|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g,
      // XMLHttpRequest
      /\.open\s*\(\s*['"`](GET|POST|PUT|DELETE|PATCH)['"`]\s*,\s*['"`]([^'"`]+)['"`]/g,
      // GraphQL
      /gql\s*`[^`]*(?:query|mutation|subscription)[^`]*`/g,
      // WebSocket
      /new\s+WebSocket\s*\(\s*['"`]([^'"`]+)['"`]/g
    ];

    const lines = content.split('\n');
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        
        if (pattern.source.includes('fetch')) {
          apiCalls.push({
            type: 'http',
            endpoint: match[1],
            file: file.relativePath,
            line: lineNumber,
            confidence: 0.9,
            framework: 'fetch'
          });
        } else if (pattern.source.includes('axios')) {
          const method = match[1] || 'GET';
          const endpoint = match[2] || match[1];
          apiCalls.push({
            type: 'http',
            method: method.toUpperCase(),
            endpoint: endpoint,
            file: file.relativePath,
            line: lineNumber,
            confidence: 0.9,
            framework: 'axios'
          });
        } else if (pattern.source.includes('gql')) {
          apiCalls.push({
            type: 'graphql',
            file: file.relativePath,
            line: lineNumber,
            confidence: 0.8
          });
        } else if (pattern.source.includes('WebSocket')) {
          apiCalls.push({
            type: 'websocket',
            endpoint: match[1],
            file: file.relativePath,
            line: lineNumber,
            confidence: 0.9
          });
        }
      }
    }

    // Try to parse with Babel for more accurate detection
    try {
      const ast = parser.parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
        errorRecovery: true
      });

      traverse(ast, {
        CallExpression(path) {
          const { node } = path;
          const { callee, arguments: args } = node;

          // Check for API calls
          if (callee.type === 'Identifier' && callee.name === 'fetch' && args.length > 0) {
            if (args[0].type === 'StringLiteral') {
              apiCalls.push({
                type: 'http',
                endpoint: args[0].value,
                file: file.relativePath,
                line: node.loc?.start.line || 0,
                confidence: 0.95,
                framework: 'fetch'
              });
            }
          }
        }
      });
    } catch (error) {
      // Fallback to regex if parsing fails
      logger.debug(`Failed to parse ${file.relativePath} with Babel`);
    }

    return apiCalls;
  }

  private static extractPythonAPICalls(content: string, file: FileInfo): APICall[] {
    const apiCalls: APICall[] = [];

    const patterns = [
      // requests library
      /requests\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/g,
      // httpx
      /httpx\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/g,
      // urllib
      /urlopen\s*\(\s*['"]([^'"]+)['"]/g,
      // aiohttp
      /session\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/g
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        const method = match[1] || 'GET';
        const endpoint = match[2] || match[1];

        apiCalls.push({
          type: 'http',
          method: method.toUpperCase(),
          endpoint: endpoint,
          file: file.relativePath,
          line: lineNumber,
          confidence: 0.85,
          framework: pattern.source.includes('requests') ? 'requests' : 
                     pattern.source.includes('httpx') ? 'httpx' : 
                     pattern.source.includes('aiohttp') ? 'aiohttp' : undefined
        });
      }
    }

    return apiCalls;
  }

  private static extractJavaAPICalls(content: string, file: FileInfo): APICall[] {
    const apiCalls: APICall[] = [];

    const patterns = [
      // RestTemplate
      /restTemplate\.(getForObject|postForObject|put|delete)\s*\(\s*"([^"]+)"/g,
      // HttpClient
      /HttpRequest\.newBuilder\s*\(\s*\)\.uri\s*\(\s*URI\.create\s*\(\s*"([^"]+)"/g,
      // OkHttp
      /Request\.Builder\s*\(\s*\)\.url\s*\(\s*"([^"]+)"/g
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        
        apiCalls.push({
          type: 'http',
          endpoint: match[2] || match[1],
          file: file.relativePath,
          line: lineNumber,
          confidence: 0.8
        });
      }
    }

    return apiCalls;
  }

  private static extractGoAPICalls(content: string, file: FileInfo): APICall[] {
    const apiCalls: APICall[] = [];

    const patterns = [
      // net/http
      /http\.(Get|Post|Put|Delete)\s*\(\s*"([^"]+)"/g,
      // http.NewRequest
      /http\.NewRequest\s*\(\s*"(GET|POST|PUT|DELETE|PATCH)"\s*,\s*"([^"]+)"/g
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        
        apiCalls.push({
          type: 'http',
          method: (match[1] || 'GET').toUpperCase(),
          endpoint: match[2] || match[1],
          file: file.relativePath,
          line: lineNumber,
          confidence: 0.85
        });
      }
    }

    return apiCalls;
  }

  public static async extractDatabaseConnections(
    repoPath: string,
    files: FileInfo[]
  ): Promise<DatabaseConnection[]> {
    const connections: DatabaseConnection[] = [];
    
    for (const file of files) {
      if (file.isDirectory) continue;

      try {
        const content = await fs.readFile(file.path, 'utf-8');
        
        // Database connection patterns
        const patterns = [
          // PostgreSQL
          { regex: /postgres(?:ql)?:\/\/[^'"\s]+/gi, type: 'sql', db: 'PostgreSQL' },
          { regex: /host=([^;\s]+).*port=(\d+).*dbname=([^;\s]+)/gi, type: 'sql', db: 'PostgreSQL' },
          
          // MySQL
          { regex: /mysql:\/\/[^'"\s]+/gi, type: 'sql', db: 'MySQL' },
          { regex: /mysqli?_connect\s*\([^)]+\)/gi, type: 'sql', db: 'MySQL' },
          
          // MongoDB
          { regex: /mongodb(?:\+srv)?:\/\/[^'"\s]+/gi, type: 'nosql', db: 'MongoDB' },
          { regex: /mongoose\.connect\s*\([^)]+\)/gi, type: 'nosql', db: 'MongoDB' },
          
          // Redis
          { regex: /redis:\/\/[^'"\s]+/gi, type: 'cache', db: 'Redis' },
          { regex: /createClient\s*\(\s*\{[^}]*host[^}]*\}/gi, type: 'cache', db: 'Redis' },
          
          // SQLite
          { regex: /sqlite:\/\/\/[^'"\s]+/gi, type: 'sql', db: 'SQLite' },
          { regex: /\.db['"`\s]|\.sqlite['"`\s]/gi, type: 'sql', db: 'SQLite' }
        ];

        for (const pattern of patterns) {
          let match;
          while ((match = pattern.regex.exec(content)) !== null) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            
            connections.push({
              type: pattern.type as 'sql' | 'nosql' | 'cache',
              database: pattern.db,
              connectionString: this.sanitizeConnectionString(match[0]),
              file: file.relativePath,
              line: lineNumber,
              confidence: 0.8
            });
          }
        }
      } catch (error) {
        logger.warn(`Failed to extract database connections from ${file.relativePath}`);
      }
    }

    return connections;
  }

  private static sanitizeConnectionString(connectionString: string): string {
    // Remove sensitive information from connection strings
    return connectionString
      .replace(/:[^@]+@/, ':****@')  // Hide password
      .replace(/password=[^;&\s]+/gi, 'password=****')
      .replace(/pwd=[^;&\s]+/gi, 'pwd=****');
  }

  public static async extractDependencies(
    repoPath: string,
    files: FileInfo[]
  ): Promise<Dependency[]> {
    const dependencies: Dependency[] = [];

    // Extract from package.json
    const packageJson = files.find(f => f.name === 'package.json' && !f.isDirectory);
    if (packageJson) {
      try {
        const content = await fs.readFile(packageJson.path, 'utf-8');
        const pkg = JSON.parse(content);
        
        if (pkg.dependencies) {
          for (const [name, version] of Object.entries(pkg.dependencies)) {
            dependencies.push({
              name,
              version: version as string,
              type: 'production',
              source: 'npm'
            });
          }
        }
        
        if (pkg.devDependencies) {
          for (const [name, version] of Object.entries(pkg.devDependencies)) {
            dependencies.push({
              name,
              version: version as string,
              type: 'development',
              source: 'npm'
            });
          }
        }
      } catch (error) {
        logger.warn('Failed to parse package.json');
      }
    }

    // Extract from requirements.txt
    const requirementsTxt = files.find(f => f.name === 'requirements.txt' && !f.isDirectory);
    if (requirementsTxt) {
      try {
        const content = await fs.readFile(requirementsTxt.path, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
        
        for (const line of lines) {
          const match = line.match(/^([^=<>!~]+)(?:[=<>!~]+(.+))?/);
          if (match) {
            dependencies.push({
              name: match[1].trim(),
              version: match[2]?.trim(),
              type: 'production',
              source: 'pip'
            });
          }
        }
      } catch (error) {
        logger.warn('Failed to parse requirements.txt');
      }
    }

    // Extract from pom.xml
    const pomXml = files.find(f => f.name === 'pom.xml' && !f.isDirectory);
    if (pomXml) {
      try {
        const content = await fs.readFile(pomXml.path, 'utf-8');
        const dependencyRegex = /<dependency>[\s\S]*?<groupId>([^<]+)<\/groupId>[\s\S]*?<artifactId>([^<]+)<\/artifactId>[\s\S]*?(?:<version>([^<]+)<\/version>)?[\s\S]*?<\/dependency>/g;
        
        let match;
        while ((match = dependencyRegex.exec(content)) !== null) {
          dependencies.push({
            name: `${match[1]}:${match[2]}`,
            version: match[3],
            type: 'production',
            source: 'maven'
          });
        }
      } catch (error) {
        logger.warn('Failed to parse pom.xml');
      }
    }

    // Extract from go.mod
    const goMod = files.find(f => f.name === 'go.mod' && !f.isDirectory);
    if (goMod) {
      try {
        const content = await fs.readFile(goMod.path, 'utf-8');
        const requireRegex = /require\s+([^\s]+)\s+([^\s]+)/g;
        
        let match;
        while ((match = requireRegex.exec(content)) !== null) {
          dependencies.push({
            name: match[1],
            version: match[2],
            type: 'production',
            source: 'go'
          });
        }
      } catch (error) {
        logger.warn('Failed to parse go.mod');
      }
    }

    return dependencies;
  }

  public static async extractEnvironmentVariables(
    repoPath: string,
    files: FileInfo[]
  ): Promise<EnvironmentVariable[]> {
    const envVars = new Map<string, EnvironmentVariable>();
    
    // First, extract from .env files
    const envFiles = files.filter(f => 
      !f.isDirectory && 
      (f.name.startsWith('.env') || f.name === 'env.example')
    );

    for (const envFile of envFiles) {
      try {
        const content = await fs.readFile(envFile.path, 'utf-8');
        const lines = content.split('\n');
        
        for (const line of lines) {
          const match = line.match(/^([A-Z_][A-Z0-9_]*)\s*=/);
          if (match) {
            const varName = match[1];
            if (!envVars.has(varName)) {
              envVars.set(varName, {
                name: varName,
                usedIn: [envFile.relativePath],
                possibleType: this.guessEnvVarType(varName)
              });
            }
          }
        }
      } catch (error) {
        logger.warn(`Failed to parse env file: ${envFile.relativePath}`);
      }
    }

    // Then, search for usage in code files
    const codeFiles = files.filter(f => 
      !f.isDirectory && 
      ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rb', '.php'].includes(f.extension)
    );

    for (const file of codeFiles) {
      try {
        const content = await fs.readFile(file.path, 'utf-8');
        
        // Pattern to match environment variable usage
        const patterns = [
          /process\.env\.([A-Z_][A-Z0-9_]*)/g,  // Node.js
          /os\.(?:getenv|environ\[?['"]\s*)([A-Z_][A-Z0-9_]*)/g,  // Python
          /ENV\[['"]([A-Z_][A-Z0-9_]*)['"]\]/g,  // Ruby
          /\$_ENV\[['"]([A-Z_][A-Z0-9_]*)['"]\]/g,  // PHP
          /System\.getenv\s*\(\s*['"]([A-Z_][A-Z0-9_]*)['"]\s*\)/g  // Java
        ];

        for (const pattern of patterns) {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            const varName = match[1];
            
            if (envVars.has(varName)) {
              const envVar = envVars.get(varName)!;
              if (!envVar.usedIn.includes(file.relativePath)) {
                envVar.usedIn.push(file.relativePath);
              }
            } else {
              envVars.set(varName, {
                name: varName,
                usedIn: [file.relativePath],
                possibleType: this.guessEnvVarType(varName)
              });
            }
          }
        }
      } catch (error) {
        logger.warn(`Failed to search env vars in: ${file.relativePath}`);
      }
    }

    return Array.from(envVars.values());
  }

  private static guessEnvVarType(varName: string): 'api_key' | 'database_url' | 'api_endpoint' | 'config' | 'secret' | undefined {
    const name = varName.toLowerCase();
    
    if (name.includes('key') || name.includes('token') || name.includes('secret')) {
      return 'api_key';
    }
    if (name.includes('database') || name.includes('db_') || name.includes('_url')) {
      return 'database_url';
    }
    if (name.includes('api_') || name.includes('endpoint') || name.includes('base_url')) {
      return 'api_endpoint';
    }
    if (name.includes('password') || name.includes('pwd') || name.includes('auth')) {
      return 'secret';
    }
    
    return 'config';
  }
}