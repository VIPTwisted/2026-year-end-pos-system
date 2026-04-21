import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Boxes, TrendingDown, DollarSign, Package2 } from 'lucide-react'

function statusBadge(status: string) {
  if (status === 'active') return <Badge variant="success">Active</Badge>
  if (status === 'disposed') return <Badge variant="secondary">Disposed</Badge>
  if (status === 'fully_depreciated') return <Badge variant="warning">Fully Depreciated</Badge>
  return <Badge variant="outline">{status}</Badge>
}

function methodLabel(method: string) {
  if (method === 'straight_line') return 'Straight-Line'
  if (method === 'declining_balance') return 'Declining Balance'
  if (method === 'sum_of_years') return 'Sum of Years'
  return method
}

export default async function FixedAssetsPage() {
  const assets = await prisma.fixedAsset.findMany({
    include: {
      group: true,
      depreciationLines: {
        orderBy: { postedAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { assetNumber: 'asc' },
  })

  const groups = await prisma.fixedAssetGroup.findMany({
    include: { assets: true },
    orderBy: { name: 'asc' },
  })

  const totalCount = assets.length
  const totalAcquisitionCost = assets.reduce((s, a) => s + a.acquisitionCost, 0)
  const totalBookValue = assets.reduce((s, a) => s + a.currentBookValue, 0)
  const totalAccumDeprec = assets.reduce((s, a) => s + a.accumulatedDeprec, 0)

  return (
    <div className="flex flex-col min-h-[100dvh] bg-zinc-950">
      <TopBar title="Fixed Assets" />

      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Package2 className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-xs text-zinc-500 uppercase tracking-wide font-medium">Total Assets</span>
            </div>
            <p className="text-2xl font-bold text-zinc-100">{totalCount}</p>
            <p className="text-xs text-zinc-500 mt-1">
              {assets.filter(a => a.status === 'active').length} active
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-xs text-zinc-500 uppercase tracking-wide font-medium">Acquisition Cost</span>
            </div>
            <p className="text-2xl font-bold text-zinc-100">{formatCurrency(totalAcquisitionCost)}</p>
            <p className="text-xs text-zinc-500 mt-1">total original cost</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <Boxes className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-xs text-zinc-500 uppercase tracking-wide font-medium">Total Book Value</span>
            </div>
            <p className="text-2xl font-bold text-zinc-100">{formatCurrency(totalBookValue)}</p>
            <p className="text-xs text-zinc-500 mt-1">
              {totalAcquisitionCost > 0
                ? `${((totalBookValue / totalAcquisitionCost) * 100).toFixed(1)}% of cost`
                : '—'}
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-red-400" />
              </div>
              <span className="text-xs text-zinc-500 uppercase tracking-wide font-medium">Accum. Depreciation</span>
            </div>
            <p className="text-2xl font-bold text-zinc-100">{formatCurrency(totalAccumDeprec)}</p>
            <p className="text-xs text-zinc-500 mt-1">
              {totalAcquisitionCost > 0
                ? `${((totalAccumDeprec / totalAcquisitionCost) * 100).toFixed(1)}% depreciated`
                : '—'}
            </p>
          </div>
        </div>

        {/* Asset Groups */}
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">Asset Groups</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {groups.map(group => {
              const groupBookValue = group.assets.reduce((s, a) => s + a.currentBookValue, 0)
              return (
                <div key={group.id} className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">{group.name}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{group.code} · {methodLabel(group.depreciationMethod)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-zinc-100">{formatCurrency(groupBookValue)}</p>
                    <p className="text-xs text-zinc-500">{group.assets.length} asset{group.assets.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions + Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">
                {assets.length} Fixed Asset{assets.length !== 1 ? 's' : ''}
              </h2>
              <p className="text-sm text-zinc-500 mt-0.5">Track, depreciate, and dispose of company assets</p>
            </div>
            <div className="flex items-center gap-3">
              <form action="/api/finance/fixed-assets/depreciate" method="POST">
                <Button
                  type="submit"
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 text-sm h-9 gap-2"
                >
                  <TrendingDown className="w-4 h-4" />
                  Run Depreciation
                </Button>
              </form>
              <Link href="/finance/fixed-assets/new">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white text-sm h-9 gap-2">
                  <Plus className="w-4 h-4" />
                  New Asset
                </Button>
              </Link>
            </div>
          </div>

          {assets.length === 0 ? (
            <div className="border border-zinc-800 rounded-xl p-16 text-center">
              <Boxes className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400 font-medium mb-2">No fixed assets yet</p>
              <p className="text-sm text-zinc-600 mb-6">Add your first asset to start tracking depreciation.</p>
              <Link href="/finance/fixed-assets/new">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white text-sm gap-2">
                  <Plus className="w-4 h-4" />
                  New Asset
                </Button>
              </Link>
            </div>
          ) : (
            <div className="border border-zinc-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/50">
                      <th className="text-left px-5 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Asset #</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Name</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Group</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Acquired</th>
                      <th className="text-right px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Cost</th>
                      <th className="text-right px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Accum. Depr.</th>
                      <th className="text-right px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Book Value</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Method</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {assets.map(asset => (
                      <tr key={asset.id} className="hover:bg-zinc-900/40 transition-colors group">
                        <td className="px-5 py-3.5">
                          <Link
                            href={`/finance/fixed-assets/${asset.id}`}
                            className="font-mono text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-400/5 px-2 py-0.5 rounded group-hover:bg-blue-400/10 transition-colors"
                          >
                            {asset.assetNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3.5">
                          <Link href={`/finance/fixed-assets/${asset.id}`} className="text-zinc-100 hover:text-blue-300 font-medium transition-colors">
                            {asset.name}
                          </Link>
                          {asset.location && (
                            <p className="text-xs text-zinc-500 mt-0.5">{asset.location}</p>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs text-zinc-300">{asset.group.name}</span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-zinc-400 whitespace-nowrap">
                          {new Date(asset.acquisitionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs font-mono text-zinc-200">
                          {formatCurrency(asset.acquisitionCost)}
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs font-mono text-red-400">
                          {formatCurrency(asset.accumulatedDeprec)}
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs font-mono font-semibold text-emerald-400">
                          {formatCurrency(asset.currentBookValue)}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs text-zinc-400">{methodLabel(asset.depreciationMethod)}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          {statusBadge(asset.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
