/**
 * Project Atlas - Backend Server
 * 
 * An open-source tool for automated code structure analysis and visualization
 * of single or multi-repository codebases.
 * 
 * @license Apache-2.0
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// Import middleware
import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';

// Import utilities
import { logger } from './utils/logger';
import { validateEnv } from './utils/validateEnv';

// Import database and services
import { initializeDatabase, closeDatabase } from './database/connection';
import { initializeRedis, closeRedis } from './services/redis/redisClient';

// Import routes
import projectRoutes from './routes/projects';
import analysisRoutes from './routes/analysis.routes';
import healthRoutes from './routes/health';

// Load environment variables
dotenv.config();

// Validate required environment variables
validateEnv();

// Create Express application
const app: Application = express();
const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || '3000', 10);
const NODE_ENV = process.env.NODE_ENV || 'development';
const isDevelopment = NODE_ENV === 'development';

/**
 * Security Configuration
 */
// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: isDevelopment ? false : undefined,
  crossOriginEmbedderPolicy: !isDevelopment
}));

// CORS configuration
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (corsOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes except health checks
app.use((req, res, next) => {
  if (req.path.startsWith('/api/health')) {
    return next();
  }
  limiter(req, res, next);
});

/**
 * Logging Configuration
 */
// Morgan HTTP request logger
app.use(morgan(isDevelopment ? 'dev' : 'combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  },
  skip: (req) => req.path === '/api/health' // Skip health check logs
}));

/**
 * Body Parsing Middleware
 */
app.use(express.json({ 
  limit: process.env.MAX_REQUEST_SIZE || '10mb',
  strict: true 
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: process.env.MAX_REQUEST_SIZE || '10mb' 
}));

/**
 * Trust Proxy Configuration
 */
if (process.env.TRUST_PROXY) {
  app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? true : process.env.TRUST_PROXY);
}

/**
 * API Routes
 */
// Debug endpoint
app.post('/api/debug', (req, res) => {
  console.log('DEBUG: Request received');
  console.log('Body:', req.body);
  res.json({ success: true, body: req.body });
});

app.use('/api/health', healthRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/analysis', analysisRoutes);

// API documentation redirect
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to Project Atlas API',
    version: process.env.npm_package_version || '0.1.0',
    documentation: `${req.protocol}://${req.get('host')}/api-docs`,
    endpoints: {
      health: '/api/health',
      projects: '/api/projects',
      analysis: '/api/analysis'
    }
  });
});

/**
 * Error Handling
 */
// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

/**
 * Server Initialization
 */
let server: any;

const startServer = async (): Promise<void> => {
  try {
    logger.info('Starting Project Atlas Backend Server...');
    
    // Initialize database
    logger.info('Initializing database...');
    await initializeDatabase();
    logger.info('✅ Database initialized successfully');
    
    // Initialize Redis (optional)
    if (process.env.REDIS_ENABLED !== 'false') {
      logger.info('Initializing Redis...');
      await initializeRedis();
      logger.info('✅ Redis initialized successfully');
    } else {
      logger.info('ℹ️  Redis is disabled');
    }
    
    // Start server
    server = app.listen(PORT, () => {
      logger.info('='.repeat(50));
      logger.info(`🚀 Project Atlas Backend Server`);
      logger.info(`📊 Environment: ${NODE_ENV}`);
      logger.info(`🔗 Server: http://localhost:${PORT}`);
      logger.info(`🌐 CORS: ${corsOrigins.join(', ')}`);
      logger.info(`📝 API Docs: http://localhost:${PORT}/api`);
      logger.info('='.repeat(50));
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      switch (error.code) {
        case 'EACCES':
          logger.error(`Port ${PORT} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`Port ${PORT} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    await cleanup();
    process.exit(1);
  }
};

/**
 * Graceful Shutdown Handler
 */
const cleanup = async (): Promise<void> => {
  logger.info('Starting graceful shutdown...');
  
  try {
    // Close server
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
      });
      logger.info('✅ HTTP server closed');
    }

    // Close Redis connection
    await closeRedis();
    logger.info('✅ Redis connection closed');

    // Close database connection
    await closeDatabase();
    logger.info('✅ Database connection closed');

    logger.info('Graceful shutdown completed');
  } catch (error) {
    logger.error('Error during shutdown:', error);
    throw error;
  }
};

// Shutdown signals
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received');
  await cleanup();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received');
  await cleanup();
  process.exit(0);
});

// Uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  cleanup().then(() => process.exit(1));
});

// Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  cleanup().then(() => process.exit(1));
});

// Start the server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;