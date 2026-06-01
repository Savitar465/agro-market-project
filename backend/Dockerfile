# Multi-stage Dockerfile for NestJS app (agro-market)

# ---- Builder stage: install all deps (incl. dev) and build TypeScript ----
FROM node:22-bookworm AS builder

WORKDIR /usr/src/app

# Copy package manifests first to leverage Docker layer caching
COPY package*.json ./

# Use npm ci when package-lock.json is present for reproducible builds; fallback to npm install.
# Full toolchain (python/make/g++) is available here so native deps like bcrypt build cleanly.
RUN npm ci --legacy-peer-deps --no-audit --no-fund || npm install --legacy-peer-deps --no-audit --no-fund

# Copy source and build
COPY . .
RUN npm run build

# Strip dev dependencies in place so the already-built native modules (bcrypt)
# can be copied as-is into the slim runner, which has no compiler toolchain.
RUN npm prune --omit=dev --legacy-peer-deps

# ---- Production image ----
FROM node:22-bookworm-slim AS runner
WORKDIR /usr/src/app

# Copy production node_modules, built output and manifests from the builder
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package*.json ./

# Run as the unprivileged 'node' user provided by the official image
USER node

# Matches the app's default port (process.env.PORT ?? 3001) and docker-compose mapping
EXPOSE 3001

# Default command — same entrypoint as package.json start:prod
CMD ["node", "dist/main.js"]
