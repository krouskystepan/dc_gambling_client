import { getGuildName, isBotInGuild } from '@/actions/discord'
import BotNotInGuild from '@/components/Errors/BotNotInGuild'
import GuildConfigSidebar from '@/components/GuildConfigSidebar'
import { authOptions } from '@/lib/authOptions'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import React from 'react'

interface GuildConfLayoutProps {
  children: React.ReactNode
  params: Promise<{ guildId: string }>
}

const GuildConfLayout = async ({ children, params }: GuildConfLayoutProps) => {
  const { guildId } = await params

  const session = await getServerSession(authOptions)
  if (!session?.accessToken) redirect('/')

  const isInGuild = await isBotInGuild(guildId)
  const guildName = await getGuildName(session.accessToken, guildId)
  if (!isInGuild || !guildName) return <BotNotInGuild />

  return (
    <div className="flex h-full">
      <GuildConfigSidebar guildId={guildId} guildName={guildName} />

      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  )
}

export default GuildConfLayout
