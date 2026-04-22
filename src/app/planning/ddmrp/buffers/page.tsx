'use client'
import { useEffect, useState } from 'react'
import { Save, Plus, X, RefreshCw } from 'lucide-react'

interface BufferConfig {
  id: string
  itemName: string
  sku: string
  topQty: number    // Top of Red
  boqQty: number    // Bottom of Green (= BOQ)
  torQty: number    // Top of Green (= TOR = max)
  leadTimeDays: number
  variabilityFactor: number  // 0.1 – 1.0
  moq: number
  isNew?: boolean
}

const EMPTY: Omit<BufferConfig, 'id'> = {
  itemName: '', sku: '', topQty: 60, boqQty: 150, torQty: 300,
  leadTimeDays: 7, variabilityFactor: 0.5, moq: 1,
}

export default function DDMRPBuffersPage() {
  const [buffers, setBuffers] = useState<BufferConfig[]>([])
  const [editing, setEditing] = useState<Record<string, Partial<BufferConfig>>>({})
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState({ ...EMPTY })
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    // Load safety stock rules as buffer config proxy
    const data = await fetch('/api/planning/safety-stock').then(r => r.json()).catch(() => [])
    const rules = Array.isArray(data) ? data : []
    setBuffers(rules.map((r: {
      id: string
      productName: string | null
      sku: string | null
      minQty: number
      reorderPoint: number
      maxQty: number
      leadTimeDays: number
    }) => ({
      id: r.id,
      itemName: r.productName ?? '',
      sku: r.sku ?? '',
      topQty: r.minQty,
      boqQty: r.reorderPoint,
      torQty: r.maxQty,
      leadTimeDays: r.leadTimeDays,
      variabilityFactor: 0.5,
      moq: 1,
    })))
  }

  function startEdit(b: BufferConfig) {
    setEditing(prev => ({ ...prev, [b.id]: { ...b } }))
  }

  function cancelEdit(id: string) {
    setEditing(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  function updateEdit(id: string, field: keyof BufferConfig, value: string | number) {
    setEditing(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  async function saveBuffer(id: string) {
    const row = editing[id]
    if (!row) return
    setSaving(id)
    await fetch(`/api/planning/safety-stock/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName: row.itemName,
        sku: row.sku,
        minQty: row.topQty,
        reorderPoint: row.boqQty,
        maxQty: row.torQty,
        reorderQty: row.boqQty,
        leadTimeDays: row.leadTimeDays,
      }),
    })
    cancelEdit(id)
    setSaving(null)
    setSaved(id)
    setTimeout(() => setSaved(null), 1500)
    load()
  }

  async function addBuffer() {
    await fetch('/api/planning/safety-stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName: addForm.itemName,
        sku: addForm.sku,
        minQty: addForm.topQty,
        reorderPoint: addForm.boqQty,
        maxQty: addForm.torQty,
        reorderQty: addForm.boqQty,
        leadTimeDays: addForm.leadTimeDays,
        fixedQty: addForm.topQty,
        daysOfSupply: addForm.leadTimeDays,
        serviceLevel: 0.95,
        currentStock: 0,
        isActive: true,
      }),
    })
    setAddForm({ ...EMPTY })
    setShowAdd(false)
    load()
  }

  const InputCell = ({ id, field, type = 'text' }: { id: string; field: keyof BufferConfig; type?: string }) => {
    const row = editing[id]
    if (!row) return null
    const val = row[field]
    return (
      <input
        type={type}
        value={typeof val === 'number' ? val : (val ?? '')}
        onChange={e => updateEdit(id, field, type === 'number' ? Number(e.target.value) : e.target.value)}
        className="w-full bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
      />
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Buffer Management</h1>
          <p className="text-zinc-400 text-sm mt-1">Set TOP / BOQ / TOR parameters per item — click a row to edit inline</p>
        </div>
        <div className="flex gap-3">
          <button onClick={load} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors">
            <RefreshCw className="w-4 h-4" />Refresh
          </button>
          <button onClick={() => setShowAdd(v => !v)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />Add Buffer
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500/40 inline-block" />TOP = Top of Red (replenishment trigger)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-yellow-500/40 inline-block" />BOQ = Bottom of Green (order qty reference)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500/40 inline-block" />TOR = Top of Red / max buffer</span>
      </div>

      {showAdd && (
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-100">New Buffer Item</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {([
              { label: 'Item Name',          field: 'itemName',         type: 'text' },
              { label: 'SKU',                field: 'sku',              type: 'text' },
              { label: 'TOP (Red trigger)',  field: 'topQty',           type: 'number' },
              { label: 'BOQ (Green bottom)', field: 'boqQty',          type: 'number' },
              { label: 'TOR (Max buffer)',   field: 'torQty',           type: 'number' },
              { label: 'Lead Time (days)',   field: 'leadTimeDays',     type: 'number' },
              { label: 'Variability Factor', field: 'variabilityFactor', type: 'number' },
              { label: 'MOQ',               field: 'moq',              type: 'number' },
            ] as { label: string; field: keyof typeof addForm; type: string }[]).map(f => (
              <div key={f.field}>
                <label className="block text-xs text-zinc-400 mb-1">{f.label}</label>
                <input
                  type={f.type}
                  value={addForm[f.field]}
                  onChange={e => setAddForm(prev => ({ ...prev, [f.field]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={addBuffer} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Save className="w-4 h-4 inline mr-1" />Save Buffer
            </button>
            <button onClick={() => setShowAdd(false)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Item', 'SKU', 'TOP (Red)', 'BOQ (Green)', 'TOR (Max)', 'Lead Time', 'Variability', 'MOQ', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-zinc-500 font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {buffers.length === 0 && (
                <tr><td colSpan={9} className="px-6 py-10 text-center text-zinc-600 text-sm">No buffer items configured yet.</td></tr>
              )}
              {buffers.map(b => {
                const isEditing = !!editing[b.id]
                const row = editing[b.id] ?? b
                return (
                  <tr key={b.id} className={`border-b border-zinc-800/50 cursor-pointer ${isEditing ? 'bg-zinc-800/40' : 'hover:bg-zinc-800/20'}`}
                    onClick={() => !isEditing && startEdit(b)}>
                    <td className="px-4 py-3">{isEditing ? <InputCell id={b.id} field="itemName" /> : <span className="text-zinc-100 font-medium">{b.itemName}</span>}</td>
                    <td className="px-4 py-3">{isEditing ? <InputCell id={b.id} field="sku" /> : <span className="text-zinc-500 text-xs font-mono">{b.sku || '—'}</span>}</td>
                    <td className="px-4 py-3">{isEditing ? <InputCell id={b.id} field="topQty" type="number" /> : <span className="text-red-400">{b.topQty}</span>}</td>
                    <td className="px-4 py-3">{isEditing ? <InputCell id={b.id} field="boqQty" type="number" /> : <span className="text-yellow-400">{b.boqQty}</span>}</td>
                    <td className="px-4 py-3">{isEditing ? <InputCell id={b.id} field="torQty" type="number" /> : <span className="text-emerald-400">{b.torQty}</span>}</td>
                    <td className="px-4 py-3">{isEditing ? <InputCell id={b.id} field="leadTimeDays" type="number" /> : <span className="text-zinc-400">{b.leadTimeDays}d</span>}</td>
                    <td className="px-4 py-3">{isEditing ? <InputCell id={b.id} field="variabilityFactor" type="number" /> : <span className="text-zinc-400">{row.variabilityFactor ?? 0.5}</span>}</td>
                    <td className="px-4 py-3">{isEditing ? <InputCell id={b.id} field="moq" type="number" /> : <span className="text-zinc-400">{row.moq ?? 1}</span>}</td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                          <button onClick={() => saveBuffer(b.id)}
                            className={`text-xs px-2 py-1 rounded font-medium transition-colors ${saving === b.id ? 'bg-zinc-700 text-zinc-400' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
                            {saving === b.id ? '…' : saved === b.id ? '✓' : 'Save'}
                          </button>
                          <button onClick={() => cancelEdit(b.id)} className="text-zinc-500 hover:text-zinc-300">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-600 italic">click to edit</span>
                      )}
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
