import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Scale, AlignLeft, Clock } from 'lucide-react'

const REPORTS = [
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

export default function ReportsPage() {
  return (
    <>
      <TopBar title="Financial Reports" />
      <main className="flex-1 p-6 overflow-auto space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 mb-1">Financial Reports</h2>
          <p className="text-sm text-zinc-500">Core financial statements and analytics — data is live from the general ledger</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {REPORTS.map(({ title, href, description, icon: Icon, color, bg }) => (
            <Link key={href} href={href} className="group">
              <Card className="h-full transition-colors hover:border-zinc-700 hover:bg-zinc-900/60">
                <CardContent className="pt-7 pb-7 px-7 flex flex-col gap-5">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                    <Badge variant="secondary" className="text-emerald-400 border-emerald-400/20 bg-emerald-400/10 text-xs">
                      Live
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-zinc-100 mb-1.5">{title}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors mt-auto">
                    <span>View Report</span>
                    <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}
