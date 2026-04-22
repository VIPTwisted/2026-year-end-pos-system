'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'

export const dynamic = 'force-dynamic'

interface Store { id: string; name: string }

export default function NewNetworkPrinterPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [stores, setStores] = useState<Store[]>([])
  const [form, setForm] = useState({
    name: '',
    description: '',
    networkPath: '',
    printerType: 'receipt',
    storeId: '',
    isDefault: false,
  })

  useEffect(() => {
    fetch('/api/stores').then(r => r.json()).then(d => setStores(Array.isArray(d) ? d : []))
  }, [])

  function set(k: string, v: string | boolean) { setForm(p => ({ ...p, [k]: v })) }

  async function save() {
    if (!form.name) return
    setSaving(true)
    const res = await fetch('/api/admin/network-printers', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, storeId: form.storeId || null }),
    })
    if (res.ok) { router.push('/admin/network-printers') }
    setSaving(false)
  }

  return (
    <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-screen">
      <TopBar
        title="Add Network Printer"
        breadcrumb={[
          { label: 'Admin', href: '/admin/users' },
          { label: 'Network Printers', href: '/admin/network-printers' },
        ]}
      />
      <div className="p-6 max-w-lg space-y-6">
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
          {[
            { label: 'Printer Name *', k: 'name' },
            { label: 'Description', k: 'description' },
            { label: 'Network Path', k: 'networkPath', placeholder: '\\\\server\\printer or //server/printer' },
          ].map(f => (
            <div key={f.k}>
              <label className="block text-xs text-zinc-500 mb-1">{f.label}</label>
              <input value={(form as Record<string, string>)[f.k]} onChange={e => set(f.k, e.target.value)}
                placeholder={(f as { placeholder?: string }).placeholder}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600" />
            </div>
          ))}

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Printer Type</label>
            <select value={form.printerType} onChange={e => set('printerType', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600">
              {['receipt', 'label', 'report', 'invoice', 'document'].map(t => (
                <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1">Store</label>
            <select value={form.storeId} onChange={e => set('storeId', e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600">
              <option value="">— No store assigned —</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isDefault" checked={form.isDefault}
              onChange={e => set('isDefault', e.target.checked)} className="w-3.5 h-3.5 rounded accent-blue-600" />
            <label htmlFor="isDefault" className="text-xs text-zinc-400">Set as default printer</label>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => router.back()} className="px-4 py-2 text-xs border border-zinc-700 text-zinc-400 rounded-lg hover:bg-zinc-800 transition-colors">Cancel</button>
          <button onClick={save} disabled={saving || !form.name}
            className="px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-colors">
            {saving ? 'Saving...' : 'Add Printer'}
          </button>
        </div>
      </div>
    </main>
  )
}
