'use server'

import { connectToDatabase } from '@/lib/utils'
import Transaction, { TransactionDoc } from '@/models/Transaction'
import { Session } from 'next-auth'
import { getDiscordGuildMembers } from '../discord/member.action'
import { FilterQuery } from 'mongoose'
import { ITransaction, ITransactionCounts } from '@/types/types'

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const getTransactions = async (
  guildId: string,
  session: Session,
  page: number = 1,
  limit: number = 50,
  search?: string,
  adminSearch?: string,
  filterType?: string[],
  filterSource?: string[],
  dateFrom?: string,
  dateTo?: string,
  sort?: string
): Promise<{
  transactions: ITransaction[]
  total: number
  gamePnL: number
  cashFlow: number
}> => {
  if (!session.accessToken)
    return { transactions: [], total: 0, gamePnL: 0, cashFlow: 0 }

  await connectToDatabase()

  const query: FilterQuery<TransactionDoc> = { guildId }
  const andFilters: FilterQuery<TransactionDoc>[] = []

  if (search) {
    const regex = new RegExp(escapeRegExp(search), 'i')
    andFilters.push({ userId: regex })
  }

  if (adminSearch) {
    const regex = new RegExp(escapeRegExp(adminSearch), 'i')
    andFilters.push({ $or: [{ handledBy: regex }, { betId: regex }] })
  }

  if (filterType && filterType.length)
    andFilters.push({ type: { $in: filterType } })
  if (filterSource && filterSource.length)
    andFilters.push({ source: { $in: filterSource } })

  if (dateFrom && dateTo) {
    const from = new Date(dateFrom)
    from.setHours(0, 0, 0, 0)
    const to = new Date(dateTo)
    to.setHours(23, 59, 59, 999)
    query.createdAt = { $gte: from, $lte: to }
  }

  if (andFilters.length > 0) query.$and = andFilters

  const total = await Transaction.countDocuments(query)

  const totalsAgg = await Transaction.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        gamePnL: {
          $sum: {
            $switch: {
              branches: [
                {
                  case: { $in: ['$type', ['bet', 'vip']] },
                  then: '$amount',
                },
                {
                  case: { $in: ['$type', ['win', 'bonus', 'refund']] },
                  then: { $multiply: ['$amount', -1] },
                },
              ],
              default: 0,
            },
          },
        },
        cashFlow: {
          $sum: {
            $switch: {
              branches: [
                { case: { $eq: ['$type', 'deposit'] }, then: '$amount' },
                {
                  case: { $eq: ['$type', 'withdraw'] },
                  then: { $multiply: ['$amount', -1] },
                },
              ],
              default: 0,
            },
          },
        },
      },
    },
  ])

  const gamePnL = totalsAgg.length ? totalsAgg[0].gamePnL : 0
  const cashFlow = totalsAgg.length ? totalsAgg[0].cashFlow : 0

  let sortObj: Record<string, 1 | -1> = { createdAt: -1 }
  if (sort) {
    sortObj = {}
    sort.split(',').forEach((pair) => {
      const [field, dir] = pair.split(':')
      if (field) sortObj[field] = dir === 'asc' ? 1 : -1
    })
  }

  const transactions = await Transaction.find(query)
    .sort(sortObj)
    .skip((page - 1) * limit)
    .limit(limit)

  if (!transactions.length)
    return { transactions: [], total, gamePnL, cashFlow }

  const userIds = Array.from(
    new Set(
      transactions.flatMap((tx) => [tx.userId, tx.handledBy].filter(Boolean))
    )
  )

  const discordMembers = await getDiscordGuildMembers(guildId)
  if (!discordMembers) return { transactions: [], total: 0, gamePnL, cashFlow }

  const discordMap = new Map(
    discordMembers
      .filter((m) => userIds.includes(m.userId))
      .map((m) => [
        m.userId,
        {
          username: m.username,
          nickname: m.nickname,
          avatar: m.avatarUrl || '/default-avatar.jpg',
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
      avatar: user?.avatar || '/default-avatar.jpg',
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

  return { transactions: transactionsWithUser, total, gamePnL, cashFlow }
}

const typeBadgeMap: Record<TransactionDoc['type'], string> = {
  deposit: '',
  withdraw: '',
  bet: '',
  win: '',
  refund: '',
  bonus: '',
  vip: '',
}

const sourceBadgeMap: Record<TransactionDoc['source'], string> = {
  casino: '',
  command: '',
  manual: '',
  system: '',
  web: '',
}

export const getTransactionCounts = async (
  guildId: string,
  session: Session,
  filterType?: string[],
  filterSource?: string[],
  search?: string,
  adminSearch?: string,
  dateFrom?: string,
  dateTo?: string
): Promise<ITransactionCounts> => {
  if (!session.accessToken) {
    return {
      type: Object.fromEntries(
        Object.keys(typeBadgeMap).map((t) => [t, 0])
      ) as Record<TransactionDoc['type'], number>,
      source: Object.fromEntries(
        Object.keys(sourceBadgeMap).map((s) => [s, 0])
      ) as Record<TransactionDoc['source'], number>,
    }
  }

  await connectToDatabase()

  const query: FilterQuery<TransactionDoc> = { guildId }
  const andFilters: FilterQuery<TransactionDoc>[] = []

  if (search) {
    const regex = new RegExp(escapeRegExp(search), 'i')
    andFilters.push({ userId: regex })
  }

  if (adminSearch) {
    const regex = new RegExp(escapeRegExp(adminSearch), 'i')
    andFilters.push({ $or: [{ handledBy: regex }, { betId: regex }] })
  }

  if (filterType && filterType.length) {
    andFilters.push({ type: { $in: filterType } })
  }

  if (filterSource && filterSource.length) {
    andFilters.push({ source: { $in: filterSource } })
  }

  if (dateFrom && dateTo) {
    const from = new Date(dateFrom)
    from.setHours(0, 0, 0, 0)
    const to = new Date(dateTo)
    to.setHours(23, 59, 59, 999)
    andFilters.push({ createdAt: { $gte: from, $lte: to } })
  }

  if (andFilters.length > 0) query.$and = andFilters

  const typeAgg = await Transaction.aggregate([
    { $match: query },
    { $group: { _id: '$type', count: { $sum: 1 } } },
  ])

  const sourceAgg = await Transaction.aggregate([
    { $match: query },
    { $group: { _id: '$source', count: { $sum: 1 } } },
  ])

  const typeCounts = Object.fromEntries(
    Object.keys(typeBadgeMap).map((t) => [t, 0])
  ) as Record<TransactionDoc['type'], number>
  typeAgg.forEach((t) => {
    typeCounts[t._id as TransactionDoc['type']] = t.count
  })

  const sourceCounts = Object.fromEntries(
    Object.keys(sourceBadgeMap).map((s) => [s, 0])
  ) as Record<TransactionDoc['source'], number>
  sourceAgg.forEach((s) => {
    sourceCounts[s._id as TransactionDoc['source']] = s.count
  })

  return { type: typeCounts, source: sourceCounts }
}
