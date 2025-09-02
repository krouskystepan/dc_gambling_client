import { getServerSession } from 'next-auth'

import CornerCircles from '@/components/CornerCircles'
import BackgroundPattern from '@/components/BackgroundPattern'
import LoginBox from '@/components/LoginBox'
import { authOptions } from '@/lib/authOptions'

const Home = async () => {
  const session = await getServerSession(authOptions)

  return (
    <section className="relative flex h-screen items-center justify-center bg-gradient-to-br from-black via-[#1a1a1a] to-[#0f0f0f] overflow-hidden">
      <CornerCircles />
      <BackgroundPattern />

      <LoginBox session={session} />
    </section>
  )
}

export default Home
