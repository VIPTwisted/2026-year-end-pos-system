import { TopBar } from '@/components/layout/TopBar'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  ShoppingCart,
  Package,
  Boxes,
  Warehouse,
  Users,
  ClipboardList,
  ShoppingBag,
  Headphones,
  Megaphone,
  UserCheck,
  Wrench,
  Building2,
  BarChart3,
  Receipt,
  Building,
  Landmark,
  CalendarDays,
  RefreshCw,
  BookOpen,
  Tags,
  ArrowLeftRight,
  PiggyBank,
  GraduationCap,
  Calculator,
  HardDrive,
  DollarSign,
  FileCheck,
  ExternalLink,
} from 'lucide-react'

type ModuleStatus = 'built' | 'partial' | 'planned'

interface BCModule {
  name: string
  d365: string
  route: string | null
  status: ModuleStatus
  description: string
  icon: React.ReactNode
}

const STATUS_CONFIG: Record<
  ModuleStatus,
  { label: string; badgeVariant: 'success' | 'warning' | 'secondary'; dot: string; card: string }
> = {
  built: {
    label: 'Built',
    badgeVariant: 'success',
    dot: 'bg-emerald-400',
    card: 'border-zinc-800 hover:border-emerald-800/60',
  },
  partial: {
    label: 'Partial',
    badgeVariant: 'warning',
    dot: 'bg-amber-400',
    card: 'border-zinc-800 hover:border-amber-800/60',
  },
  planned: {
    label: 'Planned',
    badgeVariant: 'secondary',
    dot: 'bg-zinc-600',
    card: 'border-zinc-800/50 opacity-70',
  },
}

const modules: BCModule[] = [
  {
    name: 'POS Terminal',
    d365: 'D365 Commerce',
    route: '/pos',
    status: 'built',
    description: 'Cart, checkout, payments, receipts, tax calculation',
    icon: <ShoppingCart className="w-5 h-5" />,
  },
  {
    name: 'Products',
    d365: 'D365 Commerce',
    route: '/products',
    status: 'built',
    description: 'Product catalog, SKU/barcode, categories, pricing',
    icon: <Package className="w-5 h-5" />,
  },
  {
    name: 'Inventory',
    d365: 'D365 Supply Chain',
    route: '/inventory',
    status: 'built',
    description: 'Multi-store stock, DDMRP reorder alerts, valuation',
    icon: <Boxes className="w-5 h-5" />,
  },
  {
    name: 'Warehouse',
    d365: 'D365 Supply Chain (WMS)',
    route: '/warehouse',
    status: 'built',
    description: '5-level bin hierarchy, movement journal, inventory states',
    icon: <Warehouse className="w-5 h-5" />,
  },
  {
    name: 'Customers',
    d365: 'D365 Sales',
    route: '/customers',
    status: 'built',
    description: 'Customer profiles, loyalty tiers, LTV, visit history',
    icon: <Users className="w-5 h-5" />,
  },
  {
    name: 'Orders',
    d365: 'D365 Commerce',
    route: '/orders',
    status: 'built',
    description: 'Order lifecycle, payment tracking, multi-store',
    icon: <ClipboardList className="w-5 h-5" />,
  },
  {
    name: 'Purchasing',
    d365: 'D365 Supply Chain',
    route: '/purchasing',
    status: 'built',
    description: 'Purchase orders, supplier management, receiving',
    icon: <ShoppingBag className="w-5 h-5" />,
  },
  {
    name: 'Customer Service',
    d365: 'D365 Customer Service',
    route: '/service',
    status: 'built',
    description: 'Case management, SLA tracking, priority routing',
    icon: <Headphones className="w-5 h-5" />,
  },
  {
    name: 'Marketing',
    d365: 'D365 Marketing',
    route: '/marketing',
    status: 'built',
    description: 'Campaign management, email/SMS/social, open rate tracking',
    icon: <Megaphone className="w-5 h-5" />,
  },
  {
    name: 'HR & Shifts',
    d365: 'D365 Human Resources',
    route: '/hr',
    status: 'built',
    description: 'Employee profiles, shift scheduling, compensation',
    icon: <UserCheck className="w-5 h-5" />,
  },
  {
    name: 'Field Service',
    d365: 'D365 Field Service',
    route: '/field-service',
    status: 'built',
    description: 'Work orders, dispatch board, technician scheduling',
    icon: <Wrench className="w-5 h-5" />,
  },
  {
    name: 'Stores / HQ',
    d365: 'Business Central',
    route: '/stores',
    status: 'built',
    description: 'Multi-store management, per-store KPIs, tax config',
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    name: 'Finance (GL)',
    d365: 'D365 Finance',
    route: '/finance',
    status: 'built',
    description: 'Chart of accounts, journal entries, GL balances',
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    name: 'AR / Receivables',
    d365: 'D365 Finance',
    route: '/ar',
    status: 'built',
    description: 'Customer invoices, AR aging, payment settlements',
    icon: <Receipt className="w-5 h-5" />,
  },
  {
    name: 'Vendors / AP',
    d365: 'Business Central',
    route: '/vendors',
    status: 'built',
    description: 'Vendor management, AP invoices, payment runs',
    icon: <Building className="w-5 h-5" />,
  },
  {
    name: 'Bank Management',
    d365: 'Business Central',
    route: '/bank',
    status: 'built',
    description: 'Bank accounts, statements, balance tracking',
    icon: <Landmark className="w-5 h-5" />,
  },
  {
    name: 'Fiscal Calendar',
    d365: 'Business Central',
    route: '/fiscal',
    status: 'built',
    description: 'Fiscal years, period management, open/close cycles',
    icon: <CalendarDays className="w-5 h-5" />,
  },
  {
    name: 'Year-End Close',
    d365: 'Business Central',
    route: '/year-end',
    status: 'built',
    description: 'Automated closing vouchers, retained earnings transfer',
    icon: <RefreshCw className="w-5 h-5" />,
  },
  {
    name: 'GL Journal',
    d365: 'D365 Finance',
    route: '/finance/gl',
    status: 'built',
    description: 'Manual journal entries, double-entry validation',
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    name: 'Posting Profiles',
    d365: 'Business Central',
    route: '/finance/posting-profiles',
    status: 'built',
    description: 'Module posting rules, debit/credit account mapping',
    icon: <Tags className="w-5 h-5" />,
  },
  {
    name: 'Bank Reconciliation',
    d365: 'Business Central',
    route: '/bank/reconcile',
    status: 'built',
    description: 'Statement import, line matching, GL reconciliation',
    icon: <ArrowLeftRight className="w-5 h-5" />,
  },
  {
    name: 'Budget Management',
    d365: 'D365 Finance',
    route: '/budget',
    status: 'built',
    description: 'Budget planning, variance analysis, period budgets',
    icon: <PiggyBank className="w-5 h-5" />,
  },
  {
    name: 'BC Training Center',
    d365: 'Business Central',
    route: '/training',
    status: 'built',
    description: 'Guided walkthroughs, module documentation, onboarding',
    icon: <GraduationCap className="w-5 h-5" />,
  },
  {
    name: 'Cost Accounting',
    d365: 'D365 Finance',
    route: null,
    status: 'planned',
    description: 'Cost centers, overhead allocation, profitability analysis',
    icon: <Calculator className="w-5 h-5" />,
  },
  {
    name: 'Fixed Assets',
    d365: 'D365 Finance',
    route: null,
    status: 'planned',
    description: 'Asset register, depreciation schedules, disposal',
    icon: <HardDrive className="w-5 h-5" />,
  },
  {
    name: 'Payroll',
    d365: 'D365 Human Resources',
    route: null,
    status: 'planned',
    description: 'Payroll runs, tax withholding, direct deposit',
    icon: <DollarSign className="w-5 h-5" />,
  },
  {
    name: 'Tax Management',
    d365: 'D365 Finance',
    route: null,
    status: 'planned',
    description: 'Sales tax, VAT configuration, filing reports',
    icon: <FileCheck className="w-5 h-5" />,
  },
]

const builtCount = modules.filter(m => m.status === 'built').length
const partialCount = modules.filter(m => m.status === 'partial').length
const plannedCount = modules.filter(m => m.status === 'planned').length
const totalCount = modules.length
const progressPct = Math.round(((builtCount + partialCount * 0.5) / totalCount) * 100)

export default function D365MapPage() {
  return (
    <>
      <TopBar title="D365 Business Central Module Map" />
      <main className="flex-1 p-6 overflow-auto">

        {/* Hero header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
            D365 Business Central Module Map
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            Full-stack Microsoft Dynamics 365 / Business Central equivalent built on Next.js 15 + Prisma +
            PostgreSQL — self-hosted at a fraction of the $180K+/yr enterprise license cost.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Built</p>
            <p className="text-2xl font-bold text-emerald-400">{builtCount}</p>
            <p className="text-xs text-zinc-600 mt-0.5">live modules</p>
          </div>
          {partialCount > 0 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Partial</p>
              <p className="text-2xl font-bold text-amber-400">{partialCount}</p>
              <p className="text-xs text-zinc-600 mt-0.5">in progress</p>
            </div>
          )}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Planned</p>
            <p className="text-2xl font-bold text-zinc-400">{plannedCount}</p>
            <p className="text-xs text-zinc-600 mt-0.5">on roadmap</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Modules</p>
            <p className="text-2xl font-bold text-zinc-100">{totalCount}</p>
            <p className="text-xs text-zinc-600 mt-0.5">BC coverage</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400 font-medium">Project Progress</span>
            <span className="text-xs font-bold text-zinc-100">{progressPct}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-zinc-600 mt-2">
            {builtCount} built · {plannedCount} planned · {totalCount} total
          </p>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {modules.map(mod => {
            const cfg = STATUS_CONFIG[mod.status]
            const cardContent = (
              <div
                className={`group relative bg-zinc-900 border rounded-xl p-4 transition-all ${cfg.card} ${
                  mod.route ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                {/* Status dot */}
                <span className={`absolute top-3 right-3 w-2 h-2 rounded-full ${cfg.dot}`} />

                {/* Icon + name */}
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      mod.status === 'built'
                        ? 'bg-emerald-950/50 text-emerald-400'
                        : mod.status === 'partial'
                        ? 'bg-amber-950/50 text-amber-400'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {mod.icon}
                  </div>
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="text-sm font-semibold text-zinc-100 leading-tight">{mod.name}</p>
                    <p className="text-xs text-zinc-600 mt-0.5 font-mono truncate">{mod.d365}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-400 leading-relaxed mb-3">{mod.description}</p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <Badge variant={cfg.badgeVariant} className="text-xs">
                    {mod.status === 'built' ? 'Live' : mod.status === 'partial' ? 'Partial' : 'Planned'}
                  </Badge>
                  {mod.route && mod.status !== 'planned' && (
                    <span className="text-xs text-zinc-600 font-mono group-hover:text-blue-400 transition-colors flex items-center gap-1">
                      {mod.route}
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            )

            return mod.route && mod.status !== 'planned' ? (
              <Link key={mod.name} href={mod.route}>
                {cardContent}
              </Link>
            ) : (
              <div key={mod.name}>{cardContent}</div>
            )
          })}
        </div>

        {/* Footer */}
        <p className="text-xs text-zinc-700 mt-8 text-center">
          D365 Commerce · D365 Sales · D365 Supply Chain (WMS) · D365 Customer Service · D365 Finance ·
          D365 Marketing · D365 Field Service · D365 Human Resources · Business Central
        </p>
      </main>
    </>
  )
}
