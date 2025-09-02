import { AuthOptions } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'

export const authOptions: AuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.includes('/api/auth/signin')) return '/dashboard'

      if (url.includes('/api/auth/signout')) return '/'

      return baseUrl
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
