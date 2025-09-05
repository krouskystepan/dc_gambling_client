import CasinoSettingsForm from '@/components/forms/CasinoSettingsForm'
import ChannelsForm from '@/components/forms/ChannelsForm'
import ManagerRoleForm from '@/components/forms/ManagerRoleForm'
import VipSettingsForm from '@/components/forms/VipSettingsForm'
import UsersList from '@/components/lists/UsersList'

interface GuildPageProps {
  params: Promise<{ guildId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const GuildPage = async ({ params, searchParams }: GuildPageProps) => {
  const { guildId } = await params
  const query = await searchParams
  const section = query?.s as string | undefined

  const renderSection = () => {
    switch (section) {
      case 'channels':
        return <ChannelsForm guildId={guildId} />
      case 'casinoSettings':
        return <CasinoSettingsForm guildId={guildId} />
      case 'vipSettings':
        return <VipSettingsForm guildId={guildId} />
      case 'managerRoleId':
        return <ManagerRoleForm guildId={guildId} />
      case 'users':
        return <UsersList guildId={guildId} />
      case 'vips':
        return 'Coming soon...'
      case 'predictions':
        return 'Coming soon...'
      default:
        return (
          <div>
            <h3 className="text-3xl font-bold">GUILD ID: {guildId}</h3>
            <p>Coming soon...</p>
          </div>
        )
    }
  }

  return renderSection()
}

export default GuildPage
