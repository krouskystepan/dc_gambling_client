export const readableGameValueNames = [
  { name: 'Maximum Bet Amount', value: 'maxBet' },
  { name: 'Minimum Bet Amount', value: 'minBet' },
  { name: 'Win Multiplier (x)', value: 'winMultiplier' },
  { name: 'Win Multipliers (x)', value: 'winMultipliers' },
  { name: 'Casino House Cut (%)', value: 'casinoCut' },
  { name: 'One-In Chance (e.g. 1 in 10,000)', value: 'oneInChance' },
  { name: 'Symbol Weights', value: 'symbolWeights' },
]

export const readableGamesNames = [
  { name: 'Dice', value: 'dice' },
  { name: 'Coin Flip', value: 'coinflip' },
  { name: 'Slots', value: 'slots' },
  { name: 'Lottery', value: 'lottery' },
  { name: 'Roulette', value: 'roulette' },
  { name: 'Rock Paper Scissors', value: 'rps' },
  { name: 'Golden Jackpot', value: 'goldenJackpot' },
  { name: 'Blackjack', value: 'blackjack' },
  { name: 'Prediction', value: 'prediction' },
]

export function getReadableName(
  key: string,
  map: { name: string; value: string }[]
): string {
  const found = map.find((item) => item.value === key)
  return found ? found.name : key
}

export const LOTTERY_TOTAL_NUMBERS = 40
export const LOTTERY_NUM_TO_DRAW = 4
export const MINI_NUMBERS: Record<string, 'red' | 'black' | 'green'> = {
  '0': 'green',
  '1': 'red',
  '3': 'red',
  '5': 'red',
  '7': 'red',
  '9': 'red',
  '12': 'red',
  '14': 'red',
  '16': 'red',
  '18': 'red',
  '2': 'black',
  '4': 'black',
  '6': 'black',
  '8': 'black',
  '10': 'black',
  '11': 'black',
  '13': 'black',
  '15': 'black',
  '17': 'black',
}

const defaultCasinoSettings = {
  dice: {
    winMultiplier: 5,
    maxBet: 0,
    minBet: 0,
  },
  coinflip: {
    winMultiplier: 1.9,
    maxBet: 0,
    minBet: 0,
  },
  slots: {
    winMultipliers: {
      '🍒🍒🍒': 5,
      '🫐🫐🫐': 10,
      '🍉🍉🍉': 20,
      '🔔🔔🔔': 50,
      '7️⃣7️⃣7️⃣': 100,
    },
    symbolWeights: {
      '🍒': 35,
      '🫐': 25,
      '🍉': 10,
      '🔔': 4,
      '7️⃣': 2,
    },
    maxBet: 0,
    minBet: 0,
  },
  lottery: {
    winMultipliers: {
      4: 100,
      3: 40,
      2: 10,
      1: 1,
      0: 0,
    },
    maxBet: 0,
    minBet: 0,
  },
  roulette: {
    winMultipliers: {
      number: 18,
      color: 2,
      parity: 1.95,
      range: 1.95,
      dozen: 2.85,
      column: 2.85,
    },
    maxBet: 0,
    minBet: 0,
  },
  rps: {
    casinoCut: 0.025,
    maxBet: 0,
    minBet: 0,
  },
  goldenJackpot: {
    winMultiplier: 10_000,
    oneInChance: 12_000,
    maxBet: 0,
    minBet: 0,
  },
  blackjack: {
    maxBet: 0,
    minBet: 0,
  },
  prediction: {
    maxBet: 0,
    minBet: 0,
  },
}

export default defaultCasinoSettings
