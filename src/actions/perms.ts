'use server'

import axios from 'axios'
import { Session } from 'next-auth'
import { connectToDatabase } from '@/lib/utils'
import GuildConfiguration from '@/models/GuildConfiguration'
import { DiscordGuild } from '@/types/types'

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
    const { data: userGuilds } = await axios.get<DiscordGuild[]>(
      'https://discord.com/api/users/@me/guilds',
      { headers: { Authorization: `Bearer ${session.accessToken}` } }
    )

    const guild = userGuilds.find((g) => g.id === guildId)
    if (guild) {
      isAdmin = (Number(guild.permissions) & 0x8) === 0x8
    }

    if (!isAdmin) {
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
          if (member.roles.includes(config.managerRoleId)) {
            isManager = true
          }
        } catch (err) {
          console.error(
            `Failed to fetch member roles for guild ${guildId}`,
            err
          )
        }
      }
    }
  } catch (err) {
    console.error('Failed to fetch guild permissions', err)
  }

  return { isAdmin, isManager }
}
