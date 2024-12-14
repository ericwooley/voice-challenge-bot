import { config } from 'dotenv'
import { Client as DiscordClient, Events, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js'
import cronv from 'cron-validate'
import { initializeDatabase, upsertChannel, getAllCronJobs, deleteChannel } from './sqlite'
import { startChallengeSendCronJob, stopChallengeSendCronJob } from './cron'
config()

async function main() {
  const client = new DiscordClient({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates] as const,
  })

  const db = await initializeDatabase()

  const cronJobs = await getAllCronJobs(db)
  cronJobs.forEach(({ guild_id, channel, crontab }) => {
    startChallengeSendCronJob(client, guild_id, channel, crontab)
  })

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
      if (channelName.length > 20 || channelName.length < 16 || !/^\d+$/.test(channelName)) {
        return await interaction.reply('Invalid channel')
      }
      const crontab = interaction.options.get('crontab')!.value
      if (typeof crontab !== 'string') {
        return await interaction.reply('Invalid crontab')
      }
      const guild = interaction.guildId
      if (typeof guild !== 'string') {
        return await interaction.reply('Invalid guild')
      }
      const cronResult = cronv(crontab)
      if (cronResult.isValid()) {
        await upsertChannel(db, { channelName, crontab, guild })
        startChallengeSendCronJob(client, guild, channelName, crontab)
        await interaction.reply(`Channel ${channelName} with crontab ${crontab} has been installed.`)
      } else {
        await interaction.reply(`Invalid crontab expression: ${crontab}`)
      }
    } else if (commandName === 'uninstall') {
      const channelName = interaction.options.get('channel')!.value
      if (typeof channelName !== 'string') {
        return await interaction.reply('Invalid channel')
      }
      const guild = interaction.guildId
      if (typeof guild !== 'string') {
        return await interaction.reply('Invalid guild')
      }
      await deleteChannel(db, guild, channelName)
      stopChallengeSendCronJob(guild, channelName)
      await interaction.reply(`Channel ${channelName} has been uninstalled.`)
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
    new SlashCommandBuilder()
      .setName('uninstall')
      .setDescription('Uninstall a channel')
      .addChannelOption((option) =>
        option.setName('channel').setDescription('The name of the channel').setRequired(true)
      ),
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
