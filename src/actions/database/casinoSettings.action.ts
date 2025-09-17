'use server'

import { authOptions } from '@/lib/authOptions'
import { connectToDatabase } from '@/lib/utils'
import GuildConfiguration from '@/models/GuildConfiguration'
import { casinoSettingsSchema } from '@/types/schemas'
import { CasinoSettingsValues } from '@/types/types'
import { getServerSession } from 'next-auth'
import { getUserPermissions } from '../perms'

export async function getCasinoSettings(
  guildId: string
): Promise<CasinoSettingsValues | null> {
  await connectToDatabase()

  const doc = await GuildConfiguration.findOne({ guildId })
  if (!doc) return null

  return doc.casinoSettings ?? null
}

export async function saveCasinoSettings(
  guildId: string,
  values: CasinoSettingsValues
) {
  const session = await getServerSession(authOptions)
  const { isAdmin } = await getUserPermissions(guildId, session)
  if (!isAdmin) throw new Error('Insufficient permissions: Admin only')

  const parsed = casinoSettingsSchema.parse(values)

  console.log(parsed)

  await connectToDatabase()

  const updated = await GuildConfiguration.findOneAndUpdate(
    { guildId },
    {
      guildId,
      $set: {
        casinoSettings: parsed,
      },
    },
    { new: true, upsert: true }
  )

  return updated.casinoSettings
}
