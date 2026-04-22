import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp, Scale, AlignLeft, Clock,
  Tag, Users, Percent, Package, Gift,
} from 'lucide-react'

const FINANCIAL_REPORTS = [
  {
    title: 'Profit & Loss',
    href: '/reports/pl',
    description: 'Revenue, expenses, and net income for a period',
    icon: TrendingUp,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
  {
    title: 'Balance Sheet',
    href: '/reports/balance-sheet',
    description: 'Assets, liabilities, and equity snapshot',
    icon: Scale,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    title: 'Trial Balance',
    href: '/reports/trial-balance',
    description: 'All account debit/credit totals',
    icon: AlignLeft,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
  {
    title: 'AR Aging Summary',
    href: '/reports/ar-aging',
    description: 'Receivables by aging bucket',
    icon: Clock,
    color: 'text-red-400',
    bg: 'bg-red-400/10',
  },
]

const SALES_REPORTS = [
  {
    title: 'Sales by Category',
    href: '/reports/sales-by-category',
    description: 'Revenue breakdown by product category',
    icon: Tag,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
  {
    title: 'Sales by Employee',
    href: '/reports/sales-by-employee',
    description: 'Individual sales performance by staff member',
    icon: Users,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
  },
  {
    title: 'Discount Usage Report',
    href: '/reports/discount-usage',
    description: 'Discount codes and promotions applied at POS',
    icon: Percent,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
  {
    title: 'Inventory Value Report',
    href: '/reports/inventory-value',
    description: 'On-hand inventory valued at cost and retail',
    icon: Package,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    title: 'Gift Card Liability Report',
    href: '/reports/gift-card-liability',
    description: 'Outstanding gift card balances and issuance history',
    icon: Gift,
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
  },
]

function ReportCard({ title, href, description, icon: Icon, color, bg }: {
  title: string; href: string; description: string; icon: React.ElementType; color: string; bg: string
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-colors hover:border-zinc-700 hover:bg-zinc-900/60">
        <CardContent className="pt-6 pb-6 px-6 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <Badge variant="secondary" className="text-emerald-400 border-emerald-400/20 bg-emerald-400/10 text-xs">
              Live
            </Badge>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 mb-1">{title}</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">{description}</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 group-hover:text-zinc-200 transition-colors mt-auto">
            <span>View Report</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function ReportsPage() {
  return (
    <>
      <TopBar title="Financial Reports" />
      <main className="flex-1 p-6 overflow-auto space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 mb-1">Financial Reports</h2>
          <p className="text-sm text-zinc-500">Core financial statements — data is live from the general ledger</p>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {FINANCIAL_REPORTS.map(r => <ReportCard key={r.href} {...r} />)}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-zinc-100 mb-1">Sales & Operations Reports</h2>
          <p className="text-sm text-zinc-500">Operational analytics from POS transactions, inventory, and promotions</p>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {SALES_REPORTS.map(r => <ReportCard key={r.href} {...r} />)}
        </div>
      </main>
    </>
  )
}
