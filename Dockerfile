# ---- Stage 1: Build ----
FROM node:22-slim AS builder

WORKDIR /app

# Copy workspace config and lockfile first (layer caching)
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/
COPY packages/client/package.json ./packages/client/

# Install ALL dependencies (including devDependencies for building)
RUN npm ci

# Copy source code
COPY tsconfig.base.json ./
COPY packages/shared/ ./packages/shared/
COPY packages/server/ ./packages/server/
COPY packages/client/ ./packages/client/

# Build all packages in order: shared -> server -> client
RUN npm run build

# ---- Stage 2: Production ----
FROM node:22-slim

WORKDIR /app

# Copy workspace config and lockfile
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/server/package.json ./packages/server/
COPY packages/client/package.json ./packages/client/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built artifacts from builder stage
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/client/dist ./packages/client/dist

ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "packages/server/dist/index.js"]
