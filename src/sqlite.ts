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
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
    INSERT INTO voice_channels (guild_id, channel, crontab)
    VALUES (?, ?, ?)
    ON CONFLICT(guild_id, channel) DO UPDATE SET
      channel=excluded.channel,
      crontab=excluded.crontab
    `,
    [guild, channelName, crontab]
  )
}



export async function getAllCronJobs(db: Database) {
  return db.all(`SELECT guild_id, channel, crontab FROM voice_channels`)
}
