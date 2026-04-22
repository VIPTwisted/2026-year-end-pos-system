export const dynamic = 'force-dynamic'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Hash, User, Calendar, Shield, Wrench } from 'lucide-react'
import FAActions from './FAActions'

function statusBadge(status: string) {
  if (status === 'active') return <Badge variant="success">Active</Badge>
  if (status === 'disposed') return <Badge variant="secondary">Disposed</Badge>
  if (status === 'inactive') return <Badge variant="warning">Inactive</Badge>
  return <Badge variant="outline">{status}</Badge>
}

function entryTypeBadge(type: string) {
  const styles: Record<string, string> = {
    acquisition: 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
    depreciation: 'bg-red-500/15 text-red-300 border border-red-500/30',
    write_down: 'bg-orange-500/15 text-orange-300 border border-orange-500/30',
    appreciation: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    disposal: 'bg-zinc-500/15 text-zinc-300 border border-zinc-500/30',
    revaluation: 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
    salvage_value: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
  }
  const cls = styles[type] ?? 'bg-zinc-700/30 text-zinc-400'
  const label = type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
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

function remainingLife(book: { depreciationStartDate: Date | null; noOfDepreciationYears: number; lastDepreciationDate: Date | null }): string {
  if (!book.depreciationStartDate) return '—'
  const start = new Date(book.depreciationStartDate)
  const endMs = start.getTime() + book.noOfDepreciationYears * 365.25 * 24 * 60 * 60 * 1000
  const remaining = (endMs - Date.now()) / (365.25 * 24 * 60 * 60 * 1000)
  if (remaining <= 0) return 'Fully depreciated'
  return `${remaining.toFixed(1)} yrs`
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
      class: true,
      subclass: true,
      depreciationBooks: true,
      ledgerEntries: {
        orderBy: { postingDate: 'desc' },
        take: 20,
      },
      maintenanceLedger: {
        orderBy: { serviceDate: 'desc' },
      },
      insurances: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!asset) notFound()

  const book = asset.depreciationBooks[0] ?? null
  const bookValue = book ? book.bookValue : asset.acquisitionCost
  const accumDeprec = book ? book.accumulatedDepreciation : 0
  const depreciationPct = asset.acquisitionCost > 0 ? (accumDeprec / asset.acquisitionCost) * 100 : 0

  return (
    <>
      <TopBar title={`Asset: ${asset.assetNumber}`} />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a]">
        <div className="max-w-5xl mx-auto space-y-6">

          <Link href="/fixed-assets" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Fixed Assets
          </Link>

          {/* Header */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className="font-mono text-sm font-bold text-blue-400 bg-blue-400/10 px-2.5 py-1 rounded-lg border border-blue-400/20">
                    {asset.assetNumber}
                  </span>
                  {statusBadge(asset.status)}
                  {asset.class && (
                    <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                      {asset.class.code}
                    </span>
                  )}
                  {asset.subclass && (
                    <span className="text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">
                      {asset.subclass.code}
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-zinc-100 mb-1">{asset.description}</h1>
                {asset.class && <p className="text-sm text-zinc-500">{asset.class.name}{asset.subclass ? ` / ${asset.subclass.name}` : ''}</p>}
              </div>
              <div className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap">
                {asset.location && (
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{asset.location}</span>
                )}
                {asset.serialNumber && (
                  <span className="flex items-center gap-1"><Hash className="w-3.5 h-3.5" />{asset.serialNumber}</span>
                )}
                {asset.responsibleEmployee && (
                  <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{asset.responsibleEmployee}</span>
                )}
              </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-zinc-800">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Acquisition Cost</p>
                <p className="text-2xl font-bold text-zinc-100">{formatCurrency(asset.acquisitionCost)}</p>
                <p className="text-xs text-zinc-600 mt-0.5">
                  {asset.acquisitionDate
                    ? new Date(asset.acquisitionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Book Value</p>
                <p className="text-2xl font-bold text-emerald-400">{formatCurrency(bookValue)}</p>
                <p className="text-xs text-zinc-600 mt-0.5">Salvage: {formatCurrency(asset.salvageValue)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Accum. Depreciation</p>
                <p className="text-2xl font-bold text-red-400">{formatCurrency(accumDeprec)}</p>
                <p className="text-xs text-zinc-600 mt-0.5">{depreciationPct.toFixed(1)}% of cost</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">Remaining Life</p>
                <p className="text-2xl font-bold text-zinc-100">{book ? remainingLife(book) : '—'}</p>
                <p className="text-xs text-zinc-600 mt-0.5">
                  {book ? `${book.noOfDepreciationYears}y total` : 'No book'}
                </p>
              </div>
            </div>

            {/* Progress bar */}
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

          {/* Depreciation Book */}
          {book && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-4">
                Depreciation Book — {book.bookCode}
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Method</p>
                  <p className="text-zinc-200">{methodLabel(book.depreciationMethod)}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Years</p>
                  <p className="text-zinc-200">{book.noOfDepreciationYears}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Start Date</p>
                  <p className="text-zinc-200">
                    {book.depreciationStartDate
                      ? new Date(book.depreciationStartDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Last Depreciation</p>
                  <p className="text-zinc-200">
                    {book.lastDepreciationDate
                      ? new Date(book.lastDepreciationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                      : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <FAActions assetId={asset.id} status={asset.status} />

          {/* Ledger Entries */}
          <div>
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
              FA Ledger Entries <span className="text-zinc-600 normal-case font-normal">(last 20)</span>
            </h2>
            {asset.ledgerEntries.length === 0 ? (
              <div className="border border-zinc-800/50 rounded-lg p-8 text-center text-zinc-600 text-sm">
                No ledger entries yet.
              </div>
            ) : (
              <div className="border border-zinc-800/50 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/50">
                      <th className="text-left px-5 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Date</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Type</th>
                      <th className="text-right px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Amount</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Description</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Document #</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {asset.ledgerEntries.map(entry => (
                      <tr key={entry.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="px-5 py-3 text-xs text-zinc-400 whitespace-nowrap">
                          {new Date(entry.postingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-4 py-3">{entryTypeBadge(entry.entryType)}</td>
                        <td className={`px-4 py-3 text-right text-xs font-mono font-semibold ${entry.amount < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {entry.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(entry.amount))}
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-400">{entry.description ?? '—'}</td>
                        <td className="px-4 py-3 text-xs font-mono text-zinc-600">{entry.documentNo ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Maintenance Tab */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="w-4 h-4 text-zinc-500" />
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">Maintenance History</h2>
            </div>
            {asset.maintenanceLedger.length === 0 ? (
              <div className="border border-zinc-800/50 rounded-lg p-8 text-center text-zinc-600 text-sm">
                No maintenance records.
              </div>
            ) : (
              <div className="border border-zinc-800/50 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/50">
                      <th className="text-left px-5 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Service Date</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Description</th>
                      <th className="text-right px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Amount</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Code</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {asset.maintenanceLedger.map(m => (
                      <tr key={m.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="px-5 py-3 text-xs text-zinc-400 whitespace-nowrap">
                          {new Date(m.serviceDate ?? m.maintenanceDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-300">{m.description}</td>
                        <td className="px-4 py-3 text-right text-xs font-mono text-zinc-200">{formatCurrency(m.amount)}</td>
                        <td className="px-4 py-3 text-xs text-zinc-500">{m.maintenanceCode ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Insurance Tab */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-zinc-500" />
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">Insurance Policies</h2>
            </div>
            {asset.insurances.length === 0 ? (
              <div className="border border-zinc-800/50 rounded-lg p-8 text-center text-zinc-600 text-sm">
                No insurance policies.
              </div>
            ) : (
              <div className="border border-zinc-800/50 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/50">
                      <th className="text-left px-5 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Policy #</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Insurer</th>
                      <th className="text-right px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Annual Premium</th>
                      <th className="text-right px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Coverage</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Start</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">End</th>
                      <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {asset.insurances.map(ins => (
                      <tr key={ins.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="px-5 py-3 text-xs font-mono text-blue-400">{ins.policyNo}</td>
                        <td className="px-4 py-3 text-xs text-zinc-300">{ins.insurerName}</td>
                        <td className="px-4 py-3 text-right text-xs font-mono text-zinc-200">{formatCurrency(ins.annualPremium)}</td>
                        <td className="px-4 py-3 text-right text-xs font-mono text-zinc-200">{formatCurrency(ins.coverageAmount)}</td>
                        <td className="px-4 py-3 text-xs text-zinc-500">
                          {ins.startDate ? new Date(ins.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-500">
                          {ins.endDate ? new Date(ins.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          {ins.isActive
                            ? <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">Active</span>
                            : <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-700/30 text-zinc-500">Expired</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Notes */}
          {asset.notes && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-zinc-500" />
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">Notes</h2>
              </div>
              <p className="text-sm text-zinc-400">{asset.notes}</p>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
