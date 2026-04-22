'use client'

import { use, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type StoreFeature = { id: string; feature: string }
type StoreHour = { id: string; dayOfWeek: number; openTime: string | null; closeTime: string | null; isClosed: boolean }
type StoreLocation = {
  id: string
  storeCode: string
  storeName: string
  storeType: string
  address: string | null
  address2: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  country: string
  latitude: number | null
  longitude: number | null
  phone: string | null
  email: string | null
  managerName: string | null
  squareFootage: number | null
  isActive: boolean
  features: StoreFeature[]
  hours: StoreHour[]
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const COMMON_FEATURES = ['Curbside Pickup', 'Drive-Through', 'Café', 'Pharmacy', 'Gas Station', 'ATM', 'Deli', 'Bakery', 'Optical', 'Tire Center', 'Auto Service', 'Vision Center']

export default function StoreLocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [store, setStore] = useState<StoreLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile' | 'hours' | 'features'>('profile')
  const [editing, setEditing] = useState<Partial<StoreLocation>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/store-locator/${id}`)
      .then((r) => r.json())
      .then((data) => { setStore(data); setEditing(data) })
      .finally(() => setLoading(false))
  }, [id])

  async function handleSave() {
    setSaving(true)
    const res = await fetch(`/api/store-locator/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    })
    const updated = await res.json()
    setStore((s) => s ? { ...s, ...updated } : s)
    setSaving(false)
  }

  async function saveHour(hour: StoreHour, field: keyof StoreHour, value: string | boolean) {
    const updated = { ...hour, [field]: value }
    await fetch(`/api/store-locator/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hours: store?.hours.map((h) => h.id === hour.id ? updated : h) }),
    })
    setStore((s) => s ? { ...s, hours: s.hours.map((h) => h.id === hour.id ? updated : h) } : s)
  }

  async function toggleFeature(feature: string) {
    if (!store) return
    const existing = store.features.find((f) => f.feature === feature)
    if (existing) {
      const newFeatures = store.features.filter((f) => f.feature !== feature)
      await fetch(`/api/store-locator/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ removeFeature: existing.id }),
      })
      setStore((s) => s ? { ...s, features: newFeatures } : s)
    } else {
      const res = await fetch(`/api/store-locator/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addFeature: feature }),
      })
      const updated = await res.json()
      setStore((s) => s ? { ...s, features: [...s.features, { id: updated.id ?? Date.now().toString(), feature }] } : s)
    }
  }

  if (loading) return <div className="p-6 text-zinc-400">Loading...</div>
  if (!store) return <div className="p-6 text-zinc-400">Store not found</div>

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">{store.storeCode}</span>
          <h1 className="text-2xl font-semibold text-zinc-100">{store.storeName}</h1>
          <span className={cn('text-xs px-2 py-0.5 rounded-full ml-auto', store.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500')}>
            {store.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <p className="text-zinc-500 text-sm mt-1">{[store.city, store.state].filter(Boolean).join(', ')}</p>
      </div>

      <div className="flex gap-1 border-b border-zinc-800">
        {(['profile', 'hours', 'features'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('px-4 py-2 text-sm capitalize transition-colors', activeTab === tab ? 'text-blue-400 border-b-2 border-blue-500' : 'text-zinc-400 hover:text-zinc-200')}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 max-w-2xl">
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'storeName', label: 'Store Name' },
              { key: 'storeType', label: 'Type' },
              { key: 'address', label: 'Address' },
              { key: 'address2', label: 'Address 2' },
              { key: 'city', label: 'City' },
              { key: 'state', label: 'State' },
              { key: 'zipCode', label: 'ZIP Code' },
              { key: 'phone', label: 'Phone' },
              { key: 'email', label: 'Email' },
              { key: 'managerName', label: 'Manager' },
              { key: 'latitude', label: 'Latitude' },
              { key: 'longitude', label: 'Longitude' },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-xs text-zinc-400 block mb-1.5">{f.label}</label>
                <input className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  value={(editing as Record<string, unknown>)[f.key] as string ?? ''}
                  onChange={(e) => setEditing((p) => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
          </div>
          <button onClick={handleSave} disabled={saving} className="mt-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition-colors">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      )}

      {activeTab === 'hours' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden max-w-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-zinc-400 font-medium px-4 py-3">Day</th>
                <th className="text-left text-zinc-400 font-medium px-4 py-3">Closed</th>
                <th className="text-left text-zinc-400 font-medium px-4 py-3">Open</th>
                <th className="text-left text-zinc-400 font-medium px-4 py-3">Close</th>
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day, i) => {
                const hour = store.hours.find((h) => h.dayOfWeek === i) ?? { id: `new-${i}`, dayOfWeek: i, openTime: null, closeTime: null, isClosed: false }
                return (
                  <tr key={i} className="border-b border-zinc-800/50">
                    <td className="px-4 py-3 text-zinc-300 font-medium">{day}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => saveHour(hour, 'isClosed', !hour.isClosed)}
                        className={cn('relative inline-flex h-5 w-9 rounded-full transition-colors', hour.isClosed ? 'bg-red-500' : 'bg-zinc-700')}>
                        <span className={cn('absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform', hour.isClosed && 'translate-x-4')} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <input type="time" disabled={hour.isClosed}
                        className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 disabled:opacity-40"
                        value={hour.openTime ?? ''} onChange={(e) => saveHour(hour, 'openTime', e.target.value)} />
                    </td>
                    <td className="px-4 py-3">
                      <input type="time" disabled={hour.isClosed}
                        className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 disabled:opacity-40"
                        value={hour.closeTime ?? ''} onChange={(e) => saveHour(hour, 'closeTime', e.target.value)} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'features' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 max-w-2xl">
          <p className="text-sm text-zinc-400 mb-4">Select the features available at this location</p>
          <div className="grid grid-cols-3 gap-3">
            {COMMON_FEATURES.map((feature) => {
              const active = store.features.some((f) => f.feature === feature)
              return (
                <button key={feature} onClick={() => toggleFeature(feature)}
                  className={cn('flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors text-left',
                    active ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600')}>
                  <span className={cn('w-2 h-2 rounded-full flex-shrink-0', active ? 'bg-blue-400' : 'bg-zinc-600')} />
                  {feature}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
