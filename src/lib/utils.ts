import { clsx, type ClassValue } from 'clsx'
import mongoose from 'mongoose'
import { twMerge } from 'tailwind-merge'
import { LOTTERY_NUM_TO_DRAW, LOTTERY_TOTAL_NUMBERS } from './defaultConfig'
import { CasinoSettingsValues } from '@/types/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const connectToDatabase = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not defined')
    mongoose.set('strictQuery', false)
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ Connected to the database')
  } catch (error) {
    console.error('Error connecting to the database:', error)
  }
}

const combination = (n: number, k: number): number => {
  if (k > n) return 0
  let result = 1
  for (let i = 1; i <= k; i++) {
    result = (result * (n - i + 1)) / i
  }
  return result
}

export const calculateRTP = (
  game: keyof CasinoSettingsValues,
  settings: CasinoSettingsValues[typeof game]
): number | string | undefined => {
  switch (game) {
    case 'dice': {
      const winChance = 1 / 6
      return (
        winChance * (settings as CasinoSettingsValues['dice']).winMultiplier
      )
    }

    case 'coinflip': {
      const winChance = 0.5
      return (
        winChance * (settings as CasinoSettingsValues['coinflip']).winMultiplier
      )
    }

    case 'slots': {
      const { symbolWeights, winMultipliers } =
        settings as CasinoSettingsValues['slots']

      const totalWeight = Object.values(symbolWeights).reduce(
        (a, b) => a + b,
        0
      )

      let rtp = 0
      for (const [symbol, weight] of Object.entries(symbolWeights)) {
        const probability = Math.pow(weight / totalWeight, 3)
        const combo = symbol + symbol + symbol
        const multiplier =
          (winMultipliers as Record<string, number>)[combo] ?? 0
        rtp += probability * multiplier
      }

      return rtp
    }

    case 'lottery': {
      const { winMultipliers } = settings as CasinoSettingsValues['lottery']

      const userPicks = LOTTERY_NUM_TO_DRAW
      const drawnNumbers = LOTTERY_NUM_TO_DRAW

      let rtp = 0

      for (let k = 0; k <= userPicks; k++) {
        const favorable =
          combination(userPicks, k) *
          combination(LOTTERY_TOTAL_NUMBERS - userPicks, drawnNumbers - k)
        const probability =
          favorable / combination(LOTTERY_TOTAL_NUMBERS, drawnNumbers)
        const multiplier = (winMultipliers as Record<number, number>)[k] ?? 0
        rtp += probability * multiplier
      }

      return rtp
    }

    case 'rps': {
      const { casinoCut } = settings as CasinoSettingsValues['rps']
      return 1 - casinoCut
    }

    case 'goldenJackpot': {
      const { winMultiplier, oneInChance } =
        settings as CasinoSettingsValues['goldenJackpot']
      return (1 / oneInChance) * winMultiplier
    }

    case 'blackjack': {
      // Blackjack RTP depends on strategy and rules.
      // In an infinite deck model, without splits and with basic strategy:
      // ~99.3–99.5%. We return 0.994 as the average.
      return 0.994
    }

    case 'prediction': {
      return 0
    }

    default:
      console.warn(`RTP for ${game} not implemented`)
  }
}

export const formatNumberToReadableString = (number: number): string => {
  const absNumber = Math.abs(number)

  let formatted: string
  if (absNumber >= 1_000_000_000) {
    formatted =
      (absNumber / 1_000_000_000).toFixed(
        absNumber % 1_000_000_000 === 0 ? 0 : 2
      ) + 'B'
  } else if (absNumber >= 1_000_000) {
    formatted =
      (absNumber / 1_000_000).toFixed(absNumber % 1_000_000 === 0 ? 0 : 2) + 'M'
  } else if (absNumber >= 1_000) {
    formatted =
      (absNumber / 1_000).toFixed(absNumber % 1_000 === 0 ? 0 : 2) + 'k'
  } else {
    formatted = absNumber.toString()
  }

  return number < 0 ? `-${formatted}` : formatted
}
