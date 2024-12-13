import { config } from 'dotenv'
import { ChannelType, Client as DiscordClient, Events, GatewayIntentBits } from 'discord.js'
config()

async function listAllChannels(client: DiscordClient) {
  const guilds = await client.guilds.fetch()

  for (const guild of guilds.values()) {
    const fullGuild = await client.guilds.fetch(guild.id)
    console.log(`Guild: ${fullGuild.name}`)

    const channels = await fullGuild.channels.fetch()
    channels.forEach((channel) => {
      if (channel?.type !== ChannelType.GuildText) return
      console.log(`Channel Name: ${channel.name}, Type: ${channel.type}, id: ${channel.id}`)
    })
  }
}
async function main() {
  const client = new DiscordClient({
    intents: [

    ] as const,
  })

  client.on(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user?.tag}!`)
    listAllChannels(client).catch(console.error)
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
