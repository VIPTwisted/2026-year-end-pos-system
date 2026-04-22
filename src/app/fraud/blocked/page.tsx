'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Plus, X } from 'lucide-react'

type BlockedEntity = {
  id: string
  entityType: string
  entityValue: string
  reason: string | null
  blockedBy: string | null
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}

const TYPE_TABS = ['All', 'email', 'ip', 'card', 'customer']

export default function FraudBlockedPage() {
  const [entities, setEntities] = useState<BlockedEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ entityType: 'email', entityValue: '', reason: '', blockedBy: '', expiresAt: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/fraud/blocked')
      .then((r) => r.json())
      .then(setEntities)
      .finally(() => setLoading(false))
  }, [])

  const filtered = activeTab === 'All' ? entities : entities.filter((e) => e.entityType === activeTab)

  function isExpired(expiresAt: string | null) {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  async function handleCreate() {
    setSaving(true)
    const res = await fetch('/api/fraud/blocked', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const created = await res.json()
    setEntities((prev) => [created, ...prev])
    setShowModal(false)
    setForm({ entityType: 'email', entityValue: '', reason: '', blockedBy: '', expiresAt: '' })
    setSaving(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Blocked Entities</h1>
          <p className="text-zinc-400 text-sm mt-1">Emails, IPs, cards, and customers blocked from transactions</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Block Entity
        </button>
      </div>

      <div className="flex gap-1 border-b border-zinc-800">
        {TYPE_TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('px-4 py-2 text-sm uppercase transition-colors', activeTab === tab ? 'text-blue-400 border-b-2 border-blue-500' : 'text-zinc-400 hover:text-zinc-200')}>
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Type</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Value</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Reason</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Blocked By</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Expires</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center text-zinc-500 py-8">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-zinc-500 py-8">No blocked entities</td></tr>
            ) : filtered.map((e) => {
              const expired = isExpired(e.expiresAt)
              return (
                <tr key={e.id} className={cn('border-b border-zinc-800/50', expired ? 'opacity-60' : 'hover:bg-zinc-800/20 transition-colors')}>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full uppercase">{e.entityType}</span>
                  </td>
                  <td className={cn('px-4 py-3 font-mono text-xs', expired ? 'text-zinc-600' : 'text-zinc-200')}>{e.entityValue}</td>
                  <td className={cn('px-4 py-3', expired ? 'text-zinc-600' : 'text-zinc-400')}>{e.reason ?? '—'}</td>
                  <td className={cn('px-4 py-3', expired ? 'text-zinc-600' : 'text-zinc-400')}>{e.blockedBy ?? '—'}</td>
                  <td className={cn('px-4 py-3 text-xs', expired ? 'text-zinc-600' : 'text-zinc-400')}>
                    {e.expiresAt ? new Date(e.expiresAt).toLocaleDateString() : 'Permanent'}
                    {expired && <span className="ml-1 text-zinc-600">(exp.)</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full', expired ? 'bg-zinc-800 text-zinc-600' : e.isActive ? 'bg-red-500/10 text-red-400' : 'bg-zinc-800 text-zinc-500')}>
                      {expired ? 'Expired' : e.isActive ? 'Blocked' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-zinc-100">Block Entity</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-zinc-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Entity Type</label>
                <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  value={form.entityType} onChange={(e) => setForm((f) => ({ ...f, entityType: e.target.value }))}>
                  <option value="email">Email</option>
                  <option value="ip">IP Address</option>
                  <option value="card">Card</option>
                  <option value="customer">Customer</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Value</label>
                <input className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  value={form.entityValue} onChange={(e) => setForm((f) => ({ ...f, entityValue: e.target.value }))} placeholder="bad@email.com" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Reason</label>
                <input className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Chargeback abuse" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Blocked By</label>
                <input className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  value={form.blockedBy} onChange={(e) => setForm((f) => ({ ...f, blockedBy: e.target.value }))} placeholder="admin" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Expires (leave blank = permanent)</label>
                <input type="date" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm py-2 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.entityValue} className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition-colors">
                {saving ? 'Blocking...' : 'Block'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
