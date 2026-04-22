import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, FileCheck, TrendingDown, Percent, DollarSign, ShoppingCart } from 'lucide-react'

const TYPE_LABELS: Record<string, string> = {
  SALES_PRICE: 'Sales Price',
  PURCHASE_PRICE: 'Purchase Price',
  LINE_DISCOUNT: 'Line Discount',
  MULTI_LINE_DISCOUNT: 'Multi-Line Discount',
  TOTAL_DISCOUNT: 'Total Discount',
}

const TYPE_COLORS: Record<string, string> = {
  SALES_PRICE: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PURCHASE_PRICE: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  LINE_DISCOUNT: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  MULTI_LINE_DISCOUNT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  TOTAL_DISCOUNT: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

export default async function TradeAgreementsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type: filterType } = await searchParams

  const [agreements, allCount] = await Promise.all([
    prisma.tradeAgreement.findMany({
      where: filterType ? { type: filterType } : undefined,
      include: {
        customer: { select: { firstName: true, lastName: true } },
        vendor: { select: { name: true } },
        _count: { select: { lines: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.tradeAgreement.count(),
  ])

  const activeCount = await prisma.tradeAgreement.count({ where: { isActive: true } })
  const salesPriceCount = await prisma.tradeAgreement.count({ where: { type: 'SALES_PRICE' } })
  const discountCount = await prisma.tradeAgreement.count({
    where: { type: { in: ['LINE_DISCOUNT', 'MULTI_LINE_DISCOUNT', 'TOTAL_DISCOUNT'] } },
  })

  const TABS = [
    { label: 'All', value: '' },
    { label: 'Sales Price', value: 'SALES_PRICE' },
    { label: 'Purchase Price', value: 'PURCHASE_PRICE' },
    { label: 'Line Discount', value: 'LINE_DISCOUNT' },
    { label: 'Multi-Line Discount', value: 'MULTI_LINE_DISCOUNT' },
    { label: 'Total Discount', value: 'TOTAL_DISCOUNT' },
  ]

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      <TopBar title="Trade Agreements" />
      <div className="flex-1 p-6 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Agreements', value: allCount, icon: FileCheck, color: 'text-blue-400' },
            { label: 'Active', value: activeCount, icon: TrendingDown, color: 'text-emerald-400' },
            { label: 'Sales Price', value: salesPriceCount, icon: DollarSign, color: 'text-violet-400' },
            { label: 'Discount Agreements', value: discountCount, icon: Percent, color: 'text-amber-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-xs text-zinc-400">{label}</span>
              </div>
              <div className="text-2xl font-bold text-zinc-100">{value}</div>
            </div>
          ))}
        </div>

        {/* Header + New Button */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {TABS.map(tab => (
              <Link
                key={tab.value}
                href={tab.value ? `/finance/trade-agreements?type=${tab.value}` : '/finance/trade-agreements'}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  (filterType ?? '') === tab.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
          <Link href="/finance/trade-agreements/new">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="w-4 h-4" />
              New Agreement
            </Button>
          </Link>
        </div>

        {/* Table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/80">
              <tr>
                {['Code', 'Description', 'Type', 'Relation', 'Lines', 'Date Range', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {agreements.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                    No trade agreements found
                  </td>
                </tr>
              )}
              {agreements.map(ag => {
                const relation = ag.relation === 'all'
                  ? 'All'
                  : ag.customer
                    ? `${ag.customer.firstName} ${ag.customer.lastName}`
                    : ag.vendor?.name ?? ag.relation

                const dateRange = ag.startDate || ag.endDate
                  ? `${ag.startDate ? new Date(ag.startDate).toLocaleDateString() : '—'} → ${ag.endDate ? new Date(ag.endDate).toLocaleDateString() : '∞'}`
                  : 'Always'

                return (
                  <tr key={ag.id} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/finance/trade-agreements/${ag.id}`} className="text-blue-400 hover:text-blue-300 font-mono text-xs">
                        {ag.code}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{ag.description}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-medium ${TYPE_COLORS[ag.type] ?? 'bg-zinc-700 text-zinc-300'}`}>
                        {TYPE_LABELS[ag.type] ?? ag.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{relation}</td>
                    <td className="px-4 py-3 text-zinc-400">{ag._count.lines}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{dateRange}</td>
                    <td className="px-4 py-3">
                      {ag.isActive
                        ? <Badge variant="success">Active</Badge>
                        : <Badge variant="secondary">Inactive</Badge>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
