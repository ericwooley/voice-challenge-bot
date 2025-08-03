FROM node:22-alpine

# Install build dependencies for native modules and wget for healthcheck
RUN apk add --no-cache python3 make g++ wget curl

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files for better caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies and rebuild native modules
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the TypeScript code
RUN pnpm build


# Expose port (not strictly necessary but good practice)
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Run the bot directly with node (not PM2) for proper Docker logging
CMD ["node", "dist/discord-bot.bin.js"]