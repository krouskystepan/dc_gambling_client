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

export const transactionsChannelsFormSchema = z.object({
  transactionChannelId: z.string().min(1, { message: NO_CHANNEL }),
})

export const predictionChannelsFormSchema = z.object({
  actions: z.string().min(1, { message: NO_CHANNEL }),
  logs: z.string().min(1, { message: NO_CHANNEL }),
})

export const channelsFormSchema = z.object({
  atm: atmChannelsFormSchema,
  casino: casinoChannelsFormSchema,
  transactions: transactionsChannelsFormSchema,
  prediction: predictionChannelsFormSchema,
})

export const milestoneFormSchema = z.object({
  baseThreshold: z.number().min(0),
  baseReward: z.number().min(0),
  multiplierThreshold: z.number().min(1),
  multiplierReward: z.number().min(1),
})

const numberField = z.coerce.number()

export const casinoSettingsSchema = z.object({
  dice: z.object({
    winMultiplier: numberField,
    minBet: numberField,
    maxBet: numberField,
  }),
  coinflip: z.object({
    winMultiplier: numberField,
    minBet: numberField,
    maxBet: numberField,
  }),
  slots: z.object({
    winMultipliers: z.record(z.string(), numberField),
    symbolWeights: z.record(z.string(), numberField),
    minBet: numberField,
    maxBet: numberField,
  }),
  lottery: z.object({
    winMultipliers: z.record(z.string(), numberField),
    minBet: numberField,
    maxBet: numberField,
  }),
  roulette: z.object({
    winMultipliers: z.record(z.string(), numberField),
    minBet: numberField,
    maxBet: numberField,
  }),
  rps: z.object({
    casinoCut: numberField,
    minBet: numberField,
    maxBet: numberField,
  }),
  goldenJackpot: z.object({
    winMultiplier: numberField,
    oneInChance: numberField,
    minBet: numberField,
    maxBet: numberField,
  }),
  blackjack: z.object({
    minBet: numberField,
    maxBet: numberField,
  }),
  prediction: z.object({
    minBet: numberField,
    maxBet: numberField,
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
