# Multi-stage Docker build for production
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY backend/package.json backend/package-lock.json* ./backend/
COPY frontend/package.json frontend/package-lock.json* ./frontend/

RUN npm ci --only=production

# Build the application
FROM base AS builder
WORKDIR /app

COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY shared/ ./shared/

# Build backend
WORKDIR /app/backend
RUN npm ci && npm run build

# Build frontend
WORKDIR /app/frontend
RUN npm ci && npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expenseuser

# Copy built backend
COPY --from=builder --chown=expenseuser:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=expenseuser:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=builder --chown=expenseuser:nodejs /app/backend/package.json ./backend/
COPY --from=builder --chown=expenseuser:nodejs /app/backend/prisma ./backend/prisma

# Copy built frontend
COPY --from=builder --chown=expenseuser:nodejs /app/frontend/dist ./frontend/dist

# Copy shared types
COPY --from=builder --chown=expenseuser:nodejs /app/shared ./shared

# Generate Prisma client
WORKDIR /app/backend
RUN npx prisma generate

USER expenseuser

EXPOSE 3001

ENV PORT 3001
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "start"]