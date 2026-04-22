'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'MXN'] as const
const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'America/Toronto',
  'America/Vancouver',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
] as const

interface Store {
  id:       string
  name:     string
  address:  string | null
  city:     string | null
  state:    string | null
  zip:      string | null
  phone:    string | null
  email:    string | null
  taxRate:  number
  currency: string
  isActive: boolean
}

export default function StoreConfigPage() {
  const [form, setForm] = useState({
    name:     '',
    address:  '',
    city:     '',
    state:    '',
    zip:      '',
    phone:    '',
    email:    '',
    currency: 'USD',
    taxRate:  '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [toast, setToast]     = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  function notify(msg: string, type: 'ok' | 'err' = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  useEffect(() => {
    fetch('/api/settings/store')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load store')
        return r.json() as Promise<Store>
      })
      .then((data) => {
        setForm({
          name:     data.name,
          address:  data.address ?? '',
          city:     data.city ?? '',
          state:    data.state ?? '',
          zip:      data.zip ?? '',
          phone:    data.phone ?? '',
          email:    data.email ?? '',
          currency: data.currency,
          taxRate:  String(data.taxRate),
        })
      })
      .catch(() => setError('Failed to load store configuration'))
      .finally(() => setLoading(false))
  }, [])

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.name.trim()) { setError('Store name is required'); return }

    const taxRateNum = parseFloat(form.taxRate)
    if (form.taxRate && (isNaN(taxRateNum) || taxRateNum < 0 || taxRateNum > 1)) {
      setError('Tax rate should be a decimal (e.g. 0.0825 for 8.25%)')
      return
    }

    setSaving(true)
    try {
      const body: Record<string, string | number> = {
        name:     form.name.trim(),
        currency: form.currency,
      }
      if (form.address.trim())  body.address  = form.address.trim()
      if (form.city.trim())     body.city     = form.city.trim()
      if (form.state.trim())    body.state    = form.state.trim()
      if (form.zip.trim())      body.zip      = form.zip.trim()
      if (form.phone.trim())    body.phone    = form.phone.trim()
      if (form.email.trim())    body.email    = form.email.trim()
      if (form.taxRate.trim())  body.taxRate  = taxRateNum

      const res = await fetch('/api/settings/store', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const json = await res.json() as { error?: string }
        notify(json.error ?? 'Failed to save', 'err')
        return
      }

      notify('Store configuration saved')
    } catch {
      notify('Network error — please try again', 'err')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#0f0f1a] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl border text-sm font-medium
          ${toast.type === 'ok'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {toast.type === 'ok'
            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
            : <AlertTriangle className="w-4 h-4 shrink-0" />
          }
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="h-14 border-b border-zinc-800 bg-[#0f0f1a] flex items-center px-6 gap-4 sticky top-0 z-10">
        <Link
          href="/settings"
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Settings
        </Link>
        <span className="text-zinc-700">/</span>
        <h1 className="text-base font-semibold text-zinc-100">Store Configuration</h1>
      </header>

      <main className="px-6 py-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">

          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Store Identity */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Store Identity</p>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                Store Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="My Store"
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="(555) 555-5555"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="store@example.com"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Address</p>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                Street Address
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                placeholder="123 Main St"
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  placeholder="Austin"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => set('state', e.target.value)}
                  placeholder="TX"
                  maxLength={2}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                  ZIP
                </label>
                <input
                  type="text"
                  value={form.zip}
                  onChange={(e) => set('zip', e.target.value)}
                  placeholder="78701"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Localization */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Localization</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Currency
                </label>
                <select
                  value={form.currency}
                  onChange={(e) => set('currency', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                  Default Tax Rate (decimal)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  max="1"
                  value={form.taxRate}
                  onChange={(e) => set('taxRate', e.target.value)}
                  placeholder="0.0825"
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-zinc-600 mt-1">Stored as decimal (0.0825 = 8.25%)</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {saving ? 'Saving…' : 'Save Configuration'}
            </button>
            <Link
              href="/settings"
              className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancel
            </Link>
          </div>

        </form>
      </main>
    </div>
  )
}
