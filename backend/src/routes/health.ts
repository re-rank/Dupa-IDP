import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';

const router = Router();

// Health check endpoint
router.get('/', (req: Request, res: Response) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '0.1.0',
    memory: process.memoryUsage(),
    cpu: process.cpuUsage()
  };

  try {
    res.status(200).json({
      success: true,
      data: healthCheck,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: 'Service temporarily unavailable'
      },
      timestamp: new Date().toISOString()
    });
  }
});

// Detailed health check with dependencies
router.get('/detailed', async (req: Request, res: Response) => {
  const checks = {
    server: 'OK',
    database: 'OK', // Will be implemented when database is added
    redis: 'OK',    // Will be implemented when Redis is added
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  };

  // TODO: Add actual database and Redis health checks
  
  res.status(200).json({
    success: true,
    data: checks,
    timestamp: new Date().toISOString()
  });
});

export default router;