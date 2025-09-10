'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, FormProvider, useWatch } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { FormField, FormItem, FormControl, FormMessage, Form } from '../ui/form'
import { Label } from '../ui/label'
import SaveButton from '../SaveButton'
import LoadingScreen from '../states/Loading'
import { toast } from 'sonner'
import { milestoneFormSchema } from '@/types/schemas'
import { getMilestones, saveMilestones } from '@/actions/database'
import { Input } from '../ui/input'
import { MilestoneValues } from '@/types/types'
import { formatNumberToReadableString } from '@/lib/utils'

const MilestonesForm = ({ guildId }: { guildId: string }) => {
  const form = useForm<MilestoneValues>({
    resolver: zodResolver(milestoneFormSchema),
    defaultValues: {
      baseThreshold: 0,
      baseReward: 0,
      multiplierThreshold: 0,
      multiplierReward: 0,
    },
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const guildMilestones = await getMilestones(guildId)
        if (guildMilestones) {
          form.reset({
            baseThreshold: guildMilestones.baseThreshold,
            baseReward: guildMilestones.baseReward,
            multiplierThreshold: guildMilestones.multiplierThreshold,
            multiplierReward: guildMilestones.multiplierReward,
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [guildId, form])

  const onSubmit = async (values: MilestoneValues) => {
    const toastId = toast.loading('Saving milestones...')
    try {
      await saveMilestones(guildId, values)
      toast.success('Milestones saved!', { id: toastId })
    } catch (err) {
      console.error(err)
      toast.error('Failed to save milestones', { id: toastId })
    }
  }

  // Watch form values in real-time
  const watchedValues = useWatch({ control: form.control })

  // Provide defaults to avoid undefined
  const baseThreshold = watchedValues?.baseThreshold ?? 0
  const baseReward = watchedValues?.baseReward ?? 0
  const multiplierT = watchedValues?.multiplierThreshold ?? 1
  const multiplierR = watchedValues?.multiplierReward ?? 1

  const previewMilestones = []
  let threshold = baseThreshold
  let reward = baseReward

  for (let i = 0; i < 50; i++) {
    previewMilestones.push({
      threshold: Math.round(threshold),
      reward: Math.round(reward),
    })
    threshold *= multiplierT
    reward *= multiplierR
  }

  if (loading) return <LoadingScreen />

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 w-1/2"
        >
          <h4 className="text-xl font-semibold text-yellow-400">Milestones</h4>

          <div className="grid grid-cols-2 gap-4 w-full">
            {[
              'baseThreshold',
              'baseReward',
              'multiplierThreshold',
              'multiplierReward',
            ].map((name) => {
              const labelMap: Record<string, string> = {
                baseThreshold: 'Base Threshold',
                baseReward: 'Base Reward',
                multiplierThreshold: 'Multiplier Threshold',
                multiplierReward: 'Multiplier Reward',
              }

              return (
                <FormField
                  key={name}
                  control={form.control}
                  name={name as keyof MilestoneValues}
                  render={({ field }) => (
                    <FormItem>
                      <Label>{labelMap[name]}</Label>
                      <FormControl>
                        <Input
                          type="text"
                          value={field.value?.toString() ?? ''}
                          onChange={(e) => {
                            const val = e.target.value
                            // allow digits and a single dot
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
          </div>

          <SaveButton />

          <div className="p-4 text-white max-w-xl">
            <h5 className="font-semibold mb-3 text-yellow-400">
              Milestone Preview (Next 50)
            </h5>
            <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto">
              {previewMilestones.map((m, i) => {
                const isTooBig =
                  m.threshold > 1_000_000_000 || m.reward > 1_000_000_000

                return (
                  <div
                    key={i}
                    className="flex justify-between items-center py-2 px-2 border-b-2"
                  >
                    {isTooBig ? (
                      <span className="italic text-neutral-400 w-full text-center">
                        Numbers are too big (≥ 1B)
                      </span>
                    ) : (
                      <>
                        <div className="flex gap-2 w-1/2">
                          <span className="font-semibold">#{i + 1}</span>
                          <span className="text-green-400">
                            Threshold:{' '}
                            {formatNumberToReadableString(m.threshold)}
                          </span>
                        </div>
                        <div className="flex gap-2 w-1/2 justify-end text-right">
                          <span className="text-yellow-400 font-semibold">
                            Reward: {formatNumberToReadableString(m.reward)}
                          </span>
                        </div>
                      </>
                    )}
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

export default MilestonesForm
