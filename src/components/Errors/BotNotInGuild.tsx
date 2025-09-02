import { Sparkles } from 'lucide-react'

const BotNotInGuild = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-3 text-center px-6">
      <Sparkles className="w-12 h-12 text-yellow-400 animate-spin-slower drop-shadow-lg" />

      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 bg-clip-text text-transparent animate-gradient-x">
        Bot Not In This Guild
      </h1>

      <p className="text-gray-300 max-w-sm">
        This server does not currently have the bot installed. To access
        management features for this guild, please reach out to the bot
        administrator to add it. <br />
      </p>

      <span className="text-xs text-yellow-300 font-semibold">
        (The bot is private and only available on invited servers)
      </span>
    </div>
  )
}

export default BotNotInGuild
