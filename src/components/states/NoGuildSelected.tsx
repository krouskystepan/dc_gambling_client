import { Sparkles } from 'lucide-react'

const NoGuildSelected = () => {
  return (
    <div className="h-screen flex flex-1 flex-col items-center justify-center gap-4 text-center px-6">
      <Sparkles className="w-12 h-12 text-yellow-400 animate-spin-slower drop-shadow-lg" />

      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 bg-clip-text text-transparent animate-gradient-x">
        No Guild Selected
      </h1>

      <p className="text-gray-300 max-w-sm">
        Select a guild from the sidebar to start managing it. You can see stats,
        settings, and interact with your bot here.
      </p>
    </div>
  )
}

export default NoGuildSelected
