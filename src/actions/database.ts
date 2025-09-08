'use server'

import { connectToDatabase, formatNumberToReadableString } from '@/lib/utils'
import GuildConfiguration from '@/models/GuildConfiguration'
import { casinoSettingsSchema } from '@/types/schemas'
import {
  ChannelsFormValues,
  CasinoSettingsValues,
  VipSettingsValues,
  GuildMemberStatus,
  VipChannels,
} from '@/types/types'
import { getServerSession, Session } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { getUserPermissions } from './perms'
import { getDiscordGuildMembers, getGuildChannels, sendEmbed } from './discord'
import User from '@/models/User'
import { revalidatePath } from 'next/cache'
import VipRoom from '@/models/VipRoom'

// Admin Only
export async function getChannels(
  guildId: string
): Promise<ChannelsFormValues | null> {
  await connectToDatabase()

  const doc = await GuildConfiguration.findOne({ guildId })
  if (!doc) return null

  return {
    atm: {
      actions: doc.atmChannelIds?.actions ?? '',
      logs: doc.atmChannelIds?.logs ?? '',
    },
    casino: {
      casinoChannelIds: doc.casinoChannelIds ?? [],
    },
    transactions: {
      transacitonsChannelIds: doc.transacitonsChannelIds ?? '',
    },
    prediction: {
      actions: doc.predictionChannelIds?.actions ?? '',
      logs: doc.predictionChannelIds?.logs ?? '',
    },
  }
}

export async function saveChannels(
  guildId: string,
  values: ChannelsFormValues
) {
  const session = await getServerSession(authOptions)
  const { isAdmin } = await getUserPermissions(guildId, session)
  if (!isAdmin) throw new Error('Insufficient permissions: Admin only')

  await connectToDatabase()
  const updated = await GuildConfiguration.findOneAndUpdate(
    { guildId },
    {
      guildId,
      $set: {
        'atmChannelIds.actions': values.atm.actions,
        'atmChannelIds.logs': values.atm.logs,
        transacitonsChannelIds: values.transactions.transacitonsChannelIds,
        casinoChannelIds: values.casino.casinoChannelIds,
        'predictionChannelIds.actions': values.prediction.actions,
        'predictionChannelIds.logs': values.prediction.logs,
      },
    },
    { new: true, upsert: true }
  )

  return {
    atm: {
      actions: updated.atmChannelIds.actions,
      logs: updated.atmChannelIds.logs,
    },
    casino: {
      casinoChannelIds: updated.casinoChannelIds,
    },
    transactions: {
      transacitonsChannelIds: updated.transacitonsChannelIds,
    },
    prediction: {
      actions: updated.predictionChannelIds.actions,
      logs: updated.predictionChannelIds.logs,
    },
  }
}

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

export async function getManagerRole(
  guildId: string
): Promise<{ managerRoleId: string } | null> {
  await connectToDatabase()
  const doc = await GuildConfiguration.findOne({ guildId })
  if (!doc) return null
  return { managerRoleId: doc.managerRoleId ?? '' }
}

export async function saveManagerRole(guildId: string, managerRoleId: string) {
  const session = await getServerSession(authOptions)
  const { isAdmin } = await getUserPermissions(guildId, session)
  if (!isAdmin) throw new Error('Insufficient permissions: Admin only')

  await connectToDatabase()
  const updated = await GuildConfiguration.findOneAndUpdate(
    { guildId },
    { $set: { managerRoleId } },
    { new: true, upsert: true }
  )
  return updated?.managerRoleId ?? ''
}

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

// Manager and Admin
export async function getUserWithRegistrationStatus(
  guildId: string,
  session: Session | null
): Promise<GuildMemberStatus[]> {
  if (!session || !session.accessToken) return []

  await connectToDatabase()

  const dbUsers = await User.find({ guildId })
  const dbUsersMap = new Map(dbUsers.map((u) => [u.userId, u]))

  const discordMembers = await getDiscordGuildMembers(guildId)
  const discordMembersMap = new Map(discordMembers.map((m) => [m.userId, m]))

  const allUserIds = new Set<string>([
    ...dbUsers.map((u) => u.userId),
    ...discordMembers.map((m) => m.userId),
  ])

  return Array.from(allUserIds).map((userId) => {
    const dbUser = dbUsersMap.get(userId)
    const discordMember = discordMembersMap.get(userId)

    return {
      userId,
      username: discordMember?.username || 'Unknown',
      nickname: discordMember?.nickname || null,
      avatar: discordMember?.avatarUrl || '/default-avatar.png',
      registered: !!dbUser,
      registeredAt: dbUser?.createdAt || null,
      balance: dbUser?.balance || 0,
    }
  })
}

export async function registerUser(
  userId: string,
  guildId: string,
  managerId: string
) {
  try {
    const existingUser = await User.findOne({ userId, guildId })
    if (existingUser)
      return { success: false, message: 'User already registered.' }

    const newUser = new User({ userId, guildId })
    await newUser.save()

    const guildConfig = await GuildConfiguration.findOne({ guildId })
    const logChannelId = guildConfig?.atmChannelIds.logs

    if (!logChannelId) return { success: false, message: 'ATM Logs not set.' }

    try {
      await sendEmbed(
        logChannelId,
        'ATM - User Registered via Web',
        `Manager <@${managerId}> has successfully registered <@${userId}>.`,
        0x95a5a6
      )
    } catch (logErr) {
      console.error('Failed to send log message:', logErr)
    }

    revalidatePath(`/dashboard/g/${guildId}`)

    return { success: true, message: 'User successfully registered.' }
  } catch (err) {
    console.error('Error registering user:', err)
    return { success: false, message: 'Server error, please try again.' }
  }
}

export async function unregisterUser(
  userId: string,
  guildId: string,
  managerId: string
) {
  try {
    const existingUser = await User.findOne({ userId, guildId })
    if (!existingUser)
      return { success: false, message: 'User is not registered.' }

    await User.deleteOne({ userId, guildId })

    const guildConfig = await GuildConfiguration.findOne({ guildId })
    const logChannelId = guildConfig?.atmChannelIds.logs

    if (!logChannelId) return { success: false, message: 'ATM Logs not set.' }

    try {
      await sendEmbed(
        logChannelId,
        'ATM - User Unregistered via Web',
        `Manager <@${managerId}> has successfully unregistered <@${userId}>.`,
        0x23272a
      )
    } catch (logErr) {
      console.error('Failed to send log message:', logErr)
    }

    revalidatePath(`/dashboard/g/${guildId}`)

    return { success: true, message: 'User successfully unregistered.' }
  } catch (err) {
    console.error('Error unregistering user:', err)
    return { success: false, message: 'Server error, please try again.' }
  }
}

export async function depositBalance(
  userId: string,
  guildId: string,
  managerId: string,
  amount: number
) {
  try {
    const user = await User.findOne({ userId, guildId })
    if (!user) return { success: false, message: 'User not registered.' }

    user.balance += amount
    await user.save()

    const guildConfig = await GuildConfiguration.findOne({ guildId })
    const logChannelId = guildConfig?.transacitonsChannelIds
    if (logChannelId) {
      try {
        await sendEmbed(
          logChannelId,
          'ATM - Deposit via Web',
          `Manager <@${managerId}> successfully added **$${formatNumberToReadableString(
            amount
          )}** to <@${userId}>.\nTheir new balance is now: **$${formatNumberToReadableString(
            user.balance
          )}**.`,
          0x57f287
        )
      } catch {
        return { success: false, message: 'Failed to send log message' }
      }
    }

    return { success: true, message: `Deposited $${amount} to user.` }
  } catch (err) {
    console.error('Error depositing balance:', err)
    return { success: false, message: 'Server error, please try again.' }
  }
}

export async function withdrawBalance(
  userId: string,
  guildId: string,
  managerId: string,
  amount: number
) {
  try {
    const user = await User.findOne({ userId, guildId })
    if (!user) return { success: false, message: 'User not registered.' }

    if (user.balance < amount) {
      return { success: false, message: 'User has insufficient balance.' }
    }

    user.balance -= amount
    await user.save()

    const guildConfig = await GuildConfiguration.findOne({ guildId })
    const logChannelId = guildConfig?.transacitonsChannelIds
    if (logChannelId) {
      try {
        await sendEmbed(
          logChannelId,
          'ATM - Withdraw via Web',
          `Manager <@${managerId}> successfully removed **$${formatNumberToReadableString(
            amount
          )}** from <@${userId}>.\nTheir new balance is now: **$${formatNumberToReadableString(
            user.balance
          )}**.`,
          0x57f287
        )
      } catch {
        return { success: false, message: 'Failed to send log message' }
      }
    }

    return { success: true, message: `Withdrew $${amount} from user.` }
  } catch (err) {
    console.error('Error withdrawing balance:', err)
    return { success: false, message: 'Server error, please try again.' }
  }
}

export async function resetBalance(
  userId: string,
  guildId: string,
  managerId: string
) {
  try {
    const user = await User.findOne({ userId, guildId })
    if (!user) return { success: false, message: 'User not registered.' }

    user.balance = 0
    await user.save()

    const guildConfig = await GuildConfiguration.findOne({ guildId })
    const logChannelId = guildConfig?.transacitonsChannelIds
    if (logChannelId) {
      try {
        await sendEmbed(
          logChannelId,
          'ATM - Reset Balance via Web',
          `Manager <@${managerId}> reset the balance of <@${userId}>.`,
          0x1abc9c
        )
      } catch {
        return { success: false, message: 'Failed to send log message' }
      }
    }

    return { success: true, message: 'User balance reset.' }
  } catch (err) {
    console.error('Error resetting balance:', err)
    return { success: false, message: 'Server error, please try again.' }
  }
}

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
