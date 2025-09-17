'use server'

import { BonusFormValues } from '@/components/forms/BonusesForm'
import { authOptions } from '@/lib/authOptions'
import { connectToDatabase } from '@/lib/utils'
import GuildConfiguration from '@/models/GuildConfiguration'
import { getServerSession } from 'next-auth'
import { getUserPermissions } from '../perms'

export async function getBonusSettings(
  guildId: string
): Promise<BonusFormValues | null> {
  await connectToDatabase()

  const doc = await GuildConfiguration.findOne({ guildId })
  if (!doc) return null

  return {
    baseReward: doc.bonusSettings?.baseReward ?? 0,
    streakMultiplier: doc.bonusSettings?.streakMultiplier ?? 1,
    maxReward: doc.bonusSettings?.maxReward ?? 0,
    resetOnMax: doc.bonusSettings?.resetOnMax ?? false,
  }
}

export async function saveBonusSettings(
  guildId: string,
  values: BonusFormValues
) {
  const session = await getServerSession(authOptions)
  const { isAdmin } = await getUserPermissions(guildId, session)
  if (!isAdmin) throw new Error('Insufficient permissions: Admin only')

  await connectToDatabase()

  const updatedDoc = await GuildConfiguration.findOneAndUpdate(
    { guildId },
    { $set: { bonusSettings: values } },
    { new: true, upsert: true }
  )

  if (!updatedDoc) return null

  return {
    baseReward: updatedDoc.bonusSettings?.baseReward ?? 0,
    streakMultiplier: updatedDoc.bonusSettings?.streakMultiplier ?? 1,
    maxReward: updatedDoc.bonusSettings?.maxReward ?? 0,
    resetOnMax: updatedDoc.bonusSettings?.resetOnMax ?? false,
  }
}
