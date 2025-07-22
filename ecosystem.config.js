module.exports = {
  apps: [
    {
      name: 'project-atlas-backend',
      script: './backend/dist/index.js',
      cwd: './',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        BACKEND_PORT: 3001,
        DATABASE_PATH: './data/atlas.db',
        LOG_LEVEL: 'info',
        REDIS_ENABLED: 'true',
        REDIS_URL: 'redis://localhost:6379'
      },
      env_development: {
        NODE_ENV: 'development',
        BACKEND_PORT: 3001,
        LOG_LEVEL: 'debug',
        REDIS_ENABLED: 'false'
      },
      env_staging: {
        NODE_ENV: 'staging',
        BACKEND_PORT: 3001,
        LOG_LEVEL: 'info',
        REDIS_ENABLED: 'true'
      },
      // Logging
      log_file: './logs/pm2-combined.log',
      out_file: './logs/pm2-out.log',
      error_file: './logs/pm2-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Process management
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'data', 'temp'],
      max_memory_restart: '2G',
      
      // Restart policy
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Health monitoring
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
      
      // Advanced options
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Environment variables
      env_file: './backend/.env'
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:your-org/project-atlas.git',
      path: '/var/www/project-atlas',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      'ssh_options': 'StrictHostKeyChecking=no'
    },
    
    staging: {
      user: 'deploy',
      host: ['staging-server.com'],
      ref: 'origin/develop',
      repo: 'git@github.com:your-org/project-atlas.git',
      path: '/var/www/project-atlas-staging',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging',
      'ssh_options': 'StrictHostKeyChecking=no'
    }
  }
};