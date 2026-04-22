export const dynamic = 'force-dynamic'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Building2, DollarSign, TrendingDown, Package2 } from 'lucide-react'

function statusBadge(status: string) {
  const cls: Record<string, string> = {
    active: 'bg-emerald-500/20 text-emerald-400',
    disposed: 'bg-zinc-700/60 text-zinc-400',
    inactive: 'bg-amber-500/20 text-amber-400',
  }
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${cls[status] ?? 'bg-zinc-700/40 text-zinc-500'}`}>
      {status}
    </span>
  )
}

function methodLabel(method: string) {
  const map: Record<string, string> = {
    straight_line: 'Straight-Line',
    declining_balance: 'Declining Balance',
    sum_of_years: 'Sum of Years',
    units_of_production: 'Units of Production',
    manual: 'Manual',
  }
  return map[method] ?? method
}

export default async function FixedAssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const activeTab = status ?? 'active'

  const allAssets = await prisma.fixedAsset.findMany({
    include: {
      class: true,
      subclass: true,
      depreciationBooks: { where: { isActive: true }, take: 1 },
    },
    orderBy: { assetNumber: 'asc' },
  })

  const filtered = activeTab === 'all'
    ? allAssets
    : allAssets.filter(a => a.status === activeTab)

  const totalCount = allAssets.length
  const totalAcquisitionCost = allAssets.reduce((s, a) => s + a.acquisitionCost, 0)
  const totalBookValue = allAssets.reduce((s, a) => {
    const b = a.depreciationBooks[0]
    return s + (b ? b.bookValue : a.acquisitionCost)
  }, 0)
  const totalAccumDeprec = allAssets.reduce((s, a) => {
    const b = a.depreciationBooks[0]
    return s + (b ? b.accumulatedDepreciation : 0)
  }, 0)

  const tabs = [
    { key: 'active', label: 'Active', count: allAssets.filter(a => a.status === 'active').length },
    { key: 'inactive', label: 'Inactive', count: allAssets.filter(a => a.status === 'inactive').length },
    { key: 'disposed', label: 'Disposed', count: allAssets.filter(a => a.status === 'disposed').length },
    { key: 'all', label: 'All', count: totalCount },
  ]

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Fixed Assets" />

      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-semibold text-zinc-100">Fixed Assets</h2>
            <p className="text-[13px] text-zinc-500">{totalCount} assets registered</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/fixed-assets/depreciation-run"
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-transparent hover:bg-zinc-800/50 text-zinc-300 px-3 h-9 text-[13px] font-medium transition-colors"
            >
              <TrendingDown className="w-4 h-4" />
              Depreciation Run
            </Link>
            <Link
              href="/fixed-assets/classes"
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-transparent hover:bg-zinc-800/50 text-zinc-300 px-3 h-9 text-[13px] font-medium transition-colors"
            >
              <Building2 className="w-4 h-4" />
              Classes
            </Link>
            <Link
              href="/fixed-assets/new"
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white px-3 h-9 text-[13px] font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Asset
            </Link>
          </div>
        </div>

        {/* KPI Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package2 className="w-4 h-4 text-blue-400" />
              <p className="text-[11px] uppercase tracking-widest text-zinc-500">Total Assets</p>
            </div>
            <p className="text-2xl font-bold text-zinc-100">{totalCount}</p>
            <p className="text-[11px] text-zinc-500 mt-1">{allAssets.filter(a => a.status === 'active').length} active</p>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <p className="text-[11px] uppercase tracking-widest text-zinc-500">Acquisition Cost</p>
            </div>
            <p className="text-2xl font-bold text-zinc-100">{formatCurrency(totalAcquisitionCost)}</p>
            <p className="text-[11px] text-zinc-500 mt-1">total original cost</p>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <p className="text-[11px] uppercase tracking-widest text-zinc-500">Total Book Value</p>
            </div>
            <p className="text-2xl font-bold text-zinc-100">{formatCurrency(totalBookValue)}</p>
            <p className="text-[11px] text-zinc-500 mt-1">
              {totalAcquisitionCost > 0
                ? `${((totalBookValue / totalAcquisitionCost) * 100).toFixed(1)}% of cost`
                : '—'}
            </p>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <p className="text-[11px] uppercase tracking-widest text-zinc-500">Accum. Depreciation</p>
            </div>
            <p className="text-2xl font-bold text-zinc-100">{formatCurrency(totalAccumDeprec)}</p>
            <p className="text-[11px] text-zinc-500 mt-1">
              {totalAcquisitionCost > 0
                ? `${((totalAccumDeprec / totalAcquisitionCost) * 100).toFixed(1)}% depreciated`
                : '—'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-[#16213e] border border-zinc-800/50 rounded-lg p-1 w-fit">
          {tabs.map(t => (
            <Link
              key={t.key}
              href={`/fixed-assets${t.key === 'all' ? '?status=all' : t.key === 'active' ? '' : `?status=${t.key}`}`}
              className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === t.key
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-100'
              }`}
            >
              {t.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === t.key ? 'bg-white/20' : 'bg-zinc-800'}`}>
                {t.count}
              </span>
            </Link>
          ))}
        </div>

        {/* Assets Table */}
        {filtered.length === 0 ? (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-16 text-zinc-500">
            <Package2 className="w-10 h-10 mb-4 opacity-30" />
            <p className="text-[13px] font-medium text-zinc-400 mb-2">No assets in this view</p>
            <p className="text-[13px] mb-6">Register a new asset to get started.</p>
            <Link
              href="/fixed-assets/new"
              className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white px-3 h-9 text-[13px] font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Asset
            </Link>
          </div>
        ) : (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Asset #</th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Description</th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Class</th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Acq. Date</th>
                    <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Cost</th>
                    <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Book Value</th>
                    <th className="text-right px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Accum. Depr.</th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(asset => {
                    const book = asset.depreciationBooks[0]
                    const bookValue = book ? book.bookValue : asset.acquisitionCost
                    const accumDeprec = book ? book.accumulatedDepreciation : 0
                    return (
                      <tr key={asset.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                        <td className="px-5 py-2">
                          <Link
                            href={`/fixed-assets/${asset.id}`}
                            className="font-mono text-[13px] font-semibold text-blue-400 hover:text-blue-300"
                          >
                            {asset.assetNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-2">
                          <Link href={`/fixed-assets/${asset.id}`} className="text-[13px] text-zinc-100 hover:text-blue-300 font-medium transition-colors">
                            {asset.description}
                          </Link>
                          {asset.location && (
                            <p className="text-[11px] text-zinc-500 mt-0.5">{asset.location}</p>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <span className="text-[13px] text-zinc-300">{asset.class?.name ?? '—'}</span>
                          {asset.subclass && (
                            <p className="text-[11px] text-zinc-600 mt-0.5">{asset.subclass.name}</p>
                          )}
                        </td>
                        <td className="px-4 py-2 text-[13px] text-zinc-400 whitespace-nowrap">
                          {asset.acquisitionDate
                            ? new Date(asset.acquisitionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                            : '—'}
                        </td>
                        <td className="px-4 py-2 text-right text-[13px] font-mono text-zinc-100">
                          {formatCurrency(asset.acquisitionCost)}
                        </td>
                        <td className="px-4 py-2 text-right text-[13px] font-mono font-semibold text-emerald-400">
                          {formatCurrency(bookValue)}
                        </td>
                        <td className="px-4 py-2 text-right text-[13px] font-mono text-red-400">
                          {formatCurrency(accumDeprec)}
                        </td>
                        <td className="px-4 py-2">
                          {statusBadge(asset.status)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
