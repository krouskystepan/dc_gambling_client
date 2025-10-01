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
import React from 'react'

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
  const formatCurrency = (value: number) =>
    value < 0
      ? `-$${formatNumberWithSpaces(Math.abs(value))}`
      : `$${formatNumberWithSpaces(value)}`

  return (
    <section className="mt-4 flex justify-center gap-8 rounded-md border p-4">
      <SummaryItem
        label="Cash Flow"
        value={cashFlow}
        formatter={formatCurrency}
        positiveIsGreen
        tooltip="deposit - withdraw"
      />
      <SummaryItem
        label="Profit / Loss"
        value={gamePnL}
        formatter={formatCurrency}
        positiveIsGreen
        tooltip="win + bonus + refund - bet - vip"
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
