'use client'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'

const NO_SHELL_PATHS = ['/login', '/pos']
const NO_SIDEBAR_ROLES = ['cashier']

export function AppShell({
  role,
  userName,
  children,
}: {
  role?: string | null
  userName?: string | null
  children: React.ReactNode
}) {
  const path = usePathname()
  const isPublicPath = NO_SHELL_PATHS.includes(path)
  const isCashier = role === 'cashier'
  const showSidebar = !isPublicPath && !!role && !isCashier

  return (
    <div className="flex min-h-screen">
      {showSidebar && <Sidebar />}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {children}
      </div>
    </div>
  )
}
