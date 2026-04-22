'use client'

import { useEffect, useState } from 'react'
import { CreditCard, Plus, X, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Connector { id: string; connectorName: string; connectorType: string; merchantId: string | null; isActive: boolean; isSandbox: boolean; supportedMethods: string | null }

const CONNECTOR_COLORS: Record<string, string> = {
  Adyen: 'from-green-500/20 to-green-600/10 border-green-500/30',
  Stripe: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  PayPal: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
}

const DEFAULT_CONNECTORS = [
  { connectorName: 'Adyen', connectorType: 'card_present', merchantId: '', supportedMethods: 'Visa,Mastercard,Amex,Apple Pay,Google Pay', isSandbox: true },
  { connectorName: 'Stripe', connectorType: 'card_not_present', merchantId: '', supportedMethods: 'Visa,Mastercard,Amex', isSandbox: true },
  { connectorName: 'PayPal', connectorType: 'digital_wallet', merchantId: '', supportedMethods: 'PayPal,Venmo', isSandbox: true },
]

export default function PaymentConnectorsPage() {
  const [connectors, setConnectors] = useState<Connector[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ connectorName: '', connectorType: 'card_present', merchantId: '', apiEndpoint: '', supportedMethods: '', isSandbox: true })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetch('/api/payment-connectors').then(r => r.json()).then(setConnectors) }, [])

  async function create() {
    setSaving(true)
    const res = await fetch('/api/payment-connectors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { const c = await res.json(); setConnectors(prev => [c, ...prev]); setShowModal(false) }
    setSaving(false)
  }

  async function seedDefault(d: typeof DEFAULT_CONNECTORS[0]) {
    const res = await fetch('/api/payment-connectors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
    if (res.ok) { const c = await res.json(); setConnectors(prev => [c, ...prev]) }
  }

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Payment Connectors</h2>
          <p className="text-xs text-zinc-500 mt-0.5">{connectors.length} connectors</p>
        </div>
        <div className="flex gap-2">
          {connectors.length === 0 && DEFAULT_CONNECTORS.map(d => (
            <button key={d.connectorName} onClick={() => seedDefault(d)} className="px-3 py-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors">
              + {d.connectorName}
            </button>
          ))}
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
            <Plus className="w-3 h-3" /> Add Connector
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {connectors.length === 0 ? (
          <div className="col-span-3 flex flex-col items-center justify-center py-16 text-zinc-600">
            <CreditCard className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm mb-3">No connectors configured</p>
            <p className="text-xs text-zinc-700">Add Adyen, Stripe, or PayPal above</p>
          </div>
        ) : connectors.map(c => (
          <div key={c.id} className={cn('bg-gradient-to-br border rounded-xl p-4', CONNECTOR_COLORS[c.connectorName] ?? 'from-zinc-800/50 to-zinc-900/50 border-zinc-700')}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-sm font-bold text-zinc-100">{c.connectorName}</div>
                <div className="text-xs text-zinc-400 mt-0.5 capitalize">{c.connectorType.replace('_', ' ')}</div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {c.isActive ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-zinc-600" />}
                {c.isSandbox && <span className="text-xs bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">Sandbox</span>}
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Merchant ID</span>
                <span className="text-zinc-400 font-mono">{c.merchantId || '—'}</span>
              </div>
              <div className="text-zinc-500">Methods: <span className="text-zinc-400">{c.supportedMethods || '—'}</span></div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-96 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-100">Add Payment Connector</h3>
              <button onClick={() => setShowModal(false)}><X className="w-4 h-4 text-zinc-500" /></button>
            </div>
            <div className="space-y-3">
              {[{ label: 'Connector Name', key: 'connectorName' }, { label: 'Merchant ID', key: 'merchantId' }, { label: 'API Endpoint', key: 'apiEndpoint' }, { label: 'Supported Methods', key: 'supportedMethods' }].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-zinc-500 mb-1">{f.label}</label>
                  <input value={(form as Record<string, string | boolean>)[f.key] as string} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none" />
                </div>
              ))}
              <label className="flex items-center gap-2 text-xs text-zinc-400">
                <input type="checkbox" checked={form.isSandbox} onChange={e => setForm(p => ({ ...p, isSandbox: e.target.checked }))} /> Sandbox mode
              </label>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-xs border border-zinc-700 text-zinc-400 rounded">Cancel</button>
              <button onClick={create} disabled={saving || !form.connectorName} className="flex-1 py-2 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded">
                {saving ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
