'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, FormProvider, Path } from 'react-hook-form'
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
import { calculateRTP } from '@/lib/utils'
import { RotateCw, TriangleAlert } from 'lucide-react'
import { Button } from '../ui/button'
import { CasinoSettingsValues } from '@/types/types'

type DeepNumberToString<T> = T extends number
  ? string
  : T extends Array<infer U>
  ? DeepNumberToString<U>[]
  : T extends object
  ? { [K in keyof T]: DeepNumberToString<T[K]> }
  : T

function numbersToStrings<T>(obj: T): DeepNumberToString<T> {
  if (typeof obj === 'number') {
    return obj.toString() as DeepNumberToString<T>
  }

  if (Array.isArray(obj)) {
    return obj.map(numbersToStrings) as DeepNumberToString<T>
  }

  if (obj !== null && typeof obj === 'object') {
    const result: Partial<{ [K in keyof T]: DeepNumberToString<T[K]> }> = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = numbersToStrings(obj[key])
      }
    }
    return result as DeepNumberToString<T>
  }

  return obj as DeepNumberToString<T>
}

type NestedGameKeys = 'winMultipliers' | 'symbolWeights'

interface NestedRecord {
  [key: string]: number
}

const NestedFields = ({
  game,
  settings,
  nestedKeys,
  form,
}: {
  game: keyof CasinoSettingsValues
  settings: Record<string, unknown>
  nestedKeys: NestedGameKeys[]
  form: ReturnType<typeof useForm<CasinoSettingsValues>>
}) => {
  return (
    <div className={`grid grid-cols-1 gap-3`}>
      {nestedKeys.map((nestedKey) => {
        const nestedObj = settings[nestedKey] as NestedRecord
        return (
          <div key={nestedKey} className={`grid grid-cols-5 gap-3 mt-2`}>
            {Object.entries(nestedObj).map(([symbol]) => (
              <FormField
                key={symbol}
                control={form.control}
                name={
                  `${game}.${nestedKey}.${symbol}` as Path<CasinoSettingsValues>
                }
                render={({ field }) => (
                  <FormItem>
                    <Label>
                      {nestedKey === 'winMultipliers'
                        ? `Payout for ${symbol}`
                        : `Weight for ${symbol}`}
                    </Label>
                    <FormControl>
                      <div className="flex rounded-md shadow-xs">
                        <Input
                          className="bg-muted rounded-r-none border-transparent shadow-none"
                          type="text"
                          value={field.value.toString()}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.]/g, '')
                            field.onChange(val)
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                        <Button
                          type="reset"
                          variant="ghost"
                          className="bg-muted text-destructive/60 inline-flex w-9 items-center justify-center rounded-none rounded-e-md text-sm outline-none focus:z-10 hover:text-destructive duration-200 transition-colors cursor-pointer"
                          onClick={() => {
                            const gameDefaults = defaultCasinoSettings[
                              game as keyof CasinoSettingsValues
                            ] as unknown

                            const defaultValue = (
                              gameDefaults as Record<string, NestedRecord>
                            )[nestedKey][symbol]

                            field.onChange(defaultValue.toString())
                          }}
                        >
                          <RotateCw size={16} aria-hidden="true" />
                        </Button>
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
  )
}

const CasinoSettingsForm = ({ guildId }: { guildId: string }) => {
  const form = useForm<CasinoSettingsValues>({
    resolver: zodResolver(casinoSettingsSchema),
    defaultValues: numbersToStrings(defaultCasinoSettings),
  })

  const [loading, setLoading] = useState(true)

  const watchedValues = form.watch()

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getCasinoSettings(guildId)
        if (settings) {
          form.reset(numbersToStrings(settings))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [guildId, form])

  const onSubmit = async (values: CasinoSettingsValues) => {
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
          {Object.entries(watchedValues).map(([game, settings]) => {
            const rtp = calculateRTP(
              game as keyof CasinoSettingsValues,
              settings
            )

            return (
              <section key={game} className="flex flex-col gap-3">
                <h4 className="text-xl font-semibold text-yellow-400">
                  {getReadableName(game, readableGamesNames)}{' '}
                  <span className={`text-xs text-gray-400 flex gap-1`}>
                    {`(RTP: ${rtp.toFixed(2)}%)`}
                    {rtp > 95 && (
                      <span className="text-red-500 flex gap-0.5">
                        <TriangleAlert size={16} /> (≥ 95%)
                      </span>
                    )}
                  </span>
                </h4>

                <div className="grid grid-cols-4 gap-3">
                  {Object.entries(settings as Record<string, unknown>).map(
                    ([key, value]) => {
                      if (
                        typeof value === 'number' ||
                        typeof value === 'string'
                      ) {
                        return (
                          <FormField
                            key={key}
                            control={form.control}
                            name={
                              `${game}.${key}` as Path<CasinoSettingsValues>
                            }
                            render={({ field }) => (
                              <FormItem>
                                <Label>
                                  {getReadableName(key, readableGameValueNames)}
                                </Label>
                                <FormControl>
                                  <div className="flex rounded-md shadow-xs">
                                    <Input
                                      className="bg-muted rounded-r-none border-transparent shadow-none"
                                      type="text"
                                      value={(field.value as string) ?? ''}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(
                                          /[^0-9.]/g,
                                          ''
                                        )
                                        field.onChange(val)
                                      }}
                                      onBlur={field.onBlur}
                                      name={field.name}
                                      ref={field.ref}
                                    />
                                    <Button
                                      type="reset"
                                      variant="ghost"
                                      className="bg-muted text-destructive/60 inline-flex w-9 items-center justify-center rounded-none rounded-e-md text-sm outline-none focus:z-10 hover:text-destructive duration-200 transition-colors cursor-pointer"
                                      onClick={() => {
                                        const defaultValue = (
                                          defaultCasinoSettings[
                                            game as keyof CasinoSettingsValues
                                          ] as Record<
                                            string,
                                            number | Record<string, number>
                                          >
                                        )[key]
                                        field.onChange(String(defaultValue))
                                      }}
                                    >
                                      <RotateCw size={16} aria-hidden="true" />
                                    </Button>
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

                {game === 'slots' && (
                  <NestedFields
                    game={game as keyof CasinoSettingsValues}
                    settings={settings as Record<string, unknown>}
                    nestedKeys={['winMultipliers', 'symbolWeights']}
                    form={form}
                  />
                )}

                {game === 'lottery' && (
                  <NestedFields
                    game={game as keyof CasinoSettingsValues}
                    settings={settings as Record<string, unknown>}
                    nestedKeys={['winMultipliers']}
                    form={form}
                  />
                )}
              </section>
            )
          })}

          <SaveButton />
        </form>
      </Form>
    </FormProvider>
  )
}

export default CasinoSettingsForm
