import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import { checkDatabaseHealth, getDatabaseStats } from '../database/connection';
import { CacheService } from '../services/redis/redisClient';
import { ProjectModel } from '../models/Project';
import { AnalysisStatusModel } from '../models/AnalysisStatus';
import { logger } from '../utils/logger';

const router = Router();

// Basic health check
router.get('/', 
  asyncHandler(async (req, res) => {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development'
    };

    res.json(health);
  })
);

// Detailed health check
router.get('/detailed', 
  asyncHandler(async (req, res) => {
    const startTime = Date.now();

    // Check database health
    const dbHealth = await checkDatabaseHealth();
    const dbStats = dbHealth ? await getDatabaseStats() : null;

    // Check Redis health
    const redisHealth = await CacheService.healthCheck();

    // Check system resources
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Get application stats
    let projectStats = null;
    let analysisStats = null;

    try {
      [projectStats, analysisStats] = await Promise.all([
        ProjectModel.getProjectStats(),
        AnalysisStatusModel.getAnalysisStats()
      ]);
    } catch (error) {
      logger.warn('Failed to get application stats for health check:', error);
    }

    const responseTime = Date.now() - startTime;

    const health = {
      status: dbHealth && (redisHealth.connected || process.env.REDIS_ENABLED === 'false') ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      responseTime,
      uptime: process.uptime(),
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
      
      services: {
        database: {
          status: dbHealth ? 'healthy' : 'unhealthy',
          stats: dbStats
        },
        redis: {
          status: redisHealth.connected ? 'healthy' : 'unhealthy',
          enabled: process.env.REDIS_ENABLED !== 'false',
          latency: redisHealth.latency,
          error: redisHealth.error
        }
      },

      system: {
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024),
          rss: Math.round(memoryUsage.rss / 1024 / 1024)
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system
        }
      },

      application: {
        projects: projectStats,
        analyses: analysisStats
      }
    };

    res.json(health);
  })
);

// Readiness check (for Kubernetes)
router.get('/ready', 
  asyncHandler(async (req, res) => {
    const dbHealth = await checkDatabaseHealth();
    
    if (!dbHealth) {
      return res.status(503).json({
        status: 'not_ready',
        reason: 'Database not available',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  })
);

// Liveness check (for Kubernetes)
router.get('/live', 
  asyncHandler(async (req, res) => {
    // Simple liveness check - if we can respond, we're alive
    res.json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  })
);

// Metrics endpoint (Prometheus-style)
router.get('/metrics', 
  asyncHandler(async (req, res) => {
    try {
      const [projectStats, analysisStats, dbStats] = await Promise.all([
        ProjectModel.getProjectStats(),
        AnalysisStatusModel.getAnalysisStats(),
        getDatabaseStats()
      ]);

      const memoryUsage = process.memoryUsage();
      const uptime = process.uptime();

      // Simple Prometheus-style metrics
      const metrics = [
        `# HELP atlas_uptime_seconds Total uptime in seconds`,
        `# TYPE atlas_uptime_seconds counter`,
        `atlas_uptime_seconds ${uptime}`,
        '',
        `# HELP atlas_memory_usage_bytes Memory usage in bytes`,
        `# TYPE atlas_memory_usage_bytes gauge`,
        `atlas_memory_usage_bytes{type="heap_used"} ${memoryUsage.heapUsed}`,
        `atlas_memory_usage_bytes{type="heap_total"} ${memoryUsage.heapTotal}`,
        `atlas_memory_usage_bytes{type="external"} ${memoryUsage.external}`,
        `atlas_memory_usage_bytes{type="rss"} ${memoryUsage.rss}`,
        '',
        `# HELP atlas_projects_total Total number of projects`,
        `# TYPE atlas_projects_total gauge`,
        `atlas_projects_total ${projectStats.total}`,
        '',
        `# HELP atlas_projects_by_status Number of projects by status`,
        `# TYPE atlas_projects_by_status gauge`,
        ...Object.entries(projectStats.byStatus).map(([status, count]) => 
          `atlas_projects_by_status{status="${status}"} ${count}`
        ),
        '',
        `# HELP atlas_analyses_total Total number of analyses`,
        `# TYPE atlas_analyses_total gauge`,
        `atlas_analyses_total ${analysisStats.total}`,
        '',
        `# HELP atlas_analyses_by_status Number of analyses by status`,
        `# TYPE atlas_analyses_by_status gauge`,
        ...Object.entries(analysisStats.byStatus).map(([status, count]) => 
          `atlas_analyses_by_status{status="${status}"} ${count}`
        ),
        '',
        `# HELP atlas_database_records Number of database records`,
        `# TYPE atlas_database_records gauge`,
        `atlas_database_records{table="projects"} ${dbStats.projects}`,
        `atlas_database_records{table="analysis_results"} ${dbStats.analysisResults}`,
        `atlas_database_records{table="analysis_jobs"} ${dbStats.analysisJobs}`,
        ''
      ].join('\n');

      res.set('Content-Type', 'text/plain');
      res.send(metrics);

    } catch (error) {
      logger.error('Failed to generate metrics:', error);
      res.status(500).json({
        error: 'Failed to generate metrics',
        timestamp: new Date().toISOString()
      });
    }
  })
);

export default router;