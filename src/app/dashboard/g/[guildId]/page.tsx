interface GuildPageProps {
  params: Promise<{ guildId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const GuildPage = async ({ params, searchParams }: GuildPageProps) => {
  const { guildId } = await params
  const query = await searchParams
  const section = query?.section as string | undefined

  const renderSection = () => {
    switch (section) {
      case 'atmChannelIds':
        return 'atm'
      case 'adminChannelIds':
        return 'admin'
      case 'casinoChannelIds':
        return 'casino channels'
      case 'predictionChannelIds':
        return 'prediction'
      case 'casinoSettings':
        return 'casino games'
      case 'vipSettings':
        return 'vip'
      case 'managerRoleId':
        return 'managerRole'
      default:
        return (
          <h3 className="text-4xl font-bold mb-6 text-center">
            GUILD ID: {guildId}
          </h3>
        )
    }
  }

  return renderSection()
}

export default GuildPage
