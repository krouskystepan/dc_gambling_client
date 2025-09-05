// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    error?: string
    user?: DefaultSession['user']
    userId?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    accessTokenExpires?: number
    refreshToken?: string
    error?: string
  }
}
