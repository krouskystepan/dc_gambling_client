import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  formatNumberToReadableString,
  formatNumberWithSpaces,
} from '@/lib/utils'
import { ITransactionCounts } from '@/types/types'
import { CircleQuestionMark } from 'lucide-react'

const getCashFlowFormula = (counts: ITransactionCounts) => {
  const { deposit, withdraw } = counts.type
  let formula = ''

  if (deposit) formula += 'deposit'
  if (withdraw) formula += formula ? ' - withdraw' : 'withdraw'

  return formula || 'No active types'
}

const getPnLFormula = (counts: ITransactionCounts) => {
  const positiveTypes: (keyof ITransactionCounts['type'])[] = [
    'win',
    'bonus',
    'refund',
  ]
  const negativeTypes: (keyof ITransactionCounts['type'])[] = ['bet', 'vip']

  let formula = ''

  // positive types: + win + bonus + refund
  positiveTypes.forEach((t) => {
    if (counts.type[t]) formula += formula ? ` + ${t}` : t
  })

  // negative types: - bet - vip
  negativeTypes.forEach((t) => {
    if (counts.type[t]) formula += formula ? ` - ${t}` : t
  })

  return formula || 'No active types'
}
interface SummaryPanelProps {
  cashFlow: number
  gamePnL: number
  counts: ITransactionCounts
}

const TransactionTableSummaryPanel = ({
  cashFlow,
  gamePnL,
  counts,
}: SummaryPanelProps) => {
  const formatCurrency = (value: number) => {
    const roundedValue = Math.round(value)
    return roundedValue < 0
      ? `-$${formatNumberWithSpaces(Math.abs(roundedValue))}`
      : `$${formatNumberWithSpaces(roundedValue)}`
  }

  return (
    <section className="mt-4 flex justify-center gap-8 rounded-md border p-4">
      <SummaryItem
        label="Cash Flow"
        value={cashFlow}
        formatter={formatCurrency}
        positiveIsGreen
        tooltip={getCashFlowFormula(counts)}
      />
      <SummaryItem
        label="Profit / Loss"
        value={gamePnL}
        formatter={formatCurrency}
        positiveIsGreen
        tooltip={getPnLFormula(counts)}
      />
      <SummaryItem
        label="Deposits"
        value={counts.type.deposit}
        formatter={formatNumberToReadableString}
      />
      <SummaryItem
        label="Withdraws"
        value={counts.type.withdraw}
        formatter={formatNumberToReadableString}
      />
      <SummaryItem
        label="Bets"
        value={counts.type.bet}
        formatter={formatNumberToReadableString}
      />
      <SummaryItem
        label="Vips"
        value={counts.type.vip}
        formatter={formatNumberToReadableString}
      />
      <SummaryItem
        label="Wins"
        value={counts.type.win}
        formatter={formatNumberToReadableString}
      />
      <SummaryItem
        label="Bonuses"
        value={counts.type.bonus}
        formatter={formatNumberToReadableString}
      />
      <SummaryItem
        label="Refunds"
        value={counts.type.refund}
        formatter={formatNumberToReadableString}
      />
    </section>
  )
}

interface SummaryItemProps {
  label: string
  value: number
  positiveIsGreen?: boolean
  tooltip?: string
  formatter?: (value: number) => React.ReactNode
}

const SummaryItem = ({
  label,
  value,
  positiveIsGreen = false,
  tooltip = undefined,
  formatter,
}: SummaryItemProps) => {
  const colorClass = positiveIsGreen
    ? value >= 0
      ? 'text-green-600'
      : 'text-red-600'
    : 'text-white'

  const displayValue = formatter ? formatter(value) : value

  return (
    <div>
      <Label className="text-sm text-gray-500 items-center gap-1 inline-flex">
        {label}
        {tooltip ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <CircleQuestionMark
                size={16}
                className="text-gray-500 cursor-pointer"
              />
            </TooltipTrigger>
            <TooltipContent className="flex flex-col max-w-sm">
              <span className="font-semibold">
                Only active items are counted.
              </span>
              <span>{tooltip}</span>
            </TooltipContent>
          </Tooltip>
        ) : null}
      </Label>
      <div className={`text-lg font-bold ${colorClass}`}>{displayValue}</div>
    </div>
  )
}

export default TransactionTableSummaryPanel
