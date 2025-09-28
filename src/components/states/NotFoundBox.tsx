import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '../ui/button'

const NotFoundBox = () => {
  return (
    <div className="size-full flex flex-1 flex-col items-center justify-center gap-4 text-center px-6">
      <AlertCircle className="w-12 h-12 text-red-500 animate-spin-slower drop-shadow-lg" />

      <h1 className="text-4xl font-extrabold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent animate-gradient-x">
        404 - Page Not Found
      </h1>

      <p className="text-gray-300 max-w-sm">
        Sorry, the page you are looking for does not exist. Check the URL or go
        back to the dashboard.
      </p>

      <Button
        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-colors"
        asChild
      >
        <Link href={'/'}>Go Back Home</Link>
      </Button>
    </div>
  )
}

export default NotFoundBox
