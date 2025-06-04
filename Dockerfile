FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY turbo.json ./

# Copy workspace package files
COPY packages/admin-api/package*.json ./packages/admin-api/
COPY packages/admin-panel/package*.json ./packages/admin-panel/
COPY packages/miniapp/package*.json ./packages/miniapp/
COPY packages/database/package*.json ./packages/database/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build applications
RUN npm run build

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

# Copy built assets
COPY --from=builder /app/packages/admin-api/dist ./packages/admin-api/dist
COPY --from=builder /app/packages/admin-api/package.json ./packages/admin-api/
COPY --from=builder /app/package*.json ./

# Install production dependencies
RUN npm install --production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 