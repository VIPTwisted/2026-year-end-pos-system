'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'

type WrapUpCode = {
  id: string
  code: string
  name: string
  category: string | null
  requiresNote: boolean
  isActive: boolean
}

export default function WrapUpClient({ codes: initCodes }: { codes: WrapUpCode[] }) {
  const [codes, setCodes] = useState(initCodes)
  const [form, setForm] = useState({ code: '', name: '', category: '', requiresNote: false, isActive: true })
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  async function addCode(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    setError('')
    try {
      const res = await fetch('/api/contact-center/wrap-up-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())
      const code = await res.json()
      setCodes(c => [...c, code].sort((a, b) => (a.category ?? '').localeCompare(b.category ?? '') || a.code.localeCompare(b.code)))
      setForm({ code: '', name: '', category: '', requiresNote: false, isActive: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    }
    setAdding(false)
  }

  const grouped = codes.reduce((acc, c) => {
    const cat = c.category ?? 'Uncategorized'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(c)
    return acc
  }, {} as Record<string, WrapUpCode[]>)

  return (
    <div className="p-6 space-y-6 min-h-[100dvh] bg-zinc-950 text-zinc-100">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-100">Wrap-Up Codes</h1>
        <span className="text-sm text-zinc-500">{codes.length} codes</span>
      </div>

      {/* Add Form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-300 mb-4">Add New Code</h2>
        <form onSubmit={addCode} className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Code *</label>
            <input required type="text" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
              placeholder="e.g. RESOLVED"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Name *</label>
            <input required type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Issue Resolved"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Category</label>
            <input type="text" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              placeholder="Resolution / Billing..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-4 items-end pb-0.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.requiresNote} onChange={e => setForm(f => ({ ...f, requiresNote: e.target.checked }))}
                className="accent-blue-500" />
              <span className="text-xs text-zinc-400">Requires note</span>
            </label>
            <button type="submit" disabled={adding}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap">
              {adding ? 'Adding...' : '+ Add'}
            </button>
          </div>
        </form>
        {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
      </div>

      {/* Codes Table */}
      {Object.entries(grouped).map(([cat, catCodes]) => (
        <div key={cat} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{cat}</h3>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {catCodes.map(c => (
                <tr key={c.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">{c.code}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{c.name}</td>
                  <td className="px-4 py-3">
                    {c.requiresNote && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs">Requires note</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('px-2 py-0.5 rounded text-xs font-medium', c.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700/20 text-zinc-500')}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {codes.length === 0 && (
        <div className="text-center text-zinc-600 py-10">No wrap-up codes yet</div>
      )}
    </div>
  )
}
