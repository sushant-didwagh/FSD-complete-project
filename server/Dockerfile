# ─────────────────────────────────────────────────────────
# Student Buddy — Backend Dockerfile
# ─────────────────────────────────────────────────────────

# ── Stage 1: Dependencies ────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files first (layer cache optimization)
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# ── Stage 2: Production Image ────────────────────────────
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling (graceful shutdown)
RUN apk add --no-cache dumb-init

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser  -S nodeuser -u 1001

# Copy production node_modules from deps stage
COPY --from=deps --chown=nodeuser:nodejs /app/node_modules ./node_modules

# Copy application source code
COPY --chown=nodeuser:nodejs . .

# Switch to non-root user
USER nodeuser

# Expose the API port
EXPOSE 5000

# Health check — Docker will mark container unhealthy if this fails
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

# Use dumb-init as PID 1 for proper signal forwarding
ENTRYPOINT ["dumb-init", "--"]

# Start the server
CMD ["node", "server.js"]
