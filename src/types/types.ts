import z from 'zod'
import {
  casinoSettingsSchema,
  channelsFormSchema,
  managerRoleFormSchema,
  vipSettingsFormSchema,
} from './schemas'

export interface DiscordGuild {
  id: string
  name: string
  icon: string | null
  owner: boolean
  permissions: number
}

export interface GuildChannel {
  id: string
  name: string
  type: number
}

export interface GuildRole {
  id: string
  name: string
  color: number
  hoist: boolean
  position: number
  managed: boolean
  mentionable: boolean
  permissions: string
}

export type ChannelsFormValues = z.infer<typeof channelsFormSchema>
export type CasinoSettingsValues = z.infer<typeof casinoSettingsSchema>
export type ManagerRoleValues = z.infer<typeof managerRoleFormSchema>
export type VipSettingsValues = z.infer<typeof vipSettingsFormSchema>

export type GuildMemberStatus = {
  userId: string
  username: string
  nickname: string | null
  registered: boolean
  registeredAt: string | null
  avatar: string
  balance?: number
  netProfit?: number
}

export type VipChannels = {
  userId: string
  guildId: string
  channelId: string
  channelName: string
  expiresAt: Date
  createdAt: Date
  username: string
  nickname: string
  avatar: string
}
