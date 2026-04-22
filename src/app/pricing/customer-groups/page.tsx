'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Plus, ChevronDown, ChevronRight, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GroupEntry {
  id: string
  groupName: string
  productName: string | null
  sku: string | null
  priceOverride: number
  discountPct: number | null
  isActive: boolean
}

export default function CustomerGroupsPage() {
  const [grouped, setGrouped] = useState<Record<string, GroupEntry[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [showAdd, setShowAdd] = useState<string | null>(null)
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [form, setForm] = useState({ groupName: '', productName: '', sku: '', priceOverride: '', discountPct: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    try {
      const res = await fetch('/api/pricing/customer-groups')
      const data = await res.json()
      setGrouped(data)
      if (Object.keys(data).length > 0) setExpanded(new Set([Object.keys(data)[0]]))
    } catch {
      setError('Failed to load customer groups')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function toggleExpand(g: string) {
    setExpanded(prev => {
      const n = new Set(prev)
      if (n.has(g)) n.delete(g)
      else n.add(g)
      return n
    })
  }

  async function handleAdd(groupName: string, e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await fetch('/api/pricing/customer-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupName, productName: form.productName || null, sku: form.sku || null, priceOverride: Number(form.priceOverride), discountPct: form.discountPct ? Number(form.discountPct) : null }),
      })
      setShowAdd(null)
      setForm({ groupName: '', productName: '', sku: '', priceOverride: '', discountPct: '' })
      await load()
    } catch {
      setError('Failed to add entry')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddNewGroup(e: React.FormEvent) {
    e.preventDefault()
    if (!form.groupName) return
    setSaving(true)
    try {
      await fetch('/api/pricing/customer-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupName: form.groupName, productName: form.productName || null, sku: form.sku || null, priceOverride: Number(form.priceOverride), discountPct: form.discountPct ? Number(form.discountPct) : null }),
      })
      setShowNewGroup(false)
      setForm({ groupName: '', productName: '', sku: '', priceOverride: '', discountPct: '' })
      await load()
    } catch {
      setError('Failed to create group')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this entry?')) return
    await fetch(`/api/pricing/customer-groups/${id}`, { method: 'DELETE' })
    await load()
  }

  const groups = Object.keys(grouped)

  return (
    <div className="min-h-[100dvh] bg-zinc-950 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/pricing" className="text-zinc-500 hover:text-zinc-300 text-sm">Pricing</Link>
          <ChevronRight className="w-4 h-4 text-zinc-600" />
          <span className="text-zinc-100 font-semibold">Customer Groups</span>
        </div>
        <button onClick={() => setShowNewGroup(true)} className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Group
        </button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>}

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse" />)}</div>
      ) : groups.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center text-zinc-500">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No customer group prices configured</p>
          <button onClick={() => setShowNewGroup(true)} className="mt-3 text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mx-auto">
            <Plus className="w-4 h-4" /> Create your first group
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map(groupName => {
            const entries = grouped[groupName]
            const isExpanded = expanded.has(groupName)
            return (
              <div key={groupName} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <button onClick={() => toggleExpand(groupName)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-800/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-zinc-100">{groupName}</span>
                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{entries.length} SKU{entries.length !== 1 ? 's' : ''}</span>
                  </div>
                  <ChevronDown className={cn('w-4 h-4 text-zinc-500 transition-transform', isExpanded && 'rotate-180')} />
                </button>
                {isExpanded && (
                  <>
                    <div className="border-t border-zinc-800">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-zinc-800 bg-zinc-800/30">
                            <th className="text-left px-4 py-2.5 text-zinc-400 font-medium text-xs">SKU</th>
                            <th className="text-left px-4 py-2.5 text-zinc-400 font-medium text-xs">Product</th>
                            <th className="text-right px-4 py-2.5 text-zinc-400 font-medium text-xs">Override Price</th>
                            <th className="text-right px-4 py-2.5 text-zinc-400 font-medium text-xs">Discount %</th>
                            <th className="text-center px-4 py-2.5 text-zinc-400 font-medium text-xs">Status</th>
                            <th className="px-4 py-2.5" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                          {entries.map(entry => (
                            <tr key={entry.id} className="hover:bg-zinc-800/30 transition-colors">
                              <td className="px-4 py-3 text-zinc-300 font-mono text-xs">{entry.sku ?? '—'}</td>
                              <td className="px-4 py-3 text-zinc-200">{entry.productName ?? '—'}</td>
                              <td className="px-4 py-3 text-right text-zinc-200">${entry.priceOverride.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right">{entry.discountPct != null ? <span className="text-amber-400">{entry.discountPct}%</span> : <span className="text-zinc-600">—</span>}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={cn('text-xs px-2 py-0.5 rounded-full', entry.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-500')}>
                                  {entry.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button onClick={() => handleDelete(entry.id)} className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {showAdd === groupName ? (
                      <form onSubmit={(e) => handleAdd(groupName, e)} className="p-4 border-t border-zinc-800 bg-zinc-800/20">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                          <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="SKU"
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500" />
                          <input value={form.productName} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} placeholder="Product Name"
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500" />
                          <input value={form.priceOverride} onChange={e => setForm(f => ({ ...f, priceOverride: e.target.value }))} placeholder="Override Price *" required type="number" step="0.01" min="0"
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500" />
                          <input value={form.discountPct} onChange={e => setForm(f => ({ ...f, discountPct: e.target.value }))} placeholder="Discount %" type="number" step="0.01" min="0" max="100"
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500" />
                          <div className="flex gap-2">
                            <button type="submit" disabled={saving} className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium">{saving ? '…' : 'Add'}</button>
                            <button type="button" onClick={() => setShowAdd(null)} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <div className="p-3 border-t border-zinc-800">
                        <button onClick={() => { setShowAdd(groupName); setForm(f => ({ ...f, groupName })) }}
                          className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Add entry to {groupName}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showNewGroup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-100">New Customer Group</h2>
              <button onClick={() => setShowNewGroup(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddNewGroup} className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Group Name *</label>
                <input value={form.groupName} onChange={e => setForm(f => ({ ...f, groupName: e.target.value }))} required placeholder="e.g. VIP, Wholesale, Employee"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">SKU</label>
                  <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Product Name</label>
                  <input value={form.productName} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Override Price *</label>
                  <input value={form.priceOverride} onChange={e => setForm(f => ({ ...f, priceOverride: e.target.value }))} required type="number" step="0.01" min="0"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Discount %</label>
                  <input value={form.discountPct} onChange={e => setForm(f => ({ ...f, discountPct: e.target.value }))} type="number" step="0.01" min="0" max="100"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNewGroup(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg py-2 text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className={cn('flex-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg py-2 text-sm font-medium transition-colors', saving && 'opacity-50')}>
                  {saving ? 'Creating…' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
