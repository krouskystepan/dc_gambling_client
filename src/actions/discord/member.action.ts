'use server'

import axios from 'axios'

const guildMembersCache = new Map<
  string,
  {
    data: {
      userId: string
      username: string
      nickname: string | null
      avatarUrl: string
    }[]
    expiresAt: number
  }
>()

export const getDiscordGuildMembers = async (guildId: string) => {
  const now = Date.now()
  const cached = guildMembersCache.get(guildId)

  if (cached && cached.expiresAt > now) {
    return cached.data
  }

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

    const mappedMembers = members
      .filter((m) => !m.user.bot)
      .map((m) => ({
        userId: m.user.id,
        username: m.user.username,
        nickname: m.nick || null,
        avatarUrl: m.user.avatar
          ? `https://cdn.discordapp.com/avatars/${m.user.id}/${m.user.avatar}.png?size=128`
          : '/default-avatar.jpg',
      }))

    guildMembersCache.set(guildId, {
      data: mappedMembers,
      expiresAt: now + 60_000,
    })

    return mappedMembers
  } catch (err) {
    console.error(`Failed to fetch Discord members for guild ${guildId}`, err)
    return []
  }
}
