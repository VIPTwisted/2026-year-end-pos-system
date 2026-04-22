import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { ChevronRight, BookOpen, DollarSign, ShoppingCart, Package, Users, BarChart3, Building2, GraduationCap, Factory, Globe, TrendingUp } from 'lucide-react'

const MODULES = [
  {
    id: 'finance',
    name: 'Finance',
    icon: DollarSign,
    color: 'text-emerald-400',
    bg: 'bg-emerald-600/10 border-emerald-600/20',
    desc: 'Chart of accounts, journal entries, bank reconciliation, period close, and budget management.',
    articles: 12,
    topics: ['Chart of Accounts', 'Journal Entries', 'Bank Reconciliation', 'Period Close', 'Budgets'],
  },
  {
    id: 'pos',
    name: 'POS Terminal',
    icon: ShoppingCart,
    color: 'text-blue-400',
    bg: 'bg-blue-600/10 border-blue-600/20',
    desc: 'POS terminal operations, shift management, payment types, returns, and suspended transactions.',
    articles: 9,
    topics: ['POS Interface', 'Shift Management', 'Payment Types', 'Returns', 'Suspend & Recall'],
  },
  {
    id: 'inventory',
    name: 'Inventory',
    icon: Package,
    color: 'text-violet-400',
    bg: 'bg-violet-600/10 border-violet-600/20',
    desc: 'Item cards, stock counts, inter-location transfers, purchase orders, and reorder automation.',
    articles: 11,
    topics: ['Item Cards', 'Stock Counts', 'Transfers', 'Purchase Orders', 'Reorder Points'],
  },
  {
    id: 'customers',
    name: 'Customers',
    icon: Users,
    color: 'text-cyan-400',
    bg: 'bg-cyan-600/10 border-cyan-600/20',
    desc: 'Customer records, loyalty program, AR invoicing, credit management, and customer orders.',
    articles: 8,
    topics: ['Customer Card', 'Loyalty Program', 'AR Invoices', 'Customer Orders', 'Credit Limits'],
  },
  {
    id: 'sales',
    name: 'Sales',
    icon: TrendingUp,
    color: 'text-amber-400',
    bg: 'bg-amber-600/10 border-amber-600/20',
    desc: 'Sales quotes, orders, invoices, returns, and credit memo processing.',
    articles: 10,
    topics: ['Sales Quotes', 'Sales Orders', 'Invoices', 'Returns', 'Credit Memos'],
  },
  {
    id: 'purchasing',
    name: 'Purchasing',
    icon: Building2,
    color: 'text-orange-400',
    bg: 'bg-orange-600/10 border-orange-600/20',
    desc: 'Vendor management, purchase order workflow, goods receiving, AP invoicing, and payment runs.',
    articles: 9,
    topics: ['Vendor Cards', 'Purchase Orders', 'Receiving', 'AP Invoices', 'Payment Runs'],
  },
  {
    id: 'hr',
    name: 'HR & Payroll',
    icon: GraduationCap,
    color: 'text-pink-400',
    bg: 'bg-pink-600/10 border-pink-600/20',
    desc: 'Employee records, departments, time clock, attendance, and payroll processing.',
    articles: 7,
    topics: ['Employee Records', 'Departments', 'Time Clock', 'Payroll', 'Deductions'],
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    icon: Factory,
    color: 'text-yellow-400',
    bg: 'bg-yellow-600/10 border-yellow-600/20',
    desc: 'Bills of materials, production orders, work centers, capacity planning, and output posting.',
    articles: 8,
    topics: ['Bills of Materials', 'Production Orders', 'Work Centers', 'Capacity', 'Output'],
  },
  {
    id: 'commerce',
    name: 'Commerce',
    icon: Globe,
    color: 'text-indigo-400',
    bg: 'bg-indigo-600/10 border-indigo-600/20',
    desc: 'E-commerce channels, gift cards, promotional campaigns, shipping integration, and multi-channel sync.',
    articles: 8,
    topics: ['E-Commerce Channels', 'Gift Cards', 'Promotions', 'Shipping', 'Multi-Channel'],
  },
  {
    id: 'reporting',
    name: 'Reporting',
    icon: BarChart3,
    color: 'text-teal-400',
    bg: 'bg-teal-600/10 border-teal-600/20',
    desc: 'Financial statements, sales analytics, inventory reports, and the custom report designer.',
    articles: 10,
    topics: ['Financial Reports', 'Sales Analytics', 'Inventory Reports', 'Custom Reports', 'Exports'],
  },
]

export default function ModulesIndexPage() {
  return (
    <>
      <TopBar title="Module Guides" />
      <main className="flex-1 p-6 overflow-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6">
          <Link href="/help" className="hover:text-zinc-300 transition-colors">Help Center</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-400">Module Guides</span>
        </nav>

        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-600/15 border border-emerald-600/25">
              <BookOpen className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">Module Documentation</h1>
              <p className="text-sm text-zinc-500 mt-0.5">
                Comprehensive guides for every NovaPOS module — {MODULES.reduce((s, m) => s + m.articles, 0)} articles across {MODULES.length} modules.
              </p>
            </div>
          </div>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map(mod => (
            <Link
              key={mod.id}
              href={`/help/modules/${mod.id}`}
              className="group rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all overflow-hidden hover:shadow-lg hover:shadow-black/20"
            >
              <div className="p-5">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border mb-4 ${mod.bg}`}>
                  <mod.icon className={`w-5 h-5 ${mod.color}`} />
                </div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white">{mod.name}</h3>
                  <span className={`text-xs ${mod.color} font-medium`}>{mod.articles} articles</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">{mod.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {mod.topics.map(t => (
                    <span key={t} className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
              <div className={`px-5 py-3 border-t border-zinc-800 flex items-center justify-between ${mod.bg} bg-opacity-50`}>
                <span className={`text-xs font-medium ${mod.color}`}>View documentation</span>
                <ChevronRight className={`w-3.5 h-3.5 ${mod.color} group-hover:translate-x-0.5 transition-transform`} />
              </div>
            </Link>
          ))}
        </div>

      </main>
    </>
  )
}
