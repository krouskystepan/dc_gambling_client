'use server'

import { IGuildChannel } from '@/types/types'
import axios from 'axios'

export const getGuildCategories = async (
  guildId: string
): Promise<IGuildChannel[]> => {
  if (!process.env.DISCORD_BOT_TOKEN) throw new Error('Bot token missing')
  try {
    const { data } = await axios.get<IGuildChannel[]>(
      `https://discord.com/api/v10/guilds/${guildId}/channels`,
      { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
    )
    return data.filter((c) => c.type === 4)
  } catch (err) {
    console.error('Discord API error fetching categories', err)
    return []
  }
}
