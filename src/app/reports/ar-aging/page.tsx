export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, AlertTriangle } from 'lucide-react'

function daysBetween(a: Date, b: Date) {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

type AgingBuckets = {
  current: number   // 0-30
  d31_60: number
  d61_90: number
  d90plus: number
}

function bucket(days: number): keyof AgingBuckets {
  if (days <= 30) return 'current'
  if (days <= 60) return 'd31_60'
  if (days <= 90) return 'd61_90'
  return 'd90plus'
}

export default async function ARAgingPage() {
  const today = new Date()

  const invoices = await prisma.customerInvoice.findMany({
    where: {
      status: { notIn: ['paid', 'cancelled'] },
    },
    include: {
      customer: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { dueDate: 'asc' },
  })

  // Compute days past due from dueDate
  const rows = invoices.map(inv => {
    const days = daysBetween(new Date(inv.dueDate), today)
    const outstanding = inv.totalAmount - (inv.paidAmount ?? 0)
    return { inv, days: Math.max(0, days), outstanding, bkt: bucket(Math.max(0, days)) }
  })

  // Per-customer aggregation
  type CustomerRow = {
    customerId: string
    name: string
    email: string | null
    current: number
    d31_60: number
    d61_90: number
    d90plus: number
    total: number
  }

  const customerMap = new Map<string, CustomerRow>()
  for (const r of rows) {
    const cid = r.inv.customerId
    if (!customerMap.has(cid)) {
      customerMap.set(cid, {
        customerId: cid,
        name: `${r.inv.customer.firstName} ${r.inv.customer.lastName}`,
        email: r.inv.customer.email,
        current: 0,
        d31_60: 0,
        d61_90: 0,
        d90plus: 0,
        total: 0,
      })
    }
    const crow = customerMap.get(cid)!
    crow[r.bkt] += r.outstanding
    crow.total += r.outstanding
  }

  const customerRows = Array.from(customerMap.values()).sort((a, b) => b.total - a.total)

  const grandCurrent  = rows.filter(r => r.bkt === 'current').reduce((s, r) => s + r.outstanding, 0)
  const grand31_60    = rows.filter(r => r.bkt === 'd31_60').reduce((s, r) => s + r.outstanding, 0)
  const grand61_90    = rows.filter(r => r.bkt === 'd61_90').reduce((s, r) => s + r.outstanding, 0)
  const grand90plus   = rows.filter(r => r.bkt === 'd90plus').reduce((s, r) => s + r.outstanding, 0)
  const totalAR       = grandCurrent + grand31_60 + grand61_90 + grand90plus
  const totalOverdue  = grand31_60 + grand61_90 + grand90plus
  const criticallyOverdue = grand90plus

  return (
    <>
      <TopBar title="AR Aging Summary" />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/reports">
                <Button variant="ghost" size="sm" className="gap-1.5 text-zinc-400 hover:text-zinc-100 -ml-2">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Reports
                </Button>
              </Link>
            </div>
            <h2 className="text-xl font-bold text-zinc-100">AR Aging Summary</h2>
            <p className="text-sm text-zinc-500 mt-0.5">
              {invoices.length} open invoices &nbsp;·&nbsp; As of {formatDate(today)}
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 border-zinc-700 text-zinc-300" disabled>
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total AR Outstanding</p>
              <p className="text-2xl font-bold text-zinc-100 tabular-nums">{formatCurrency(totalAR)}</p>
              <p className="text-xs text-zinc-600 mt-1">{invoices.length} invoices</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Overdue (&gt;30 days)</p>
              <p className="text-2xl font-bold text-amber-400 tabular-nums">{formatCurrency(totalOverdue)}</p>
              <p className="text-xs text-zinc-600 mt-1">
                {rows.filter(r => r.bkt !== 'current').length} invoices
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5 flex items-start gap-3">
              <div className="flex-1">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Critically Overdue (&gt;90d)</p>
                <p className="text-2xl font-bold text-red-400 tabular-nums">{formatCurrency(criticallyOverdue)}</p>
                <p className="text-xs text-zinc-600 mt-1">
                  {rows.filter(r => r.bkt === 'd90plus').length} invoices
                </p>
              </div>
              {criticallyOverdue > 0 && (
                <AlertTriangle className="w-5 h-5 text-red-400 mt-1 shrink-0" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Aging matrix table */}
        <Card>
          <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-900/60 rounded-t-lg">
            <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">Aging by Customer</h3>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left px-5 pb-3 pt-4 font-medium">Customer</th>
                    <th className="text-right pb-3 pt-4 font-medium">Current (0-30)</th>
                    <th className="text-right pb-3 pt-4 font-medium">31-60 Days</th>
                    <th className="text-right pb-3 pt-4 font-medium">61-90 Days</th>
                    <th className="text-right pb-3 pt-4 font-medium">90+ Days</th>
                    <th className="text-right px-5 pb-3 pt-4 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {customerRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-zinc-600">
                        No outstanding AR — all invoices are paid or cancelled
                      </td>
                    </tr>
                  ) : (
                    customerRows.map(cr => (
                      <tr key={cr.customerId} className="hover:bg-zinc-900/50">
                        <td className="px-5 py-2.5">
                          <p className="text-zinc-300 font-medium text-sm">{cr.name}</p>
                          {cr.email && <p className="text-xs text-zinc-600">{cr.email}</p>}
                        </td>
                        <td className="py-2.5 pr-4 text-right tabular-nums text-zinc-300">
                          {cr.current > 0 ? formatCurrency(cr.current) : <span className="text-zinc-700">—</span>}
                        </td>
                        <td className="py-2.5 pr-4 text-right tabular-nums">
                          {cr.d31_60 > 0 ? (
                            <span className="text-amber-300/80">{formatCurrency(cr.d31_60)}</span>
                          ) : (
                            <span className="text-zinc-700">—</span>
                          )}
                        </td>
                        <td className="py-2.5 pr-4 text-right tabular-nums">
                          {cr.d61_90 > 0 ? (
                            <span className="text-amber-400">{formatCurrency(cr.d61_90)}</span>
                          ) : (
                            <span className="text-zinc-700">—</span>
                          )}
                        </td>
                        <td className="py-2.5 pr-4 text-right tabular-nums">
                          {cr.d90plus > 0 ? (
                            <span className="text-red-400 font-semibold">{formatCurrency(cr.d90plus)}</span>
                          ) : (
                            <span className="text-zinc-700">—</span>
                          )}
                        </td>
                        <td className="px-5 py-2.5 text-right font-semibold tabular-nums text-zinc-100">
                          {formatCurrency(cr.total)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {customerRows.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-zinc-700 bg-zinc-900/60">
                      <td className="px-5 py-3 text-sm font-bold text-zinc-100">Grand Total</td>
                      <td className="py-3 pr-4 text-right font-bold tabular-nums text-zinc-200">
                        {formatCurrency(grandCurrent)}
                      </td>
                      <td className="py-3 pr-4 text-right font-bold tabular-nums text-amber-300/80">
                        {formatCurrency(grand31_60)}
                      </td>
                      <td className="py-3 pr-4 text-right font-bold tabular-nums text-amber-400">
                        {formatCurrency(grand61_90)}
                      </td>
                      <td className="py-3 pr-4 text-right font-bold tabular-nums text-red-400">
                        {formatCurrency(grand90plus)}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-base tabular-nums text-zinc-100">
                        {formatCurrency(totalAR)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </CardContent>
        </Card>

      </main>
    </>
  )
}
