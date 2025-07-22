import { createClient } from 'redis';
import { logger } from '../../utils/logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = createClient({
  url: REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logger.error('Redis connection failed after 10 retries');
        return new Error('Redis connection failed');
      }
      const delay = Math.min(retries * 100, 3000);
      logger.info(`Retrying Redis connection in ${delay}ms...`);
      return delay;
    }
  }
});

redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  logger.info('Redis Client Connected');
});

redisClient.on('ready', () => {
  logger.info('Redis Client Ready');
});

export async function initializeRedis(): Promise<void> {
  try {
    await redisClient.connect();
    logger.info('Redis connection established');
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    // Don't throw - allow app to run without Redis for development
    logger.warn('Running without Redis - analysis queue will not be available');
  }
}

export async function closeRedis(): Promise<void> {
  try {
    await redisClient.quit();
    logger.info('Redis connection closed');
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
  }
}

export function isRedisConnected(): boolean {
  return redisClient.isReady;
}