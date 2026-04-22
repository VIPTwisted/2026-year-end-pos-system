export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Receipt, RefreshCw, XCircle, ChevronRight, Users, DollarSign, CalendarDays } from 'lucide-react'

const STATUS_BADGE: Record<string, string> = {
  Active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Terminated: 'bg-red-500/20 text-red-400 border-red-500/30',
  Suspended: 'bg-zinc-600/30 text-zinc-400 border-zinc-600/40',
}

const PERIOD_BADGE: Record<string, string> = {
  Monthly: 'text-blue-400',
  Quarterly: 'text-purple-400',
  Annually: 'text-emerald-400',
}

const MOCK_SUBS = [
  { id: 'SUB-0001', contractNo: 'SUB-0001', customer: 'Acme Corp', item: 'PRO-PLAN-001', description: 'Pro Software License', billingPeriod: 'Monthly', startDate: '2026-01-01', nextInvoiceDate: '2026-05-01', status: 'Active', amount: 299.00 },
  { id: 'SUB-0002', contractNo: 'SUB-0002', customer: 'Globex Industries', item: 'ENT-PLAN-002', description: 'Enterprise License', billingPeriod: 'Annually', startDate: '2026-01-15', nextInvoiceDate: '2027-01-15', status: 'Active', amount: 2988.00 },
  { id: 'SUB-0003', contractNo: 'SUB-0003', customer: 'Springfield LLC', item: 'STD-PLAN-001', description: 'Standard Plan', billingPeriod: 'Quarterly', startDate: '2026-02-01', nextInvoiceDate: '2026-05-01', status: 'Pending', amount: 597.00 },
  { id: 'SUB-0004', contractNo: 'SUB-0004', customer: 'Initech Corp', item: 'PRO-PLAN-001', description: 'Pro Software License', billingPeriod: 'Monthly', startDate: '2025-06-01', nextInvoiceDate: '2026-05-01', status: 'Terminated', amount: 299.00 },
  { id: 'SUB-0005', contractNo: 'SUB-0005', customer: 'Umbrella Ltd', item: 'ENT-PLAN-002', description: 'Enterprise License', billingPeriod: 'Annually', startDate: '2026-03-01', nextInvoiceDate: '2027-03-01', status: 'Active', amount: 3600.00 },
]

export default function BillingSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const active = MOCK_SUBS.filter(s => s.status === 'Active').length
  const pending = MOCK_SUBS.filter(s => s.status === 'Pending').length
  const totalMRR = MOCK_SUBS
    .filter(s => s.status === 'Active' && s.billingPeriod === 'Monthly')
    .reduce((sum, s) => sum + s.amount, 0)

  return (
    <>
      <TopBar title="Billing Subscriptions" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Active Contracts</p>
                <p className="text-2xl font-bold text-emerald-400">{active}</p>
              </div>
              <Users className="w-5 h-5 text-emerald-500/50" />
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Pending</p>
                <p className="text-2xl font-bold text-amber-400">{pending}</p>
              </div>
              <CalendarDays className="w-5 h-5 text-amber-500/50" />
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Monthly MRR</p>
                <p className="text-2xl font-bold text-blue-400">${totalMRR.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
              <DollarSign className="w-5 h-5 text-blue-500/50" />
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Contracts</p>
                <p className="text-2xl font-bold text-zinc-100">{MOCK_SUBS.length}</p>
              </div>
              <Receipt className="w-5 h-5 text-zinc-500/50" />
            </div>
          </CardContent></Card>
        </div>

        {/* Action Ribbon */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-500" asChild>
            <Link href="/billing/subscriptions/new">
              <Plus className="w-4 h-4" />
              New Contract
            </Link>
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <Receipt className="w-4 h-4" />
            Create Invoice
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Renew Selected
          </Button>
          <Button size="sm" variant="outline" className="gap-2 text-red-400 hover:text-red-300 border-red-900/40 hover:border-red-800">
            <XCircle className="w-4 h-4" />
            Terminate
          </Button>
        </div>

        {/* Filter pane */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-500 font-medium">Status:</span>
          {['All', 'Active', 'Pending', 'Suspended', 'Terminated'].map(s => (
            <Link
              key={s}
              href={s === 'All' ? '/billing/subscriptions' : `/billing/subscriptions?status=${s}`}
              className="px-2.5 py-1 rounded text-xs font-medium border bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500 transition-colors"
            >
              {s}
            </Link>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Contract No.</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Customer</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Item</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Description</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Billing Period</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Start Date</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Next Invoice</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Amount</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {MOCK_SUBS.map(sub => (
                    <tr key={sub.id} className="hover:bg-zinc-900/40 transition-colors group">
                      <td className="px-4 py-3 font-mono text-xs">
                        <Link href={`/billing/subscriptions/${sub.id}`} className="text-blue-400 hover:text-blue-300">
                          {sub.contractNo}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-300">{sub.customer}</td>
                      <td className="px-4 py-3 text-xs font-mono text-zinc-500">{sub.item}</td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{sub.description}</td>
                      <td className="px-4 py-3 text-xs font-medium">
                        <span className={PERIOD_BADGE[sub.billingPeriod] ?? 'text-zinc-400'}>{sub.billingPeriod}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{sub.startDate}</td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{sub.nextInvoiceDate}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-zinc-200">
                        ${sub.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${STATUS_BADGE[sub.status] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/billing/subscriptions/${sub.id}`}>
                          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 inline" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
