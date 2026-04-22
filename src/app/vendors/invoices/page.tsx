export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Plus, Clock, CheckCircle, AlertTriangle, FilePen } from 'lucide-react'

type StatusFilter = 'all' | 'draft' | 'open' | 'paid' | 'overdue'

const STATUS_BADGE: Record<string, { variant: 'secondary' | 'default' | 'success' | 'warning' | 'destructive'; label: string }> = {
  draft:     { variant: 'secondary',   label: 'Draft' },
  posted:    { variant: 'default',     label: 'Posted' },
  matched:   { variant: 'default',     label: 'Matched' },
  paid:      { variant: 'success',     label: 'Paid' },
  partial:   { variant: 'warning',     label: 'Partial' },
  cancelled: { variant: 'destructive', label: 'Cancelled' },
}

const MATCH_BADGE: Record<string, { variant: 'secondary' | 'default' | 'success'; label: string }> = {
  none:      { variant: 'secondary', label: 'None' },
  two_way:   { variant: 'default',   label: '2-Way' },
  three_way: { variant: 'success',   label: '3-Way' },
}

export default async function VendorInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const filter = (params.status ?? 'all') as StatusFilter
  const now = new Date()

  const allInvoices = await prisma.vendorInvoice.findMany({
    include: { vendor: true },
    orderBy: { invoiceDate: 'desc' },
  })

  // Summary counts
  const totalCount   = allInvoices.length
  const draftCount   = allInvoices.filter(i => i.status === 'draft').length
  const openCount    = allInvoices.filter(i => i.status === 'posted' || i.status === 'matched' || i.status === 'partial').length
  const paidCount    = allInvoices.filter(i => i.status === 'paid').length
  const overdueCount = allInvoices.filter(
    i => i.dueDate < now && i.status !== 'paid' && i.status !== 'cancelled'
  ).length

  // Apply filter
  const invoices = allInvoices.filter(i => {
    if (filter === 'all') return true
    if (filter === 'draft') return i.status === 'draft'
    if (filter === 'open') return ['posted', 'matched', 'partial'].includes(i.status)
    if (filter === 'paid') return i.status === 'paid'
    if (filter === 'overdue') return i.dueDate < now && i.status !== 'paid' && i.status !== 'cancelled'
    return true
  })

  const tabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: 'all',     label: 'All',     count: totalCount },
    { key: 'draft',   label: 'Draft',   count: draftCount },
    { key: 'open',    label: 'Open',    count: openCount },
    { key: 'paid',    label: 'Paid',    count: paidCount },
    { key: 'overdue', label: 'Overdue', count: overdueCount },
  ]

  return (
    <>
      <TopBar title="Vendor Invoices" />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Accounts Payable — Invoices</h2>
            <p className="text-sm text-zinc-500">{totalCount} invoices</p>
          </div>
          <Link href="/vendors/invoices/new">
            <Button><Plus className="w-4 h-4 mr-1" />New Invoice</Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-zinc-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Total</p>
              </div>
              <p className="text-2xl font-bold text-zinc-100">{totalCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <FilePen className="w-4 h-4 text-zinc-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Draft</p>
              </div>
              <p className="text-2xl font-bold text-zinc-300">{draftCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Open</p>
              </div>
              <p className="text-2xl font-bold text-blue-400">{openCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Paid</p>
              </div>
              <p className="text-2xl font-bold text-emerald-400">{paidCount}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Overdue</p>
              </div>
              <p className="text-2xl font-bold text-red-400">{overdueCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 border-b border-zinc-800 pb-0">
          {tabs.map(tab => (
            <Link
              key={tab.key}
              href={`/vendors/invoices${tab.key === 'all' ? '' : `?status=${tab.key}`}`}
              className={[
                'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                filter === tab.key
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300',
              ].join(' ')}
            >
              {tab.label}
              <span className="ml-1.5 text-xs text-zinc-600">({tab.count})</span>
            </Link>
          ))}
        </div>

        {/* Invoices Table */}
        {invoices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <FileText className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">No invoices found for this filter.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Invoice #</th>
                  <th className="text-left pb-3 font-medium">Vendor</th>
                  <th className="text-left pb-3 font-medium">Invoice Date</th>
                  <th className="text-left pb-3 font-medium">Due Date</th>
                  <th className="text-right pb-3 font-medium">Total</th>
                  <th className="text-right pb-3 font-medium">Paid</th>
                  <th className="text-right pb-3 font-medium">Balance</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                  <th className="text-center pb-3 font-medium">Match</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {invoices.map(inv => {
                  const balance = inv.totalAmount - inv.paidAmount
                  const isOverdue = inv.dueDate < now && inv.status !== 'paid' && inv.status !== 'cancelled'
                  const statusInfo = STATUS_BADGE[inv.status] ?? { variant: 'secondary' as const, label: inv.status }
                  const matchInfo = MATCH_BADGE[inv.matchingStatus] ?? { variant: 'secondary' as const, label: inv.matchingStatus }

                  return (
                    <tr key={inv.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 font-mono text-xs text-zinc-400">{inv.invoiceNumber}</td>
                      <td className="py-3 pr-4 font-medium text-zinc-100">{inv.vendor.name}</td>
                      <td className="py-3 pr-4 text-zinc-400">
                        {new Date(inv.invoiceDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={isOverdue ? 'text-red-400 font-semibold' : 'text-zinc-400'}>
                          {new Date(inv.dueDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                          {isOverdue && ' ⚠'}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold text-zinc-100 tabular-nums">
                        {formatCurrency(inv.totalAmount)}
                      </td>
                      <td className="py-3 pr-4 text-right text-emerald-400 tabular-nums">
                        {formatCurrency(inv.paidAmount)}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums">
                        <span className={balance > 0 ? 'text-amber-400 font-semibold' : 'text-zinc-500'}>
                          {formatCurrency(balance)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </td>
                      <td className="py-3 text-center">
                        <Badge variant={matchInfo.variant}>{matchInfo.label}</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

      </main>
    </>
  )
}
