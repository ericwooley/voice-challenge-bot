# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

- `pnpm install` - Install dependencies using pnpm package manager
- `pnpm build` or `npm run build` - Compile TypeScript to JavaScript in the dist/ directory
- `pnpm start` or `npm start` - Build and start the Discord bot using PM2 process manager
- `pnpm restart` or `npm restart` - Rebuild and restart the PM2 process
- `npm run logs` - View PM2 logs for the running bot
- `npm run build-run` - Build and run the prompt binary for testing

## Architecture Overview

This is a Discord bot that generates daily voice acting challenges for Discord servers. The bot operates on a cron job system and integrates with external APIs.

### Core Components

**Main Bot (`discord-bot.bin.ts`)**: The primary Discord client that handles slash commands and manages the bot lifecycle. Registers and handles three commands:
- `/vcb_install` - Install voice challenges in a channel with cron schedule
- `/vcb_uninstall` - Remove voice challenges from a channel  
- `/vcb_generate_challenge` - Manually generate a challenge

**Cron System (`cron.ts`)**: Manages scheduled message sending using the `cron` library. Maintains a registry of running cron jobs keyed by `guildId-channelId`. Uses America/Denver timezone.

**Challenge Generation (`generateVoiceChallengeResponse.ts` + `prompt.ts`)**: 
- Fetches current news headlines from NewsAPI.org via `ContextPool`
- Generates creative voice acting challenges using Google Gemini 2.0 Flash model
- Returns structured challenges with title, scenario, and voice bonus (speed/pitch variations)

**Context Pool (`ContextPool.ts`)**: Manages a pool of current news articles from NewsAPI.org to provide inspiration context for challenge generation. Handles rate limiting with 30-second retries and filters out removed articles.

**Database (`sqlite.ts`)**: SQLite database operations for persisting channel configurations. Single table `voice_channels` stores guild_id, channel, and crontab schedule.

### Key Dependencies

- `discord.js` - Discord API integration
- `@google/generative-ai` - Gemini AI model for challenge generation  
- `cron` - Cron job scheduling
- `sqlite`/`sqlite3` - Database persistence
- `pm2` - Process management for production deployment

### Environment Variables Required

- `DISCORD_BOT_TOKEN` - Discord bot authentication token
- `GEMINI_API_KEY` - Google Gemini API key for AI generation
- `NEWS_API_KEY` - NewsAPI.org API key for fetching current news headlines

The bot creates a SQLite database file `voice-challenge-bot.db` in the project root for persistence.