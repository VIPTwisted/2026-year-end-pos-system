'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { Suspense } from 'react'

interface Store {
  id: string
  storeNo: string
  name: string
}

function NewTerminalForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const prefilledStoreId = searchParams.get('storeId') ?? ''

  const [stores, setStores] = useState<Store[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    terminalId: '',
    name: '',
    storeId: prefilledStoreId,
    storeName: '',
    hardwareProfile: '',
    screenLayout: '',
    offlineEnabled: false,
    status: 'Active',
  })

  useEffect(() => {
    fetch('/api/commerce/stores').then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        setStores(data)
        if (prefilledStoreId) {
          const s = data.find((s: Store) => s.id === prefilledStoreId)
          if (s) setForm(f => ({ ...f, storeName: s.name }))
        }
      }
    }).catch(() => {})
  }, [prefilledStoreId])

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/commerce/terminals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to create terminal'); return }
      if (form.storeId) {
        router.push(`/commerce/stores/${form.storeId}`)
      } else {
        router.push('/commerce/terminals')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Terminal" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-6">
          <span className="hover:text-zinc-300 cursor-pointer" onClick={() => router.push('/commerce/terminals')}>Terminals</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-300">New Terminal</span>
        </div>

        <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-zinc-100">New POS Terminal</h1>
            <div className="flex gap-3">
              <button type="button" onClick={() => router.push('/commerce/terminals')}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors">Cancel</button>
              <button type="submit" disabled={saving}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>

          {error && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-400">{error}</div>}

          <Card>
            <CardContent className="pt-5 pb-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Terminal ID *</label>
                  <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 font-mono uppercase focus:outline-none focus:border-indigo-500"
                    placeholder="TERM001" value={form.terminalId}
                    onChange={e => set('terminalId', e.target.value.toUpperCase())} required />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Terminal Name *</label>
                  <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                    placeholder="Register 1" value={form.name}
                    onChange={e => set('name', e.target.value)} required />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-zinc-500 mb-1">Assign to Store</label>
                  <select className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                    value={form.storeId}
                    onChange={e => {
                      const s = stores.find(s => s.id === e.target.value)
                      set('storeId', e.target.value)
                      set('storeName', s?.name ?? '')
                    }}>
                    <option value="">— No Store —</option>
                    {stores.map(s => (
                      <option key={s.id} value={s.id}>{s.storeNo} — {s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Hardware Profile</label>
                  <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                    placeholder="HWPROFILE-001" value={form.hardwareProfile}
                    onChange={e => set('hardwareProfile', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Screen Layout</label>
                  <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                    placeholder="LAYOUT-DEFAULT" value={form.screenLayout}
                    onChange={e => set('screenLayout', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Status</label>
                  <select className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500"
                    value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                <div>
                  <p className="text-sm font-medium text-zinc-200">Offline Mode</p>
                  <p className="text-xs text-zinc-500">Allow terminal to process transactions when disconnected from server</p>
                </div>
                <button type="button" onClick={() => set('offlineEnabled', !form.offlineEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${form.offlineEnabled ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.offlineEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </CardContent>
          </Card>
        </form>
      </main>
    </>
  )
}

export default function NewTerminalPage() {
  return (
    <Suspense>
      <NewTerminalForm />
    </Suspense>
  )
}
