import defaultCasinoSettings from '@/lib/defaultConfig'
import { Schema, model, models, Document } from 'mongoose'

export type GuildConfiguration = Document & {
  guildId: string
  atmChannelIds: {
    actions: string
    logs: string
  }
  casinoChannelIds: string[]
  predictionChannelIds: {
    actions: string
    logs: string
  }
  managerRoleId: string
  casinoSettings: typeof defaultCasinoSettings
  vipSettings: {
    roleId: string
    categoryId: string
    pricePerDay: number
    pricePerCreate: number
  }
  bonusSettings: {
    baseReward: number
    streakMultiplier: number
    maxReward: number
    resetOnMax: number
  }
}

const guildConfigurationSchema = new Schema<GuildConfiguration>({
  guildId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  atmChannelIds: {
    actions: { type: String, default: '' },
    logs: { type: String, default: '' },
  },
  casinoChannelIds: { type: [String], default: [] },
  predictionChannelIds: {
    actions: { type: String, default: '' },
    logs: { type: String, default: '' },
  },
  managerRoleId: { type: String, default: '' },
  casinoSettings: {
    type: Schema.Types.Mixed,
    default: defaultCasinoSettings,
  },
  vipSettings: {
    roleId: { type: String, default: '' },
    categoryId: { type: String, default: '' },
    pricePerDay: { type: Number, default: 0 },
    pricePerCreate: { type: Number, default: 0 },
  },
  bonusSettings: {
    baseReward: { type: Number, default: 0 },
    streakMultiplier: { type: Number, default: 0 },
    maxReward: { type: Number, default: 0 },
    resetOnMax: { type: Boolean, default: false },
  },
})

export default models.GuildConfiguration ||
  model<GuildConfiguration>('GuildConfiguration', guildConfigurationSchema)
