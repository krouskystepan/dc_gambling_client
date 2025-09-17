'use server'

import { connectToDatabase } from '@/lib/utils'
import GuildConfiguration from '@/models/GuildConfiguration'

export const getAllGuildConfigsWithManagers = async () => {
  await connectToDatabase()

  return await GuildConfiguration.find({
    managerRoleId: { $exists: true, $ne: '' },
  })
}
