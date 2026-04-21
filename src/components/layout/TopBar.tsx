'use client'
import { Bell, Search, User, LogOut, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

const ROLE_VARIANT: Record<string, 'success' | 'warning' | 'default' | 'secondary'> = {
  admin: 'success',
  manager: 'warning',
  accountant: 'default',
  cashier: 'secondary',
}

export function TopBar({ title }: { title: string }) {
  const { data: session } = useSession()
  const [showUser, setShowUser] = useState(false)
  const role = (session?.user as { role?: string })?.role ?? 'cashier'

  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950 flex items-center px-6 gap-4 sticky top-0 z-10">
      <h1 className="text-base font-semibold text-zinc-100 mr-auto">{title}</h1>
      <div className="relative hidden md:block">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
        <Input className="pl-8 w-52 h-8 text-xs" placeholder="Search..." />
      </div>
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
      </Button>

      {session?.user && (
        <div className="relative">
          <button
            onClick={() => setShowUser(v => !v)}
            className="flex items-center gap-2 h-8 px-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <div className="w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-zinc-300" />
            </div>
            <span className="text-xs text-zinc-300 hidden sm:block max-w-[100px] truncate">
              {session.user.name}
            </span>
            <Badge variant={ROLE_VARIANT[role] ?? 'secondary'} className="text-[10px] px-1.5 hidden sm:flex capitalize">
              {role}
            </Badge>
            <ChevronDown className="w-3 h-3 text-zinc-500" />
          </button>

          {showUser && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 py-1">
              <div className="px-3 py-2 border-b border-zinc-800">
                <p className="text-xs font-medium text-zinc-200 truncate">{session.user.name}</p>
                <p className="text-xs text-zinc-500 truncate">{session.user.email}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
