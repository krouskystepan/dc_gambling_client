import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../ui/button'

const NoPerms = () => {
  return (
    <div className="h-screen flex flex-1 flex-col items-center justify-center gap-4 text-center px-6">
      <AlertCircle className="w-12 h-12 text-red-500 animate-pulse drop-shadow-lg" />

      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent animate-gradient-x">
        No Permissions
      </h1>

      <p className="text-gray-300 max-w-sm">
        You do not have the required permissions to view this page. Contact your
        server admin if you believe this is a mistake.
      </p>

      <Button
        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-colors"
        asChild
      >
        <Link href={'/dashboard'}>Back to Dashboard</Link>
      </Button>
    </div>
  )
}

export default NoPerms
