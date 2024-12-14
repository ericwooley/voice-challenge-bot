import { Client as DiscordClient } from 'discord.js'
import { CronJob } from 'cron'
import { generateVoiceChallengeResponse } from './generateVoiceChallengeResponse'
const runningCronJobs: Record<string, CronJob> = {}
export function getKey(guildId: string, channel: string) {
  return `${guildId}-${channel}`
}
export function startChallengeSendCronJob(client: DiscordClient, guildId: string, channel: string, crontab: string) {
  const key = getKey(guildId, channel)
  stopChallengeSendCronJob(guildId, channel)
  const job = new CronJob(
    crontab,
    async function sendMessage() {
      const guild = await client.guilds.fetch(guildId)
      const textChannel = guild.channels.cache.get(channel)
      if (textChannel && textChannel.isTextBased()) {
        await textChannel.send(await generateVoiceChallengeResponse())
      }
    },
    null,
    true,
    'America/Denver'
  )
  job.start()
  runningCronJobs[key] = job
}
export function stopChallengeSendCronJob(guildId: string, channel: string) {
  const key = getKey(guildId, channel)
  if (runningCronJobs[key]) {
    runningCronJobs[key].stop()
    delete runningCronJobs[key]
  }
}
