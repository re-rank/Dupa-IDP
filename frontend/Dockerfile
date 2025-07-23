# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create nginx user
RUN addgroup -g 1001 -S nginx
RUN adduser -S atlas -u 1001 -G nginx

# Set permissions
RUN chown -R atlas:nginx /usr/share/nginx/html
RUN chown -R atlas:nginx /var/cache/nginx
RUN chown -R atlas:nginx /var/log/nginx
RUN chown -R atlas:nginx /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R atlas:nginx /var/run/nginx.pid

# Switch to non-root user
USER atlas

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]