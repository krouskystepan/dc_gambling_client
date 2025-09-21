import {
  getTransactionCounts,
  getTransactions,
} from '@/actions/database/transaction.action'
import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import TransactionTable from '../tables/TransactionTable'

const TransactionList = async ({
  guildId,
  searchParams,
}: {
  guildId: string
  searchParams?: {
    page?: string
    limit?: string
    search?: string
    searchAdmin?: string
    filterType?: string
    filterSource?: string
    sort?: string
  }
}) => {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const page = Number(searchParams?.page ?? 1)
  const limit = Number(searchParams?.limit ?? 10)

  const filterType = searchParams?.filterType?.split(',').filter(Boolean)
  const filterSource = searchParams?.filterSource?.split(',').filter(Boolean)

  const { transactions, total } = await getTransactions(
    guildId,
    session,
    page,
    limit,
    searchParams?.search || undefined,
    searchParams?.searchAdmin || undefined,
    filterType?.length ? filterType : undefined,
    filterSource?.length ? filterSource : undefined,
    searchParams?.sort || undefined
  )

  const transactionCounts = await getTransactionCounts(
    guildId,
    session,
    filterType?.length ? filterType : undefined,
    filterSource?.length ? filterSource : undefined
  )

  return (
    <TransactionTable
      transactions={transactions}
      transactionCounts={transactionCounts}
      guildId={guildId}
      managerId={session.userId!}
      page={page}
      limit={limit}
      total={total}
    />
  )
}

export default TransactionList
