# Multi-stage Docker build for Restaurant Revolution v3

# Stage 1: Dependencies
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY client/ ./client/
COPY server/ ./server/
COPY shared/ ./shared/

# Build the application
RUN npm run build

# Stage 3: Production
FROM node:18-alpine AS production

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S restaurantapp -u 1001

# Set working directory
WORKDIR /app

# Copy production dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/package*.json ./

# Copy static assets and configuration
COPY --chown=restaurantapp:nodejs theme.json ./
COPY --chown=restaurantapp:nodejs generated-icon.png ./

# Create necessary directories
RUN mkdir -p /app/logs && chown -R restaurantapp:nodejs /app/logs
RUN mkdir -p /app/uploads && chown -R restaurantapp:nodejs /app/uploads

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache dumb-init

# Switch to non-root user
USER restaurantapp

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
    const options = { host: 'localhost', port: 5001, path: '/health', timeout: 2000 }; \
    const req = http.request(options, (res) => { \
      if (res.statusCode === 200) process.exit(0); \
      else process.exit(1); \
    }); \
    req.on('error', () => process.exit(1)); \
    req.on('timeout', () => process.exit(1)); \
    req.end();"

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5001

# Start application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]