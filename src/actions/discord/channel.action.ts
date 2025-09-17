'use server'

import { GuildChannel } from '@/types/types'
import axios from 'axios'

type CachedGuildChannels = {
  data: GuildChannel[]
  expiresAt: number
}

const guildChannelsCache = new Map<string, CachedGuildChannels>()

export const getGuildChannels = async (
  guildId: string
): Promise<GuildChannel[]> => {
  const now = Date.now()
  const cached = guildChannelsCache.get(guildId)

  if (cached && cached.expiresAt > now) {
    return cached.data
  }

  if (!process.env.DISCORD_BOT_TOKEN) throw new Error('Bot token missing')

  try {
    const { data } = await axios.get<GuildChannel[]>(
      `https://discord.com/api/v10/guilds/${guildId}/channels`,
      {
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
      }
    )

    const textChannels = data.filter((c) => c.type === 0)

    guildChannelsCache.set(guildId, {
      data: textChannels,
      expiresAt: now + 60_000, // cache for 1 minute
    })

    return textChannels
  } catch (err) {
    console.error('Discord API error fetching channels', err)
    return []
  }
}
