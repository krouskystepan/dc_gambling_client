'use server'

import { REST } from '@discordjs/rest'
import axios from 'axios'
import { Routes } from 'discord-api-types/v10'

export const isBotInGuild = async (guildId: string): Promise<boolean> => {
  if (!process.env.DISCORD_BOT_TOKEN) {
    throw new Error('Bot token missing')
  }

  try {
    await axios.get(`https://discord.com/api/v10/guilds/${guildId}`, {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
    })
    return true
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status
      if (status === 403 || status === 404) return false
      throw new Error(`Discord API error: ${status}`)
    }
    throw err
  }
}

export async function sendEmbed(
  channelId: string,
  title: string,
  description: string,
  color: number
) {
  if (!channelId) throw new Error('No channel ID provided')
  if (!process.env.DISCORD_BOT_TOKEN) throw new Error('Discord token not set')

  try {
    const rest = new REST({ version: '10' }).setToken(
      process.env.DISCORD_BOT_TOKEN
    )

    const embed = {
      title,
      description,
      color,
    }

    await rest.post(Routes.channelMessages(channelId), {
      body: { embeds: [embed] },
    })
  } catch (err) {
    console.error(`Failed to send message to channel ${channelId}:`, err)
  }
}
