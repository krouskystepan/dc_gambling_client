import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import UserTable from '../tables/UserTable'
import { getUserWithRegistrationStatus } from '@/actions/database/user.action'

const UsersList = async ({ guildId }: { guildId: string }) => {
  const session = await getServerSession(authOptions)
  const users = await getUserWithRegistrationStatus(guildId, session)

  return (
    <div>
      <h4 className="text-3xl font-semibold text-yellow-400 mb-4">Users</h4>

      <UserTable users={users} guildId={guildId} managerId={session!.userId!} />
    </div>
  )
}

export default UsersList
