import { getTransactions } from '@/actions/database/transaction.action'
import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import TransactionTable from '../tables/TransactionTable'

interface TransactionListProps {
  guildId: string
  page?: number
  limit?: number
}

const TransactionList = async ({
  guildId,
  page = 1,
  limit = 50,
}: TransactionListProps) => {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const { transactions, total } = await getTransactions(
    guildId,
    session,
    page,
    limit
  )

  return (
    <div>
      <h4 className="text-3xl font-semibold text-yellow-400 mb-4">
        Transactions
      </h4>

      <TransactionTable
        transactions={transactions}
        guildId={guildId}
        managerId={session.userId!}
        page={page}
        limit={limit}
        total={total}
      />
    </div>
  )
}

export default TransactionList
