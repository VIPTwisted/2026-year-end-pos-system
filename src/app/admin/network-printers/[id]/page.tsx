'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Save, Wifi } from 'lucide-react'

interface NetworkPrinter {
  id: string
  name: string
  description: string | null
  networkPath: string | null
  printerType: string
  status: string
  isDefault: boolean
  lastPingAt: string | null
  storeId: string | null
  store: { id: string; name: string } | null
  createdAt: string
  updatedAt: string
}

export const dynamic = 'force-dynamic'

const STATUS_COLORS: Record<string, string> = {
  active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  inactive: 'text-zinc-400 bg-zinc-700/50 border-zinc-700',
  error: 'text-red-400 bg-red-500/10 border-red-500/20',
  offline: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
}

export default function NetworkPrinterDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [printer, setPrinter] = useState<NetworkPrinter | null>(null)
  const [form, setForm] = useState<Partial<NetworkPrinter>>({})
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/network-printers/${id}`)
      .then(r => r.json())
      .then(d => { setPrinter(d); setForm(d) })
  }, [id])

  async function save() {
    setSaving(true)
    const { store, ...data } = form as NetworkPrinter
    const res = await fetch(`/api/admin/network-printers/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    })
    if (res.ok) { const d = await res.json(); setPrinter(p => ({ ...p!, ...d })); setForm(p => ({ ...p, ...d })) }
    setSaving(false)
  }

  async function testConnection() {
    setTesting(true)
    const res = await fetch(`/api/admin/network-printers/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _action: 'test-connection' }),
    })
    if (res.ok) { const { printer: p } = await res.json(); setPrinter(prev => ({ ...prev!, ...p })) }
    setTesting(false)
  }

  if (!printer) return <main className="flex-1 bg-[#0f0f1a] p-6 text-zinc-500 text-xs">Loading...</main>

  return (
    <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-screen">
      <TopBar
        title={printer.name}
        breadcrumb={[
          { label: 'Admin', href: '/admin/users' },
          { label: 'Network Printers', href: '/admin/network-printers' },
        ]}
        actions={
          <div className="flex gap-2">
            <button onClick={testConnection} disabled={testing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-600/30 rounded transition-colors disabled:opacity-50">
              <Wifi className="w-3 h-3" /> {testing ? 'Testing...' : 'Test Connection'}
            </button>
            <button onClick={save} disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded transition-colors">
              <Save className="w-3 h-3" /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        }
      />

      <div className="p-6 max-w-lg space-y-6">
        {/* Status Banner */}
        <div className={`rounded-xl p-4 border flex items-center gap-3 text-sm font-medium capitalize ${STATUS_COLORS[printer.status] ?? STATUS_COLORS.inactive}`}>
          <Wifi className="w-4 h-4" />
          {printer.status}
          {printer.lastPingAt && <span className="ml-auto text-xs opacity-70">Last ping: {new Date(printer.lastPingAt).toLocaleString()}</span>}
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-4">
          {([
            { label: 'Printer Name', k: 'name' },
            { label: 'Description', k: 'description' },
            { label: 'Network Path', k: 'networkPath' },
          ] as const).map(f => (
            <div key={f.k}>
              <label className="block text-xs text-zinc-500 mb-1">{f.label}</label>
              <input value={(form[f.k] as string) ?? ''} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600" />
            </div>
          ))}
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Printer Type</label>
            <select value={form.printerType ?? 'receipt'} onChange={e => setForm(p => ({ ...p, printerType: e.target.value }))}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600">
              {['receipt', 'label', 'report', 'invoice', 'document'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Status</label>
            <select value={form.status ?? 'active'} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-blue-600">
              {['active', 'inactive', 'offline', 'error'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isDefault" checked={form.isDefault ?? false}
              onChange={e => setForm(p => ({ ...p, isDefault: e.target.checked }))} className="w-3.5 h-3.5 rounded accent-blue-600" />
            <label htmlFor="isDefault" className="text-xs text-zinc-400">Set as default printer</label>
          </div>
          {printer.store && (
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Store</label>
              <div className="px-3 py-2 bg-zinc-900/50 rounded-lg text-xs text-zinc-400">{printer.store.name}</div>
            </div>
          )}
        </div>

        <div className="text-[10px] text-zinc-700">
          Created {new Date(printer.createdAt).toLocaleString()} &middot; Updated {new Date(printer.updatedAt).toLocaleString()}
        </div>
      </div>
    </main>
  )
}
