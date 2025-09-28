'use server'

import { ICacheEntry, IGuild } from '@/types/types'
import axios from 'axios'
import { Session } from 'next-auth'
import { cache } from 'react'
import { getAllGuildConfigsWithManagers } from '../database/guild.action'
import { fetchMemberRoles } from './role.action'

const guildCache = new Map<string, ICacheEntry<IGuild[]>>()

const GUILD_CACHE_DURATION = 5 * 60_000

export const fetchUserGuilds = async (session: Session): Promise<IGuild[]> => {
  if (!session.accessToken) return []

  const cacheKey = session.userId!
  const cached = guildCache.get(cacheKey)
  const now = Date.now()

  if (cached && cached.expiresAt > now) return cached.data

  try {
    const { data } = await axios.get<IGuild[]>(
      'https://discord.com/api/v10/users/@me/guilds',
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    )

    guildCache.set(cacheKey, { data, expiresAt: now + GUILD_CACHE_DURATION })
    return data
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 429) {
      console.warn('Discord API rate limit hit when fetching user guilds')
      return []
    }

    throw err
  }
}

export const getUserGuilds = cache(
  async (session: Session): Promise<IGuild[]> => {
    if (!session.userId) return []

    if (!process.env.DISCORD_BOT_TOKEN) throw new Error('Bot token missing')

    const userGuilds = await fetchUserGuilds(session)

    const allGuildConfigs = await getAllGuildConfigsWithManagers()

    const accessibleGuilds: IGuild[] = []

    for (const guild of userGuilds) {
      let includeGuild = false

      const isAdmin = (Number(guild.permissions) & 0x8) === 0x8
      if (isAdmin) {
        includeGuild = true
      }

      const dbConfig = allGuildConfigs.find((c) => c.guildId === guild.id)
      if (dbConfig) {
        try {
          const roles = await fetchMemberRoles(guild.id, session.userId!)
          if (roles.includes(dbConfig.managerRoleId)) includeGuild = true
        } catch (err) {
          if (
            axios.isAxiosError(err) &&
            (err.response?.status === 403 || err.response?.status === 404)
          ) {
            continue
          }
          console.error(
            `Failed to fetch member roles for guild ${guild.id}`,
            err
          )
        }
      }

      if (includeGuild) accessibleGuilds.push(guild)
    }

    return accessibleGuilds
  }
)

export const getGuildName = async (guildId: string): Promise<string | null> => {
  if (!process.env.DISCORD_BOT_TOKEN) return null

  try {
    const { data: guild } = await axios.get<{ id: string; name: string }>(
      `https://discord.com/api/v10/guilds/${guildId}`,
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
      }
    )

    return guild.name
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status
      if (status === 403 || status === 404) return null
      console.error('Discord API error', status, err.message)
      return null
    }
    throw err
  }
}
