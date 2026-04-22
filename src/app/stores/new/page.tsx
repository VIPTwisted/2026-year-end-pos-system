'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface StoreForm {
  name: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  email: string
  taxRate: string
  currency: string
}

const inputCls =
  'w-full rounded-md bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm px-3 py-2 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500'
const labelCls = 'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1'

export default function NewStorePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<StoreForm>({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    email: '',
    taxRate: '0.0825',
    currency: 'USD',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Store name is required')
      return
    }
    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          address: form.address.trim() || null,
          city: form.city.trim() || null,
          state: form.state.trim() || null,
          zip: form.zip.trim() || null,
          phone: form.phone.trim() || null,
          email: form.email.trim() || null,
          taxRate: parseFloat(form.taxRate) || 0.0825,
          currency: form.currency || 'USD',
        }),
      })

      if (!res.ok) {
        const json = (await res.json()) as { error?: string }
        throw new Error(json.error ?? 'Failed to create store')
      }

      const created = (await res.json()) as { id: string }
      router.push(`/stores/${created.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar
        title="Add Store"
        breadcrumb={[{ label: 'Stores', href: '/stores' }]}
      />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-2xl mx-auto p-6 space-y-6">

          <div>
            <Link
              href="/stores"
              className="inline-flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Stores
            </Link>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800/40">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500">New Store</span>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && (
                <div className="rounded-md bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="sn-name" className={labelCls}>Store Name *</label>
                <input
                  id="sn-name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="Main Street Location"
                />
              </div>

              <div>
                <label htmlFor="sn-address" className={labelCls}>Address</label>
                <input
                  id="sn-address"
                  name="address"
                  type="text"
                  value={form.address}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="123 Main St"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="sn-city" className={labelCls}>City</label>
                  <input
                    id="sn-city"
                    name="city"
                    type="text"
                    value={form.city}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="sn-state" className={labelCls}>State</label>
                  <input
                    id="sn-state"
                    name="state"
                    type="text"
                    value={form.state}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="TX"
                  />
                </div>
                <div>
                  <label htmlFor="sn-zip" className={labelCls}>ZIP</label>
                  <input
                    id="sn-zip"
                    name="zip"
                    type="text"
                    value={form.zip}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="sn-phone" className={labelCls}>Phone</label>
                  <input
                    id="sn-phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="sn-email" className={labelCls}>Email</label>
                  <input
                    id="sn-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="sn-taxRate" className={labelCls}>Tax Rate (decimal)</label>
                  <input
                    id="sn-taxRate"
                    name="taxRate"
                    type="number"
                    step="0.0001"
                    min="0"
                    max="1"
                    value={form.taxRate}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="sn-currency" className={labelCls}>Currency</label>
                  <select
                    id="sn-currency"
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    className={inputCls}
                  >
                    <option value="USD">USD</option>
                    <option value="CAD">CAD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="MXN">MXN</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-[13px] font-medium text-white transition-colors disabled:opacity-50"
                >
                  {saving ? 'Creating…' : 'Create Store'}
                </button>
                <Link
                  href="/stores"
                  className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-[13px] font-medium text-zinc-400 transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>

        </div>
      </main>
    </>
  )
}
