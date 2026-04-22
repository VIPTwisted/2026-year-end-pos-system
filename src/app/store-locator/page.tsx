'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Plus, Store, MapPin, ToggleLeft, ToggleRight, X } from 'lucide-react'
import Link from 'next/link'

type StoreLocation = {
  id: string
  storeCode: string
  storeName: string
  storeType: string
  city: string | null
  state: string | null
  phone: string | null
  managerName: string | null
  isActive: boolean
  features: { id: string }[]
}

const TYPE_COLORS: Record<string, string> = {
  retail: 'bg-blue-500/10 text-blue-400',
  warehouse: 'bg-amber-500/10 text-amber-400',
  outlet: 'bg-purple-500/10 text-purple-400',
  flagship: 'bg-emerald-500/10 text-emerald-400',
  kiosk: 'bg-zinc-700 text-zinc-300',
}

export default function StoreLocatorPage() {
  const [stores, setStores] = useState<StoreLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [stateFilter, setStateFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ storeCode: '', storeName: '', storeType: 'retail', city: '', state: '', zipCode: '', phone: '', managerName: '' })
  const [saving, setSaving] = useState(false)

  function load() {
    const params = new URLSearchParams()
    if (stateFilter) params.set('state', stateFilter)
    if (typeFilter) params.set('type', typeFilter)
    fetch(`/api/store-locator?${params}`)
      .then((r) => r.json())
      .then(setStores)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [stateFilter, typeFilter])

  async function toggleActive(store: StoreLocation) {
    await fetch(`/api/store-locator/${store.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !store.isActive }),
    })
    setStores((prev) => prev.map((s) => s.id === store.id ? { ...s, isActive: !s.isActive } : s))
  }

  async function handleCreate() {
    setSaving(true)
    const res = await fetch('/api/store-locator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const created = await res.json()
    setStores((prev) => [...prev, { ...created, features: [] }])
    setShowModal(false)
    setForm({ storeCode: '', storeName: '', storeType: 'retail', city: '', state: '', zipCode: '', phone: '', managerName: '' })
    setSaving(false)
  }

  const active = stores.filter((s) => s.isActive).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Store Locator</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage store locations, hours, and features</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Add Store
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center"><Store className="w-4 h-4 text-blue-400" /></div>
          <div><p className="text-xl font-bold text-zinc-100">{stores.length}</p><p className="text-xs text-zinc-500">Total Locations</p></div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center"><MapPin className="w-4 h-4 text-emerald-400" /></div>
          <div><p className="text-xl font-bold text-zinc-100">{active}</p><p className="text-xs text-zinc-500">Active</p></div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-700/50 rounded-lg flex items-center justify-center"><Store className="w-4 h-4 text-zinc-400" /></div>
          <div><p className="text-xl font-bold text-zinc-100">{stores.length - active}</p><p className="text-xs text-zinc-500">Inactive</p></div>
        </div>
      </div>

      <div className="flex gap-3">
        <input className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 w-24"
          placeholder="State" value={stateFilter} onChange={(e) => setStateFilter(e.target.value.toUpperCase())} maxLength={2} />
        <select className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
          value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="retail">Retail</option>
          <option value="warehouse">Warehouse</option>
          <option value="outlet">Outlet</option>
          <option value="flagship">Flagship</option>
          <option value="kiosk">Kiosk</option>
        </select>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Code</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Name</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Type</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">City/State</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Phone</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Manager</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Features</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center text-zinc-500 py-8">Loading...</td></tr>
            ) : stores.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-zinc-500 py-8">No stores</td></tr>
            ) : stores.map((s) => (
              <tr key={s.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/store-locator/${s.id}`} className="text-blue-400 hover:text-blue-300 font-mono">{s.storeCode}</Link>
                </td>
                <td className="px-4 py-3 text-zinc-100">{s.storeName}</td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full capitalize', TYPE_COLORS[s.storeType] ?? 'bg-zinc-700 text-zinc-300')}>{s.storeType}</span>
                </td>
                <td className="px-4 py-3 text-zinc-400">{[s.city, s.state].filter(Boolean).join(', ') || '—'}</td>
                <td className="px-4 py-3 text-zinc-400">{s.phone ?? '—'}</td>
                <td className="px-4 py-3 text-zinc-400">{s.managerName ?? '—'}</td>
                <td className="px-4 py-3 text-zinc-400">{s.features.length}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(s)} className="text-zinc-400 hover:text-zinc-100 transition-colors">
                    {s.isActive ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-zinc-100">Add Store</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-zinc-400" /></button>
            </div>
            <div className="space-y-3">
              {[
                { key: 'storeCode', label: 'Store Code', placeholder: 'STORE-001' },
                { key: 'storeName', label: 'Name', placeholder: 'Downtown Flagship' },
                { key: 'city', label: 'City', placeholder: 'Austin' },
                { key: 'state', label: 'State', placeholder: 'TX' },
                { key: 'zipCode', label: 'ZIP', placeholder: '78701' },
                { key: 'phone', label: 'Phone', placeholder: '(512) 555-0100' },
                { key: 'managerName', label: 'Manager', placeholder: 'Jane Smith' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs text-zinc-400 block mb-1.5">{f.label}</label>
                  <input className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    value={(form as Record<string, string>)[f.key]} onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} />
                </div>
              ))}
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Type</label>
                <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  value={form.storeType} onChange={(e) => setForm((f) => ({ ...f, storeType: e.target.value }))}>
                  <option value="retail">Retail</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="outlet">Outlet</option>
                  <option value="flagship">Flagship</option>
                  <option value="kiosk">Kiosk</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm py-2 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.storeCode || !form.storeName} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition-colors">
                {saving ? 'Saving...' : 'Create Store'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
