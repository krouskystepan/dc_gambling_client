'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, FormProvider } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { Form, FormField, FormItem, FormControl, FormMessage } from '../ui/form'
import { Label } from '../ui/label'
import SaveButton from '../SaveButton'
import LoadingScreen from '../states/Loading'
import { toast } from 'sonner'
import { IGuildRole, IGuildChannel, TVipSettingsValues } from '@/types/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Input } from '../ui/input'
import { vipSettingsFormSchema } from '@/types/schemas'
import {
  getVipSettings,
  saveVipSettings,
} from '@/actions/database/vipSettings.action'
import { getGuildCategories } from '@/actions/discord/category.action'
import { getGuildRoles } from '@/actions/discord/role.action'

const VipSettingsForm = ({ guildId }: { guildId: string }) => {
  const form = useForm<TVipSettingsValues>({
    resolver: zodResolver(vipSettingsFormSchema),
    defaultValues: {
      roleId: '',
      categoryId: '',
      pricePerDay: 0,
      pricePerCreate: 0,
    },
  })

  const [roles, setRoles] = useState<IGuildRole[]>([])
  const [categories, setCategories] = useState<IGuildChannel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [guildRoles, guildCategories, vipConfig] = await Promise.all([
          getGuildRoles(guildId),
          getGuildCategories(guildId),
          getVipSettings(guildId),
        ])

        setRoles(guildRoles)
        setCategories(guildCategories)

        form.reset({
          roleId: vipConfig?.roleId ?? '',
          categoryId: vipConfig?.categoryId ?? '',
          pricePerDay: vipConfig?.pricePerDay ?? 0,
          pricePerCreate: vipConfig?.pricePerCreate ?? 0,
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [guildId, form])

  const onSubmit = async (values: TVipSettingsValues) => {
    const toastId = toast.loading('Saving VIP settings...')
    try {
      await saveVipSettings(guildId, values)
      toast.success('VIP settings saved!', { id: toastId })
    } catch (err) {
      console.error(err)
      toast.error('Failed to save VIP settings', { id: toastId })
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
          <h4 className="text-xl font-semibold text-yellow-400">
            Channels and Categories
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <Label>VIP Role</Label>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ''}
                    >
                      <SelectTrigger className="bg-muted border-transparent shadow-none">
                        <SelectValue placeholder="Select VIP Role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => {
                          const hexColor = `#${role.color
                            .toString(16)
                            .padStart(6, '0')}`
                          return (
                            <SelectItem key={role.id} value={role.id}>
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: hexColor }}
                                />
                                <span>{role.name}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <Label>VIP Category</Label>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ''}
                    >
                      <SelectTrigger className="bg-muted border-transparent shadow-none">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <h4 className="text-xl font-semibold text-yellow-400">Prices</h4>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="pricePerDay"
              render={({ field }) => (
                <FormItem>
                  <Label>Price per Day</Label>
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
              name="pricePerCreate"
              render={({ field }) => (
                <FormItem>
                  <Label>Price per Create</Label>
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
          </div>

          <SaveButton />
        </form>
      </Form>
    </FormProvider>
  )
}

export default VipSettingsForm
