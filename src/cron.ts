import { Client as DiscordClient } from 'discord.js'
import { CronJob } from 'cron'
import { contextPool } from './ContextPool'
import { generateVoiceChallenge } from './prompt'
const runningCronJobs: Record<string, CronJob> = {}

export function startCronJob(client: DiscordClient, guildId: string, channel: string, crontab: string) {
  const key = `${guildId}-${channel}`
  if (runningCronJobs[key]) {
    runningCronJobs[key].stop()
  }
  const job = new CronJob(
    crontab,
    async function sendMessage() {
      const guild = await client.guilds.fetch(guildId)
      const textChannel = guild.channels.cache.get(channel)

      if (textChannel && textChannel.isTextBased()) {
        const contextData = await contextPool.getContext()
        const context = `
          *${contextData?.question}*
          ${contextData?.choices.map((choice, index) => `${index + 1}. ${choice}`).join('\n')}\n\n
Answer: ${contextData?.answer}`
        const userResponse = await generateVoiceChallenge(context)
        if (!userResponse) {
          textChannel.send('Failed to generate voice challenge.')
        }
        await textChannel.send(
          `
### Voice Challenge: ${userResponse.title}
\`\`\`
${userResponse.challenge}
\`\`\`
*Bonus Points if your voice has a ${userResponse.bonus.toLowerCase().replace(/\.$/, '')}.*
          `.trim()
        )
      }
    },
    null,
    true,
    'America/Denver'
  )
  job.start()
  runningCronJobs[key] = job
}
