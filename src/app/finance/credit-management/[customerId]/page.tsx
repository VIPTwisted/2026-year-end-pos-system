export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { ChevronLeft, ShieldX, ShieldCheck } from 'lucide-react'

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(d))
}

function ageDays(d: Date): number {
  return Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24))
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-400',
  posted: 'bg-blue-500/10 text-blue-400',
  partial: 'bg-amber-500/10 text-amber-400',
  paid: 'bg-emerald-500/10 text-emerald-400',
  void: 'bg-red-500/10 text-red-400',
  cancelled: 'bg-red-500/10 text-red-400',
}

interface PageProps {
  params: Promise<{ customerId: string }>
}

export default async function CustomerCreditDetailPage({ params }: PageProps) {
  const { customerId } = await params

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      arInvoices: {
        include: { settlements: true },
        orderBy: { invoiceDate: 'desc' },
      },
    },
  })

  if (!customer) notFound()

  const openInvoices = customer.arInvoices.filter(
    (i) => !['paid', 'void', 'cancelled'].includes(i.status)
  )
  const balance = openInvoices.reduce(
    (s, i) => s + Math.max(0, i.totalAmount - i.paidAmount),
    0
  )
  const utilization =
    customer.creditLimit > 0
      ? Math.round((balance / customer.creditLimit) * 100)
      : 0

  const lateCount = customer.arInvoices.filter((i) => {
    if (i.status !== 'paid') return false
    const settled = i.settlements[0]
    if (!settled) return false
    return new Date(settled.settledAt) > new Date(i.dueDate)
  }).length

  const paidCount = customer.arInvoices.filter((i) => i.status === 'paid').length
  const riskScore = Math.min(
    100,
    Math.round(
      (lateCount / Math.max(1, paidCount)) * 50 +
        Math.min(50, utilization / 2)
    )
  )

  const riskLabel = riskScore < 25 ? 'Low' : riskScore < 60 ? 'Medium' : 'High'
  const riskColor = riskScore < 25 ? 'text-emerald-400' : riskScore < 60 ? 'text-amber-400' : 'text-red-400'
  const blocked = customer.creditStatus === 'blocked'

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title={`${customer.firstName} ${customer.lastName} — Credit Detail`}
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Credit Management', href: '/finance/credit-management' },
        ]}
      />

      <div className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
        <Link
          href="/finance/credit-management"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to Credit Management
        </Link>

        {/* Header card */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">
                {customer.firstName} {customer.lastName}
              </h2>
              {customer.email && <p className="text-sm text-zinc-400 mt-0.5">{customer.email}</p>}
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold ${blocked ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
              {blocked ? <ShieldX className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              {blocked ? 'BLOCKED' : customer.creditStatus.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-6 mt-6">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Credit Limit</div>
              <div className="text-xl font-bold text-zinc-100 font-mono tabular-nums">
                {customer.creditLimit > 0 ? formatCurrency(customer.creditLimit) : '—'}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Open Balance</div>
              <div className={`text-xl font-bold font-mono tabular-nums ${balance > customer.creditLimit && customer.creditLimit > 0 ? 'text-red-400' : 'text-zinc-100'}`}>
                {formatCurrency(balance)}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Utilization</div>
              <div className={`text-xl font-bold tabular-nums ${utilization >= 100 ? 'text-red-400' : utilization >= 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {utilization}%
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Risk Score</div>
              <div className={`text-xl font-bold tabular-nums ${riskColor}`}>
                {riskScore}/100 <span className="text-sm font-normal">({riskLabel})</span>
              </div>
            </div>
          </div>

          {customer.creditLimit > 0 && (
            <div className="mt-4">
              <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${utilization >= 100 ? 'bg-red-500' : utilization >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, utilization)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Invoices</div>
            <div className="text-2xl font-bold text-zinc-100">{customer.arInvoices.length}</div>
            <div className="text-xs text-zinc-500 mt-1">all time</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Paid On Time</div>
            <div className="text-2xl font-bold text-emerald-400">{paidCount - lateCount}</div>
            <div className="text-xs text-zinc-500 mt-1">of {paidCount} paid</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Late Payments</div>
            <div className="text-2xl font-bold text-red-400">{lateCount}</div>
            <div className="text-xs text-zinc-500 mt-1">historical late</div>
          </div>
        </div>

        {/* Invoice history timeline */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">Invoice History</h2>
            <span className="text-xs text-zinc-500">{customer.arInvoices.length} records</span>
          </div>

          {customer.arInvoices.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-zinc-500">No invoice history.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Invoice #</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Date</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Due Date</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Amount</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Paid</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Balance</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Age</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {customer.arInvoices.map((inv) => {
                    const bal = Math.max(0, inv.totalAmount - inv.paidAmount)
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const isOverdue =
                      new Date(inv.dueDate) < today &&
                      !['paid', 'void', 'cancelled'].includes(inv.status)
                    return (
                      <tr key={inv.id} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="px-5 py-3">
                          <Link
                            href={`/finance/invoices/${inv.id}`}
                            className="font-mono text-xs text-blue-400 bg-blue-400/5 px-2 py-0.5 rounded hover:bg-blue-400/10"
                          >
                            {inv.invoiceNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-400">{fmtDate(inv.invoiceDate)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${isOverdue ? 'text-red-400' : 'text-zinc-400'}`}>
                            {fmtDate(inv.dueDate)}
                            {isOverdue && <span className="ml-1 text-[10px] text-red-500">OVERDUE</span>}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm text-zinc-300 tabular-nums">{formatCurrency(inv.totalAmount)}</td>
                        <td className="px-4 py-3 text-right font-mono text-sm text-emerald-400 tabular-nums">{formatCurrency(inv.paidAmount)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-mono text-sm font-bold tabular-nums ${bal > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>
                            {formatCurrency(bal)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_BADGE[inv.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-zinc-500 tabular-nums">{ageDays(inv.invoiceDate)}d</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
