import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { Dice5 } from 'lucide-react'
import { DiscordGuild } from '@/types/discord'
import Image from 'next/image'
import { getUserGuilds } from '@/actions/discord'
import { Separator } from './ui/separator'
import Link from 'next/link'

const DashboardSidebar = async () => {
  const session = await getServerSession(authOptions)

  let guilds: DiscordGuild[] = []
  if (session?.accessToken) {
    guilds = await getUserGuilds(session.accessToken)
  }

  return (
    <aside className="flex flex-col w-20 h-screen bg-black/70 backdrop-blur-md border-r border-yellow-500/10 shadow-lg p-4 gap-4 overflow-y-auto items-center">
      <Link
        href={'/'}
        className="text-xl font-extrabold text-yellow-400 mb-1 flex items-center justify-center hover:scale-110 transition duration-300"
      >
        <Dice5 className="w-8 h-8 text-yellow-400" />
      </Link>

      <div className="flex flex-col gap-3">
        <Link
          href={'/dashboard/demo'}
          className={`cursor-pointer flex items-center justify-center p-2 rounded-full hover:bg-red-600/20 hover:scale-110 transition duration-300`}
        >
          <div className="w-12 h-12 rounded-full bg-gray-600 text-white flex flex-col justify-center items-center leading-none">
            <span>DE</span>
            <span>MO</span>
          </div>
        </Link>

        <Separator className="h-0.5 rounded-lg" />

        {guilds.map((guild) => (
          <GuildRow key={guild.id} guild={guild} />
        ))}
      </div>
    </aside>
  )
}

export default DashboardSidebar

const GuildRow = ({ guild }: { guild: DiscordGuild }) => (
  <a
    href={`/dashboard/g/${guild.id}`}
    className="flex items-center justify-center p-2 rounded-full hover:bg-yellow-400/15 hover:scale-110 transition duration-300"
  >
    {guild.icon ? (
      <Image
        src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
        alt={guild.name}
        className="w-12 h-12 rounded-full"
        height={48}
        width={48}
      />
    ) : (
      <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-sm text-white">
        {guild.name.slice(0, 2).toUpperCase()}
      </div>
    )}
  </a>
)
