import { AuthOptions } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import { JWT } from 'next-auth/jwt'

interface DiscordProfile {
  id: string
  username: string
  avatar: string
  discriminator: string
  public_flags: number
}

async function refreshAccessToken(token: JWT) {
  try {
    const url = 'https://discord.com/api/oauth2/token'
    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!, // server-only
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: 'refresh_token',
      refresh_token: token.refreshToken as string,
    })

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })

    const refreshedTokens = await response.json()

    if (!response.ok) throw refreshedTokens

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    }
  } catch (error) {
    console.error('Error refreshing Discord access token:', error)
    return { ...token, error: 'RefreshAccessTokenError' as const }
  }
}

export const authOptions: AuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!, // frontend
      clientSecret: process.env.DISCORD_CLIENT_SECRET!, // server-only
      authorization: {
        params: { scope: 'identify guilds' },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        return {
          accessToken: account.access_token,
          accessTokenExpires:
            Date.now() + (Number(account.expires_in) || 3600) * 1000,
          refreshToken: account.refresh_token,
          userId: (profile as DiscordProfile).id,
        }
      }

      if (Date.now() < (token.accessTokenExpires as number)) return token

      return await refreshAccessToken(token)
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.userId = token.userId as string
      session.error = token.error as string | undefined
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
