import { createClient, RedisClientType } from 'redis';
import { logger } from '../../utils/logger';

let redisClient: RedisClientType | null = null;

export const initializeRedis = async (): Promise<RedisClientType | null> => {
  if (process.env.REDIS_ENABLED !== 'true') {
    logger.info('Redis is disabled, skipping initialization');
    return null;
  }

  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = createClient({
      url: redisUrl,
      password: process.env.REDIS_PASSWORD || undefined,
      database: parseInt(process.env.REDIS_DB || '0'),
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis reconnection failed after 10 attempts');
            return new Error('Redis reconnection failed');
          }
          return Math.min(retries * 50, 1000);
        }
      }
    });

    redisClient.on('error', (error) => {
      logger.error('Redis client error:', error);
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('end', () => {
      logger.info('Redis client disconnected');
    });

    await redisClient.connect();
    
    // Test connection
    await redisClient.ping();
    
    logger.info('Redis initialized successfully');
    return redisClient;
  } catch (error) {
    logger.error('Failed to initialize Redis:', error);
    redisClient = null;
    return null;
  }
};

export const getRedisClient = (): RedisClientType | null => {
  return redisClient;
};

export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
};

// Cache utility functions
export const cacheGet = async (key: string): Promise<string | null> => {
  if (!redisClient) return null;
  
  try {
    return await redisClient.get(key);
  } catch (error) {
    logger.error('Redis GET error:', error);
    return null;
  }
};

export const cacheSet = async (
  key: string, 
  value: string, 
  ttl?: number
): Promise<boolean> => {
  if (!redisClient) return false;
  
  try {
    if (ttl) {
      await redisClient.setEx(key, ttl, value);
    } else {
      await redisClient.set(key, value);
    }
    return true;
  } catch (error) {
    logger.error('Redis SET error:', error);
    return false;
  }
};

export const cacheDel = async (key: string): Promise<boolean> => {
  if (!redisClient) return false;
  
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error('Redis DEL error:', error);
    return false;
  }
};