'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Receipt, Plus, RefreshCw, Save } from 'lucide-react'

interface ReceiptProfile {
  id: string
  profileId: string
  name: string
  receiptType: string
  header: string | null
  footer: string | null
  showLogo: boolean
  showBarcode: boolean
  emailReceipt: boolean
  printReceipt: boolean
  createdAt: string
}

const RECEIPT_TYPES = ['sales', 'return', 'quote', 'credit_card', 'gift_card', 'layaway']

const TYPE_COLORS: Record<string, string> = {
  sales: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  return: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  quote: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  credit_card: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  gift_card: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  layaway: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
}

const EMPTY_FORM = {
  profileId: '',
  name: '',
  receiptType: 'sales',
  header: '',
  footer: '',
  showLogo: true,
  showBarcode: true,
  emailReceipt: false,
  printReceipt: true,
}

export default function ReceiptProfilesPage() {
  const [profiles, setProfiles] = useState<ReceiptProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ ...EMPTY_FORM })

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/commerce/receipt-profiles')
      setProfiles(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/commerce/receipt-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          header: form.header || undefined,
          footer: form.footer || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to create'); return }
      setSuccess('Profile created.')
      setShowForm(false)
      setForm({ ...EMPTY_FORM })
      load()
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="Receipt Profiles" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Receipt Profiles</h1>
            <p className="text-sm text-zinc-500">{profiles.length} profile(s) configured</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setShowForm(v => !v); setError(''); setSuccess('') }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> New Profile
            </button>
          </div>
        </div>

        {showForm && (
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="pt-5 pb-5">
              <h3 className="text-sm font-semibold text-zinc-100 mb-4">Create Receipt Profile</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Profile ID *</label>
                    <input
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                      placeholder="RCPT-SALES-01"
                      value={form.profileId}
                      onChange={e => setForm(f => ({ ...f, profileId: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Name *</label>
                    <input
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                      placeholder="Standard Sales Receipt"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Receipt Type *</label>
                    <select
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                      value={form.receiptType}
                      onChange={e => setForm(f => ({ ...f, receiptType: e.target.value }))}
                    >
                      {RECEIPT_TYPES.map(t => (
                        <option key={t} value={t}>{t.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Header Text</label>
                  <textarea
                    rows={3}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none font-mono"
                    placeholder="Thank you for shopping with us!&#10;123 Main St, Anytown, USA"
                    value={form.header}
                    onChange={e => setForm(f => ({ ...f, header: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Footer Text</label>
                  <textarea
                    rows={3}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none font-mono"
                    placeholder="Returns accepted within 30 days with receipt.&#10;Visit us at www.example.com"
                    value={form.footer}
                    onChange={e => setForm(f => ({ ...f, footer: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'showLogo', label: 'Show Logo' },
                    { key: 'showBarcode', label: 'Show Barcode' },
                    { key: 'emailReceipt', label: 'Email Receipt' },
                    { key: 'printReceipt', label: 'Print Receipt' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form[key as keyof typeof form] as boolean}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                        className="w-4 h-4 accent-blue-500"
                      />
                      <span className="text-sm text-zinc-300">{label}</span>
                    </label>
                  ))}
                </div>

                {error && <p className="text-xs text-rose-400">{error}</p>}
                {success && <p className="text-xs text-emerald-400">{success}</p>}
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-50">
                    <Save className="w-4 h-4" /> {saving ? 'Creating…' : 'Create Profile'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-16 text-zinc-600">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading…
            </CardContent>
          </Card>
        ) : profiles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-600">
              <Receipt className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">No receipt profiles configured yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
            {profiles.map(p => (
              <Card key={p.id} className="hover:border-zinc-700 transition-colors">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-zinc-100">{p.name}</p>
                      <p className="text-xs text-zinc-500 font-mono">{p.profileId}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium capitalize ${TYPE_COLORS[p.receiptType] ?? 'bg-zinc-700 text-zinc-300 border-zinc-600'}`}>
                      {p.receiptType.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs space-y-1 mb-3">
                    {p.header && (
                      <div className="bg-zinc-900 rounded p-2 text-zinc-400 font-mono whitespace-pre-line">{p.header}</div>
                    )}
                    {p.footer && (
                      <div className="bg-zinc-900 rounded p-2 text-zinc-500 font-mono whitespace-pre-line text-xs">{p.footer}</div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.showLogo && <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">Logo</span>}
                    {p.showBarcode && <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">Barcode</span>}
                    {p.emailReceipt && <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Email</span>}
                    {p.printReceipt && <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">Print</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
