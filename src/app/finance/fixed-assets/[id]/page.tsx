export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react'

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
}

function methodLabel(m: string) {
  if (m === 'straight_line') return 'Straight-Line'
  if (m === 'declining_balance') return 'Declining Balance (200%)'
  if (m === 'sum_of_years') return "Sum-of-Years' Digits"
  return m
}

const STATUS_BADGE: Record<string, string> = {
  active:            'bg-emerald-500/10 text-emerald-400',
  disposed:          'bg-zinc-700 text-zinc-400',
  fully_depreciated: 'bg-amber-500/10 text-amber-400',
}

function Field({ label, value, children }: { label: string; value?: string | null; children?: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">{label}</div>
      <div className="text-[13px] text-zinc-200">{children ?? value ?? '—'}</div>
    </div>
  )
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
        orderBy: [{ fiscalYear: 'desc' }, { periodNumber: 'desc' }],
        take: 24,
      },
    },
  })

  if (!asset) notFound()

  const depreciationPct = asset.acquisitionCost > 0
    ? (asset.accumulatedDeprec / asset.acquisitionCost * 100).toFixed(1)
    : '0'

  const actions = (
    <div className="flex items-center gap-1.5">
      <Link
        href={`/finance/fixed-assets/${id}/edit`}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-medium rounded transition-colors"
      >
        <Edit2 className="w-3.5 h-3.5" /> Edit
      </Link>
      <button className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors">
        <Trash2 className="w-3.5 h-3.5" /> Delete
      </button>
      <div className="w-px h-5 bg-zinc-700 mx-1" />
      {/* Navigate */}
      <div className="relative group">
        <button className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors">
          Navigate <ChevronDown className="w-3 h-3" />
        </button>
        <div className="absolute left-0 top-full mt-1 w-52 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-20 hidden group-hover:block">
          <Link href="/finance/gl-entries" className="block px-3 py-2 text-[12px] text-zinc-300 hover:bg-zinc-800 rounded-t-lg transition-colors">
            FA Ledger Entries
          </Link>
          <Link href="/finance/fixed-assets" className="block px-3 py-2 text-[12px] text-zinc-300 hover:bg-zinc-800 transition-colors">
            Maintenance
          </Link>
          <Link href="/finance/fixed-assets" className="block px-3 py-2 text-[12px] text-zinc-300 hover:bg-zinc-800 rounded-b-lg transition-colors">
            Depreciation Books
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <TopBar
        title={`${asset.assetNumber} · ${asset.name}`}
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Fixed Assets', href: '/finance/fixed-assets' },
        ]}
        actions={actions}
      />

      <div className="flex min-h-[100dvh] bg-[#0f0f1a]">
        <main className="flex-1 p-6 overflow-auto space-y-3">

          {/* General FastTab */}
          <details open className="group bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <summary className="flex items-center justify-between px-5 py-3 cursor-pointer select-none bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors list-none">
              <span className="text-[13px] font-semibold text-zinc-100">General</span>
              <ChevronDown className="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
              <Field label="No." value={asset.assetNumber} />
              <Field label="Description" value={asset.name} />
              <Field label="Description 2" value={asset.description ?? '—'} />
              <Field label="FA Class Code" value={asset.group.code} />
              <Field label="FA Subclass Code" value={asset.group.name} />
              <Field label="Location Code" value={asset.location ?? '—'} />
              <Field label="Serial No." value={asset.serialNumber ?? '—'} />
              <Field label="Status">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_BADGE[asset.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                  {asset.status.replace('_', ' ')}
                </span>
              </Field>
              <Field label="Blocked" value={asset.status === 'disposed' ? 'Yes' : 'No'} />
            </div>
          </details>

          {/* Depreciation Book FastTab */}
          <details open className="group bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <summary className="flex items-center justify-between px-5 py-3 cursor-pointer select-none bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors list-none">
              <span className="text-[13px] font-semibold text-zinc-100">Depreciation Book</span>
              <ChevronDown className="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
              <Field label="Depreciation Book Code" value="DEFAULT" />
              <Field label="Depreciation Method" value={methodLabel(asset.depreciationMethod)} />
              <Field label="FA Posting Date" value={formatDate(asset.acquisitionDate)} />
              <Field label="Acquisition Cost" value={formatCurrency(asset.acquisitionCost)} />
              <Field label="Salvage Value" value={formatCurrency(asset.salvageValue)} />
              <Field label="No. of Depreciation Years" value={String(asset.usefulLifeYears)} />
              <Field label="Accumulated Depreciation" value={formatCurrency(asset.accumulatedDeprec)} />
              <Field label="Book Value" value={formatCurrency(asset.currentBookValue)} />
              <Field label="% Depreciated" value={`${depreciationPct}%`} />
            </div>
          </details>

          {/* Maintenance FastTab */}
          <details className="group bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <summary className="flex items-center justify-between px-5 py-3 cursor-pointer select-none bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors list-none">
              <span className="text-[13px] font-semibold text-zinc-100">Maintenance</span>
              <ChevronDown className="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
              <Field label="Maintenance Vendor No." value="—" />
              <Field label="Under Maintenance" value="No" />
              {asset.notes && (
                <div className="col-span-3">
                  <Field label="Notes" value={asset.notes} />
                </div>
              )}
              {!asset.notes && (
                <div className="col-span-3">
                  <p className="text-[13px] text-zinc-500">No maintenance records.</p>
                </div>
              )}
            </div>
          </details>

          {/* Depreciation Ledger */}
          {asset.depreciationLines.length > 0 && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800/50 bg-zinc-900/30">
                <span className="text-[13px] font-semibold text-zinc-100">Depreciation Ledger</span>
              </div>
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-4 py-2 text-[10px] uppercase tracking-widest text-zinc-500">Fiscal Year</th>
                    <th className="text-left px-4 py-2 text-[10px] uppercase tracking-widest text-zinc-500">Period</th>
                    <th className="text-right px-4 py-2 text-[10px] uppercase tracking-widest text-zinc-500">Depreciation</th>
                    <th className="text-right px-4 py-2 text-[10px] uppercase tracking-widest text-zinc-500">Accum. Deprec.</th>
                    <th className="text-right px-4 py-2 text-[10px] uppercase tracking-widest text-zinc-500">Book Value</th>
                  </tr>
                </thead>
                <tbody>
                  {asset.depreciationLines.map((l, i) => (
                    <tr key={l.id} className={`hover:bg-zinc-800/20 ${i !== asset.depreciationLines.length - 1 ? 'border-b border-zinc-800/30' : ''}`}>
                      <td className="px-4 py-2 text-zinc-400">{l.fiscalYear}</td>
                      <td className="px-4 py-2 text-zinc-500">{l.periodNumber}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-zinc-300">{formatCurrency(l.depreciationAmount)}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-amber-400">{formatCurrency(l.accumulatedDepreciation)}</td>
                      <td className="px-4 py-2 text-right tabular-nums text-emerald-400">{formatCurrency(l.bookValueAfter)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {/* FactBox — FA Statistics */}
        <aside className="w-72 shrink-0 border-l border-zinc-800/50 p-4 space-y-4 bg-[#0f0f1a]">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 border-b border-zinc-800/50 bg-zinc-900/30">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">FA Statistics</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Book Value</div>
                <div className="text-xl font-bold text-emerald-400 tabular-nums">{formatCurrency(asset.currentBookValue)}</div>
              </div>
              <div className="pt-2 border-t border-zinc-800/50 space-y-2 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Acquisition Cost</span>
                  <span className="text-zinc-200 tabular-nums">{formatCurrency(asset.acquisitionCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Accum. Depreciation</span>
                  <span className="text-amber-400 tabular-nums">{formatCurrency(asset.accumulatedDeprec)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Book Value</span>
                  <span className="text-emerald-400 tabular-nums">{formatCurrency(asset.currentBookValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">% Depreciated</span>
                  <span className="text-zinc-200">{depreciationPct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Useful Life</span>
                  <span className="text-zinc-200">{asset.usefulLifeYears} years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Method</span>
                  <span className="text-zinc-200 text-[11px]">{methodLabel(asset.depreciationMethod)}</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="pt-2">
                <div className="w-full bg-zinc-800 rounded-full h-1.5">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min(parseFloat(depreciationPct), 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-zinc-600 mt-1">{depreciationPct}% depreciated</div>
              </div>
            </div>
          </div>

          {/* Navigate links */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 border-b border-zinc-800/50 bg-zinc-900/30">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Related</span>
            </div>
            <div className="py-1">
              <Link href="/finance/gl-entries" className="flex items-center justify-between px-4 py-2 text-[12px] text-zinc-400 hover:text-zinc-200 hover:bg-[rgba(99,102,241,0.05)] transition-colors">
                FA Ledger Entries <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/finance/fixed-assets" className="flex items-center justify-between px-4 py-2 text-[12px] text-zinc-400 hover:text-zinc-200 hover:bg-[rgba(99,102,241,0.05)] transition-colors">
                Depreciation Books <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
