FROM node:22-alpine

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files for better caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the TypeScript code
RUN pnpm build

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S botuser -u 1001
USER botuser

# Expose port (not strictly necessary but good practice)
EXPOSE 3000

# Run the bot directly with node (not PM2) for proper Docker logging
CMD ["node", "dist/discord-bot.bin.js"]