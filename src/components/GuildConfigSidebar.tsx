import Link from 'next/link'

const sections = [
  { id: 'atmChannelIds', label: 'ATM Channels' },
  { id: 'adminChannelIds', label: 'Admin Channels' },
  { id: 'casinoChannelIds', label: 'Casino Channels' },
  { id: 'predictionChannelIds', label: 'Prediction Channels' },
  { id: 'casinoSettings', label: 'Casino Settings' },
  { id: 'vipSettings', label: 'Vip Settings' },
  { id: 'managerRoleId', label: 'Manager Role' },
]

const GuildConfigSidebar = ({
  guildId,
  guildName,
}: {
  guildId: string
  guildName: string
}) => {
  return (
    <section className="max-w-58 w-fit bg-black/40 border-r border-yellow-500/10">
      <div className="border-b border-yellow-500/10 p-2 text-center text-lg font-semibold">
        {guildName}
      </div>

      <aside className="p-4 flex flex-col gap-2">
        <Link
          href={`/dashboard/g/${guildId}`}
          className="text-gray-200 hover:text-yellow-400 px-2 py-2 rounded hover:bg-yellow-500/10 transition"
        >
          Home
        </Link>
        {sections.map((section) => (
          <Link
            key={section.id}
            href={{
              pathname: `/dashboard/g/${guildId}`,
              query: { section: section.id },
            }}
            className="text-gray-200 hover:text-yellow-400 px-2 py-2 rounded hover:bg-yellow-500/10 transition"
          >
            {section.label}
          </Link>
        ))}
      </aside>
    </section>
  )
}

export default GuildConfigSidebar
