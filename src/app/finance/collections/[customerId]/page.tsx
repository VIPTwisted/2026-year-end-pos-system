export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { ChevronLeft } from 'lucide-react'

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(d))
}

type BucketKey = 'b0_30' | 'b31_60' | 'b61_90' | 'b91_120' | 'b120plus'

function getBucket(days: number): BucketKey {
  if (days > 120) return 'b120plus'
  if (days > 90) return 'b91_120'
  if (days > 60) return 'b61_90'
  if (days > 30) return 'b31_60'
  return 'b0_30'
}

const BUCKET_LABEL: Record<BucketKey, string> = {
  b0_30: '0–30 Days',
  b31_60: '31–60 Days',
  b61_90: '61–90 Days',
  b91_120: '91–120 Days',
  b120plus: '120+ Days',
}
const BUCKET_COLOR: Record<BucketKey, string> = {
  b0_30: 'text-emerald-400',
  b31_60: 'text-amber-400',
  b61_90: 'text-orange-400',
  b91_120: 'text-red-400',
  b120plus: 'text-red-500',
}
const BUCKET_BADGE: Record<BucketKey, string> = {
  b0_30: 'bg-emerald-500/10 text-emerald-400',
  b31_60: 'bg-amber-500/10 text-amber-400',
  b61_90: 'bg-orange-500/10 text-orange-400',
  b91_120: 'bg-red-500/10 text-red-400',
  b120plus: 'bg-red-800/30 text-red-300',
}
const INV_BADGE: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-400',
  posted: 'bg-blue-500/10 text-blue-400',
  partial: 'bg-amber-500/10 text-amber-400',
  paid: 'bg-emerald-500/10 text-emerald-400',
  void: 'bg-red-500/10 text-red-400',
}

// Mock activity log entries — production would use a CollectionActivity model
const MOCK_ACTIVITIES = [
  { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), type: 'Email', note: 'First reminder sent via email.' },
  { date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), type: 'Call', note: 'Customer promised payment by next Friday.' },
  { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), type: 'System', note: 'Invoice flagged as overdue.' },
]

interface PageProps {
  params: Promise<{ customerId: string }>
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const { customerId } = await params

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      arInvoices: {
        where: { status: { in: ['posted', 'partial'] } },
        orderBy: { dueDate: 'asc' },
      },
    },
  })

  if (!customer) notFound()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const rows = customer.arInvoices
    .map((inv) => {
      const outstanding = Math.max(0, inv.totalAmount - inv.paidAmount)
      const due = new Date(inv.dueDate)
      due.setHours(0, 0, 0, 0)
      const daysOverdue = Math.max(
        0,
        Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
      )
      return { ...inv, outstanding, daysOverdue, bucket: getBucket(daysOverdue) }
    })
    .filter((r) => r.outstanding > 0.005)

  const totalOutstanding = rows.reduce((s, r) => s + r.outstanding, 0)
  const maxDays = rows.length > 0 ? Math.max(...rows.map((r) => r.daysOverdue)) : 0

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title={`${customer.firstName} ${customer.lastName} — Collections`}
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Collections', href: '/finance/collections' },
        ]}
      />

      <div className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
        <Link
          href="/finance/collections"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to Collections
        </Link>

        {/* Header */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">{customer.firstName} {customer.lastName}</h2>
              {customer.email && <p className="text-sm text-zinc-400 mt-0.5">{customer.email}</p>}
              {customer.phone && <p className="text-sm text-zinc-500 mt-0.5">{customer.phone}</p>}
            </div>
            <div className="text-right">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Outstanding</div>
              <div className="text-2xl font-bold font-mono text-red-400 tabular-nums">{formatCurrency(totalOutstanding)}</div>
              <div className="text-xs text-zinc-500 mt-1">{rows.length} open invoices · max {maxDays}d overdue</div>
            </div>
          </div>
        </div>

        {/* Open invoices */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">Open Invoices</h2>
            <span className="text-xs text-zinc-500">{rows.length} records</span>
          </div>

          {rows.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-zinc-500">No open invoices.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Invoice #</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Due Date</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Total</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Outstanding</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Days</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Bucket</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-3">
                        <Link href={`/finance/invoices/${row.id}`} className="font-mono text-xs text-blue-400 bg-blue-400/5 px-2 py-0.5 rounded hover:bg-blue-400/10">
                          {row.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400">{fmtDate(row.dueDate)}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-zinc-300 tabular-nums">{formatCurrency(row.totalAmount)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-mono text-sm font-bold tabular-nums ${BUCKET_COLOR[row.bucket]}`}>{formatCurrency(row.outstanding)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-mono text-xs font-semibold tabular-nums ${BUCKET_COLOR[row.bucket]}`}>{row.daysOverdue}d</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${BUCKET_BADGE[row.bucket]}`}>
                          {BUCKET_LABEL[row.bucket]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${INV_BADGE[row.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment promises / activity log (mock) */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50">
            <h2 className="text-sm font-semibold text-zinc-100">Activity Log</h2>
          </div>
          <div className="divide-y divide-zinc-800/30">
            {MOCK_ACTIVITIES.map((a, i) => (
              <div key={i} className="px-5 py-3 flex items-start gap-3">
                <div className="mt-0.5 w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-zinc-300">{a.type}</span>
                  <span className="mx-2 text-zinc-600">·</span>
                  <span className="text-xs text-zinc-500">{fmtDate(a.date)}</span>
                  <p className="text-xs text-zinc-400 mt-0.5">{a.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
