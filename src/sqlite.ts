import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'
import { Interaction } from 'discord.js'

export async function initializeDatabase() {
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

export async function upsertChannel(
  db: Database,
  {
    interaction,
    channelName,
    crontab,
    guild,
  }: {
    interaction: Interaction
    channelName: string
    crontab: string
    guild: string
  }
) {
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
}
