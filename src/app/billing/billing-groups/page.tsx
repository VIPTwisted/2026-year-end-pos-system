export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Users, CalendarDays, ChevronRight, Receipt } from 'lucide-react'

const MOCK_GROUPS = [
  { id: 'MONTHLY-BATCH', code: 'MONTHLY-BATCH', description: 'Monthly Recurring Billing', customerCount: 38, nextBillingDate: '2026-05-01', totalAmount: 12450.00 },
  { id: 'QUARTERLY-BATCH', code: 'QUARTERLY-BATCH', description: 'Quarterly Billing Group', customerCount: 14, nextBillingDate: '2026-07-01', totalAmount: 24800.00 },
  { id: 'ANNUAL-BATCH', code: 'ANNUAL-BATCH', description: 'Annual Renewal Group', customerCount: 7, nextBillingDate: '2027-01-01', totalAmount: 41600.00 },
  { id: 'TRIAL-GROUP', code: 'TRIAL-GROUP', description: 'Trial Conversions — Month 1', customerCount: 5, nextBillingDate: '2026-05-15', totalAmount: 0.00 },
]

export default function BillingGroupsPage() {
  const totalCustomers = MOCK_GROUPS.reduce((s, g) => s + g.customerCount, 0)

  return (
    <>
      <TopBar title="Billing Groups" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Groups</p>
            <p className="text-2xl font-bold text-zinc-100">{MOCK_GROUPS.length}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Customers</p>
            <p className="text-2xl font-bold text-blue-400">{totalCustomers}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Next Billing Run</p>
            <p className="text-2xl font-bold text-amber-400">2026-05-01</p>
          </CardContent></Card>
        </div>

        {/* Action Ribbon */}
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-500">
            <Plus className="w-4 h-4" />
            New Billing Group
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <Receipt className="w-4 h-4" />
            Run Billing Batch
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Code</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Description</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Customer Count</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Next Billing Date</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Total Amount</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {MOCK_GROUPS.map(g => (
                  <tr key={g.id} className="hover:bg-zinc-900/40 transition-colors group">
                    <td className="px-4 py-3 font-mono text-xs text-blue-400">{g.code}</td>
                    <td className="px-4 py-3 text-sm text-zinc-300">{g.description}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="flex items-center justify-end gap-1 text-zinc-300">
                        <Users className="w-3 h-3 text-zinc-500" />
                        {g.customerCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-400">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3 text-zinc-600" />
                        {g.nextBillingDate}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-zinc-200">
                      ${g.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
