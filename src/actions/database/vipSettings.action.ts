'use server'

import { authOptions } from '@/lib/authOptions'
import { connectToDatabase } from '@/lib/utils'
import GuildConfiguration from '@/models/GuildConfiguration'
import { VipSettingsValues } from '@/types/types'
import { getServerSession } from 'next-auth'
import { getUserPermissions } from '../perms'

export async function getVipSettings(
  guildId: string
): Promise<VipSettingsValues | null> {
  await connectToDatabase()

  const doc = await GuildConfiguration.findOne({ guildId })
  if (!doc) return null

  return {
    roleId: doc.vipSettings?.roleId ?? '',
    categoryId: doc.vipSettings?.categoryId ?? '',
    pricePerDay: doc.vipSettings?.pricePerDay ?? 0,
    pricePerCreate: doc.vipSettings?.pricePerCreate ?? 0,
  }
}

export async function saveVipSettings(
  guildId: string,
  values: VipSettingsValues
) {
  const session = await getServerSession(authOptions)
  const { isAdmin } = await getUserPermissions(guildId, session)
  if (!isAdmin) throw new Error('Insufficient permissions: Admin only')

  await connectToDatabase()

  const updatedDoc = await GuildConfiguration.findOneAndUpdate(
    { guildId },
    { $set: { vipSettings: values } },
    { new: true, upsert: true }
  )

  if (!updatedDoc) return null

  return {
    roleId: updatedDoc.vipSettings?.roleId ?? '',
    categoryId: updatedDoc.vipSettings?.categoryId ?? '',
    pricePerDay: updatedDoc.vipSettings?.pricePerDay ?? 0,
    pricePerCreate: updatedDoc.vipSettings?.pricePerCreate ?? 0,
  }
}
