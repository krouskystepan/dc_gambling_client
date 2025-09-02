'use server'

import axios from 'axios'
import { DiscordGuild } from '@/types/discord'

import { cache } from 'react'

export const getUserGuilds = cache(async (accessToken: string) => {
  if (!accessToken) return []
  try {
    const { data: userGuilds } = await axios.get<DiscordGuild[]>(
      'https://discord.com/api/users/@me/guilds',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    return userGuilds.filter((g) => (Number(g.permissions) & 0x8) === 0x8)
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 429) return []
    throw err
  }
})

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

export const getGuildName = async (
  accessToken: string,
  guildId: string
): Promise<string | null> => {
  if (!accessToken) return null

  try {
    const userGuilds = await getUserGuilds(accessToken)
    const guild = userGuilds.find((g) => g.id === guildId)
    return guild ? guild.name : null
  } catch (err) {
    console.error('Failed to fetch guild name', err)
    return null
  }
}

export const getGuildInfo = async (
  accessToken: string,
  guildId: string
): Promise<{ guild: DiscordGuild | null }> => {
  const userGuilds = await getUserGuilds(accessToken)

  const guild = userGuilds.find((g) => g.id === guildId) || null

  return { guild }
}
