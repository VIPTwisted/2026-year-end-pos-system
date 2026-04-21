'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, ShoppingCart, Package, Users, Warehouse,
  Building2, HeadphonesIcon, DollarSign, Megaphone, Wrench,
  Settings, ChevronRight, Store, Map,
  CreditCard, CalendarDays, CheckSquare, GraduationCap,
  ArrowDownCircle, PieChart, FileText, Sliders, BarChart3,
  Target, Percent, Banknote, Boxes,
} from 'lucide-react'

const NAV = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'POS Terminal', href: '/pos', icon: ShoppingCart },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Inventory', href: '/inventory', icon: Warehouse },
  { label: 'Warehouse', href: '/warehouse', icon: Warehouse },
  { label: 'Customers', href: '/customers', icon: Users },
  { label: 'Orders', href: '/orders', icon: ShoppingCart },
  { label: 'Purchasing', href: '/purchasing', icon: Building2 },
  { label: 'Customer Service', href: '/service', icon: HeadphonesIcon },
  { label: 'Finance', href: '/finance', icon: DollarSign },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'GL Journal', href: '/finance/gl', icon: FileText },
  { label: 'Posting Profiles', href: '/finance/posting-profiles', icon: Sliders },
  { label: 'Fixed Assets', href: '/finance/fixed-assets', icon: Boxes },
  { label: 'Tax Management', href: '/finance/tax', icon: Percent },
  { label: 'Budget', href: '/budget', icon: PieChart },
  { label: 'Budget Plans', href: '/budget/plans', icon: Target },
  { label: 'AR / Receivables', href: '/ar', icon: ArrowDownCircle },
  { label: 'Vendors / AP', href: '/vendors', icon: Building2 },
  { label: 'Bank Accounts', href: '/bank', icon: CreditCard },
  { label: 'Fiscal Calendar', href: '/fiscal', icon: CalendarDays },
  { label: 'Year-End Close', href: '/year-end', icon: CheckSquare },
  { label: 'BC Training', href: '/training', icon: GraduationCap },
  { label: 'Marketing', href: '/marketing', icon: Megaphone },
  { label: 'Field Service', href: '/field-service', icon: Wrench },
  { label: 'HR & Shifts', href: '/hr', icon: Users },
  { label: 'Payroll', href: '/hr/payroll', icon: Banknote },
  { label: 'Stores / HQ', href: '/stores', icon: Store },
  { label: 'D365 Map', href: '/d365-map', icon: Map },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const path = usePathname()
  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">P</div>
          <div>
            <div className="text-sm font-bold text-zinc-100">[PLATFORM SUITE]</div>
            <div className="text-xs text-zinc-500">Enterprise Edition</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = path === href || (href !== '/' && path.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm mb-1 transition-colors group',
                active
                  ? 'bg-blue-600/20 text-blue-400 font-medium'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3" />}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-zinc-800">
        <div className="text-xs text-zinc-600">Year-End Final Project 2026</div>
        <div className="text-xs text-zinc-700">VIPTwisted x Claude</div>
      </div>
    </aside>
  )
}
