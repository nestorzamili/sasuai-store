# syntax=docker.io/docker/dockerfile:1

# Base image with Node.js
FROM node:22-alpine AS base

# Install libc6-compat for compatibility with certain binaries
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps

# Copy package.json and lockfile
COPY package.json package-lock.json* ./

# Install dependencies using npm, ensuring legacy peer dependencies are handled
RUN if [ -f package-lock.json ]; then npm ci --legacy-peer-deps; \
    else echo "Lockfile not found." && exit 1; \
    fi

# Set environment variables for runtime
ENV NODE_ENV=production

# Rebuild the source code only when needed
FROM base AS builder

# Copy runtime dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application source code
COPY . .

# Build the Next.js application
RUN npm run build

# Final production image
FROM base AS runner

# Copy required files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose port 3000
EXPOSE 3000

# Set the port environment variable
ENV PORT=3000

# Start the Next.js application
CMD ["npm", "run", "start"]

# Add metadata to the image
LABEL org.opencontainers.image.source="https://github.com/nestorzamili/sasuai-store" \
      org.opencontainers.image.description="Production-ready Docker image for Next.js application" \
    #   org.opencontainers.image.version=${GIT_TAG:-latest}