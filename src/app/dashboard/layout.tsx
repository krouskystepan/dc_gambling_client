import DashboardSidebar from '@/components/DashboardSidebar'

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-black via-[#121212] to-[#0a0a0a] overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1">{children}</div>
    </div>
  )
}

export default DashboardLayout
