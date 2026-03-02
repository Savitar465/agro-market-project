# Multi-stage Dockerfile for NestJS app (agro-market)
# Builder stage: installs dev deps and builds TypeScript
FROM node:18-bullseye AS builder

# Create app directory
WORKDIR /usr/src/app

# Install build-time dependencies and deps
# Copy package manifests first to leverage Docker layer caching
COPY package*.json ./

# Use npm ci when package-lock.json is present for reproducible builds; fallback to npm install
RUN npm ci --legacy-peer-deps --no-audit --no-fund || npm install --legacy-peer-deps --no-audit --no-fund

# Copy source and build
COPY . .
RUN npm run build

# Production image
FROM node:18-bullseye-slim AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production

# Copy package manifests and install only production deps
COPY package*.json ./
RUN npm ci --only=production --no-audit --no-fund || npm install --only=production --no-audit --no-fund

# Copy built output from builder
COPY --from=builder /usr/src/app/dist ./dist

# Ensure runtime files are owned by the 'node' user (official image provides node user)
RUN chown -R node:node /usr/src/app
USER node

EXPOSE 3000

# Default command — use the same entrypoint as package.json start:prod
CMD ["node", "dist/main.js"]
