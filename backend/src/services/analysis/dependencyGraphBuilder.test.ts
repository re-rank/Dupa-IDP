import { describe, it, expect } from '@jest/globals';
import { DependencyGraphBuilder } from './dependencyGraphBuilder';
import { FileInfo } from '../git/gitService';
import { APICall, DatabaseConnection, Dependency } from './dependencyExtractor';
import { FrameworkInfo } from './frameworkDetector';

describe('DependencyGraphBuilder', () => {
  const mockFiles: FileInfo[] = [
    {
      path: '/test/src/services/userService.js',
      name: 'userService.js',
      size: 1024,
      extension: '.js',
      isDirectory: false,
      relativePath: 'src/services/userService.js',
      lastModified: new Date('2023-01-01')
    },
    {
      path: '/test/src/controllers/userController.js',
      name: 'userController.js',
      size: 2048,
      extension: '.js',
      isDirectory: false,
      relativePath: 'src/controllers/userController.js',
      lastModified: new Date('2023-01-01')
    },
    {
      path: '/test/src/services',
      name: 'services',
      size: 0,
      extension: '',
      isDirectory: true,
      relativePath: 'src/services',
      lastModified: new Date('2023-01-01')
    }
  ];

  const mockAPIcalls: APICall[] = [
    {
      type: 'http',
      method: 'GET',
      endpoint: '/api/users',
      file: 'src/services/userService.js',
      line: 10,
      confidence: 0.9,
      framework: 'axios'
    },
    {
      type: 'http',
      method: 'POST',
      endpoint: '/api/users',
      file: 'src/controllers/userController.js',
      line: 25,
      confidence: 0.9,
      framework: 'fetch'
    }
  ];

  const mockDatabaseConnections: DatabaseConnection[] = [
    {
      type: 'sql',
      database: 'PostgreSQL',
      connectionString: 'postgres://localhost:5432/mydb',
      file: 'src/services/userService.js',
      line: 5,
      confidence: 0.8
    }
  ];

  const mockDependencies: Dependency[] = [
    { name: 'express', version: '^4.18.0', type: 'production', source: 'npm' },
    { name: 'axios', version: '^1.0.0', type: 'production', source: 'npm' },
    { name: 'jest', version: '^29.0.0', type: 'development', source: 'npm' }
  ];

  const mockFrameworks: FrameworkInfo[] = [
    {
      name: 'Express.js',
      type: 'backend',
      confidence: 0.9,
      version: '4.18.0',
      configFiles: ['package.json'],
      indicators: ['Package: express']
    }
  ];

  describe('buildGraph', () => {
    it('should build a complete dependency graph', () => {
      const builder = new DependencyGraphBuilder();
      const graph = builder.buildGraph(
        mockFiles,
        mockAPIcalls,
        mockDatabaseConnections,
        mockDependencies,
        mockFrameworks
      );

      expect(graph.nodes).toBeDefined();
      expect(graph.edges).toBeDefined();
      expect(graph.statistics).toBeDefined();
      expect(graph.statistics.totalNodes).toBeGreaterThan(0);
      expect(graph.statistics.totalEdges).toBeGreaterThan(0);
    });

    it('should create framework nodes', () => {
      const builder = new DependencyGraphBuilder();
      const graph = builder.buildGraph(
        mockFiles,
        mockAPIcalls,
        mockDatabaseConnections,
        mockDependencies,
        mockFrameworks
      );

      const frameworkNode = graph.nodes.find(n => n.type === 'framework' && n.label === 'Express.js');
      expect(frameworkNode).toBeDefined();
      expect(frameworkNode?.metadata?.version).toBe('4.18.0');
    });

    it('should create service nodes from files', () => {
      const builder = new DependencyGraphBuilder();
      const graph = builder.buildGraph(
        mockFiles,
        mockAPIcalls,
        mockDatabaseConnections,
        mockDependencies,
        mockFrameworks
      );

      const serviceNodes = graph.nodes.filter(n => n.type === 'service');
      expect(serviceNodes.length).toBeGreaterThan(0);
      
      const userService = serviceNodes.find(n => n.label === 'services');
      expect(userService).toBeDefined();
    });

    it('should create API nodes and edges', () => {
      const builder = new DependencyGraphBuilder();
      const graph = builder.buildGraph(
        mockFiles,
        mockAPIcalls,
        mockDatabaseConnections,
        mockDependencies,
        mockFrameworks
      );

      const apiNodes = graph.nodes.filter(n => n.type === 'api');
      expect(apiNodes.length).toBeGreaterThan(0);

      const apiEdges = graph.edges.filter(e => e.type === 'api_call');
      expect(apiEdges.length).toBeGreaterThan(0);
    });

    it('should create database nodes and connections', () => {
      const builder = new DependencyGraphBuilder();
      const graph = builder.buildGraph(
        mockFiles,
        mockAPIcalls,
        mockDatabaseConnections,
        mockDependencies,
        mockFrameworks
      );

      const dbNode = graph.nodes.find(n => n.type === 'database' && n.label === 'PostgreSQL');
      expect(dbNode).toBeDefined();

      const dbEdges = graph.edges.filter(e => e.type === 'database_connection');
      expect(dbEdges.length).toBeGreaterThan(0);
    });

    it('should identify major dependencies', () => {
      const builder = new DependencyGraphBuilder();
      const graph = builder.buildGraph(
        mockFiles,
        mockAPIcalls,
        mockDatabaseConnections,
        mockDependencies,
        mockFrameworks
      );

      const depNodes = graph.nodes.filter(n => n.type === 'external');
      expect(depNodes.length).toBeGreaterThan(0);

      const expressNode = depNodes.find(n => n.label === 'express');
      expect(expressNode).toBeDefined();
      expect(expressNode?.metadata?.version).toBe('^4.18.0');
    });

    it('should calculate correct statistics', () => {
      const builder = new DependencyGraphBuilder();
      const graph = builder.buildGraph(
        mockFiles,
        mockAPIcalls,
        mockDatabaseConnections,
        mockDependencies,
        mockFrameworks
      );

      const { statistics } = graph;
      expect(statistics.totalNodes).toBe(graph.nodes.length);
      expect(statistics.totalEdges).toBe(graph.edges.length);
      expect(statistics.nodesByType).toBeDefined();
      expect(statistics.edgesByType).toBeDefined();
      expect(statistics.avgDegree).toBeGreaterThanOrEqual(0);
      expect(statistics.clusters).toBeGreaterThan(0);
    });

    it('should normalize API endpoints correctly', () => {
      const builder = new DependencyGraphBuilder();
      const apiCallsWithIds: APICall[] = [
        ...mockAPIcalls,
        {
          type: 'http',
          method: 'GET',
          endpoint: '/api/users/123',
          file: 'src/services/userService.js',
          line: 15,
          confidence: 0.9
        },
        {
          type: 'http',
          method: 'GET',
          endpoint: 'https://api.example.com/api/users/456',
          file: 'src/services/userService.js',
          line: 20,
          confidence: 0.9
        }
      ];

      const graph = builder.buildGraph(
        mockFiles,
        apiCallsWithIds,
        mockDatabaseConnections,
        mockDependencies,
        mockFrameworks
      );

      const apiNodes = graph.nodes.filter(n => n.type === 'api');
      
      // Should normalize /api/users/123 and /api/users/456 to /api/users/:id
      const normalizedNode = apiNodes.find(n => n.label === '/api/users/:id');
      expect(normalizedNode).toBeDefined();
    });
  });
});