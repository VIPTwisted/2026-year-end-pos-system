'use client'
import { Bell, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function TopBar({ title }: { title: string }) {
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
      <Button variant="ghost" size="icon">
        <User className="w-4 h-4" />
      </Button>
    </header>
  )
}
