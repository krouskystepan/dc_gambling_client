'use client'

import { DiscordGuild } from '@/types/discord'

export default function GuildList({ guilds }: { guilds: DiscordGuild[] }) {
  return (
    <ul>
      {guilds.map((g) => (
        <li key={g.id}>
          {g.name} ({g.id})
        </li>
      ))}
    </ul>
  )
}
