'use server'

import { connectToDatabase } from '@/lib/utils'
import GuildConfiguration, {
  GuildConfiguration as GuildConfigType,
} from '@/models/GuildConfiguration'
import { getGuildChannels, getGuildRoles } from './discord'

export const getGuildConfigWithDiscordData = async (
  guildId: string,
  accessToken: string
) => {
  await connectToDatabase()

  const config = await GuildConfiguration.findOne({ guildId })
  const channels = await getGuildChannels(accessToken, guildId)
  const roles = await getGuildRoles(accessToken, guildId)

  return { config, channels, roles }
}

export const updateGuildConfig = async (
  guildId: string,
  data: Partial<GuildConfigType>
): Promise<GuildConfigType> => {
  await connectToDatabase()

  const updated = await GuildConfiguration.findOneAndUpdate(
    { guildId },
    { $set: data },
    { new: true, upsert: true } // create if doesn't exist
  )

  if (!updated) throw new Error('Failed to update guild configuration')
  return updated
}
