export const dynamic = 'force-dynamic'
import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import {
  ChevronRight, GraduationCap, Settings, Zap, ShoppingCart, DollarSign,
  CheckCircle, Clock, BookOpen,
} from 'lucide-react'

const PATHS = [
  {
    role: 'admin',
    label: 'Administrator',
    icon: Settings,
    color: 'text-blue-400',
    iconBg: 'bg-blue-600/15 border-blue-600/25',
    accent: 'border-blue-600/20',
    totalTime: '~4.5 hrs',
    modules: [
      { name: 'Platform Setup', time: '35 min', desc: 'Install and configure NovaPOS from scratch.' },
      { name: 'User Management', time: '25 min', desc: 'Create users, assign roles, and manage access.' },
      { name: 'Store Configuration', time: '30 min', desc: 'Stores, registers, tender types, and receipts.' },
      { name: 'Finance Configuration', time: '40 min', desc: 'Chart of accounts, posting profiles, tax setup.' },
      { name: 'Reporting Setup', time: '25 min', desc: 'Report layouts, scheduled exports, and KPIs.' },
      { name: 'Integrations', time: '35 min', desc: 'API keys, e-commerce connectors, payment gateways.' },
      { name: 'Security & Audit', time: '20 min', desc: 'Audit logs, IP restrictions, and session policies.' },
      { name: 'Advanced Admin', time: '30 min', desc: 'Data archival, backup, and multi-store hierarchy.' },
    ],
  },
  {
    role: 'manager',
    label: 'Store Manager',
    icon: Zap,
    color: 'text-violet-400',
    iconBg: 'bg-violet-600/15 border-violet-600/25',
    accent: 'border-violet-600/20',
    totalTime: '~3 hrs',
    modules: [
      { name: 'Daily Operations', time: '30 min', desc: 'Opening procedures, shift oversight, and EOD.' },
      { name: 'Inventory Management', time: '35 min', desc: 'Stock counts, transfers, and reorder management.' },
      { name: 'Staff Management', time: '25 min', desc: 'Scheduling, performance tracking, and time clock.' },
      { name: 'Sales Reports', time: '25 min', desc: 'Reading and acting on daily and weekly reports.' },
      { name: 'Customer Service', time: '20 min', desc: 'Handling escalations, refunds, and loyalty issues.' },
      { name: 'Promotions', time: '25 min', desc: 'Creating and managing price rules and campaigns.' },
    ],
  },
  {
    role: 'cashier',
    label: 'Cashier',
    icon: ShoppingCart,
    color: 'text-emerald-400',
    iconBg: 'bg-emerald-600/15 border-emerald-600/25',
    accent: 'border-emerald-600/20',
    totalTime: '~1.5 hrs',
    modules: [
      { name: 'POS Basics', time: '25 min', desc: 'Terminal interface, opening a shift, and product search.' },
      { name: 'Processing Transactions', time: '25 min', desc: 'Sales, discounts, payment methods, and receipts.' },
      { name: 'Returns & Exchanges', time: '20 min', desc: 'Processing returns, exchanges, and refunds.' },
      { name: 'End of Day', time: '20 min', desc: 'Cash count, shift close, and variance handling.' },
    ],
  },
  {
    role: 'accountant',
    label: 'Accountant',
    icon: DollarSign,
    color: 'text-amber-400',
    iconBg: 'bg-amber-600/15 border-amber-600/25',
    accent: 'border-amber-600/20',
    totalTime: '~3.5 hrs',
    modules: [
      { name: 'Chart of Accounts', time: '30 min', desc: 'Creating and maintaining your GL structure.' },
      { name: 'AP / AR Workflows', time: '45 min', desc: 'Invoice matching, payment runs, and collections.' },
      { name: 'Bank Reconciliation', time: '35 min', desc: 'Statement matching and outstanding items.' },
      { name: 'Period Close', time: '35 min', desc: 'Month-end checklist, accruals, and posting.' },
      { name: 'Financial Reports', time: '30 min', desc: 'P&L, balance sheet, cash flow, and custom reports.' },
    ],
  },
]

export default function TrainingIndexPage() {
  return (
    <>
      <TopBar title="Training Paths" />
      <main className="flex-1 p-6 overflow-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6">
          <Link href="/help" className="hover:text-zinc-300 transition-colors">Help Center</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-400">Training Paths</span>
        </nav>

        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-violet-600/15 border border-violet-600/25">
              <GraduationCap className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">NovaPOS Training Paths</h1>
              <p className="text-sm text-zinc-500 mt-0.5">Role-based learning paths with structured modules and real-world workflows.</p>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-5 pt-5 border-t border-zinc-800 flex-wrap">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-zinc-400" />
              <span className="text-sm font-bold text-zinc-100">23</span>
              <span className="text-xs text-zinc-500">total modules</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span className="text-sm font-bold text-zinc-100">~12.5 hrs</span>
              <span className="text-xs text-zinc-500">combined content</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-zinc-500">Progress tracking via completion marks</span>
            </div>
          </div>
        </div>

        {/* Paths */}
        <div className="space-y-6">
          {PATHS.map(path => (
            <div key={path.role} className={`rounded-xl bg-zinc-900 border ${path.accent} overflow-hidden`}>
              {/* Path Header */}
              <div className="flex items-center justify-between p-5 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${path.iconBg}`}>
                    <path.icon className={`w-5 h-5 ${path.color}`} />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-zinc-100">{path.label} Path</h2>
                    <p className="text-xs text-zinc-500">{path.modules.length} modules · {path.totalTime}</p>
                  </div>
                </div>
                <Link
                  href={`/help/training/${path.role}`}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 ${path.color} transition-colors`}
                >
                  Start Path <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Module Steps */}
              <div className="p-5">
                <div className="relative">
                  {/* Connector line */}
                  <div className="absolute left-3 top-4 bottom-4 w-px bg-zinc-800" />
                  <div className="space-y-3">
                    {path.modules.map((mod, i) => (
                      <div key={mod.name} className="flex items-start gap-4 relative">
                        <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 z-10 bg-zinc-900 ${i === 0 ? `border-current ${path.color}` : 'border-zinc-700 text-zinc-600'}`}>
                          {i + 1}
                        </div>
                        <div className="flex-1 pt-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-zinc-200">{mod.name}</span>
                            <span className="text-xs text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded-full">{mod.time}</span>
                          </div>
                          <p className="text-xs text-zinc-500 mt-0.5">{mod.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>
    </>
  )
}
