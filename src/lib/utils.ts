import { clsx, type ClassValue } from 'clsx'
import mongoose from 'mongoose'
import { twMerge } from 'tailwind-merge'
import {
  LOTTERY_NUM_TO_DRAW,
  LOTTERY_TOTAL_NUMBERS,
  MINI_NUMBERS,
} from './defaultConfig'
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
): number | Record<string, number> => {
  const toNumber = (val: unknown): number => {
    if (typeof val === 'string') return parseFloat(val) || 0
    if (typeof val === 'number') return val
    return 0
  }

  switch (game) {
    case 'dice': {
      const { winMultiplier } = settings as CasinoSettingsValues['dice']
      return (1 / 6) * toNumber(winMultiplier) * 100
    }

    case 'coinflip': {
      const { winMultiplier } = settings as CasinoSettingsValues['coinflip']
      return 0.5 * toNumber(winMultiplier) * 100
    }

    case 'slots': {
      const { symbolWeights, winMultipliers } =
        settings as CasinoSettingsValues['slots']

      const totalWeight = Object.values(symbolWeights).reduce(
        (a, b) => a + toNumber(b),
        0
      )

      let rtp = 0
      for (const [symbol, weight] of Object.entries(symbolWeights)) {
        const probability = Math.pow(toNumber(weight) / totalWeight, 3)
        const combo = symbol + symbol + symbol
        const multiplier = toNumber(winMultipliers[combo] ?? 0)
        rtp += probability * multiplier
      }

      return rtp * 100
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
        const multiplier = toNumber(winMultipliers[k] ?? 0)
        rtp += probability * multiplier
      }

      return rtp * 100
    }

    case 'roulette': {
      const { winMultipliers } = settings as CasinoSettingsValues['roulette']
      const numbers = Object.keys(MINI_NUMBERS)
      const totalNumbers = numbers.length
      const greenCount = numbers.filter(
        (n) => MINI_NUMBERS[n] === 'green'
      ).length

      const numberRTP =
        (1 / totalNumbers) * toNumber(winMultipliers.number) * 100

      const redCount = numbers.filter((n) => MINI_NUMBERS[n] === 'red').length
      const colorRTP =
        (redCount / totalNumbers) * toNumber(winMultipliers.color) * 100

      const evenCount = numbers.filter(
        (n) => parseInt(n) % 2 === 0 && MINI_NUMBERS[n] !== 'green'
      ).length
      const parityRTP =
        (evenCount / (totalNumbers - greenCount)) *
        toNumber(winMultipliers.parity) *
        100

      const rangeCount = numbers.filter(
        (n) => parseInt(n) >= 1 && parseInt(n) <= 9
      ).length
      const rangeRTP =
        (rangeCount / (totalNumbers - greenCount)) *
        toNumber(winMultipliers.range) *
        100

      const dozenCount = numbers.filter(
        (n) => parseInt(n) >= 1 && parseInt(n) <= 6
      ).length
      const dozenRTP =
        (dozenCount / (totalNumbers - greenCount)) *
        toNumber(winMultipliers.dozen) *
        100

      const columnCount = numbers.filter(
        (n) => parseInt(n) % 3 === 1 && MINI_NUMBERS[n] !== 'green'
      ).length
      const columnRTP =
        (columnCount / (totalNumbers - greenCount)) *
        toNumber(winMultipliers.column) *
        100

      return {
        number: numberRTP,
        color: colorRTP,
        parity: parityRTP,
        range: rangeRTP,
        dozen: dozenRTP,
        column: columnRTP,
      }
    }

    case 'rps': {
      const { casinoCut } = settings as CasinoSettingsValues['rps']
      return (1 - toNumber(casinoCut)) * 100
    }

    case 'goldenJackpot': {
      const { winMultiplier, oneInChance } =
        settings as CasinoSettingsValues['goldenJackpot']
      return (toNumber(winMultiplier) / toNumber(oneInChance)) * 100
    }

    case 'blackjack':
      return 99.4

    case 'prediction':
      return 0

    default:
      console.warn(`RTP for ${game} not implemented`)
      return 0
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
