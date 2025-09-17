import { getGuildName } from '@/actions/discord/guilds.action'
import { isBotInGuild } from '@/actions/discord/utils.action'
import { getUserPermissions } from '@/actions/perms'
import GuildConfigSidebar from '@/components/GuildConfigSidebar'
import BotNotInGuild from '@/components/states/BotNotInGuild'
import NoPerms from '@/components/states/NoPerms'
import RateLimited from '@/components/states/RateLimmited'
import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

interface GuildConfLayoutProps {
  children: React.ReactNode
  params: Promise<{ guildId: string }>
}

const GuildConfLayout = async ({ children, params }: GuildConfLayoutProps) => {
  const { guildId } = await params

  const session = await getServerSession(authOptions)
  if (!session?.accessToken) redirect('/')

  const isInGuild = await isBotInGuild(guildId)
  if (!isInGuild) return <BotNotInGuild />

  const guildName = await getGuildName(guildId)
  if (!guildName) return <BotNotInGuild />

  const { isAdmin, isManager, rateLimited } = await getUserPermissions(
    guildId,
    session
  )

  if (rateLimited) return <RateLimited />

  if (!isAdmin && !isManager) return <NoPerms />

  return (
    <div className="flex h-full">
      <GuildConfigSidebar
        guildId={guildId}
        guildName={guildName}
        isAdmin={isAdmin}
      />

      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  )
}

export default GuildConfLayout
