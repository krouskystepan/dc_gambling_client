import Link from 'next/link'
import {
  Crown,
  LucideIcon,
  MessagesSquare,
  ShieldCheck,
  Dices,
  User,
  Home,
  ChartBar,
  Medal,
} from 'lucide-react'

const LINKS = [
  {
    title: 'General',
    links: [{ id: 'home', label: 'Home', icon: Home }],
  },
  {
    title: 'Manage',
    links: [
      { id: 'users', label: 'Users', icon: User },
      { id: 'vips', label: 'VIPs', icon: Crown },
      { id: 'predictions', label: 'Predictions', icon: ChartBar },
    ],
  },
  {
    title: 'Setup',
    links: [
      { id: 'channels', label: 'Channels', icon: MessagesSquare },
      { id: 'managerRoleId', label: 'Manager Role', icon: ShieldCheck },
      { id: 'vipSettings', label: 'VIP', icon: Crown },
      { id: 'milestones', label: 'Milestones', icon: Medal },
      { id: 'casinoSettings', label: 'Casino', icon: Dices },
    ],
  },
]

interface GuildConfigSidebarProps {
  guildId: string
  guildName: string
  isAdmin: boolean
}

const GuildConfigSidebar = ({
  guildId,
  guildName,
  isAdmin,
}: GuildConfigSidebarProps) => {
  return (
    <section className="w-60 bg-black/40 border-r border-yellow-500/10 flex flex-col">
      <div className="p-3 text-center text-lg font-bold text-yellow-400">
        {guildName}
      </div>

      <aside className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {LINKS.map((group) => {
          if (group.title === 'Setup' && !isAdmin) return null

          return (
            <div key={group.title} className="flex flex-col gap-1">
              <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {group.title}
              </div>

              {group.links.map((link) => {
                const Icon = link.icon as LucideIcon
                return (
                  <Link
                    key={link.id}
                    href={
                      link.id === 'home'
                        ? { pathname: `/dashboard/g/${guildId}` }
                        : {
                            pathname: `/dashboard/g/${guildId}`,
                            query: { s: link.id },
                          }
                    }
                    className="flex items-center gap-2 px-5 py-2 text-gray-200 rounded hover:bg-yellow-500/10 hover:text-yellow-400 transition text-sm"
                  >
                    {Icon && <Icon size={16} />}
                    {link.label}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </aside>
    </section>
  )
}

export default GuildConfigSidebar
