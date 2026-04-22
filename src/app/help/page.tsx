import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import {
  HelpCircle, GraduationCap, BookOpen, FileText,
  ShoppingCart, DollarSign, Package, Users,
  Building2, BarChart3, Settings, Keyboard,
  Shield, Truck, CreditCard, RefreshCw,
  ChevronRight, Star, Zap, Globe,
} from 'lucide-react'
import { HelpSearch } from './HelpSearch'

const FEATURE_TILES = [
  {
    title: 'Getting Started',
    description: 'New to NovaPOS? Start here for system setup, first login, and the quick-start checklist.',
    href: '/help/getting-started',
    icon: Star,
    color: 'text-blue-400',
    bg: 'bg-blue-600/10 border-blue-600/20',
  },
  {
    title: 'Training Paths',
    description: 'Role-based learning paths for Admins, Managers, Cashiers, and Accountants.',
    href: '/help/training',
    icon: GraduationCap,
    color: 'text-violet-400',
    bg: 'bg-violet-600/10 border-violet-600/20',
  },
  {
    title: 'Module Guides',
    description: 'Deep-dive documentation for every NovaPOS module from Finance to Commerce.',
    href: '/help/modules',
    icon: BookOpen,
    color: 'text-emerald-400',
    bg: 'bg-emerald-600/10 border-emerald-600/20',
  },
  {
    title: 'Release Notes',
    description: "What's new in each NovaPOS version — features, improvements, and fixes.",
    href: '/help/release-notes',
    icon: FileText,
    color: 'text-amber-400',
    bg: 'bg-amber-600/10 border-amber-600/20',
  },
]

const QUICK_LINKS = [
  { title: 'POS Terminal Guide', href: '/help/modules/pos', icon: ShoppingCart, desc: 'Operating the register' },
  { title: 'Chart of Accounts', href: '/help/modules/finance', icon: DollarSign, desc: 'GL & account setup' },
  { title: 'Inventory Management', href: '/help/modules/inventory', icon: Package, desc: 'Stock & item cards' },
  { title: 'Customer Records', href: '/help/modules/customers', icon: Users, desc: 'CRM & loyalty' },
  { title: 'Vendor & AP', href: '/help/modules/purchasing', icon: Building2, desc: 'Payables & POs' },
  { title: 'Sales & Orders', href: '/help/modules/sales', icon: BarChart3, desc: 'Quotes to invoices' },
  { title: 'System Settings', href: '/settings', icon: Settings, desc: 'Stores & preferences' },
  { title: 'Keyboard Shortcuts', href: '/help/shortcuts', icon: Keyboard, desc: 'Speed up your work' },
  { title: 'Payment Types', href: '/help/modules/pos', icon: CreditCard, desc: 'Cash, card, split' },
  { title: 'Shipping Methods', href: '/settings/shipping', icon: Truck, desc: 'Carriers & rates' },
  { title: 'User Security', href: '/help/training/admin', icon: Shield, desc: 'Roles & permissions' },
  { title: 'Period Close', href: '/help/modules/finance', icon: RefreshCw, desc: 'Month & year-end' },
]

const ROLES = [
  {
    role: 'Admin',
    href: '/help/training/admin',
    icon: Settings,
    color: 'text-blue-400',
    border: 'border-blue-600/20',
    bg: 'bg-blue-600/10',
    desc: 'Full platform configuration, user management, security, and advanced workflows.',
    modules: 8,
  },
  {
    role: 'Manager',
    href: '/help/training/manager',
    icon: Zap,
    color: 'text-violet-400',
    border: 'border-violet-600/20',
    bg: 'bg-violet-600/10',
    desc: 'Daily operations, inventory oversight, staff management, and sales reporting.',
    modules: 6,
  },
  {
    role: 'Cashier',
    href: '/help/training/cashier',
    icon: ShoppingCart,
    color: 'text-emerald-400',
    border: 'border-emerald-600/20',
    bg: 'bg-emerald-600/10',
    desc: 'POS terminal operation, transaction processing, returns, and end-of-day duties.',
    modules: 4,
  },
  {
    role: 'Accountant',
    href: '/help/training/accountant',
    icon: Globe,
    color: 'text-amber-400',
    border: 'border-amber-600/20',
    bg: 'bg-amber-600/10',
    desc: 'Chart of accounts, AP/AR workflows, bank reconciliation, and period close.',
    modules: 5,
  },
]

export default function HelpPage() {
  return (
    <>
      <TopBar title="Help Center" />
      <main className="flex-1 p-6 overflow-auto">

        {/* Hero */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/15 border border-blue-600/25 mb-5">
            <HelpCircle className="w-7 h-7 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-3">NovaPOS Help Center</h1>
          <p className="text-base text-zinc-400 leading-relaxed">
            Find answers, learn workflows, and master every module of the NovaPOS Enterprise Platform.
          </p>

          {/* Search */}
          <div className="mt-7">
            <HelpSearch />
          </div>
        </div>

        {/* Feature Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {FEATURE_TILES.map(tile => (
            <Link
              key={tile.href}
              href={tile.href}
              className={`group rounded-xl border p-5 transition-all hover:scale-[1.01] hover:shadow-lg hover:shadow-black/20 ${tile.bg}`}
            >
              <tile.icon className={`w-6 h-6 ${tile.color} mb-3`} />
              <h3 className="font-semibold text-zinc-100 mb-1.5 group-hover:text-white">{tile.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{tile.description}</p>
              <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${tile.color}`}>
                Explore <ChevronRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mb-10">
          <h2 className="text-base font-semibold text-zinc-100 mb-4">Common Help Topics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {QUICK_LINKS.map(link => (
              <Link
                key={link.href + link.title}
                href={link.href}
                className="flex items-start gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center shrink-0 transition-colors">
                  <link.icon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" />
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-200 group-hover:text-zinc-100 leading-tight">{link.title}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{link.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Browse by Role */}
        <div>
          <h2 className="text-base font-semibold text-zinc-100 mb-4">Browse by Role</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROLES.map(r => (
              <Link
                key={r.role}
                href={r.href}
                className={`group rounded-xl border p-5 bg-zinc-900 ${r.border} hover:border-opacity-60 transition-all hover:shadow-md`}
              >
                <div className={`w-10 h-10 rounded-lg ${r.bg} flex items-center justify-center mb-3`}>
                  <r.icon className={`w-5 h-5 ${r.color}`} />
                </div>
                <div className="flex items-baseline gap-2 mb-1.5">
                  <h3 className="font-semibold text-zinc-100">{r.role}</h3>
                  <span className={`text-xs ${r.color} font-medium`}>{r.modules} modules</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed mb-3">{r.desc}</p>
                <div className={`flex items-center gap-1 text-xs font-medium ${r.color}`}>
                  Start training <ChevronRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>

      </main>
    </>
  )
}
