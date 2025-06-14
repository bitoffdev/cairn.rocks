# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Deploy stage
FROM node:20-alpine

WORKDIR /app

# Install wrangler globally
RUN npm install -g wrangler

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/wrangler.toml ./

# Set environment variables
ENV NODE_ENV=production

# Command to run the worker
CMD ["wrangler", "dev"] 