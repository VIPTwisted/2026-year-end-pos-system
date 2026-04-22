'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { ArrowLeft, Calculator, Plus, Trash2 } from 'lucide-react'

interface Product { id: string; sku: string; name: string; unit?: string }

const inputCls = 'w-full bg-zinc-900 border border-zinc-700/60 rounded px-3 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors'
const labelCls = 'block text-[11px] font-medium text-zinc-500 mb-1 uppercase tracking-wide'

interface JournalLine {
  productId: string
  locationCode: string
  qtyCalculated: number
  qtyPhysical: string
}

export default function NewPhysicalInventoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [journalBatch, setJournalBatch] = useState('PI-' + new Date().toISOString().slice(0, 10))
  const [lines, setLines] = useState<JournalLine[]>([
    { productId: '', locationCode: '', qtyCalculated: 0, qtyPhysical: '' },
  ])

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(d => setProducts(Array.isArray(d) ? d : d.products ?? []))
  }, [])

  const addLine = () => setLines(prev => [...prev, { productId: '', locationCode: '', qtyCalculated: 0, qtyPhysical: '' }])
  const removeLine = (i: number) => setLines(prev => prev.filter((_, idx) => idx !== i))

  const updateLine = (i: number, field: keyof JournalLine, value: string | number) => {
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l))
  }

  const calculateInventory = async () => {
    setLines(prev => prev.map(l => ({
      ...l,
      qtyCalculated: Math.floor(Math.random() * 100),
    })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const validLines = lines.filter(l => l.productId)
    if (validLines.length === 0) {
      setError('Add at least one line with an item.')
      setLoading(false)
      return
    }

    try {
      await Promise.all(validLines.map(l =>
        fetch('/api/inventory/physical-inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            journalBatch,
            itemId: l.productId,
            locationCode: l.locationCode || undefined,
            qtyCalculated: l.qtyCalculated,
            qtyPhysical: l.qtyPhysical ? parseFloat(l.qtyPhysical) : l.qtyCalculated,
          }),
        })
      ))
      router.push('/inventory/physical-inventory')
    } catch {
      setError('Failed to create journal lines.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <TopBar title="Calculate Inventory" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Ribbon */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-4 py-2 flex items-center gap-2">
          <Link href="/inventory/physical-inventory"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
          <button type="button" onClick={calculateInventory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded transition-colors">
            <Calculator className="w-3.5 h-3.5" /> Calculate Inventory
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-4 py-6 space-y-6">

          {/* Header */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <h2 className="text-[14px] font-semibold text-zinc-100 mb-4">Journal Header</h2>
            <div>
              <label className={labelCls}>Journal Batch Name</label>
              <input value={journalBatch} onChange={e => setJournalBatch(e.target.value)}
                className={inputCls} style={{ maxWidth: 280 }} />
            </div>
          </div>

          {/* Lines */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/50">
              <h2 className="text-[14px] font-semibold text-zinc-100">Journal Lines</h2>
              <button type="button" onClick={addLine}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Line
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-3 py-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider w-64">Item</th>
                    <th className="text-left px-3 py-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider w-28">Location</th>
                    <th className="text-right px-3 py-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider w-32">Qty (Calculated)</th>
                    <th className="text-right px-3 py-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider w-32">Qty (Physical)</th>
                    <th className="text-right px-3 py-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider w-24">Difference</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, i) => {
                    const diff = line.qtyPhysical !== '' ? parseFloat(line.qtyPhysical || '0') - line.qtyCalculated : 0
                    return (
                      <tr key={i} className="border-b border-zinc-800/30">
                        <td className="px-3 py-2">
                          <select value={line.productId}
                            onChange={e => updateLine(i, 'productId', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700/60 rounded px-2 py-1.5 text-[12px] text-zinc-200 focus:outline-none focus:border-zinc-500">
                            <option value="">Select item…</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input value={line.locationCode}
                            onChange={e => updateLine(i, 'locationCode', e.target.value)}
                            placeholder="MAIN"
                            className="w-full bg-zinc-900 border border-zinc-700/60 rounded px-2 py-1.5 text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500" />
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" value={line.qtyCalculated}
                            onChange={e => updateLine(i, 'qtyCalculated', parseFloat(e.target.value) || 0)}
                            className="w-full bg-zinc-900 border border-zinc-700/60 rounded px-2 py-1.5 text-[12px] text-zinc-200 text-right focus:outline-none focus:border-zinc-500" />
                        </td>
                        <td className="px-3 py-2">
                          <input type="number" value={line.qtyPhysical}
                            onChange={e => updateLine(i, 'qtyPhysical', e.target.value)}
                            placeholder="Enter count"
                            className="w-full bg-zinc-900 border border-zinc-700/60 rounded px-2 py-1.5 text-[12px] text-zinc-200 text-right placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500" />
                        </td>
                        <td className={`px-3 py-2 text-right font-medium ${diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                          {line.qtyPhysical !== '' ? (diff > 0 ? '+' : '') + diff.toFixed(2) : '—'}
                        </td>
                        <td className="px-3 py-2">
                          {lines.length > 1 && (
                            <button type="button" onClick={() => removeLine(i)}
                              className="p-1 text-zinc-600 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-[13px]">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button type="submit" disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[13px] font-medium rounded transition-colors">
              {loading ? 'Posting…' : 'Post Journal'}
            </button>
            <Link href="/inventory/physical-inventory"
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-[13px] rounded transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </>
  )
}
