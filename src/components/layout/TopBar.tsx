'use client'
import Link from 'next/link'
import { Bell, Search, User, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ReactNode } from 'react'

interface BreadcrumbItem {
  label: string
  href: string
}

interface TopBarProps {
  title: string
  breadcrumb?: BreadcrumbItem[]
  actions?: ReactNode
}

export function TopBar({ title, breadcrumb, actions }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10" style={{ background: '#0d0e24', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
      {breadcrumb && breadcrumb.length > 0 && (
        <div className="px-6 pt-2 flex items-center gap-1.5">
          {breadcrumb.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <Link href={item.href} className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">
                {item.label}
              </Link>
              <ChevronRight className="w-3 h-3 text-zinc-700" />
            </span>
          ))}
          <span className="text-[11px] text-zinc-400">{title}</span>
        </div>
      )}
      <div className="h-12 flex items-center px-6 gap-4">
        <h1 className="text-base font-semibold text-zinc-100 mr-auto">{title}</h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
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
      </div>
    </header>
  )
}
