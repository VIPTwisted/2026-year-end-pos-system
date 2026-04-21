import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, DollarSign, AlertTriangle, FileText, TrendingUp } from 'lucide-react'

function statusBadge(status: string) {
  const map: Record<string, 'secondary' | 'default' | 'success' | 'warning' | 'destructive'> = {
    draft: 'secondary',
    posted: 'default',
    paid: 'success',
    partial: 'warning',
    cancelled: 'destructive',
  }
  return <Badge variant={map[status] ?? 'secondary'}>{status}</Badge>
}

function typeBadge(type: string) {
  return (
    <Badge variant="secondary" className="capitalize text-xs">
      {type === 'free_text' ? 'Free Text' : 'Sales'}
    </Badge>
  )
}

export default async function ARPage() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const invoices = await prisma.customerInvoice.findMany({
    include: { customer: true, lines: true },
    orderBy: { invoiceDate: 'desc' },
    take: 20,
  })

  const allOpen = await prisma.customerInvoice.findMany({
    where: { status: { notIn: ['paid', 'cancelled'] } },
    select: {
      totalAmount: true,
      paidAmount: true,
      dueDate: true,
      customerId: true,
    },
  })

  const allPaid = await prisma.customerInvoice.findMany({
    where: { status: 'paid' },
    select: { totalAmount: true },
  })

  const thisMonthCount = await prisma.customerInvoice.count({
    where: { invoiceDate: { gte: startOfMonth } },
  })

  // Summary calculations
  const totalARBalance = allOpen.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0)

  const overdueBalance = allOpen
    .filter(inv => inv.dueDate < now)
    .reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0)

  const totalPaid = allPaid.reduce((sum, inv) => sum + inv.totalAmount, 0)
  const collectionRate =
    totalPaid + totalARBalance > 0
      ? (totalPaid / (totalPaid + totalARBalance)) * 100
      : 0

  // AR Aging buckets
  type AgingBucket = { label: string; min: number; max: number; total: number; customers: Set<string> }
  const buckets: AgingBucket[] = [
    { label: 'Current (0–30d)', min: 0, max: 30, total: 0, customers: new Set() },
    { label: '31–60 Days', min: 31, max: 60, total: 0, customers: new Set() },
    { label: '61–90 Days', min: 61, max: 90, total: 0, customers: new Set() },
    { label: '90+ Days', min: 91, max: Infinity, total: 0, customers: new Set() },
  ]

  for (const inv of allOpen) {
    const daysOverdue = Math.max(
      0,
      Math.floor((now.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24))
    )
    const balance = inv.totalAmount - inv.paidAmount
    for (const bucket of buckets) {
      if (daysOverdue >= bucket.min && daysOverdue <= bucket.max) {
        bucket.total += balance
        bucket.customers.add(inv.customerId)
        break
      }
    }
  }

  return (
    <>
      <TopBar title="AR / Receivables" />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Accounts Receivable</h2>
            <p className="text-sm text-zinc-500">Customer invoices and collections</p>
          </div>
          <Link href="/ar/new">
            <Button><Plus className="w-4 h-4 mr-1" />New Invoice</Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Total AR Balance</p>
              </div>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalARBalance)}</p>
              <p className="text-xs text-zinc-600 mt-1">open invoices</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Overdue Balance</p>
              </div>
              <p className="text-2xl font-bold text-red-400">{formatCurrency(overdueBalance)}</p>
              <p className="text-xs text-zinc-600 mt-1">past due date</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">This Month</p>
              </div>
              <p className="text-2xl font-bold text-blue-400">{thisMonthCount}</p>
              <p className="text-xs text-zinc-600 mt-1">invoices issued</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Collection Rate</p>
              </div>
              <p className="text-2xl font-bold text-amber-400">{collectionRate.toFixed(1)}%</p>
              <p className="text-xs text-zinc-600 mt-1">paid vs outstanding</p>
            </CardContent>
          </Card>
        </div>

        {/* AR Aging Table */}
        <section>
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">AR Aging Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Aging Bucket</th>
                  <th className="text-right pb-3 font-medium">Customer Count</th>
                  <th className="text-right pb-3 font-medium">Total Balance</th>
                  <th className="text-right pb-3 font-medium">% of AR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {buckets.map(bucket => (
                  <tr key={bucket.label} className="hover:bg-zinc-900/50">
                    <td className="py-3 pr-4 text-zinc-100 font-medium">{bucket.label}</td>
                    <td className="py-3 pr-4 text-right text-zinc-400">{bucket.customers.size}</td>
                    <td className="py-3 pr-4 text-right">
                      <span className={bucket.min > 30 && bucket.total > 0 ? 'text-red-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                        {formatCurrency(bucket.total)}
                      </span>
                    </td>
                    <td className="py-3 text-right text-zinc-500">
                      {totalARBalance > 0 ? ((bucket.total / totalARBalance) * 100).toFixed(1) : '0.0'}%
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-zinc-700">
                  <td className="py-3 pr-4 font-semibold text-zinc-100">Total</td>
                  <td className="py-3 pr-4 text-right text-zinc-300 font-semibold">{allOpen.length}</td>
                  <td className="py-3 pr-4 text-right text-emerald-400 font-bold">{formatCurrency(totalARBalance)}</td>
                  <td className="py-3 text-right text-zinc-400">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Invoices Table */}
        <section>
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">Recent Invoices</h3>

          {invoices.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <FileText className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-sm">No invoices yet. Create your first customer invoice.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Invoice #</th>
                    <th className="text-left pb-3 font-medium">Customer</th>
                    <th className="text-left pb-3 font-medium">Type</th>
                    <th className="text-left pb-3 font-medium">Invoice Date</th>
                    <th className="text-left pb-3 font-medium">Due Date</th>
                    <th className="text-right pb-3 font-medium">Total</th>
                    <th className="text-right pb-3 font-medium">Paid</th>
                    <th className="text-right pb-3 font-medium">Balance</th>
                    <th className="text-center pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {invoices.map(inv => {
                    const balance = inv.totalAmount - inv.paidAmount
                    const overdue = inv.dueDate < now && !['paid', 'cancelled'].includes(inv.status)
                    return (
                      <tr key={inv.id} className="hover:bg-zinc-900/50">
                        <td className="py-3 pr-4">
                          <Link
                            href={`/ar/${inv.id}`}
                            className="font-mono text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            {inv.invoiceNumber}
                          </Link>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-zinc-100 font-medium">
                            {inv.customer.firstName} {inv.customer.lastName}
                          </span>
                          {inv.customer.email && (
                            <div className="text-xs text-zinc-500">{inv.customer.email}</div>
                          )}
                        </td>
                        <td className="py-3 pr-4">{typeBadge(inv.invoiceType)}</td>
                        <td className="py-3 pr-4 text-zinc-400 text-xs">
                          {new Date(inv.invoiceDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                        </td>
                        <td className="py-3 pr-4 text-xs">
                          <span className={overdue ? 'text-red-400 font-semibold' : 'text-zinc-400'}>
                            {new Date(inv.dueDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                            {overdue && ' ⚠'}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-right text-zinc-200 font-semibold">
                          {formatCurrency(inv.totalAmount)}
                        </td>
                        <td className="py-3 pr-4 text-right text-emerald-400">
                          {formatCurrency(inv.paidAmount)}
                        </td>
                        <td className="py-3 pr-4 text-right font-semibold">
                          <span className={balance > 0 ? (overdue ? 'text-red-400' : 'text-amber-400') : 'text-zinc-500'}>
                            {formatCurrency(balance)}
                          </span>
                        </td>
                        <td className="py-3 text-center">{statusBadge(inv.status)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>
    </>
  )
}
