'use server'

import GuildConfiguration from '@/models/GuildConfiguration'
import { revalidatePath } from 'next/cache'
import User from '@/models/User'
import { connectToDatabase, formatNumberToReadableString } from '@/lib/utils'
import { GuildMemberStatus } from '@/types/types'
import { Session } from 'next-auth'
import { getDiscordGuildMembers } from '../discord/member.action'
import { sendEmbed } from '../discord/utils.action'
import Transaction from '@/models/Transaction'

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

// Only delete from db.
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

    await Transaction.create({
      userId,
      guildId,
      amount: amount,
      type: 'deposit',
      source: 'web',
      handledBy: managerId,
      createdAt: new Date(),
    })

    const guildConfig = await GuildConfiguration.findOne({ guildId })
    const logChannelId = guildConfig?.atmChannelIds.logs
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

    await Transaction.create({
      userId,
      guildId,
      amount: amount,
      type: 'withdraw',
      source: 'web',
      handledBy: managerId,
      createdAt: new Date(),
    })

    const guildConfig = await GuildConfiguration.findOne({ guildId })
    const logChannelId = guildConfig?.atmChannelIds.logs
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

  const userIds = dbUsers.map((u) => u.userId)
  const transactions = await Transaction.find({ userId: { $in: userIds } })

  const netProfitMap = new Map<string, number>()

  for (const tx of transactions) {
    const current = netProfitMap.get(tx.userId) || 0

    if (tx.type === 'bet') {
      netProfitMap.set(tx.userId, current - tx.amount)
    } else if (tx.type === 'win') {
      netProfitMap.set(tx.userId, current + tx.amount)
    }
  }
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
      netProfit: netProfitMap.get(userId) || 0,
    }
  })
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

    await Transaction.deleteMany({
      userId,
      guildId,
    })

    const guildConfig = await GuildConfiguration.findOne({ guildId })
    const logChannelId = guildConfig?.atmChannelIds.logs
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

    revalidatePath('/')
    return { success: true, message: 'User balance reset.' }
  } catch (err) {
    console.error('Error resetting balance:', err)
    return { success: false, message: 'Server error, please try again.' }
  }
}

export async function bonusBalance(
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

    await Transaction.create({
      userId,
      guildId,
      amount: amount,
      type: 'bonus',
      source: 'web',
      handledBy: managerId,
      createdAt: new Date(),
    })

    const guildConfig = await GuildConfiguration.findOne({ guildId })
    const logChannelId = guildConfig?.atmChannelIds.logs
    if (logChannelId) {
      try {
        await sendEmbed(
          logChannelId,
          'ATM - Bonus Given via Web',
          `Manager <@${managerId}> successfully given **$${formatNumberToReadableString(
            amount
          )}** bonus to <@${userId}>.\nTheir new balance is now: **$${formatNumberToReadableString(
            user.balance
          )}**.`,
          0x57f287
        )
      } catch {
        return { success: false, message: 'Failed to send log message' }
      }
    }

    return { success: true, message: `Bonus given $${amount} to user.` }
  } catch (err) {
    console.error('Error giving bonus:', err)
    return { success: false, message: 'Server error, please try again.' }
  }
}
