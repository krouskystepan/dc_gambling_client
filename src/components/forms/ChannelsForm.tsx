'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, FormProvider } from 'react-hook-form'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormDescription,
  FormMessage,
} from '../ui/form'
import { Label } from '../ui/label'
import { GuildChannel } from '@/types/types'
import { getGuildChannels } from '@/actions/discord'
import SaveButton from '../SaveButton'
import LoadingScreen from '../states/Loading'
import { toast } from 'sonner'
import {
  atmChannelsFormSchema,
  predictionChannelsFormSchema,
  casinoChannelsFormSchema,
  transactionsChannelsFormSchema,
} from '@/types/schemas'
import { getChannels, saveChannels } from '@/actions/database'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import MultipleSelector from '../ui/multiselect'

const channelsFormSchema = z.object({
  atm: atmChannelsFormSchema,
  casino: casinoChannelsFormSchema,
  transactions: transactionsChannelsFormSchema,
  prediction: predictionChannelsFormSchema,
})

type ChannelsFormValues = z.infer<typeof channelsFormSchema>

const ChannelsForm = ({ guildId }: { guildId: string }) => {
  const form = useForm<ChannelsFormValues>({
    resolver: zodResolver(channelsFormSchema),
    defaultValues: {
      atm: { actions: '', logs: '' },
      casino: { casinoChannelIds: [] },
      transactions: { transactionChannelId: '' },
      prediction: { actions: '', logs: '' },
    },
  })

  const [channels, setChannels] = useState<GuildChannel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const [guildChannels, channels] = await Promise.all([
        getGuildChannels(guildId),
        getChannels(guildId),
      ])

      setChannels(guildChannels)

      form.reset({
        atm: {
          actions: channels?.atm?.actions || '',
          logs: channels?.atm?.logs || '',
        },
        casino: {
          casinoChannelIds: channels?.casino?.casinoChannelIds || [],
        },
        transactions: {
          transactionChannelId:
            channels?.transactions?.transactionChannelId || '',
        },
        prediction: {
          actions: channels?.prediction?.actions || '',
          logs: channels?.prediction?.logs || '',
        },
      })

      setLoading(false)
    }

    fetchData()
  }, [guildId, form])

  const onSubmit = async (values: ChannelsFormValues) => {
    const toastId = toast.loading('Saving...')

    try {
      await saveChannels(guildId, values)

      toast.success('Channels saved!', { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error('Failed to save channels', { id: toastId })
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 w-1/2"
        >
          <section className="flex flex-col gap-4">
            <h4 className="text-xl font-semibold text-yellow-400">
              ATM Channels
            </h4>
            <div className="grid grid-cols-2 gap-8 w-full">
              <FormField
                control={form.control}
                name="atm.actions"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <Label>ATM Actions</Label>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ''}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-muted border-transparent shadow-none">
                          <SelectValue placeholder="Select Action Channel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {channels.map((channel) => (
                          <SelectItem key={channel.id} value={channel.id}>
                            {channel.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select channel for ATM Actions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="atm.logs"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <Label>ATM Logs</Label>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ''}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-muted border-transparent shadow-none">
                          <SelectValue placeholder="Select Logs Channel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {channels.map((channel) => (
                          <SelectItem key={channel.id} value={channel.id}>
                            {channel.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select channel for ATM Logs
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h4 className="text-xl font-semibold text-yellow-400">
              Casino Channels
            </h4>
            <FormField
              control={form.control}
              name="casino.casinoChannelIds"
              render={({ field }) => (
                <FormItem>
                  <Label>Casino Channels</Label>
                  <FormControl>
                    <MultipleSelector
                      className="bg-muted border-transparent shadow-none"
                      commandProps={{
                        label: 'Select channels',
                        shouldFilter: false,
                      }}
                      placeholder="Select channels"
                      emptyIndicator={
                        <p className="text-center text-sm">No results found</p>
                      }
                      value={(field.value ?? []).map((id) => {
                        const channel = channels.find((c) => c.id === id)
                        return { label: channel?.name ?? id, value: id }
                      })}
                      defaultOptions={channels.map((channel) => ({
                        label: channel.name,
                        value: channel.id,
                      }))}
                      onChange={(options) =>
                        field.onChange(options.map((opt) => opt.value))
                      }
                      selectFirstItem={false}
                      onSearchSync={(search) => {
                        const term = search.toLowerCase().trim()

                        if (!term) {
                          return channels.map((c) => ({
                            label: c.name,
                            value: c.id,
                          }))
                        }

                        const filtered = channels
                          .filter((c) => c.name.toLowerCase().includes(term))
                          .map((c) => ({ label: c.name, value: c.id }))

                        return filtered
                      }}
                      key={channels.length}
                    />
                  </FormControl>
                  <FormDescription>
                    Select channel(s) for Casino Channels
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <section className="flex flex-col gap-4">
            <h4 className="text-xl font-semibold text-yellow-400">
              Transaction Channel
            </h4>
            <FormField
              control={form.control}
              name="transactions.transactionChannelId"
              render={({ field }) => (
                <FormItem>
                  <Label>Transaction Channel</Label>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? ''}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-muted border-transparent shadow-none">
                        <SelectValue placeholder="Select Logs Channel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {channels.map((channel) => (
                        <SelectItem key={channel.id} value={channel.id}>
                          {channel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select channel for Transactions
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <section className="flex flex-col gap-4">
            <h4 className="text-xl font-semibold text-yellow-400">
              Prediction Channels
            </h4>
            <div className="grid grid-cols-2 gap-8 w-full">
              <FormField
                control={form.control}
                name="prediction.actions"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <Label>Prediction Actions</Label>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ''}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-muted border-transparent shadow-none">
                          <SelectValue placeholder="Select Action Channel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {channels.map((channel) => (
                          <SelectItem key={channel.id} value={channel.id}>
                            {channel.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select channel for Prediction Actions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prediction.logs"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <Label>Prediction Logs</Label>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ''}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-muted border-transparent shadow-none">
                          <SelectValue placeholder="Select Logs Channel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {channels.map((channel) => (
                          <SelectItem key={channel.id} value={channel.id}>
                            {channel.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select channel for Prediction Logs
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          <SaveButton />
        </form>
      </Form>
    </FormProvider>
  )
}

export default ChannelsForm
