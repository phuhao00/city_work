# Frontend Dockerfile for Expo Web
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install global dependencies
RUN npm install -g @expo/cli

# Copy package files
COPY package*.json ./
COPY app.json ./
COPY babel.config.js ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY App.tsx ./
COPY assets/ ./assets/

# Expose port for Expo web
EXPOSE 19006

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:19006 || exit 1

# Start Expo web
CMD ["npx", "expo", "start", "--web", "--port", "19006"]