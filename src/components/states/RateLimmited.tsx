'use client'

import { Clock } from 'lucide-react'
import { Button } from '../ui/button'

const RateLimited = () => {
  return (
    <div className="h-screen flex flex-1 flex-col items-center justify-center gap-4 text-center px-6">
      <Clock className="w-12 h-12 text-blue-500 animate-pulse drop-shadow-lg" />

      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent animate-gradient-x">
        Rate Limited
      </h1>

      <p className="text-gray-300 max-w-sm">
        Discord is temporarily limiting requests. Please wait a bit and try
        again.
      </p>

      <p className="text-gray-400 max-w-sm">
        You can also try refreshing the page:
      </p>

      <Button
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-colors"
        onClick={() => window.location.reload()}
      >
        Refresh Page
      </Button>
    </div>
  )
}

export default RateLimited
