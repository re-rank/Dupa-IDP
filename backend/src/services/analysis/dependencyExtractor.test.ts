import { describe, it, expect, vi } from 'vitest';
import { DependencyExtractor } from './dependencyExtractor';
import { FileInfo } from '../git/gitService';
import fs from 'fs/promises';

vi.mock('fs/promises');
vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

describe('DependencyExtractor', () => {
  const mockFiles: FileInfo[] = [
    {
      path: '/test/src/api.js',
      name: 'api.js',
      size: 1024,
      extension: '.js',
      isDirectory: false,
      relativePath: 'src/api.js'
    },
    {
      path: '/test/package.json',
      name: 'package.json',
      size: 500,
      extension: '.json',
      isDirectory: false,
      relativePath: 'package.json'
    },
    {
      path: '/test/.env',
      name: '.env',
      size: 100,
      extension: '',
      isDirectory: false,
      relativePath: '.env'
    }
  ];

  describe('extractAPICalls', () => {
    it('should extract fetch API calls', async () => {
      const jsContent = `
        fetch('https://api.example.com/users')
          .then(res => res.json());
          
        fetch(\`https://api.example.com/users/\${userId}\`);
      `;

      vi.mocked(fs.readFile).mockResolvedValueOnce(jsContent);

      const apiCalls = await DependencyExtractor.extractAPICalls('/test', [mockFiles[0]]);

      expect(apiCalls).toHaveLength(1); // Only static URLs are captured by regex
      expect(apiCalls[0]).toMatchObject({
        type: 'http',
        endpoint: 'https://api.example.com/users',
        framework: 'fetch'
      });
    });

    it('should extract axios API calls', async () => {
      const jsContent = `
        import axios from 'axios';
        
        axios.get('https://api.example.com/users');
        axios.post('/api/users', { name: 'John' });
        axios.put('/api/users/1', { name: 'Jane' });
      `;

      vi.mocked(fs.readFile).mockResolvedValueOnce(jsContent);

      const apiCalls = await DependencyExtractor.extractAPICalls('/test', [mockFiles[0]]);

      expect(apiCalls.length).toBeGreaterThanOrEqual(3);
      expect(apiCalls.find(call => call.method === 'GET')).toBeDefined();
      expect(apiCalls.find(call => call.method === 'POST')).toBeDefined();
      expect(apiCalls.find(call => call.method === 'PUT')).toBeDefined();
    });

    it('should extract WebSocket connections', async () => {
      const jsContent = `
        const ws = new WebSocket('wss://socket.example.com');
        const socket = new WebSocket('ws://localhost:8080/socket');
      `;

      vi.mocked(fs.readFile).mockResolvedValueOnce(jsContent);

      const apiCalls = await DependencyExtractor.extractAPICalls('/test', [mockFiles[0]]);

      expect(apiCalls).toHaveLength(2);
      expect(apiCalls[0]).toMatchObject({
        type: 'websocket',
        endpoint: 'wss://socket.example.com'
      });
    });
  });

  describe('extractDatabaseConnections', () => {
    it('should extract PostgreSQL connections', async () => {
      const content = `
        const connectionString = 'postgresql://user:pass@localhost:5432/mydb';
        const pgConfig = {
          host: 'localhost',
          port: 5432,
          dbname: 'testdb'
        };
      `;

      vi.mocked(fs.readFile).mockResolvedValue(content);

      const connections = await DependencyExtractor.extractDatabaseConnections('/test', mockFiles);

      expect(connections.length).toBeGreaterThan(0);
      expect(connections[0]).toMatchObject({
        type: 'sql',
        database: 'PostgreSQL',
        connectionString: expect.stringContaining('postgresql://user:****@localhost:5432/mydb')
      });
    });

    it('should extract MongoDB connections', async () => {
      const content = `
        mongoose.connect('mongodb://localhost:27017/myapp');
        const mongoUri = 'mongodb+srv://user:pass@cluster.mongodb.net/db';
      `;

      vi.mocked(fs.readFile).mockResolvedValue(content);

      const connections = await DependencyExtractor.extractDatabaseConnections('/test', mockFiles);

      expect(connections.find(c => c.database === 'MongoDB')).toBeDefined();
    });

    it('should sanitize connection strings', async () => {
      const content = `const db = 'mysql://root:mysecretpassword@localhost:3306/mydb';`;

      vi.mocked(fs.readFile).mockResolvedValue(content);

      const connections = await DependencyExtractor.extractDatabaseConnections('/test', mockFiles);

      expect(connections[0].connectionString).not.toContain('mysecretpassword');
      expect(connections[0].connectionString).toContain('****');
    });
  });

  describe('extractDependencies', () => {
    it('should extract npm dependencies', async () => {
      const packageJson = {
        dependencies: {
          'express': '^4.18.2',
          'mongoose': '^7.0.0'
        },
        devDependencies: {
          'jest': '^29.0.0',
          'eslint': '^8.0.0'
        }
      };

      vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify(packageJson));

      const dependencies = await DependencyExtractor.extractDependencies('/test', [mockFiles[1]]);

      expect(dependencies).toHaveLength(4);
      expect(dependencies.find(d => d.name === 'express')).toMatchObject({
        version: '^4.18.2',
        type: 'production',
        source: 'npm'
      });
      expect(dependencies.find(d => d.name === 'jest')).toMatchObject({
        type: 'development'
      });
    });

    it('should extract Python dependencies', async () => {
      const requirementsTxt = `
Django==4.2.0
requests>=2.28.0
# This is a comment
pytest==7.0.0
      `;

      const pythonFiles: FileInfo[] = [{
        path: '/test/requirements.txt',
        name: 'requirements.txt',
        size: 100,
        extension: '.txt',
        isDirectory: false,
        relativePath: 'requirements.txt'
      }];

      vi.mocked(fs.readFile).mockResolvedValueOnce(requirementsTxt);

      const dependencies = await DependencyExtractor.extractDependencies('/test', pythonFiles);

      expect(dependencies).toHaveLength(3);
      expect(dependencies.find(d => d.name === 'Django')).toMatchObject({
        version: '4.2.0',
        source: 'pip'
      });
    });
  });

  describe('extractEnvironmentVariables', () => {
    it('should extract env vars from .env file', async () => {
      const envContent = `
DATABASE_URL=postgresql://localhost:5432/mydb
API_KEY=sk-1234567890
NODE_ENV=development
# COMMENTED_VAR=value
      `;

      vi.mocked(fs.readFile).mockResolvedValueOnce(envContent);

      const envVars = await DependencyExtractor.extractEnvironmentVariables('/test', [mockFiles[2]]);

      expect(envVars).toHaveLength(3);
      expect(envVars.find(v => v.name === 'DATABASE_URL')).toMatchObject({
        possibleType: 'database_url'
      });
      expect(envVars.find(v => v.name === 'API_KEY')).toMatchObject({
        possibleType: 'api_key'
      });
    });

    it('should track env var usage in code', async () => {
      const envContent = 'API_KEY=test';
      const jsContent = `
        const apiKey = process.env.API_KEY;
        const dbUrl = process.env.DATABASE_URL || 'localhost';
      `;

      vi.mocked(fs.readFile)
        .mockResolvedValueOnce(envContent)  // .env
        .mockResolvedValueOnce(jsContent);  // api.js

      const envVars = await DependencyExtractor.extractEnvironmentVariables('/test', mockFiles);

      const apiKeyVar = envVars.find(v => v.name === 'API_KEY');
      expect(apiKeyVar).toBeDefined();
      expect(apiKeyVar?.usedIn).toContain('src/api.js');

      const dbUrlVar = envVars.find(v => v.name === 'DATABASE_URL');
      expect(dbUrlVar).toBeDefined();
      expect(dbUrlVar?.usedIn).toContain('src/api.js');
    });
  });
});