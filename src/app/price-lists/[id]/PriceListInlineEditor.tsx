'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Save } from 'lucide-react'

type Line = {
  id: string
  productId: string
  productName: string
  productSku: string
  defaultPrice: number
  unitPrice: number
  minQuantity: number
  startDate: string
  endDate: string
}

type NewLine = {
  productId: string
  unitPrice: string
  minQuantity: string
  startDate: string
  endDate: string
}

const inputCls = 'w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-colors'

export function PriceListInlineEditor({ priceListId, initialLines }: { priceListId: string; initialLines: Line[] }) {
  const router = useRouter()
  const [lines, setLines] = useState<Line[]>(initialLines)
  const [newLine, setNewLine] = useState<NewLine>({ productId: '', unitPrice: '', minQuantity: '1', startDate: '', endDate: '' })
  const [adding, setAdding] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [saveError, setSaveError] = useState('')

  const setNew = (k: keyof NewLine) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setNewLine(prev => ({ ...prev, [k]: e.target.value }))

  const addLine = async () => {
    if (!newLine.productId.trim() || !newLine.unitPrice) {
      setSaveError('Product ID and price required')
      return
    }
    setAdding(true)
    setSaveError('')
    const res = await fetch(`/api/price-lists/${priceListId}/lines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLine),
    })
    if (res.ok) {
      setNewLine({ productId: '', unitPrice: '', minQuantity: '1', startDate: '', endDate: '' })
      setShowAdd(false)
      router.refresh()
    } else {
      setSaveError('Failed to add line')
    }
    setAdding(false)
  }

  const deleteLine = async (lineId: string) => {
    setDeleting(lineId)
    await fetch(`/api/price-lists/${priceListId}/lines?lineId=${lineId}`, { method: 'DELETE' })
    setLines(prev => prev.filter(l => l.id !== lineId))
    setDeleting(null)
    router.refresh()
  }

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800">
            {['Product', 'SKU', 'Default Price', 'List Price', 'Min Qty', 'Effective Dates', ''].map(h => (
              <th key={h} className={`px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide ${h === 'Product' ? 'text-left' : 'text-center'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lines.length === 0 && !showAdd && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-zinc-600 text-xs">
                No price lines. Add lines to override product prices for this list.
              </td>
            </tr>
          )}
          {lines.map(l => (
            <tr key={l.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20">
              <td className="px-4 py-3 text-zinc-100 text-sm">{l.productName}</td>
              <td className="px-4 py-3 text-center font-mono text-xs text-zinc-500">{l.productSku}</td>
              <td className="px-4 py-3 text-center text-xs text-zinc-400">${l.defaultPrice.toFixed(2)}</td>
              <td className="px-4 py-3 text-center text-emerald-400 font-bold">${l.unitPrice.toFixed(2)}</td>
              <td className="px-4 py-3 text-center text-zinc-400">{l.minQuantity}+</td>
              <td className="px-4 py-3 text-center text-xs text-zinc-500">
                {l.startDate || l.endDate ? `${l.startDate || '∞'} — ${l.endDate || '∞'}` : 'Always'}
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => deleteLine(l.id)}
                  disabled={deleting === l.id}
                  className="text-red-500/50 hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </td>
            </tr>
          ))}

          {showAdd && (
            <tr className="border-b border-zinc-800/50 bg-zinc-800/30">
              <td className="px-4 py-2.5" colSpan={1}>
                <input type="text" placeholder="Product ID (cuid)…" value={newLine.productId} onChange={setNew('productId')} className={inputCls + ' font-mono'} />
              </td>
              <td className="px-4 py-2.5" colSpan={2} />
              <td className="px-4 py-2.5">
                <input type="number" min="0" step="0.01" placeholder="Price" value={newLine.unitPrice} onChange={setNew('unitPrice')} className={inputCls} />
              </td>
              <td className="px-4 py-2.5">
                <input type="number" min="1" step="1" value={newLine.minQuantity} onChange={setNew('minQuantity')} className={inputCls} />
              </td>
              <td className="px-4 py-2.5">
                <div className="flex gap-1">
                  <input type="date" value={newLine.startDate} onChange={setNew('startDate')} className={inputCls} />
                  <input type="date" value={newLine.endDate} onChange={setNew('endDate')} className={inputCls} />
                </div>
              </td>
              <td className="px-4 py-2.5">
                <div className="flex gap-1">
                  <button onClick={addLine} disabled={adding} className="text-emerald-400 hover:text-emerald-300 p-1">
                    <Save className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => { setShowAdd(false); setSaveError('') }} className="text-zinc-500 hover:text-zinc-300 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="p-4 border-t border-zinc-800 flex items-center gap-3">
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => { setShowAdd(true); setSaveError('') }}>
          <Plus className="w-3.5 h-3.5" />
          Add Line
        </Button>
        {saveError && <p className="text-xs text-red-400">{saveError}</p>}
      </div>
    </div>
  )
}
