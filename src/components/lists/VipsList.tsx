import { getVips } from '@/actions/database'
import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import VipTable from '../VipTable'

const VipsList = async ({ guildId }: { guildId: string }) => {
  const session = await getServerSession(authOptions)
  const vips = await getVips(guildId, session!)

  return (
    <div>
      <h4 className="text-3xl font-semibold text-yellow-400 mb-4">
        VIPs Channels
      </h4>

      <VipTable vips={vips} guildId={guildId} managerId={session!.userId!} />
    </div>
  )
}

export default VipsList
