import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import TradeAgreementActions from './TradeAgreementActions'

const TYPE_LABELS: Record<string, string> = {
  SALES_PRICE: 'Sales Price',
  PURCHASE_PRICE: 'Purchase Price',
  LINE_DISCOUNT: 'Line Discount',
  MULTI_LINE_DISCOUNT: 'Multi-Line Discount',
  TOTAL_DISCOUNT: 'Total Discount',
}

function FastTabHeader({ label, count }: { label: string; count?: number }) {
  return (
    <div className="border-b border-zinc-800/40 py-2.5 px-4 flex justify-between items-center bg-zinc-900/40">
      <span className="text-[12px] font-semibold uppercase tracking-wide text-zinc-300">
        {label}{count !== undefined ? ` (${count})` : ''}
      </span>
    </div>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-[13px] text-zinc-100">{value ?? '—'}</p>
    </div>
  )
}

export default async function TradeAgreementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const agreement = await prisma.tradeAgreement.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true } },
      vendor: { select: { id: true, name: true } },
      lines: {
        include: {
          product: { select: { id: true, name: true, sku: true } },
        },
      },
    },
  })
  if (!agreement) notFound()

  const relation = agreement.relation === 'all'
    ? 'All Customers/Vendors'
    : agreement.customer
      ? `Customer: ${agreement.customer.firstName} ${agreement.customer.lastName}`
      : agreement.vendor
        ? `Vendor: ${agreement.vendor.name}`
        : agreement.relation

  return (
    <>
      <TopBar title={`Trade Agreement — ${agreement.code}`} />
      <main className="flex-1 overflow-auto bg-[#0f0f1a]">

        {/* D365 Header Band */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/finance/trade-agreements"
                className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Trade Agreements
              </Link>
              <span className="text-zinc-700">/</span>
              <span className="font-mono text-lg font-bold text-zinc-100 tracking-tight">{agreement.code}</span>
              {agreement.isActive
                ? <Badge variant="success">Active</Badge>
                : <Badge variant="secondary">Inactive</Badge>}
              <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {TYPE_LABELS[agreement.type] ?? agreement.type}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TradeAgreementActions id={agreement.id} isActive={agreement.isActive} />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">

          {/* General FastTab */}
          <div className="border border-zinc-800/60 rounded-md overflow-hidden bg-zinc-900/20">
            <FastTabHeader label="General" />
            <div className="px-4 py-3 grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-4">
              <Field label="Relation" value={relation} />
              <Field label="Currency" value={agreement.currencyCode} />
              <Field label="Start Date" value={agreement.startDate ? new Date(agreement.startDate).toLocaleDateString() : '—'} />
              <Field label="End Date" value={agreement.endDate ? new Date(agreement.endDate).toLocaleDateString() : 'No expiry'} />
              {agreement.description && (
                <div className="col-span-2 md:col-span-4">
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-0.5">Description</p>
                  <p className="text-[13px] text-zinc-400">{agreement.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Lines FastTab */}
          <div className="border border-zinc-800/60 rounded-md overflow-hidden bg-zinc-900/20">
            <FastTabHeader label="Agreement Lines" count={agreement.lines.length} />
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                    {['Product', 'Min Qty', 'Max Qty', 'UOM', 'Amount', 'Disc %', 'From', 'To'].map(h => (
                      <th
                        key={h}
                        className={`px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide ${h === 'Product' ? 'text-left' : 'text-right'}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {agreement.lines.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-6 text-center text-[13px] text-zinc-500">No lines defined</td>
                    </tr>
                  )}
                  {agreement.lines.map(line => (
                    <tr key={line.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-2 text-[13px] text-zinc-300">
                        {line.product ? `${line.product.name} (${line.product.sku})` : '—'}
                      </td>
                      <td className="px-4 py-2 text-right text-[13px] text-zinc-400">{line.quantityMin}</td>
                      <td className="px-4 py-2 text-right text-[13px] text-zinc-400">{line.quantityMax ?? '—'}</td>
                      <td className="px-4 py-2 text-right text-[13px] text-zinc-400">{line.unitOfMeasure}</td>
                      <td className="px-4 py-2 text-right text-[13px] text-zinc-300">{formatCurrency(line.amount)}</td>
                      <td className="px-4 py-2 text-right text-[13px] text-zinc-400">{line.pct != null ? `${line.pct}%` : '—'}</td>
                      <td className="px-4 py-2 text-right text-[13px] text-zinc-400">{line.fromDate ? new Date(line.fromDate).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-2 text-right text-[13px] text-zinc-400">{line.toDate ? new Date(line.toDate).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
