# Multi-stage build for Project Atlas

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./
RUN npm ci --only=production

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source and shared types
COPY backend/ ./
COPY shared/ ../shared/

# Build backend
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine AS production

# Install system dependencies
RUN apk add --no-cache \
    git \
    sqlite \
    && rm -rf /var/cache/apk/*

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S atlas -u 1001

# Set working directory
WORKDIR /app

# Copy built backend
COPY --from=backend-builder --chown=atlas:nodejs /app/backend/dist ./backend/dist
COPY --from=backend-builder --chown=atlas:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder --chown=atlas:nodejs /app/backend/package.json ./backend/

# Copy built frontend
COPY --from=frontend-builder --chown=atlas:nodejs /app/frontend/dist ./frontend/dist

# Copy shared types
COPY --chown=atlas:nodejs shared/ ./shared/

# Create necessary directories
RUN mkdir -p /app/data /app/temp /app/logs && \
    chown -R atlas:nodejs /app/data /app/temp /app/logs

# Switch to non-root user
USER atlas

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the application
CMD ["node", "backend/dist/index.js"]