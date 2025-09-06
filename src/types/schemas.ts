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

const positiveNumberString = z
  .string()
  .regex(/^\d*\.?\d*$/, 'Must be a valid number')
  .refine((val) => val === '' || Number(val) >= 0, 'Must be >= 0')

export const casinoSettingsSchema = z.object({
  dice: z.object({
    winMultiplier: positiveNumberString,
    minBet: positiveNumberString,
    maxBet: positiveNumberString,
  }),
  coinflip: z.object({
    winMultiplier: positiveNumberString,
    minBet: positiveNumberString,
    maxBet: positiveNumberString,
  }),
  slots: z.object({
    winMultipliers: z.record(z.string(), positiveNumberString),
    symbolWeights: z.record(z.string(), positiveNumberString),
    minBet: positiveNumberString,
    maxBet: positiveNumberString,
  }),
  lottery: z.object({
    winMultipliers: z.record(z.string(), positiveNumberString),
    minBet: positiveNumberString,
    maxBet: positiveNumberString,
  }),
  rps: z.object({
    casinoCut: positiveNumberString,
    minBet: positiveNumberString,
    maxBet: positiveNumberString,
  }),
  goldenJackpot: z.object({
    winMultiplier: positiveNumberString,
    oneInChance: positiveNumberString,
    minBet: positiveNumberString,
    maxBet: positiveNumberString,
  }),
  blackjack: z.object({
    minBet: positiveNumberString,
    maxBet: positiveNumberString,
  }),
  prediction: z.object({
    minBet: positiveNumberString,
    maxBet: positiveNumberString,
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
