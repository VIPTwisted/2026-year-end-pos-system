import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Plus, FileText } from 'lucide-react'

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(d)
}

function ageDays(d: Date): number {
  return Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24))
}

const statusBadge: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-400',
  posted: 'bg-blue-500/10 text-blue-400',
  partial: 'bg-amber-500/10 text-amber-400',
  paid: 'bg-emerald-500/10 text-emerald-400',
  void: 'bg-red-500/10 text-red-400',
  cancelled: 'bg-red-500/10 text-red-400',
}

export default async function InvoicesListPage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const invoices = await prisma.customerInvoice.findMany({
    include: {
      customer: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
    orderBy: { invoiceDate: 'desc' },
    take: 100,
  })

  const totalCount = invoices.length
  const outstanding = invoices.filter((i) => !['paid', 'void', 'cancelled'].includes(i.status))
  const overdueCount = outstanding.filter(
    (i) => new Date(i.dueDate) < today
  ).length
  const arBalance = invoices.reduce((s, i) => {
    if (['void', 'cancelled'].includes(i.status)) return s
    return s + Math.max(0, i.totalAmount - i.paidAmount)
  }, 0)

  const newButton = (
    <Link
      href="/finance/invoices/new"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
    >
      <Plus className="w-3.5 h-3.5" />
      New Invoice
    </Link>
  )

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Sales Invoices"
        breadcrumb={[{ label: 'Finance', href: '/finance' }]}
        actions={newButton}
      />

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
              Total Invoices
            </div>
            <div className="text-2xl font-bold text-zinc-100 tabular-nums">{totalCount}</div>
            <div className="text-xs text-zinc-500 mt-1">all time</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
              Outstanding
            </div>
            <div className="text-2xl font-bold text-blue-400 tabular-nums">{outstanding.length}</div>
            <div className="text-xs text-zinc-500 mt-1">unpaid invoices</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
              Overdue
            </div>
            <div className="text-2xl font-bold text-red-400 tabular-nums">{overdueCount}</div>
            <div className="text-xs text-zinc-500 mt-1">past due date</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
              Total AR Balance
            </div>
            <div className="text-2xl font-bold text-zinc-100 tabular-nums font-mono">
              {formatCurrency(arBalance)}
            </div>
            <div className="text-xs text-zinc-500 mt-1">amount due</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">All Invoices</h2>
            <span className="text-xs text-zinc-500">{totalCount} records</span>
          </div>

          {invoices.length === 0 ? (
            <div className="py-20 text-center">
              <FileText className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">No invoices yet.</p>
              <Link
                href="/finance/invoices/new"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create First Invoice
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Invoice #
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Customer
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Due Date
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Total
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Paid
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Balance
                    </th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Age
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {invoices.map((inv) => {
                    const balance = Math.max(0, inv.totalAmount - inv.paidAmount)
                    const isOverdue =
                      new Date(inv.dueDate) < today &&
                      !['paid', 'void', 'cancelled'].includes(inv.status)
                    const age = ageDays(inv.invoiceDate)
                    return (
                      <tr key={inv.id} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="px-5 py-3">
                          <Link
                            href={`/finance/invoices/${inv.id}`}
                            className="font-mono text-xs text-blue-400 bg-blue-400/5 px-2 py-0.5 rounded hover:bg-blue-400/10 transition-colors"
                          >
                            {inv.invoiceNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-zinc-200">
                            {inv.customer.firstName} {inv.customer.lastName}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-zinc-400">{fmtDate(inv.invoiceDate)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${isOverdue ? 'text-red-400' : 'text-zinc-400'}`}>
                            {fmtDate(inv.dueDate)}
                            {isOverdue && (
                              <span className="ml-1 text-[10px] text-red-500">OVERDUE</span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono text-sm text-zinc-200 tabular-nums font-semibold">
                            {formatCurrency(inv.totalAmount)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono text-sm text-emerald-400 tabular-nums">
                            {formatCurrency(inv.paidAmount)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`font-mono text-sm font-bold tabular-nums ${
                              balance > 0 && !['void', 'cancelled'].includes(inv.status)
                                ? 'text-amber-400'
                                : 'text-zinc-500'
                            }`}
                          >
                            {formatCurrency(balance)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                              statusBadge[inv.status] ?? 'bg-zinc-700 text-zinc-400'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-xs text-zinc-500 tabular-nums">{age}d</span>
                        </td>
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
