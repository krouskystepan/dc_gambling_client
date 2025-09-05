import z from 'zod'

const NO_CHANNEL = 'At least one channel must be selected.'

export const atmChannelsFormSchema = z.object({
  actions: z.string().min(1, { message: NO_CHANNEL }),
  logs: z.string().min(1, { message: NO_CHANNEL }),
})

export const casinoChannelsFormSchema = z.object({
  casinoChannelIds: z
    .array(z.string().min(1, { message: NO_CHANNEL }))
    .min(1, { message: NO_CHANNEL }),
})

export const adminChannelsFormSchema = z.object({
  adminChannelIds: z
    .array(z.string().min(1, { message: NO_CHANNEL }))
    .min(1, { message: NO_CHANNEL }),
})

export const predictionChannelsFormSchema = z.object({
  actions: z.string().min(1, { message: NO_CHANNEL }),
  logs: z.string().min(1, { message: NO_CHANNEL }),
})

export const channelsFormSchema = z.object({
  atm: atmChannelsFormSchema,
  casino: casinoChannelsFormSchema,
  admin: adminChannelsFormSchema,
  prediction: predictionChannelsFormSchema,
})

export const casinoSettingsSchema = z.object({
  dice: z.object({
    winMultiplier: z.number().min(0),
    minBet: z.number().min(0),
    maxBet: z.number().min(0),
  }),
  coinflip: z.object({
    winMultiplier: z.number().min(0),
    minBet: z.number().min(0),
    maxBet: z.number().min(0),
  }),
  slots: z.object({
    winMultipliers: z.record(z.string(), z.number().min(0)),
    symbolWeights: z.record(z.string(), z.number().min(0)),
    minBet: z.number().min(0),
    maxBet: z.number().min(0),
  }),
  lottery: z.object({
    winMultipliers: z.record(z.string(), z.number().min(0)),
    minBet: z.number().min(0),
    maxBet: z.number().min(0),
  }),
  rps: z.object({
    casinoCut: z.number().min(0),
    minBet: z.number().min(0),
    maxBet: z.number().min(0),
  }),
  goldenJackpot: z.object({
    winMultiplier: z.number().min(0),
    oneInChance: z.number().min(0),
    minBet: z.number().min(0),
    maxBet: z.number().min(0),
  }),
  blackjack: z.object({
    minBet: z.number().min(0),
    maxBet: z.number().min(0),
  }),
  prediction: z.object({
    minBet: z.number().min(0),
    maxBet: z.number().min(0),
  }),
})

export const vipSettingsFormSchema = z.object({
  roleId: z.string().min(1, 'Select a VIP role'),
  categoryId: z.string().min(1, 'Select a category'),
  pricePerDay: z.number().min(0, 'Must be ≥ 0'),
  pricePerCreate: z.number().min(0, 'Must be ≥ 0'),
})

export const managerRoleFormSchema = z.object({
  managerRoleId: z.string().min(1, 'Select a manager role'),
})
