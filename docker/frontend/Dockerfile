# Frontend Dockerfile for Expo Web
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install global dependencies (removed @expo/cli for faster build)

# Copy package files
COPY package*.json ./
COPY app.json ./
COPY babel.config.js ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY src/ ./src/
COPY App.tsx ./
COPY index.js ./

# Expose port for Expo web
EXPOSE 19007

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:19007 || exit 1

# Start Expo web
CMD ["npx", "expo", "start", "--web", "--port", "19007"]