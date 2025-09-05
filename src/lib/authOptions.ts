import { AuthOptions } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'

interface DiscordProfile {
  id: string
  username: string
  avatar: string
  discriminator: string
  public_flags: number
}

export const authOptions: AuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'identify guilds',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const discordProfile = profile as DiscordProfile
        token.accessToken = account.access_token
        token.userId = discordProfile.id
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.userId = token.userId as string
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

/*
import { AuthOptions } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import { JWT } from 'next-auth/jwt'



async function refreshAccessToken(token: JWT) {
  try {
    const response = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
      }),
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
    console.error('Error refreshing access token', error)
    return { ...token, error: 'RefreshAccessTokenError' as const }
  }
}

export const authOptions: AuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'identify guilds',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user, profile }) {
      if (account && user) {
        const discordProfile = profile as DiscordProfile

        return {
          accessToken: account.access_token,
          accessTokenExpires:
            Date.now() + (Number(account.expires_in) || 3600) * 1000,
          refreshToken: account.refresh_token,
          user,
          userId: discordProfile.id,
        }
      }

      if (Date.now() < Number(token.accessTokenExpires)) {
        return token
      }

      return await refreshAccessToken(token)
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.error = token.error as string | undefined
      session.userId = token.userId as string
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
*/
