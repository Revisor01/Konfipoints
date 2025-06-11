FROM node:18-alpine

WORKDIR /app

# Install build dependencies for SQLite
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies (use install instead of ci)
RUN npm install --omit=dev

# Copy source code
COPY . .

# Create data directory for SQLite
RUN mkdir -p /app/data

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start the application
CMD ["node", "server.js"]