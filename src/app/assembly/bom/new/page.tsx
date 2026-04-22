'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'

interface BOMLineDraft {
  type: string
  componentNo: string
  description: string
  qtyPer: number
  unitOfMeasure: string
  leadTimeDays: number
}

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors'
const labelCls = 'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1'

export default function NewAssemblyBOMPage() {
  const router = useRouter()
  const [itemNo, setItemNo] = useState('')
  const [description, setDescription] = useState('')
  const [unitOfMeasure, setUnitOfMeasure] = useState('EACH')
  const [versionCode, setVersionCode] = useState('1')
  const [status, setStatus] = useState('Certified')
  const [lines, setLines] = useState<BOMLineDraft[]>([
    { type: 'Item', componentNo: '', description: '', qtyPer: 1, unitOfMeasure: 'EACH', leadTimeDays: 0 }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addLine = () => setLines(prev => [...prev, { type: 'Item', componentNo: '', description: '', qtyPer: 1, unitOfMeasure: 'EACH', leadTimeDays: 0 }])
  const removeLine = (i: number) => setLines(prev => prev.filter((_, idx) => idx !== i))
  const updateLine = (i: number, key: keyof BOMLineDraft, value: string | number) =>
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, [key]: value } : l))

  const submit = async () => {
    if (!itemNo.trim()) { setError('Item No. is required'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/assembly/bom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemNo: itemNo.trim(),
          description: description.trim() || undefined,
          unitOfMeasure,
          versionCode,
          status,
          lines: lines.filter(l => l.componentNo.trim()).map((l, idx) => ({
            lineNo: idx + 1,
            type: l.type,
            componentNo: l.componentNo.trim(),
            description: l.description.trim() || undefined,
            qtyPer: l.qtyPer,
            unitOfMeasure: l.unitOfMeasure,
            leadTimeDays: l.leadTimeDays,
          })),
        }),
      })
      const data: { id?: string; error?: string } = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push(`/assembly/bom/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
    }
  }

  return (
    <>
      <TopBar title="New Assembly BOM" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-5xl mx-auto p-6 space-y-6">

          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="h-8 w-8 flex items-center justify-center rounded border border-zinc-700/60 bg-zinc-800/40 text-zinc-400 hover:text-zinc-200 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">Assembly BOMs</p>
              <h2 className="text-xl font-bold text-zinc-100">New Assembly BOM</h2>
            </div>
          </div>

          <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <summary className="px-5 py-3.5 border-b border-zinc-800/50 cursor-pointer text-[12px] font-semibold uppercase tracking-widest text-zinc-400 hover:text-zinc-200 transition-colors select-none">
              Header
            </summary>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Item No. <span className="text-red-400">*</span></label>
                <input type="text" value={itemNo} onChange={e => setItemNo(e.target.value)} placeholder="Finished item no." className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Description</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="BOM description" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Unit of Measure</label>
                <select value={unitOfMeasure} onChange={e => setUnitOfMeasure(e.target.value)} className={inputCls}>
                  <option>EACH</option><option>BOX</option><option>CASE</option><option>KG</option><option>LB</option><option>SET</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Version Code</label>
                <input type="text" value={versionCode} onChange={e => setVersionCode(e.target.value)} placeholder="1" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className={inputCls}>
                  <option>Certified</option><option>Under Development</option><option>Closed</option>
                </select>
              </div>
            </div>
          </details>

          <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <summary className="px-5 py-3.5 border-b border-zinc-800/50 cursor-pointer text-[12px] font-semibold uppercase tracking-widest text-zinc-400 hover:text-zinc-200 transition-colors select-none">
              BOM Lines
            </summary>
            <div className="p-5 space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['Type', 'Component No.', 'Description', 'Qty per', 'Unit of Measure', 'Lead Time (Days)', ''].map(h => (
                        <th key={h} className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 text-left whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {lines.map((line, i) => (
                      <tr key={i}>
                        <td className="px-2 py-2">
                          <select value={line.type} onChange={e => updateLine(i, 'type', e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 w-24">
                            <option>Item</option><option>Resource</option>
                          </select>
                        </td>
                        <td className="px-2 py-2">
                          <input type="text" value={line.componentNo} onChange={e => updateLine(i, 'componentNo', e.target.value)} placeholder="No." className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 w-28" />
                        </td>
                        <td className="px-2 py-2">
                          <input type="text" value={line.description} onChange={e => updateLine(i, 'description', e.target.value)} placeholder="Description" className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 w-36" />
                        </td>
                        <td className="px-2 py-2">
                          <input type="number" min={0} step={0.01} value={line.qtyPer} onChange={e => updateLine(i, 'qtyPer', parseFloat(e.target.value) || 0)} className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 w-20 text-right tabular-nums" />
                        </td>
                        <td className="px-2 py-2">
                          <select value={line.unitOfMeasure} onChange={e => updateLine(i, 'unitOfMeasure', e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 w-20">
                            <option>EACH</option><option>BOX</option><option>KG</option><option>LB</option>
                          </select>
                        </td>
                        <td className="px-2 py-2">
                          <input type="number" min={0} value={line.leadTimeDays} onChange={e => updateLine(i, 'leadTimeDays', parseInt(e.target.value) || 0)} className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 w-24 text-right tabular-nums" />
                        </td>
                        <td className="px-2 py-2">
                          {lines.length > 1 && (
                            <button onClick={() => removeLine(i)} className="text-zinc-600 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={addLine} className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors">
                <Plus className="w-3 h-3" />Add Line
              </button>
            </div>
          </details>

          {error && (
            <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
          )}

          <div className="flex items-center justify-end gap-3">
            <button onClick={() => router.back()} className="h-9 px-5 rounded text-[12px] text-zinc-400 hover:text-zinc-200 border border-zinc-700/60 hover:bg-zinc-800/60 transition-colors">
              Cancel
            </button>
            <button onClick={submit} disabled={loading} className="h-9 px-6 rounded text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-60">
              {loading ? 'Creating…' : 'Create BOM'}
            </button>
          </div>
        </div>
      </main>
    </>
  )
}
