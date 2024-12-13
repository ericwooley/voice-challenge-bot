import { config } from 'dotenv'
import { Client as DiscordClient, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import cron from 'cron-validate'
config()

async function initializeDatabase() {
  const db = await open({
    filename: './voice-challenge-bot.db',
    driver: sqlite3.Database,
  })

  await db.exec(`
    CREATE TABLE IF NOT EXISTS voice_channels (
      id TEXT PRIMARY KEY,
      guild_id TEXT NOT NULL,
      channel TEXT NOT NULL,
      crontab TEXT,
      UNIQUE(guild_id, channel)
    )
  `)

  return db
}

async function main() {
  const client = new DiscordClient({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates] as const,
  })

  const db = await initializeDatabase()

  client.on(Events.ClientReady, async () => {
    console.log(`Logged in as ${client.user?.tag}!`)
    await registerCommands(client)
  })

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return

    const { commandName } = interaction

    if (commandName === 'install') {
      const channelName = interaction.options.get('channel')!.value
      if (typeof channelName !== 'string') {
        return await interaction.reply('Invalid channel')
      }
      const crontab = interaction.options.get('crontab')!.value
      if (typeof crontab !== 'string') {
        return await interaction.reply('Invalid crontab')
      }
      const guild = interaction.guildId

      const cronResult = cron(crontab)
      if (cronResult.isValid()) {
        await db.run(
          `
          INSERT INTO voice_channels (id, guild_id, channel, crontab)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            channel=excluded.channel,
            crontab=excluded.crontab
          `,
          [interaction.channelId, guild, channelName, crontab]
        )
        await interaction.reply(`Channel ${channelName} with crontab ${crontab} has been installed.`)
      } else {
        await interaction.reply(`Invalid crontab expression: ${crontab}`)
      }
    }
  })

  client.on(Events.MessageCreate, async (message) => {
    console.log('message', message)
    console.log('message.content', message.content)
    if (message.content === 'ping') {
      message.reply('pong')
    }
  })
  client.login(process.env.DISCORD_BOT_TOKEN)
}

async function registerCommands(client: DiscordClient) {
  const commands = [
    new SlashCommandBuilder()
      .setName('install')
      .setDescription('Install a channel with a crontab')
      .addChannelOption((option) =>
        option.setName('channel').setDescription('The name of the channel').setRequired(true)
      )
      .addStringOption((option) => option.setName('crontab').setDescription('The crontab schedule').setRequired(true)),
  ].map((command) => command.toJSON())

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN!)

  try {
    console.log('Started refreshing application (/) commands.')

    await rest.put(Routes.applicationCommands(client.user!.id), { body: commands })

    console.log('Successfully reloaded application (/) commands.')
  } catch (error) {
    console.error(error)
  }
}

main()
