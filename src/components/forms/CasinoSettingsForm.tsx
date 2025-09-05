'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, FormProvider, Path } from 'react-hook-form'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import { Form, FormField, FormItem, FormControl, FormMessage } from '../ui/form'
import { Label } from '../ui/label'
import SaveButton from '../SaveButton'
import LoadingScreen from '../states/Loading'
import { toast } from 'sonner'
import { getCasinoSettings, saveCasinoSettings } from '@/actions/database'
import { casinoSettingsSchema } from '@/types/schemas'
import { Input } from '../ui/input'
import defaultCasinoSettings, {
  getReadableName,
  readableGamesNames,
  readableGameValueNames,
} from '@/lib/defaultConfig'
import { calculateRTP, CasinoSettings } from '@/lib/utils'
import { RotateCw } from 'lucide-react'
import { Button } from '../ui/button'

type CasinoSettingsFormValues = z.infer<typeof casinoSettingsSchema>

const CasinoSettingsForm = ({ guildId }: { guildId: string }) => {
  const form = useForm<CasinoSettingsFormValues>({
    resolver: zodResolver(casinoSettingsSchema),
    defaultValues: defaultCasinoSettings,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getCasinoSettings(guildId)
        form.reset(settings || defaultCasinoSettings)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [guildId, form])

  const onSubmit = async (values: CasinoSettingsFormValues) => {
    const toastId = toast.loading('Saving...')
    try {
      await saveCasinoSettings(guildId, values)
      toast.success('Casino settings saved!', { id: toastId })
    } catch (err) {
      console.error(err)
      toast.error('Failed to save casino settings', { id: toastId })
    }
  }

  if (loading) return <LoadingScreen />

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 w-full"
        >
          {Object.entries(form.getValues()).map(([game, settings]) => (
            <section key={game} className="flex flex-col gap-3">
              <h4 className="text-xl font-semibold text-yellow-400">
                {getReadableName(game, readableGamesNames)}{' '}
                <span className="text-xs text-gray-400">{`(RTP: ${Number(
                  calculateRTP(game as keyof CasinoSettings, settings)
                ).toFixed(2)})`}</span>
              </h4>

              <div className="grid grid-cols-4 gap-3">
                {Object.entries(settings as Record<string, unknown>).map(
                  ([key, value]) => {
                    if (typeof value === 'number') {
                      return (
                        <FormField
                          key={key}
                          control={form.control}
                          name={
                            `${game}.${key}` as Path<CasinoSettingsFormValues>
                          }
                          render={({ field }) => (
                            <FormItem>
                              <Label>
                                {getReadableName(key, readableGameValueNames)}
                              </Label>
                              <FormControl>
                                <div>
                                  <div className="flex rounded-md shadow-xs">
                                    <Input
                                      className="bg-muted rounded-r-none border-transparent shadow-none"
                                      type="text"
                                      value={(field.value as number) ?? 0}
                                      onChange={(e) => {
                                        const value = e.target.value.replace(
                                          /\D/g,
                                          ''
                                        )
                                        field.onChange(Number(value))
                                      }}
                                      onBlur={field.onBlur}
                                      name={field.name}
                                      ref={field.ref}
                                    />
                                    <Button
                                      className="bg-muted text-destructive/60 inline-flex w-9 items-center rounded-none justify-center rounded-e-md text-sm outline-none focus:z-10 hover:text-destructive duration-200 transition-colors cursor-pointer"
                                      variant={'ghost'}
                                      type="reset"
                                      onClick={() => {
                                        const defaultValue = (
                                          defaultCasinoSettings[
                                            game as keyof CasinoSettings
                                          ] as Record<
                                            string,
                                            number | Record<string, number>
                                          >
                                        )[key] as number
                                        field.onChange(defaultValue)
                                      }}
                                    >
                                      <RotateCw size={16} aria-hidden="true" />
                                    </Button>
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )
                    }
                    return null
                  }
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {game === 'slots' &&
                  ['winMultipliers', 'symbolWeights'].map((nestedKey) => {
                    const nestedObj = (settings as never)[nestedKey] as Record<
                      string,
                      number
                    >
                    return (
                      <div
                        key={nestedKey}
                        className="grid grid-cols-2 gap-3 mt-2"
                      >
                        {Object.entries(nestedObj).map(([symbol]) => (
                          <FormField
                            key={symbol}
                            control={form.control}
                            name={
                              `${game}.${nestedKey}.${symbol}` as Path<CasinoSettingsFormValues>
                            }
                            render={({ field }) => (
                              <FormItem>
                                <Label>
                                  {nestedKey === 'winMultipliers'
                                    ? `Payout for ${symbol}`
                                    : `Weight for ${symbol}`}
                                </Label>
                                <FormControl>
                                  <div>
                                    <div className="flex rounded-md shadow-xs">
                                      <Input
                                        className="bg-muted rounded-r-none border-transparent shadow-none"
                                        type="text"
                                        value={(field.value as number) ?? 0}
                                        onChange={(e) => {
                                          const value = e.target.value.replace(
                                            /\D/g,
                                            ''
                                          )
                                          field.onChange(Number(value))
                                        }}
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        ref={field.ref}
                                      />
                                      <Button
                                        className="bg-muted text-destructive/60 inline-flex w-9 items-center justify-center rounded-none rounded-e-md text-sm outline-none focus:z-10 hover:text-destructive duration-200 transition-colors cursor-pointer"
                                        variant={'ghost'}
                                      >
                                        <RotateCw
                                          size={16}
                                          aria-hidden="true"
                                        />
                                      </Button>
                                    </div>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    )
                  })}
              </div>
            </section>
          ))}

          <SaveButton />
        </form>
      </Form>
    </FormProvider>
  )
}

export default CasinoSettingsForm
