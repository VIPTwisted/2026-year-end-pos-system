import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Hash, FileText } from 'lucide-react'
import DisposeAssetForm from './DisposeAssetForm'

function statusBadge(status: string) {
  if (status === 'active') return <Badge variant="success">Active</Badge>
  if (status === 'disposed') return <Badge variant="secondary">Disposed</Badge>
  if (status === 'fully_depreciated') return <Badge variant="warning">Fully Depreciated</Badge>
  return <Badge variant="outline">{status}</Badge>
}

function methodLabel(method: string) {
  if (method === 'straight_line') return 'Straight-Line'
  if (method === 'declining_balance') return 'Declining Balance (200%)'
  if (method === 'sum_of_years') return 'Sum of Years\' Digits'
  return method
}

/** Build a projected depreciation schedule (monthly) without saving */
function buildProjectedSchedule(
  method: string,
  acquisitionCost: number,
  salvageValue: number,
  usefulLifeYears: number,
  startYear = new Date().getFullYear()
): Array<{
  fiscalYear: number
  periodNumber: number
  depreciationAmount: number
  accumulatedDepreciation: number
  bookValueAfter: number
}> {
  const totalMonths = usefulLifeYears * 12
  const rows = []
  let bookValue = acquisitionCost
  let accumulated = 0

  for (let m = 1; m <= totalMonths; m++) {
    if (bookValue <= salvageValue) break
    let depreciationAmount = 0

    if (method === 'straight_line') {
      depreciationAmount = (acquisitionCost - salvageValue) / totalMonths
    } else if (method === 'declining_balance') {
      depreciationAmount = bookValue * (2 / totalMonths)
    } else if (method === 'sum_of_years') {
      const remainingMonths = totalMonths - m + 1
      const sumMonths = (totalMonths * (totalMonths + 1)) / 2
      depreciationAmount = ((acquisitionCost - salvageValue) * remainingMonths) / sumMonths
    }

    depreciationAmount = Math.min(depreciationAmount, bookValue - salvageValue)
    bookValue -= depreciationAmount
    accumulated += depreciationAmount

    const yearOffset = Math.floor((m - 1) / 12)
    const periodInYear = ((m - 1) % 12) + 1
    rows.push({
      fiscalYear: startYear + yearOffset,
      periodNumber: periodInYear,
      depreciationAmount,
      accumulatedDepreciation: accumulated,
      bookValueAfter: bookValue,
    })
  }
  return rows
}

export default async function FixedAssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const asset = await prisma.fixedAsset.findUnique({
    where: { id },
    include: {
      group: true,
      depreciationLines: {
        orderBy: [{ fiscalYear: 'asc' }, { periodNumber: 'asc' }],
      },
    },
  })

  if (!asset) notFound()

  const hasLines = asset.depreciationLines.length > 0
  const projected = hasLines ? [] : buildProjectedSchedule(
    asset.depreciationMethod,
    asset.acquisitionCost,
    asset.salvageValue,
    asset.usefulLifeYears,
    new Date(asset.acquisitionDate).getFullYear()
  )

  const depreciationPct = asset.acquisitionCost > 0
    ? (asset.accumulatedDeprec / asset.acquisitionCost) * 100
    : 0

  return (
    <div className="flex flex-col min-h-[100dvh] bg-zinc-950">
      <TopBar title={`Asset: ${asset.assetNumber}`} />

      <main className="flex-1 p-6 overflow-auto space-y-8">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Back */}
          <Link href="/finance/fixed-assets" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Fixed Assets
          </Link>

          {/* Asset Header */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="font-mono text-sm font-bold text-blue-400 bg-blue-400/10 px-2.5 py-1 rounded-lg border border-blue-400/20">
                    {asset.assetNumber}
                  </span>
                  {statusBadge(asset.status)}
                  <Badge variant="outline">{methodLabel(asset.depreciationMethod)}</Badge>
                </div>
                <h1 className="text-xl font-bold text-zinc-100 mb-1">{asset.name}</h1>
                <p className="text-sm text-zinc-500">{asset.group.name}</p>
                {asset.description && (
                  <p className="text-sm text-zinc-400 mt-2">{asset.description}</p>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap">
                {asset.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {asset.location}
                  </span>
                )}
                {asset.serialNumber && (
                  <span className="flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5" />
                    {asset.serialNumber}
                  </span>
                )}
                {asset.notes && (
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    {asset.notes}
                  </span>
                )}
              </div>
            </div>

            {/* Key Figures */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-800">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Acquisition Cost</p>
                <p className="text-2xl font-bold text-zinc-100">{formatCurrency(asset.acquisitionCost)}</p>
                <p className="text-xs text-zinc-600 mt-0.5">
                  {new Date(asset.acquisitionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Accumulated Depreciation</p>
                <p className="text-2xl font-bold text-red-400">{formatCurrency(asset.accumulatedDeprec)}</p>
                <p className="text-xs text-zinc-600 mt-0.5">{depreciationPct.toFixed(1)}% of cost</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Current Book Value</p>
                <p className="text-2xl font-bold text-emerald-400">{formatCurrency(asset.currentBookValue)}</p>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Salvage: {formatCurrency(asset.salvageValue)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Useful Life</p>
                <p className="text-2xl font-bold text-zinc-100">{asset.usefulLifeYears}y</p>
                <p className="text-xs text-zinc-600 mt-0.5">
                  {asset.usefulLifeYears * 12} periods total
                </p>
              </div>
            </div>

            {/* Depreciation progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
                <span>Depreciation progress</span>
                <span>{depreciationPct.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all"
                  style={{ width: `${Math.min(depreciationPct, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Depreciation Schedule */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
                Depreciation Schedule
              </h2>
              {!hasLines && (
                <span className="text-xs text-zinc-600 italic">Projected — no entries posted yet</span>
              )}
            </div>

            <div className="border border-zinc-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-zinc-900 z-10">
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-5 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Fiscal Year</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Period</th>
                      <th className="text-right px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Depreciation</th>
                      <th className="text-right px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Accum. Depr.</th>
                      <th className="text-right px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Book Value After</th>
                      {hasLines && (
                        <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Posted</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {hasLines
                      ? asset.depreciationLines.map(line => (
                          <tr key={line.id} className="hover:bg-zinc-900/40 transition-colors">
                            <td className="px-5 py-3 text-xs font-mono text-zinc-300">{line.fiscalYear}</td>
                            <td className="px-4 py-3 text-xs text-zinc-400">Period {line.periodNumber}</td>
                            <td className="px-4 py-3 text-right text-xs font-mono text-red-400">
                              {formatCurrency(line.depreciationAmount)}
                            </td>
                            <td className="px-4 py-3 text-right text-xs font-mono text-zinc-300">
                              {formatCurrency(line.accumulatedDepreciation)}
                            </td>
                            <td className="px-4 py-3 text-right text-xs font-mono font-semibold text-emerald-400">
                              {formatCurrency(line.bookValueAfter)}
                            </td>
                            <td className="px-4 py-3 text-xs text-zinc-500">
                              {new Date(line.postedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </td>
                          </tr>
                        ))
                      : projected.slice(0, 60).map((row, i) => (
                          <tr key={i} className="hover:bg-zinc-900/40 transition-colors">
                            <td className="px-5 py-3 text-xs font-mono text-zinc-500">{row.fiscalYear}</td>
                            <td className="px-4 py-3 text-xs text-zinc-600">Period {row.periodNumber}</td>
                            <td className="px-4 py-3 text-right text-xs font-mono text-zinc-500">
                              {formatCurrency(row.depreciationAmount)}
                            </td>
                            <td className="px-4 py-3 text-right text-xs font-mono text-zinc-500">
                              {formatCurrency(row.accumulatedDepreciation)}
                            </td>
                            <td className="px-4 py-3 text-right text-xs font-mono text-zinc-400">
                              {formatCurrency(row.bookValueAfter)}
                            </td>
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
              </div>
              {!hasLines && projected.length > 60 && (
                <div className="px-5 py-2 border-t border-zinc-800 text-xs text-zinc-600 italic">
                  Showing first 60 of {projected.length} projected periods
                </div>
              )}
            </div>
          </div>

          {/* Dispose Asset */}
          {asset.status === 'active' && (
            <DisposeAssetForm assetId={asset.id} assetName={asset.name} />
          )}

          {asset.status === 'disposed' && asset.disposedAt && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-4">Disposal Record</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Disposal Date</p>
                  <p className="text-zinc-200">
                    {new Date(asset.disposedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Disposal Amount</p>
                  <p className="text-zinc-200">
                    {asset.disposalAmount != null ? formatCurrency(asset.disposalAmount) : '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
