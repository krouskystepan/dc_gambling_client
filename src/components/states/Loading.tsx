import { Loader2 } from 'lucide-react'

const LoadingScreen = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-3 text-center px-6">
      <Loader2 className="w-12 h-12 text-yellow-400 animate-spin drop-shadow-lg" />

      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 bg-clip-text text-transparent animate-gradient-x">
        Loading...
      </h1>

      <p className="text-gray-300 max-w-sm">
        Please wait while we prepare everything for you.
      </p>

      <span className="text-xs text-yellow-300 font-semibold">
        (This may take a few seconds)
      </span>
    </div>
  )
}

export default LoadingScreen
