'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, Trash2 } from 'lucide-react'

type Line = {
  lineType: string
  productId: string
  bomId: string
  changeDesc: string
  fromValue: string
  toValue: string
}

export default function NewECOPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    changeType: 'design',
    priority: 'normal',
    description: '',
    requestedBy: '',
    effectiveDate: '',
  })
  const [lines, setLines] = useState<Line[]>([
    { lineType: 'product', productId: '', bomId: '', changeDesc: '', fromValue: '', toValue: '' },
  ])

  function setField(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }))
  }
  function setLine(i: number, k: keyof Line, v: string) {
    setLines(ls => ls.map((l, idx) => idx === i ? { ...l, [k]: v } : l))
  }
  function addLine() {
    setLines(ls => [...ls, { lineType: 'product', productId: '', bomId: '', changeDesc: '', fromValue: '', toValue: '' }])
  }
  function removeLine(i: number) {
    setLines(ls => ls.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/engineering-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, lines }),
      })
      if (!res.ok) throw new Error('Failed to create ECO')
      const data = await res.json()
      router.push(`/engineering-change/${data.id}`)
    } catch {
      setSaving(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 placeholder:text-zinc-600'
  const selectCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500'
  const labelCls = 'block text-[11px] uppercase tracking-wide text-zinc-500 mb-1'

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="New Engineering Change Order" />
      <main className="flex-1 p-6 overflow-auto">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200 mb-2">ECO Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelCls}>Title *</label>
                <input required value={form.title} onChange={e => setField('title', e.target.value)}
                  className={inputCls} placeholder="Brief description of the change" />
              </div>
              <div>
                <label className={labelCls}>Change Type</label>
                <select value={form.changeType} onChange={e => setField('changeType', e.target.value)} className={selectCls}>
                  <option value="design">Design</option>
                  <option value="process">Process</option>
                  <option value="material">Material</option>
                  <option value="software">Software</option>
                  <option value="documentation">Documentation</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Priority</label>
                <select value={form.priority} onChange={e => setField('priority', e.target.value)} className={selectCls}>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Requested By</label>
                <input value={form.requestedBy} onChange={e => setField('requestedBy', e.target.value)}
                  className={inputCls} placeholder="Name or email" />
              </div>
              <div>
                <label className={labelCls}>Effective Date</label>
                <input type="date" value={form.effectiveDate} onChange={e => setField('effectiveDate', e.target.value)}
                  className={inputCls} />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>Description</label>
                <textarea value={form.description} onChange={e => setField('description', e.target.value)}
                  className={`${inputCls} h-24 resize-none`} placeholder="Detailed explanation of the engineering change..." />
              </div>
            </div>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-zinc-200">Change Lines</h2>
              <button type="button" onClick={addLine}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-200 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Line
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-zinc-800/30">
                    {['Type', 'Product ID', 'BOM ID', 'Change Description', 'From Value', 'To Value', ''].map(h => (
                      <th key={h} className="text-left px-2 py-1 text-[10px] uppercase text-zinc-500 font-medium tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line, i) => (
                    <tr key={i} className="border-b border-zinc-800/20">
                      <td className="px-2 py-1.5">
                        <select value={line.lineType} onChange={e => setLine(i, 'lineType', e.target.value)}
                          className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-zinc-200 text-xs focus:outline-none focus:border-blue-500">
                          <option value="product">Product</option>
                          <option value="bom">BOM</option>
                          <option value="routing">Routing</option>
                          <option value="document">Document</option>
                        </select>
                      </td>
                      <td className="px-2 py-1.5">
                        <input value={line.productId} onChange={e => setLine(i, 'productId', e.target.value)}
                          className="w-24 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-zinc-200 text-xs focus:outline-none focus:border-blue-500 placeholder:text-zinc-600" placeholder="Product ID" />
                      </td>
                      <td className="px-2 py-1.5">
                        <input value={line.bomId} onChange={e => setLine(i, 'bomId', e.target.value)}
                          className="w-24 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-zinc-200 text-xs focus:outline-none focus:border-blue-500 placeholder:text-zinc-600" placeholder="BOM ID" />
                      </td>
                      <td className="px-2 py-1.5">
                        <input required value={line.changeDesc} onChange={e => setLine(i, 'changeDesc', e.target.value)}
                          className="w-48 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-zinc-200 text-xs focus:outline-none focus:border-blue-500 placeholder:text-zinc-600" placeholder="Describe change..." />
                      </td>
                      <td className="px-2 py-1.5">
                        <input value={line.fromValue} onChange={e => setLine(i, 'fromValue', e.target.value)}
                          className="w-28 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-zinc-200 text-xs focus:outline-none focus:border-blue-500 placeholder:text-zinc-600" placeholder="Current value" />
                      </td>
                      <td className="px-2 py-1.5">
                        <input value={line.toValue} onChange={e => setLine(i, 'toValue', e.target.value)}
                          className="w-28 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-zinc-200 text-xs focus:outline-none focus:border-blue-500 placeholder:text-zinc-600" placeholder="New value" />
                      </td>
                      <td className="px-2 py-1.5">
                        <button type="button" onClick={() => removeLine(i)} disabled={lines.length === 1}
                          className="text-zinc-600 hover:text-red-400 disabled:opacity-30 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={() => router.push('/engineering-change')}
              className="px-4 py-2 rounded-md text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-60">
              {saving ? 'Creating...' : 'Create ECO'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
