# Voice Challenge Bot

This is a Discord bot that generates voice challenges for a Discord channel based on a cron job.

## Prerequisites

- [pnpm](https://pnpm.io/installation)
- A Discord bot access token
- A Gemini API key

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/yourusername/voice-challenge-bot.git
   cd voice-challenge-bot
   ```

2. Install dependencies using pnpm:

   ```sh
   pnpm install
   ```

3. Create a `.env` file in the root directory and add the following environment variables:

   ```env
   DISCORD_BOT_TOKEN=your-discord-bot-token
   GEMINI_API_KEY=your-gemini-api-key
   ```

## Usage

1. Start the bot:

   ```sh
   pnpm start
   ```

2. The bot will log in to Discord and start listening for commands.

## Commands

- `/vcb_install`: Install a channel with a crontab schedule.
- `/vcb_uninstall`: Uninstall a channel.
- `/vcb_generate_challenge`: Generate a voice challenge.

## License

This project is licensed under the MIT License.
