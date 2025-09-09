'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, FormProvider, useFieldArray } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { FormField, FormItem, FormControl, FormMessage, Form } from '../ui/form'
import { Label } from '../ui/label'
import SaveButton from '../SaveButton'
import LoadingScreen from '../states/Loading'
import { toast } from 'sonner'
import { MilestoneFormValues } from '@/types/types'
import { milestoneFormSchema } from '@/types/schemas'
import { getMilestones, saveMilestones } from '@/actions/database'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { X } from 'lucide-react'

const MilestonesForm = ({ guildId }: { guildId: string }) => {
  const form = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneFormSchema),
    defaultValues: { milestones: [] },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'milestones',
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const guildMilestones = await getMilestones(guildId)
        form.reset({
          milestones: guildMilestones
            ? guildMilestones.milestones.map((m) => ({
                threshold: Number(m.threshold),
                reward: Number(m.reward),
              }))
            : [],
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [guildId, form])

  const onSubmit = async (values: MilestoneFormValues) => {
    const toastId = toast.loading('Saving milestones...')
    try {
      await saveMilestones(guildId, values.milestones)
      toast.success('Milestones saved!', { id: toastId })
    } catch (err) {
      console.error(err)
      toast.error('Failed to save milestones', { id: toastId })
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 w-md"
        >
          <h4 className="text-xl font-semibold text-yellow-400">Milestones</h4>

          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-3 w-full">
              <FormField
                control={form.control}
                name={`milestones.${index}.threshold`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <Label>Threshold</Label>
                    <FormControl>
                      <Input
                        type="text"
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            Number(e.target.value.replace(/\D/g, ''))
                          )
                        }
                        className="bg-muted border-transparent shadow-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`milestones.${index}.reward`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <Label>Reward</Label>
                    <FormControl>
                      <Input
                        type="text"
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            Number(e.target.value.replace(/\D/g, ''))
                          )
                        }
                        className="bg-muted border-transparent shadow-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end items-end">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <X />
                </Button>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            className="px-3 py-1 rounded"
            onClick={() => append({ threshold: 0, reward: 0 })}
          >
            ➕ Add Milestone
          </Button>

          <SaveButton />
        </form>
      </Form>
    </FormProvider>
  )
}

export default MilestonesForm
