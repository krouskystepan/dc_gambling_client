interface GuildPageProps {
  params: Promise<{ guildId: string; sectionId: string }>
}

const GuildPage = async ({ params }: GuildPageProps) => {
  const { guildId } = await params

  return (
    <div>
      <h3 className="text-3xl font-bold">GUILD ID: {guildId}</h3>
      <p>Coming soon...</p>
    </div>
  )
}

export default GuildPage
