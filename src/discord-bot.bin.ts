import { config } from 'dotenv'
import { ChannelType, Client as DiscordClient, Events, GatewayIntentBits } from 'discord.js'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
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
      name TEXT NOT NULL,
      crontab TEXT
    )
  `)

  return db
}

async function listAllChannels(client: DiscordClient, db: any) {
  const guilds = await client.guilds.fetch()

  for (const guild of guilds.values()) {
    const fullGuild = await client.guilds.fetch(guild.id)
    console.log(`Guild: ${fullGuild.name}`)

    const channels = await fullGuild.channels.fetch()
    channels.forEach(async (channel) => {
      if (channel?.type !== ChannelType.GuildVoice) return
      console.log(`Channel Name: ${channel.name}, Type: ${channel.type}, id: ${channel.id}`)
      // await db.run(
      //   `
      //   INSERT OR IGNORE INTO voice_channels (id, guild_id, name)
      //   VALUES (?, ?, ?)
      // `,
      //   [channel.id, guild.id, channel.name]
      // )
    })
  }
}

async function main() {
  const client = new DiscordClient({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates] as const,
  })

  const db = await initializeDatabase()

  client.on(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user?.tag}!`)
    listAllChannels(client, db).catch(console.error)
  })

  // // keep nodejs alive
  client.on(Events.MessageCreate, async (message) => {
    console.log('message', message)
    console.log('message.content', message.content)
    if (message.content === 'ping') {
      message.reply('pong')
    }
  })
  client.login(process.env.DISCORD_BOT_TOKEN)
}
main()
