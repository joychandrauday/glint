# Multi-stage Dockerfile for @glint/gateway
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root configurations and workspace manifests
COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/db/package*.json ./packages/db/
COPY packages/db/tsconfig.json ./packages/db/
COPY apps/gateway/package*.json ./apps/gateway/
COPY apps/gateway/tsconfig.json ./apps/gateway/

# Install monorepo dependencies
RUN npm ci

# Copy source code
COPY packages/shared ./packages/shared
COPY packages/db ./packages/db
COPY apps/gateway ./apps/gateway

# Build packages and gateway
RUN npm --workspace=@glint/shared run build
RUN npm --workspace=@glint/db run build
RUN npm --workspace=@glint/gateway run build

# Production runtime container
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8787

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/packages/db ./packages/db
COPY --from=builder /app/apps/gateway/package.json ./apps/gateway/package.json
COPY --from=builder /app/apps/gateway/dist ./apps/gateway/dist

EXPOSE 8787

CMD ["node", "apps/gateway/dist/index.js"]
