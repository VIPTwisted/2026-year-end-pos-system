'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Monitor, ArrowLeft, Loader2 } from 'lucide-react'

const DEVICE_TYPES = ['StoreCommerce', 'MPOS', 'CloudPOS']

export default function StoreCommerceNewPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [stores, setStores] = useState<{ id: string; name: string }[]>([])
  const [form, setForm] = useState({
    deviceName: '',
    deviceType: 'StoreCommerce',
    storeId: '',
    registerId: '',
    cloudPOSUrl: '',
    hardwareProfileId: '',
    offlineEnabled: false,
    appVersion: '',
    osInfo: '',
  })

  useEffect(() => {
    fetch('/api/stores').then(r => r.ok ? r.json() : []).then(setStores).catch(() => {})
  }, [])

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm(p => ({ ...p, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/channels/store-commerce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to register device'); return }
      router.push('/channels/store-commerce')
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100 p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <Link href="/channels/store-commerce" className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Devices
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Monitor className="w-6 h-6 text-blue-400" />
            Register Device
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Add a new Store Commerce, MPOS, or Cloud POS device</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Device Name *</label>
            <input
              value={form.deviceName}
              onChange={e => set('deviceName', e.target.value)}
              placeholder="e.g. Register 1 — Main Floor"
              required
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Device Type</label>
            <div className="grid grid-cols-3 gap-2">
              {DEVICE_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('deviceType', t)}
                  className={`py-2.5 px-3 rounded-lg text-sm font-medium border transition-colors ${
                    form.deviceType === t
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Assign to Store</label>
            <select
              value={form.storeId}
              onChange={e => set('storeId', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
            >
              <option value="">— Select store —</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Register ID</label>
              <input
                value={form.registerId}
                onChange={e => set('registerId', e.target.value)}
                placeholder="REG-001"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Hardware Profile ID</label>
              <input
                value={form.hardwareProfileId}
                onChange={e => set('hardwareProfileId', e.target.value)}
                placeholder="HW-PROFILE-01"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {form.deviceType === 'CloudPOS' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Cloud POS URL</label>
              <input
                value={form.cloudPOSUrl}
                onChange={e => set('cloudPOSUrl', e.target.value)}
                placeholder="https://pos.example.com"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          )}

          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div
              onClick={() => set('offlineEnabled', !form.offlineEnabled)}
              className={`w-9 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0 relative ${form.offlineEnabled ? 'bg-blue-600' : 'bg-zinc-700'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.offlineEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">Enable offline mode</span>
          </label>

          <div className="flex gap-3 pt-2">
            <Link
              href="/channels/store-commerce"
              className="flex-1 text-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Register Device
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
