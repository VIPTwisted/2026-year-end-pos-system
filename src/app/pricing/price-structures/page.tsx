'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ChevronRight, Grid3X3, Pencil, X, Check, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

// Dimension definitions — mirroring D365 price structure matrix
const TIERS = ['Standard', 'Silver', 'Gold', 'Platinum'] as const
const CATEGORIES = [
  'Electronics',
  'Apparel',
  'Home & Garden',
  'Food & Beverage',
  'Health & Beauty',
  'Automotive',
  'Office Supplies',
  'Sports & Outdoors',
] as const

type Tier = typeof TIERS[number]
type Category = typeof CATEGORIES[number]

interface MatrixCell {
  tier: Tier
  category: Category
  multiplier: number   // e.g. 0.90 = 10% off base price
  override: number | null  // absolute price override (null = use multiplier)
}

interface MatrixData {
  cells: MatrixCell[]
}

// colour ramp based on multiplier value
function multiplierColor(m: number): string {
  if (m < 0.85) return 'bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
  if (m < 0.95) return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  if (m <= 1.0)  return 'bg-zinc-700/40 text-zinc-300 border-zinc-600/40'
  if (m <= 1.1)  return 'bg-amber-500/20 text-amber-300 border-amber-500/30'
  return 'bg-rose-500/20 text-rose-300 border-rose-500/30'
}

function buildDefaultMatrix(): MatrixCell[] {
  return CATEGORIES.flatMap(category =>
    TIERS.map(tier => {
      const tierMult: Record<Tier, number> = { Standard: 1.0, Silver: 0.95, Gold: 0.90, Platinum: 0.85 }
      return { tier, category, multiplier: tierMult[tier], override: null }
    })
  )
}

export default function PriceStructuresPage() {
  const [matrix, setMatrix] = useState<MatrixData>({ cells: [] })
  const [loading, setLoading] = useState(true)
  const [editCell, setEditCell] = useState<MatrixCell | null>(null)
  const [editMultiplier, setEditMultiplier] = useState('')
  const [editOverride, setEditOverride] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pricing/price-structures')
      const data = await res.json()
      setMatrix({ cells: Array.isArray(data.cells) && data.cells.length > 0 ? data.cells : buildDefaultMatrix() })
    } catch {
      setMatrix({ cells: buildDefaultMatrix() })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function openEdit(cell: MatrixCell) {
    setEditCell(cell)
    setEditMultiplier(String(cell.multiplier))
    setEditOverride(cell.override != null ? String(cell.override) : '')
  }

  async function saveCell() {
    if (!editCell) return
    setSaving(true)
    const newMultiplier = parseFloat(editMultiplier) || editCell.multiplier
    const newOverride   = editOverride !== '' ? parseFloat(editOverride) : null

    try {
      await fetch('/api/pricing/price-structures', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier:       editCell.tier,
          category:   editCell.category,
          multiplier: newMultiplier,
          override:   newOverride,
        }),
      })
      // Optimistically update local state
      setMatrix(prev => ({
        cells: prev.cells.map(c =>
          c.tier === editCell.tier && c.category === editCell.category
            ? { ...c, multiplier: newMultiplier, override: newOverride }
            : c
        ),
      }))
      setEditCell(null)
    } catch {
      // silent — data already applied locally
    } finally {
      setSaving(false)
    }
  }

  function getCell(tier: Tier, category: Category): MatrixCell | undefined {
    return matrix.cells.find(c => c.tier === tier && c.category === category)
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/pricing" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Pricing</Link>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Price Structures</h1>
            <p className="text-zinc-500 text-xs mt-0.5">Attribute-based pricing matrix — customer tier × product category</p>
          </div>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-zinc-500">
        <span className="font-medium text-zinc-400">Multiplier legend:</span>
        {[
          { label: '< 0.85', cls: 'bg-emerald-500/30 text-emerald-300 border-emerald-500/40' },
          { label: '0.85–0.95', cls: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
          { label: '0.95–1.0', cls: 'bg-zinc-700/40 text-zinc-300 border-zinc-600/40' },
          { label: '1.0–1.1', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
          { label: '> 1.1', cls: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
        ].map(item => (
          <span key={item.label} className={cn('px-2 py-0.5 rounded border text-xs', item.cls)}>{item.label}</span>
        ))}
        <span className="ml-2">Click any cell to edit</span>
      </div>

      {/* Matrix */}
      <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-zinc-800">
          <Grid3X3 className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-zinc-100">Pricing Matrix</span>
          <span className="text-zinc-500 text-sm">({TIERS.length} tiers × {CATEGORIES.length} categories)</span>
        </div>

        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-zinc-800/50 rounded animate-pulse" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide min-w-40 sticky left-0 bg-[#16213e] z-10">
                    Category / Tier
                  </th>
                  {TIERS.map(tier => (
                    <th key={tier} className="px-4 py-3 text-zinc-400 font-medium text-xs uppercase tracking-wide text-center min-w-32">
                      {tier}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {CATEGORIES.map(category => (
                  <tr key={category} className="hover:bg-zinc-800/20">
                    <td className="px-4 py-3 text-zinc-300 font-medium text-sm sticky left-0 bg-[#16213e] border-r border-zinc-800/50">
                      {category}
                    </td>
                    {TIERS.map(tier => {
                      const cell = getCell(tier, category)
                      const m = cell?.multiplier ?? 1.0
                      return (
                        <td key={tier} className="px-4 py-3 text-center">
                          <button
                            onClick={() => cell && openEdit(cell)}
                            className={cn(
                              'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-mono font-medium transition-all hover:scale-105 group',
                              multiplierColor(m)
                            )}
                          >
                            ×{m.toFixed(2)}
                            {cell?.override != null && (
                              <span className="text-[10px] opacity-70 ml-1">${cell.override.toFixed(2)}</span>
                            )}
                            <Pencil className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 ml-0.5" />
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Cell Modal */}
      {editCell && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <div>
                <h2 className="text-base font-semibold text-zinc-100">Edit Cell</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {editCell.tier} tier · {editCell.category}
                </p>
              </div>
              <button onClick={() => setEditCell(null)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
                  Price Multiplier
                  <span className="text-zinc-600 ml-2 font-normal">(0.85 = 15% discount · 1.10 = 10% markup)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={0.01}
                  max={5}
                  value={editMultiplier}
                  onChange={e => setEditMultiplier(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
                  Price Override
                  <span className="text-zinc-600 ml-2 font-normal">(absolute price — leave blank to use multiplier)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  placeholder="e.g. 49.99"
                  value={editOverride}
                  onChange={e => setEditOverride(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>

              {/* Preview */}
              <div className="bg-zinc-800/50 rounded-lg p-3 text-xs text-zinc-400 border border-zinc-700/50">
                <span className="text-zinc-500">Effect: </span>
                {editOverride !== ''
                  ? <span className="text-emerald-400">Fixed price ${parseFloat(editOverride || '0').toFixed(2)}</span>
                  : <span className="text-blue-400">Base × {parseFloat(editMultiplier || '1').toFixed(2)} = {(parseFloat(editMultiplier || '1') * 100 - 100).toFixed(0)}% {parseFloat(editMultiplier || '1') <= 1 ? 'discount' : 'markup'}</span>}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setEditCell(null)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg py-2.5 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCell}
                  disabled={saving}
                  className={cn(
                    'flex-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2',
                    saving && 'opacity-50'
                  )}
                >
                  <Check className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Apply'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
