# Backend Dockerfile
FROM node:18-alpine

# No build dependencies needed for pure JavaScript modules

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Set npm registry to Taobao mirror for faster downloads
RUN npm config set registry https://registry.npmmirror.com

# Set npm configuration for better network handling
RUN npm config set fetch-retry-mintimeout 20000
RUN npm config set fetch-retry-maxtimeout 120000
RUN npm config set fetch-retries 3
# Removed invalid network-timeout option

# Install dependencies with retry mechanism
RUN npm install || npm install || npm install

# Copy source code
COPY src/ ./src/
COPY prisma/ ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "run", "start:prod"]