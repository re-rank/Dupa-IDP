/**
 * Environment Variable Validation
 * 
 * Validates required environment variables at startup to prevent runtime errors
 */

import { logger } from './logger';

interface EnvConfig {
  required: string[];
  optional: string[];
}

const envConfig: EnvConfig = {
  required: [
    'NODE_ENV',
    'DATABASE_PATH',
  ],
  optional: [
    'BACKEND_PORT',
    'FRONTEND_URL',
    'CORS_ORIGIN',
    'REDIS_URL',
    'REDIS_ENABLED',
    'JWT_SECRET',
    'SESSION_SECRET',
    'LOG_LEVEL',
    'RATE_LIMIT_WINDOW',
    'RATE_LIMIT_MAX',
    'MAX_FILE_SIZE',
    'MAX_ANALYSIS_TIME',
    'GITHUB_TOKEN',
    'GITLAB_TOKEN',
    'BITBUCKET_TOKEN',
    'SENTRY_DSN',
    'TRUST_PROXY',
  ]
};

/**
 * Validates that all required environment variables are set
 * @throws {Error} If any required environment variable is missing
 */
export function validateEnv(): void {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const variable of envConfig.required) {
    if (!process.env[variable]) {
      missing.push(variable);
    }
  }

  // Check for development/production specific requirements
  if (process.env.NODE_ENV === 'production') {
    // Additional production requirements
    const productionRequired = ['JWT_SECRET', 'SESSION_SECRET'];
    
    for (const variable of productionRequired) {
      if (!process.env[variable] || process.env[variable]?.includes('change-this')) {
        warnings.push(`${variable} must be set to a secure value in production`);
      }
    }

    // Warn about disabled security features
    if (process.env.REDIS_ENABLED === 'false') {
      warnings.push('Redis is disabled - caching and job queues will not be available');
    }
  }

  // Check for default values that should be changed
  if (process.env.JWT_SECRET?.includes('change-this')) {
    warnings.push('JWT_SECRET contains default value - please change it');
  }

  if (process.env.SESSION_SECRET?.includes('change-this')) {
    warnings.push('SESSION_SECRET contains default value - please change it');
  }

  // Log warnings
  warnings.forEach(warning => logger.warn(`⚠️  ${warning}`));

  // Throw error if required variables are missing
  if (missing.length > 0) {
    const errorMessage = `Missing required environment variables: ${missing.join(', ')}`;
    logger.error(errorMessage);
    logger.info('Please create a .env file based on .env.example');
    throw new Error(errorMessage);
  }

  // Log successful validation
  logger.info('✅ Environment variables validated successfully');
  
  // Log environment info
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Database: ${process.env.DATABASE_PATH}`);
  logger.info(`Redis: ${process.env.REDIS_ENABLED === 'false' ? 'Disabled' : 'Enabled'}`);
}

/**
 * Gets a required environment variable or throws an error
 * @param key The environment variable key
 * @returns The environment variable value
 * @throws {Error} If the environment variable is not set
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  
  return value;
}

/**
 * Gets an optional environment variable with a default value
 * @param key The environment variable key
 * @param defaultValue The default value to use if not set
 * @returns The environment variable value or default
 */
export function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Gets a boolean environment variable
 * @param key The environment variable key
 * @param defaultValue The default value to use if not set
 * @returns The boolean value
 */
export function getBooleanEnv(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];
  
  if (!value) {
    return defaultValue;
  }
  
  return value.toLowerCase() === 'true';
}

/**
 * Gets a numeric environment variable
 * @param key The environment variable key
 * @param defaultValue The default value to use if not set
 * @returns The numeric value
 */
export function getNumericEnv(key: string, defaultValue: number): number {
  const value = process.env[key];
  
  if (!value) {
    return defaultValue;
  }
  
  const parsed = parseInt(value, 10);
  
  if (isNaN(parsed)) {
    logger.warn(`Invalid numeric value for ${key}: ${value}, using default: ${defaultValue}`);
    return defaultValue;
  }
  
  return parsed;
}