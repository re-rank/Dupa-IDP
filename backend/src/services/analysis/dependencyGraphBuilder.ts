import { APICall, DatabaseConnection, Dependency } from './dependencyExtractor';
import { FrameworkInfo } from './frameworkDetector';
import { FileInfo } from '../git/gitService';
import { logger } from '../../utils/logger';

export interface GraphNode {
  id: string;
  label: string;
  type: 'service' | 'api' | 'database' | 'external' | 'file' | 'framework';
  metadata?: Record<string, any>;
  group?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'api_call' | 'database_connection' | 'dependency' | 'file_import' | 'framework_usage';
  label?: string;
  metadata?: Record<string, any>;
  weight?: number;
}

export interface DependencyGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  statistics: {
    totalNodes: number;
    totalEdges: number;
    nodesByType: Record<string, number>;
    edgesByType: Record<string, number>;
    clusters: number;
    avgDegree: number;
  };
}

export class DependencyGraphBuilder {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  private nodeIdCounter = 0;
  private edgeIdCounter = 0;

  public buildGraph(
    files: FileInfo[],
    apiCalls: APICall[],
    databaseConnections: DatabaseConnection[],
    dependencies: Dependency[],
    frameworks: FrameworkInfo[]
  ): DependencyGraph {
    this.reset();

    // Add framework nodes
    this.addFrameworkNodes(frameworks);

    // Add service nodes based on file structure
    this.addServiceNodes(files);

    // Add API endpoint nodes and edges
    this.addAPINodes(apiCalls);

    // Add database nodes and edges
    this.addDatabaseNodes(databaseConnections);

    // Add dependency nodes and edges
    this.addDependencyNodes(dependencies);

    // Add file import relationships
    this.addFileImportEdges(files);

    // Calculate statistics
    const statistics = this.calculateStatistics();

    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
      statistics
    };
  }

  private reset(): void {
    this.nodes.clear();
    this.edges.clear();
    this.nodeIdCounter = 0;
    this.edgeIdCounter = 0;
  }

  private generateNodeId(): string {
    return `node_${++this.nodeIdCounter}`;
  }

  private generateEdgeId(): string {
    return `edge_${++this.edgeIdCounter}`;
  }

  private addFrameworkNodes(frameworks: FrameworkInfo[]): void {
    for (const framework of frameworks) {
      const nodeId = this.generateNodeId();
      this.nodes.set(nodeId, {
        id: nodeId,
        label: framework.name,
        type: 'framework',
        metadata: {
          version: framework.version,
          confidence: framework.confidence,
          type: framework.type
        },
        group: 'frameworks'
      });
    }
  }

  private addServiceNodes(files: FileInfo[]): void {
    // Group files by directory to identify services
    const serviceMap = new Map<string, string[]>();

    for (const file of files) {
      if (file.isDirectory || !this.isServiceFile(file)) continue;

      const serviceName = this.extractServiceName(file);
      if (!serviceMap.has(serviceName)) {
        serviceMap.set(serviceName, []);
      }
      serviceMap.get(serviceName)!.push(file.relativePath);
    }

    // Create nodes for each service
    for (const [serviceName, files] of serviceMap.entries()) {
      const nodeId = `service_${serviceName}`;
      this.nodes.set(nodeId, {
        id: nodeId,
        label: serviceName,
        type: 'service',
        metadata: {
          files: files,
          fileCount: files.length
        },
        group: 'services'
      });
    }
  }

  private addAPINodes(apiCalls: APICall[]): void {
    const apiEndpoints = new Map<string, APICall[]>();

    // Group API calls by endpoint
    for (const call of apiCalls) {
      const endpoint = this.normalizeEndpoint(call.endpoint || 'unknown');
      if (!apiEndpoints.has(endpoint)) {
        apiEndpoints.set(endpoint, []);
      }
      apiEndpoints.get(endpoint)!.push(call);
    }

    // Create nodes and edges for API endpoints
    for (const [endpoint, calls] of apiEndpoints.entries()) {
      const nodeId = `api_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
      
      // Add API node if it doesn't exist
      if (!this.nodes.has(nodeId)) {
        this.nodes.set(nodeId, {
          id: nodeId,
          label: endpoint,
          type: 'api',
          metadata: {
            methods: [...new Set(calls.map(c => c.method).filter(Boolean))],
            callCount: calls.length,
            type: calls[0].type
          },
          group: 'apis'
        });
      }

      // Create edges from services to APIs
      for (const call of calls) {
        const sourceService = this.findServiceForFile(call.file);
        if (sourceService) {
          const edgeId = this.generateEdgeId();
          this.edges.set(edgeId, {
            id: edgeId,
            source: sourceService,
            target: nodeId,
            type: 'api_call',
            label: call.method || 'API Call',
            metadata: {
              file: call.file,
              line: call.line,
              framework: call.framework
            },
            weight: 1
          });
        }
      }
    }
  }

  private addDatabaseNodes(connections: DatabaseConnection[]): void {
    const databases = new Map<string, DatabaseConnection[]>();

    // Group connections by database
    for (const conn of connections) {
      const dbKey = `${conn.database}_${conn.type}`;
      if (!databases.has(dbKey)) {
        databases.set(dbKey, []);
      }
      databases.get(dbKey)!.push(conn);
    }

    // Create nodes and edges for databases
    for (const [dbKey, conns] of databases.entries()) {
      const nodeId = `db_${dbKey.replace(/[^a-zA-Z0-9]/g, '_')}`;
      
      // Add database node
      this.nodes.set(nodeId, {
        id: nodeId,
        label: conns[0].database,
        type: 'database',
        metadata: {
          type: conns[0].type,
          connectionCount: conns.length
        },
        group: 'databases'
      });

      // Create edges from services to databases
      for (const conn of conns) {
        const sourceService = this.findServiceForFile(conn.file);
        if (sourceService) {
          const edgeId = this.generateEdgeId();
          this.edges.set(edgeId, {
            id: edgeId,
            source: sourceService,
            target: nodeId,
            type: 'database_connection',
            label: 'DB Connection',
            metadata: {
              file: conn.file,
              line: conn.line
            },
            weight: 1
          });
        }
      }
    }
  }

  private addDependencyNodes(dependencies: Dependency[]): void {
    // Group dependencies by source
    const depsBySource = new Map<string, Dependency[]>();
    
    for (const dep of dependencies) {
      if (!depsBySource.has(dep.source)) {
        depsBySource.set(dep.source, []);
      }
      depsBySource.get(dep.source)!.push(dep);
    }

    // Create external dependency nodes for major libraries
    const majorDependencies = this.identifyMajorDependencies(dependencies);
    
    for (const dep of majorDependencies) {
      const nodeId = `dep_${dep.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
      
      this.nodes.set(nodeId, {
        id: nodeId,
        label: dep.name,
        type: 'external',
        metadata: {
          version: dep.version,
          type: dep.type,
          source: dep.source
        },
        group: 'dependencies'
      });

      // Create edges from services to major dependencies
      // This is simplified - in reality, we'd analyze which services use which deps
      for (const [serviceId, serviceNode] of this.nodes.entries()) {
        if (serviceNode.type === 'service') {
          const edgeId = this.generateEdgeId();
          this.edges.set(edgeId, {
            id: edgeId,
            source: serviceId,
            target: nodeId,
            type: 'dependency',
            label: 'Uses',
            weight: 0.5
          });
        }
      }
    }
  }

  private addFileImportEdges(files: FileInfo[]): void {
    // This is a simplified implementation
    // In a real implementation, we would parse import/require statements
    // For now, we'll create edges based on directory structure
    
    const serviceNodes = Array.from(this.nodes.values()).filter(n => n.type === 'service');
    
    // Connect services that might communicate based on naming patterns
    for (let i = 0; i < serviceNodes.length; i++) {
      for (let j = i + 1; j < serviceNodes.length; j++) {
        const service1 = serviceNodes[i];
        const service2 = serviceNodes[j];
        
        // Simple heuristic: if services have related names, they might communicate
        if (this.areServicesRelated(service1.label, service2.label)) {
          const edgeId = this.generateEdgeId();
          this.edges.set(edgeId, {
            id: edgeId,
            source: service1.id,
            target: service2.id,
            type: 'file_import',
            label: 'Imports',
            weight: 0.3
          });
        }
      }
    }
  }

  private isServiceFile(file: FileInfo): boolean {
    const servicePatterns = [
      'service', 'controller', 'handler', 'api', 'route',
      'model', 'schema', 'repository', 'dao'
    ];
    
    const fileName = file.name.toLowerCase();
    const filePath = file.relativePath.toLowerCase();
    
    return servicePatterns.some(pattern => 
      fileName.includes(pattern) || filePath.includes(pattern)
    );
  }

  private extractServiceName(file: FileInfo): string {
    const parts = file.relativePath.split('/');
    
    // Look for common service directory patterns
    for (const part of parts) {
      if (['src', 'lib', 'app', 'services', 'api', 'controllers'].includes(part.toLowerCase())) {
        const nextIndex = parts.indexOf(part) + 1;
        if (nextIndex < parts.length) {
          return parts[nextIndex];
        }
      }
    }
    
    // Fallback to first meaningful directory
    return parts.find(p => !['src', 'lib', '.'].includes(p)) || 'main';
  }

  private normalizeEndpoint(endpoint: string): string {
    // Remove protocol and domain
    let normalized = endpoint.replace(/^https?:\/\/[^/]+/, '');
    
    // Remove query parameters
    normalized = normalized.split('?')[0];
    
    // Replace path parameters with placeholders
    normalized = normalized.replace(/\/\d+/g, '/:id');
    normalized = normalized.replace(/\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/g, '/:uuid');
    
    return normalized || '/';
  }

  private findServiceForFile(filePath: string): string | null {
    // Find which service node contains this file
    for (const [nodeId, node] of this.nodes.entries()) {
      if (node.type === 'service' && node.metadata?.files) {
        if (node.metadata.files.some((f: string) => filePath.includes(f))) {
          return nodeId;
        }
      }
    }
    
    // Fallback: extract service name from file path
    const serviceName = this.extractServiceName({ relativePath: filePath } as FileInfo);
    return `service_${serviceName}`;
  }

  private identifyMajorDependencies(dependencies: Dependency[]): Dependency[] {
    // List of major dependencies to show in the graph
    const majorLibs = [
      'react', 'vue', 'angular', 'express', 'fastify', 'nestjs',
      'django', 'flask', 'fastapi', 'spring-boot', 'rails',
      'axios', 'mongoose', 'sequelize', 'typeorm', 'prisma',
      'redis', 'kafka', 'rabbitmq', 'elasticsearch'
    ];
    
    return dependencies.filter(dep => 
      majorLibs.some(lib => dep.name.toLowerCase().includes(lib))
    );
  }

  private areServicesRelated(service1: string, service2: string): boolean {
    // Simple heuristic to determine if services might be related
    const s1 = service1.toLowerCase();
    const s2 = service2.toLowerCase();
    
    // Check for common patterns
    if (s1.includes('api') && s2.includes('service')) return true;
    if (s1.includes('controller') && s2.includes('service')) return true;
    if (s1.includes('auth') && (s2.includes('user') || s2.includes('account'))) return true;
    
    return false;
  }

  private calculateStatistics(): DependencyGraph['statistics'] {
    const nodes = Array.from(this.nodes.values());
    const edges = Array.from(this.edges.values());
    
    const nodesByType: Record<string, number> = {};
    const edgesByType: Record<string, number> = {};
    
    for (const node of nodes) {
      nodesByType[node.type] = (nodesByType[node.type] || 0) + 1;
    }
    
    for (const edge of edges) {
      edgesByType[edge.type] = (edgesByType[edge.type] || 0) + 1;
    }
    
    // Calculate average degree
    const degrees = new Map<string, number>();
    for (const edge of edges) {
      degrees.set(edge.source, (degrees.get(edge.source) || 0) + 1);
      degrees.set(edge.target, (degrees.get(edge.target) || 0) + 1);
    }
    
    const avgDegree = degrees.size > 0 
      ? Array.from(degrees.values()).reduce((a, b) => a + b, 0) / degrees.size 
      : 0;
    
    // Simple cluster detection (connected components)
    const clusters = this.countClusters(nodes, edges);
    
    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      nodesByType,
      edgesByType,
      clusters,
      avgDegree: Math.round(avgDegree * 100) / 100
    };
  }

  private countClusters(nodes: GraphNode[], edges: GraphEdge[]): number {
    const adjacencyList = new Map<string, Set<string>>();
    
    // Build adjacency list
    for (const node of nodes) {
      adjacencyList.set(node.id, new Set());
    }
    
    for (const edge of edges) {
      adjacencyList.get(edge.source)?.add(edge.target);
      adjacencyList.get(edge.target)?.add(edge.source);
    }
    
    // Count connected components using DFS
    const visited = new Set<string>();
    let clusterCount = 0;
    
    const dfs = (nodeId: string) => {
      visited.add(nodeId);
      const neighbors = adjacencyList.get(nodeId) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor);
        }
      }
    };
    
    for (const node of nodes) {
      if (!visited.has(node.id)) {
        dfs(node.id);
        clusterCount++;
      }
    }
    
    return clusterCount;
  }
}