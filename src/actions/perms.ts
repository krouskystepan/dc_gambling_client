'use server'

import axios from 'axios'
import { Session } from 'next-auth'
import { connectToDatabase } from '@/lib/utils'
import GuildConfiguration from '@/models/GuildConfiguration'
import { fetchUserGuilds } from './discord'

export const getUserPermissions = async (
  guildId: string,
  session: Session | null
): Promise<{ isAdmin: boolean; isManager: boolean }> => {
  if (!session || !session.accessToken || !session.userId) {
    return { isAdmin: false, isManager: false }
  }

  let isAdmin = false
  let isManager = false

  try {
    const userGuilds = await fetchUserGuilds(
      session.accessToken,
      session.userId
    )

    const guild = userGuilds.find((g) => g.id === guildId)
    if (guild) {
      const perm = Number(guild.permissions) || 0
      isAdmin = (perm & 0x8) === 0x8
    }

    await connectToDatabase()
    const config = await GuildConfiguration.findOne({ guildId })
    if (config?.managerRoleId) {
      try {
        const { data: member } = await axios.get<{ roles: string[] }>(
          `https://discord.com/api/v10/guilds/${guildId}/members/${session.userId}`,
          {
            headers: {
              Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
            },
          }
        )

        if (member.roles.includes(config.managerRoleId.toString())) {
          isManager = true
        }
      } catch (err) {
        console.error(`Failed to fetch member roles for guild ${guildId}`, err)
      }
    }
  } catch (err) {
    console.error('Failed to fetch guild permissions', err)
  }

  return { isAdmin, isManager }
}
