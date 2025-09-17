'use server'

import { connectToDatabase } from '@/lib/utils'
import VipRoom from '@/models/VipRoom'
import { VipChannels } from '@/types/types'
import { Session } from 'next-auth'
import { getGuildChannels } from '../discord/channel.action'
import { getDiscordGuildMembers } from '../discord/member.action'

export async function getVips(
  guildId: string,
  session: Session
): Promise<VipChannels[]> {
  if (!session || !session.accessToken) return []

  await connectToDatabase()

  const docs = await VipRoom.find({ guildId })
  if (!docs.length) return []

  const discordMembers = await getDiscordGuildMembers(guildId)
  const membersMap = new Map(discordMembers.map((m) => [m.userId, m]))

  const guildChannels = await getGuildChannels(guildId)
  const channelsMap = new Map(guildChannels.map((c) => [c.id, c.name]))

  return docs.map((vip) => {
    const member = membersMap.get(vip.userId)
    const channelName = channelsMap.get(vip.channelId) || 'Unknown'

    return {
      userId: vip.userId,
      guildId: vip.guildId,
      channelId: vip.channelId,
      channelName,
      expiresAt: vip.expiresAt,
      createdAt: vip.createdAt,
      username: member?.username || 'Unknown',
      nickname: member?.nickname || '',
      avatar: member?.avatarUrl || '/default-avatar.png',
    }
  })
}
