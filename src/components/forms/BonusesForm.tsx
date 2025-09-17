'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, FormProvider, useWatch } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { FormField, FormItem, FormControl, FormMessage, Form } from '../ui/form'
import { Label } from '../ui/label'
import SaveButton from '../SaveButton'
import LoadingScreen from '../states/Loading'
import { toast } from 'sonner'
import { z } from 'zod'
import { Input } from '../ui/input'
import { formatNumberToReadableString } from '@/lib/utils'
import { Switch } from '../ui/switch'
import {
  getBonusSettings,
  saveBonusSettings,
} from '@/actions/database/bonusSettings.action'

const bonusFormSchema = z.object({
  baseReward: z.number().min(0),
  streakMultiplier: z.number().min(0.01), // allow decimals > 0
  maxReward: z.number().min(0),
  resetOnMax: z.boolean(),
})

export type BonusFormValues = z.infer<typeof bonusFormSchema>

const BonusesForm = ({ guildId }: { guildId: string }) => {
  const form = useForm<BonusFormValues>({
    resolver: zodResolver(bonusFormSchema),
    defaultValues: {
      baseReward: 0,
      streakMultiplier: 1,
      maxReward: 0,
      resetOnMax: false,
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
      console.log(values)
      await saveBonusSettings(guildId, values)
      toast.success('Bonus settings saved!', { id: toastId })
    } catch (err) {
      console.error(err)
      toast.error('Failed to save bonus settings', { id: toastId })
    }
  }

  const watchedValues = useWatch({ control: form.control })
  const baseReward = Number(watchedValues?.baseReward ?? 0)
  const multiplier = Number(watchedValues?.streakMultiplier ?? 1)
  const maxReward = Number(watchedValues?.maxReward ?? 0)
  const resetOnMax = watchedValues?.resetOnMax ?? false

  const preview: { day: number; reward: number }[] = []
  let reward = baseReward
  for (let i = 1; i <= 30; i++) {
    let displayReward = reward

    if (maxReward > 0 && reward > maxReward) {
      if (resetOnMax) {
        displayReward = baseReward
        reward = baseReward
      } else {
        displayReward = maxReward
      }
    }

    preview.push({ day: i, reward: Number(displayReward.toFixed(2)) })
    reward *= multiplier
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

          <div className="grid grid-cols-2 gap-4 w-full">
            {['baseReward', 'streakMultiplier', 'maxReward'].map((name) => {
              const labelMap: Record<string, string> = {
                baseReward: 'Base Reward',
                streakMultiplier: 'Streak Multiplier',
                maxReward: 'Max Reward',
              }
              return (
                <FormField
                  key={name}
                  control={form.control}
                  name={name as keyof BonusFormValues}
                  render={({ field }) => (
                    <FormItem>
                      <Label>{labelMap[name]}</Label>
                      <FormControl>
                        <Input
                          type="text"
                          value={field.value?.toString() ?? ''}
                          onChange={(e) => {
                            const val = e.target.value
                            if (/^\d*\.?\d*$/.test(val)) {
                              field.onChange(val)
                            }
                          }}
                          onBlur={() => {
                            const parsed = parseFloat(
                              field.value as unknown as string
                            )
                            field.onChange(isNaN(parsed) ? 0 : parsed)
                          }}
                          className="bg-muted border-transparent shadow-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            })}

            <FormField
              control={form.control}
              name="resetOnMax"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border px-4 py-2">
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

          <div className="p-4 text-white max-w-xl">
            <h5 className="font-semibold mb-3 text-yellow-400">
              Preview (Next 30 days)
            </h5>
            <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto hide-scrollbar">
              {preview.map((p) => (
                <div
                  key={p.day}
                  className="flex justify-between items-center py-2 px-2 border-b-2"
                >
                  <span className="font-semibold">Day #{p.day}</span>
                  <span className="text-yellow-400 font-semibold">
                    {formatNumberToReadableString(p.reward)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </form>
      </Form>
    </FormProvider>
  )
}

export default BonusesForm
