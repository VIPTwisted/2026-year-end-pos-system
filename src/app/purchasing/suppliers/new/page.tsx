'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

type FormState = {
  name: string
  contactName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  paymentTerms: string
  notes: string
}

export default function NewSupplierPage() {
  const router = useRouter()

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState<FormState>({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    paymentTerms: '',
    notes: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Supplier name is required')
      return
    }
    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/purchasing/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          contactName: form.contactName.trim() || null,
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
          city: form.city.trim() || null,
          state: form.state.trim() || null,
          zip: form.zip.trim() || null,
          paymentTerms: form.paymentTerms.trim() || null,
          notes: form.notes.trim() || null,
        }),
      })

      if (!res.ok) {
        const json = await res.json() as { error?: string }
        throw new Error(json.error ?? 'Failed to create supplier')
      }

      const created = await res.json() as { id: string }
      router.push(`/purchasing/suppliers/${created.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setSaving(false)
    }
  }

  const inputCls =
    'w-full rounded-md bg-zinc-900 border border-zinc-700 text-zinc-100 text-[13px] px-3 py-2 placeholder-zinc-600 focus:outline-none focus:border-blue-500'
  const labelCls = 'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1'

  return (
    <>
      <TopBar title="New Supplier" />
      <main className="flex-1 p-6 min-h-[100dvh] bg-[#0f0f1a] space-y-6">

        <Link
          href="/purchasing/suppliers"
          className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Suppliers
        </Link>

        <div>
          <h1 className="text-xl font-bold text-zinc-100">New Supplier</h1>
          <p className="text-[13px] text-zinc-500 mt-0.5">Add a new vendor to your supplier directory</p>
        </div>

        {error && (
          <div className="rounded-md bg-red-500/10 border border-red-500/30 px-4 py-2.5 text-[13px] text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Basic info */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 border-b border-zinc-800/50 pb-2">Basic Information</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ns-name" className={labelCls}>Supplier Name *</label>
                <input
                  id="ns-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                  autoFocus
                  className={inputCls}
                  placeholder="e.g. Acme Distribution"
                />
              </div>
              <div>
                <label htmlFor="ns-contactName" className={labelCls}>Contact Name</label>
                <input
                  id="ns-contactName"
                  name="contactName"
                  type="text"
                  value={form.contactName}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="e.g. Jane Doe"
                />
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 border-b border-zinc-800/50 pb-2">Contact Details</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ns-email" className={labelCls}>Email</label>
                <input
                  id="ns-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="orders@supplier.com"
                />
              </div>
              <div>
                <label htmlFor="ns-phone" className={labelCls}>Phone</label>
                <input
                  id="ns-phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="(555) 000-0000"
                />
              </div>
              <div>
                <label htmlFor="ns-paymentTerms" className={labelCls}>Payment Terms</label>
                <input
                  id="ns-paymentTerms"
                  name="paymentTerms"
                  type="text"
                  value={form.paymentTerms}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="e.g. Net 30"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 border-b border-zinc-800/50 pb-2">Address</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="ns-address" className={labelCls}>Street Address</label>
                <input
                  id="ns-address"
                  name="address"
                  type="text"
                  value={form.address}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="123 Main St"
                />
              </div>
              <div>
                <label htmlFor="ns-city" className={labelCls}>City</label>
                <input
                  id="ns-city"
                  name="city"
                  type="text"
                  value={form.city}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="City"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ns-state" className={labelCls}>State</label>
                  <input
                    id="ns-state"
                    name="state"
                    type="text"
                    value={form.state}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="CA"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label htmlFor="ns-zip" className={labelCls}>ZIP</label>
                  <input
                    id="ns-zip"
                    name="zip"
                    type="text"
                    value={form.zip}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="90210"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 border-b border-zinc-800/50 pb-2">Notes</p>
            <div>
              <label htmlFor="ns-notes" className={labelCls}>Internal Notes</label>
              <textarea
                id="ns-notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-md bg-zinc-900 border border-zinc-700 text-zinc-100 text-[13px] px-3 py-2 placeholder-zinc-600 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Optional internal notes…"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pb-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[13px] font-medium transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Creating…' : 'Create Supplier'}
            </button>
            <Link
              href="/purchasing/suppliers"
              className="px-4 py-2 rounded-md border border-zinc-700 text-zinc-400 hover:text-zinc-200 text-[13px] transition-colors"
            >
              Cancel
            </Link>
          </div>

        </form>
      </main>
    </>
  )
}
