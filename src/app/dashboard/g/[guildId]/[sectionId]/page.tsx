import BonusesForm from '@/components/forms/BonusesForm'
import CasinoSettingsForm from '@/components/forms/CasinoSettingsForm'
import ChannelsForm from '@/components/forms/ChannelsForm'
import ManagerRoleForm from '@/components/forms/ManagerRoleForm'
import VipSettingsForm from '@/components/forms/VipSettingsForm'
import TransactionsSection from '@/components/sections/TransactionsSection'
import UsersSection from '@/components/sections/UsersSection'

interface SectionPageProps {
  params: Promise<{ guildId: string; sectionId: string }>
  searchParams?: Promise<{
    page?: string
    limit?: string
    search?: string
    adminSearch?: string
    filterType?: string
    filterSource?: string
  }>
}

const SectionPage = async ({ params, searchParams }: SectionPageProps) => {
  const { guildId, sectionId } = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}

  const renderSection = () => {
    switch (sectionId) {
      case 'transactions':
        return (
          <TransactionsSection
            guildId={guildId}
            searchParams={resolvedSearchParams}
          />
        )
      case 'channels':
        return <ChannelsForm guildId={guildId} />
      case 'casinoSettings':
        return <CasinoSettingsForm guildId={guildId} />
      case 'vipSettings':
        return <VipSettingsForm guildId={guildId} />
      case 'managerRoleId':
        return <ManagerRoleForm guildId={guildId} />
      case 'users':
        return <UsersSection guildId={guildId} />
      case 'bonusSettings':
        return <BonusesForm guildId={guildId} />
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

export default SectionPage
