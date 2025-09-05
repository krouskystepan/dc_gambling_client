'use server'

import axios from 'axios'
import { DiscordGuild, GuildChannel, GuildRole } from '@/types/types'
import { cache } from 'react'
import { Session } from 'next-auth'
import { connectToDatabase } from '@/lib/utils'
import GuildConfiguration from '@/models/GuildConfiguration'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v10'

export const getUserGuilds = cache(
  async (session: Session): Promise<DiscordGuild[]> => {
    if (!session.userId) return []

    if (!process.env.DISCORD_BOT_TOKEN) throw new Error('Bot token missing')

    await connectToDatabase()

    const allGuildConfigs = await GuildConfiguration.find({
      managerRoleId: { $exists: true, $ne: '' },
    })

    const accessibleGuilds: DiscordGuild[] = []

    for (const config of allGuildConfigs) {
      try {
        const { data: member } = await axios.get<{ roles: string[] }>(
          `https://discord.com/api/v10/guilds/${config.guildId}/members/${session.userId}`,
          { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
        )

        if (member.roles.includes(config.managerRoleId)) {
          const { data: guild } = await axios.get<DiscordGuild>(
            `https://discord.com/api/v10/guilds/${config.guildId}`,
            {
              headers: {
                Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
              },
            }
          )
          accessibleGuilds.push(guild)
        }
      } catch (err) {
        if (
          axios.isAxiosError(err) &&
          (err.response?.status === 403 || err.response?.status === 404)
        ) {
          continue
        }
        console.error(
          `Failed to fetch member roles for guild ${config.guildId}`,
          err
        )
      }
    }

    return accessibleGuilds
  }
)

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

export const getGuildChannels = async (
  guildId: string
): Promise<GuildChannel[]> => {
  if (!process.env.DISCORD_BOT_TOKEN) throw new Error('Bot token missing')
  try {
    const { data } = await axios.get<GuildChannel[]>(
      `https://discord.com/api/v10/guilds/${guildId}/channels`,
      { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
    )
    return data.filter((c) => c.type === 0)
  } catch (err) {
    console.error('Discord API error fetching channels', err)
    return []
  }
}

export const getGuildRoles = async (guildId: string): Promise<GuildRole[]> => {
  if (!process.env.DISCORD_BOT_TOKEN) throw new Error('Bot token missing')
  try {
    const { data } = await axios.get<GuildRole[]>(
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

export const getGuildCategories = async (
  guildId: string
): Promise<GuildChannel[]> => {
  if (!process.env.DISCORD_BOT_TOKEN) throw new Error('Bot token missing')
  try {
    const { data } = await axios.get<GuildChannel[]>(
      `https://discord.com/api/v10/guilds/${guildId}/channels`,
      { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
    )
    return data.filter((c) => c.type === 4)
  } catch (err) {
    console.error('Discord API error fetching categories', err)
    return []
  }
}

export const getDiscordGuildMembers = async (guildId: string) => {
  try {
    const { data: members } = await axios.get<
      {
        user: {
          id: string
          username: string
          avatar: string | null
          bot?: boolean
        }
        nick?: string | null
      }[]
    >(`https://discord.com/api/v10/guilds/${guildId}/members?limit=1000`, {
      headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
    })

    return members
      .filter((m) => !m.user.bot)
      .map((m) => ({
        userId: m.user.id,
        username: m.user.username,
        nickname: m.nick || null,
        avatarUrl: m.user.avatar
          ? `https://cdn.discordapp.com/avatars/${m.user.id}/${m.user.avatar}.png?size=128`
          : '/default-avatar.png',
      }))
  } catch (err) {
    console.error(`Failed to fetch Discord members for guild ${guildId}`, err)
    return []
  }
}

// Utils
const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN!

export async function sendEmbed(
  channelId: string,
  title: string,
  description: string,
  color: number
) {
  if (!channelId) throw new Error('No channel ID provided')
  if (!DISCORD_TOKEN) throw new Error('Discord token not set')

  try {
    const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN)

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
