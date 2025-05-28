# syntax=docker.io/docker/dockerfile:1

# Base image with Node.js (updated to v20 for compatibility with @simplewebauthn/server)
FROM node:20-alpine AS base

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

# Rebuild the source code only when needed
FROM base AS builder

# Define build arguments for environment variables
ARG GIT_TAG
ARG DATABASE_URL
ARG DIRECT_URL
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG EMAIL_VERIFICATION_CALLBACK_URL
ARG MAINTENANCE_MODE
ARG NODE_ENV=production
ARG NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ARG NEXT_PUBLIC_CLOUDINARY_API_KEY
ARG CLOUDINARY_API_SECRET
ARG ENABLE_SIGNUP
ARG RESEND_API_KEY
ARG EMAIL_USER

# Set environment variables from build args
ENV DATABASE_URL=${DATABASE_URL}
ENV DIRECT_URL=${DIRECT_URL}
ENV BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
ENV BETTER_AUTH_URL=${BETTER_AUTH_URL}
ENV EMAIL_VERIFICATION_CALLBACK_URL=${EMAIL_VERIFICATION_CALLBACK_URL}
ENV MAINTENANCE_MODE=${MAINTENANCE_MODE}
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=${NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
ENV NEXT_PUBLIC_CLOUDINARY_API_KEY=${NEXT_PUBLIC_CLOUDINARY_API_KEY}
ENV CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
ENV ENABLE_SIGNUP=${ENABLE_SIGNUP}
ENV RESEND_API_KEY=${RESEND_API_KEY}
ENV EMAIL_USER=${EMAIL_USER}
ENV NEXT_TELEMETRY_DISABLED=1

# Copy runtime dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application source code
COPY . .

# Build the Next.js application with standalone output
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner

# Set non-root user for better security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create necessary directories and set permissions before switching user
RUN mkdir -p /app/.next/static && chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Pass public environment variables and runtime configuration
ARG NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ARG NEXT_PUBLIC_CLOUDINARY_API_KEY
ARG MAINTENANCE_MODE
ARG NODE_ENV=production
ARG GIT_TAG
ARG ENABLE_SIGNUP

# Set runtime environment variables
ENV NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=${NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}
ENV NEXT_PUBLIC_CLOUDINARY_API_KEY=${NEXT_PUBLIC_CLOUDINARY_API_KEY}
ENV MAINTENANCE_MODE=${MAINTENANCE_MODE}
ENV NODE_ENV=${NODE_ENV}
ENV ENABLE_SIGNUP=${ENABLE_SIGNUP}
ENV PORT=3113
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# Copy necessary files for standalone mode
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Standalone output contains everything needed to run the application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Expose port 3113
EXPOSE 3113

# Start the Next.js application using the standalone server.js
CMD ["node", "server.js"]

LABEL git.tag=${GIT_TAG}