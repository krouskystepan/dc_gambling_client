'use server'

import { IGuildRole, IMemberCacheEntry } from '@/types/types'
import axios from 'axios'

const memberCache = new Map<string, IMemberCacheEntry>()

export async function fetchMemberRoles(guildId: string, userId: string) {
  const cacheKey = `${guildId}:${userId}`
  const cached = memberCache.get(cacheKey)
  const now = Date.now()

  if (cached && cached.expiresAt > now) {
    return cached.roles
  }

  const { data } = await axios.get<{ roles: string[] }>(
    `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`,
    { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN!}` } }
  )

  memberCache.set(cacheKey, { roles: data.roles, expiresAt: now + 60_000 })
  return data.roles
}

export async function getGuildRoles(guildId: string): Promise<IGuildRole[]> {
  if (!process.env.DISCORD_BOT_TOKEN) throw new Error('Bot token missing')
  try {
    const { data } = await axios.get<IGuildRole[]>(
      `https://discord.com/api/v10/guilds/${guildId}/roles`,
      { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
    )
    return data
      .filter((r) => r.id !== guildId && !r.managed)
      .sort((a, b) => b.position - a.position)
  } catch (err) {
    console.error('Discord API error fetching roles', err)
    return []
  }
}
