# Multi-stage Dockerfile for @glint/admin
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root configurations and workspace manifests
COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/db/package*.json ./packages/db/
COPY packages/db/tsconfig.json ./packages/db/
COPY apps/admin/package*.json ./apps/admin/
COPY apps/admin/tsconfig.json ./apps/admin/
COPY apps/admin/vite.config.ts ./apps/admin/
COPY apps/admin/tailwind.config.js ./apps/admin/
COPY apps/admin/postcss.config.js ./apps/admin/
COPY apps/admin/index.html ./apps/admin/

# Install dependencies
RUN npm ci

# Copy source
COPY packages/shared ./packages/shared
COPY packages/db ./packages/db
COPY apps/admin/src ./apps/admin/src

# Build packages and admin
RUN npm --workspace=@glint/shared run build
RUN npm --workspace=@glint/db run build
RUN npm --workspace=@glint/admin run build

# Nginx static server
FROM nginx:alpine AS runner

COPY --from=builder /app/apps/admin/dist /usr/share/nginx/html
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
