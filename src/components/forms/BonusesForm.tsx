'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, FormProvider, useWatch } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { FormField, FormItem, FormControl, FormMessage, Form } from '../ui/form'
import { Label } from '../ui/label'
import SaveButton from '../SaveButton'
import LoadingScreen from '../states/Loading'
import { toast } from 'sonner'
import { Input } from '../ui/input'
import { formatNumberToReadableString } from '@/lib/utils'
import { Switch } from '../ui/switch'
import {
  getBonusSettings,
  saveBonusSettings,
} from '@/actions/database/bonusSettings.action'
import { bonusFormSchema } from '@/types/schemas'
import { BonusFormValues } from '@/types/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

const BonusesForm = ({ guildId }: { guildId: string }) => {
  const form = useForm<BonusFormValues>({
    resolver: zodResolver(bonusFormSchema),
    defaultValues: {
      rewardMode: 'linear',
      baseReward: 0,
      streakIncrement: 0,
      streakMultiplier: 1,
      maxReward: 0,
      resetOnMax: false,
      milestoneBonus: {
        weekly: 0,
        monthly: 0,
      },
    },
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const settings = await getBonusSettings(guildId)
        if (settings) form.reset(settings)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [guildId, form])

  const onSubmit = async (values: BonusFormValues) => {
    const toastId = toast.loading('Saving bonus settings...')
    try {
      await saveBonusSettings(guildId, values)
      toast.success('Bonus settings saved!', { id: toastId })
    } catch (err) {
      console.error(err)
      toast.error('Failed to save bonus settings', { id: toastId })
    }
  }

  const watched = useWatch({ control: form.control })
  const {
    baseReward = 0,
    streakIncrement = 0,
    streakMultiplier = 1,
    maxReward = 0,
    resetOnMax = false,
    milestoneBonus: {
      weekly: milestoneWeekly = 0,
      monthly: milestoneMonthly = 0,
    } = {},
    rewardMode = 'linear',
  } = watched ?? {}

  const preview: {
    day: number
    reward: number
    base: number
    weekly: number
    monthly: number
  }[] = []

  const base = Number(baseReward)
  const inc = Number(streakIncrement)
  const mult = Number(streakMultiplier)
  const max = Number(maxReward)
  const weeklyMilestone = Number(milestoneWeekly)
  const monthlyMilestone = Number(milestoneMonthly)

  let simRewardStreak = 1

  for (let i = 1; i <= 90; i++) {
    let reward = 0
    if (rewardMode === 'linear') {
      reward = base + (simRewardStreak - 1) * inc
    } else {
      reward = base * Math.pow(mult, simRewardStreak - 1)
    }

    const isWeeklyMilestone = i % 7 === 0
    const isMonthlyMilestone = i % 28 === 0
    let milestone = 0
    if (isWeeklyMilestone) milestone += weeklyMilestone
    if (isMonthlyMilestone) milestone += monthlyMilestone

    if (max > 0 && reward > max) {
      if (resetOnMax) {
        reward = rewardMode === 'linear' ? base : base
        simRewardStreak = 1
      } else {
        reward = max
      }
    }

    const total = Number((reward + milestone).toFixed(2))
    const baseOnly = Number(reward.toFixed(2))
    const weeklyOnly = isWeeklyMilestone ? weeklyMilestone : 0
    const monthlyOnly = isMonthlyMilestone ? monthlyMilestone : 0

    preview.push({
      day: i,
      reward: total,
      base: baseOnly,
      weekly: weeklyOnly,
      monthly: monthlyOnly,
    })

    simRewardStreak++
  }

  if (loading) return <LoadingScreen />

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 w-full max-w-2xl"
        >
          <h4 className="text-xl font-semibold text-yellow-400">
            Bonus Settings
          </h4>

          <div className="grid grid-cols-3 gap-4 w-full">
            <FormField
              control={form.control}
              name="rewardMode"
              render={({ field }) => (
                <FormItem>
                  <Label>Reward Mode</Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="bg-muted border-transparent shadow-none">
                        <SelectValue placeholder="Select reward mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="linear">Linear</SelectItem>
                      <SelectItem value="exponential">Exponential</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="baseReward"
              render={({ field }) => (
                <FormItem>
                  <Label>Base Reward</Label>
                  <FormControl>
                    <Input
                      className="bg-muted border-transparent shadow-none"
                      type="text"
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        field.onChange(Number(value))
                      }}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxReward"
              render={({ field }) => (
                <FormItem>
                  <Label>Max Reward</Label>
                  <FormControl>
                    <Input
                      className="bg-muted border-transparent shadow-none"
                      type="text"
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        field.onChange(Number(value))
                      }}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {rewardMode === 'linear' && (
              <FormField
                control={form.control}
                name="streakIncrement"
                render={({ field }) => (
                  <FormItem>
                    <Label>Streak Increment (Linear)</Label>
                    <FormControl>
                      <Input
                        className="bg-muted border-transparent shadow-none"
                        type="text"
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '')
                          field.onChange(Number(value))
                        }}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {rewardMode === 'exponential' && (
              <FormField
                control={form.control}
                name="streakMultiplier"
                render={({ field }) => (
                  <FormItem>
                    <Label>Streak Multiplier (Exponential)</Label>
                    <FormControl>
                      <Input
                        className="bg-muted border-transparent shadow-none"
                        type="text"
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '')
                          field.onChange(Number(value))
                        }}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="milestoneBonus.weekly"
              render={({ field }) => (
                <FormItem>
                  <Label>Weekly Milestone Bonus (7d)</Label>
                  <FormControl>
                    <Input
                      className="bg-muted border-transparent shadow-none"
                      type="text"
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        field.onChange(Number(value))
                      }}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="milestoneBonus.monthly"
              render={({ field }) => (
                <FormItem>
                  <Label>Monthly Milestone Bonus (28d)</Label>
                  <FormControl>
                    <Input
                      className="bg-muted border-transparent shadow-none"
                      type="text"
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '')
                        field.onChange(Number(value))
                      }}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resetOnMax"
              render={({ field }) => (
                <FormItem className="col-start-2 flex flex-row items-center justify-between rounded-lg border px-4 py-2">
                  <Label>Reset On Max Reward</Label>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <SaveButton />

          <div className="p-2 w-full text-white">
            <h5 className="text-yellow-400 font-semibold mb-2 text-lg">
              Preview (Next 90 Days)
            </h5>
            <div className="grid grid-cols-3 gap-4 max-h-[540px] overflow-y-auto hide-scrollbar">
              {preview.map((p) => {
                const weekly = p.weekly
                const monthly = p.monthly
                const baseOnly = p.base
                const total = p.reward
                const isResetRow = false

                return (
                  <div
                    key={p.day}
                    className={`flex flex-col p-2 border-b border-gray-700 ${
                      isResetRow ? 'bg-red-900/20 rounded-lg' : ''
                    }`}
                  >
                    <div className="flex justify-between">
                      <span className="text-yellow-400">Day #{p.day}</span>
                      <span className="font-semibold">
                        {formatNumberToReadableString(total)}
                      </span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="text-gray-300">
                        B: {formatNumberToReadableString(baseOnly)}
                      </span>
                      {weekly > 0 && (
                        <span className="text-blue-400 font-medium">
                          W: {formatNumberToReadableString(weekly)}
                        </span>
                      )}
                      {monthly > 0 && (
                        <span className="text-green-400 font-bold">
                          M: {formatNumberToReadableString(monthly)}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </form>
      </Form>
    </FormProvider>
  )
}

export default BonusesForm
