'use server'

import { connectToDatabase } from '@/lib/utils'
import Transaction, { TransactionDoc } from '@/models/Transaction'
import { Session } from 'next-auth'
import { getDiscordGuildMembers } from '../discord/member.action'

export interface ITransaction
  extends Pick<
    TransactionDoc,
    | 'id'
    | 'userId'
    | 'type'
    | 'amount'
    | 'source'
    | 'createdAt'
    | 'betId'
    | 'handledBy'
    | 'meta'
  > {
  username: string
  nickname: string | null
  avatar: string
  handledByUsername?: string | null
}

export const getTransactions = async (
  guildId: string,
  session: Session,
  page: number = 1,
  limit: number = 50
): Promise<{ transactions: ITransaction[]; total: number }> => {
  if (!session.accessToken) return { transactions: [], total: 0 }

  await connectToDatabase()

  const total = await Transaction.countDocuments({ guildId })

  const transactions = await Transaction.find({ guildId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)

  if (!transactions.length) return { transactions: [], total }

  // Collect all unique userIds including handledBy
  const userIds = Array.from(
    new Set(
      transactions.flatMap((tx) => [tx.userId, tx.handledBy].filter(Boolean))
    )
  )

  const discordMembers = await getDiscordGuildMembers(guildId)

  // Map userId to Discord member info
  const discordMap = new Map(
    discordMembers
      .filter((m) => userIds.includes(m.userId))
      .map((m) => [
        m.userId,
        {
          username: m.username,
          nickname: m.nickname,
          avatar: m.avatarUrl || '/default-avatar.png',
        },
      ])
  )

  const transactionsWithUser: ITransaction[] = transactions.map((tx) => {
    const user = discordMap.get(tx.userId)
    const handler = tx.handledBy ? discordMap.get(tx.handledBy) : null

    return {
      id: tx._id.toString(),
      userId: tx.userId,
      username: user?.username || 'Unknown',
      nickname: user?.nickname || null,
      avatar: user?.avatar || '/default-avatar.png',
      type: tx.type,
      meta: tx.meta,
      amount: tx.amount,
      source: tx.source,
      createdAt: tx.createdAt.toISOString(),
      betId: tx.betId || null,
      handledBy: tx.handledBy || null,
      handledByUsername: handler?.username || null,
    }
  })

  return { transactions: transactionsWithUser, total }
}

export async function refetchTransactions(
  guildId: string,
  session: Session,
  page = 1,
  limit = 50
) {
  return await getTransactions(guildId, session, page, limit)
}
