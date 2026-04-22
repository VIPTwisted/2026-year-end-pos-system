'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Building2 } from 'lucide-react'

export default function NewVendorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    vendorCode: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'US',
    paymentTerms: '',
    currency: 'USD',
    leadTimeDays: '14',
    minimumOrderAmt: '0',
    notes: '',
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Vendor name is required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const body: Record<string, unknown> = {
        name: form.name.trim(),
        vendorCode: form.vendorCode.trim() || undefined,
        contactName: form.contactName.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        country: form.country.trim() || 'US',
        paymentTerms: form.paymentTerms.trim() || null,
        currency: form.currency.trim() || 'USD',
        leadTimeDays: form.leadTimeDays ? parseInt(form.leadTimeDays) : 14,
        minimumOrderAmt: form.minimumOrderAmt ? parseFloat(form.minimumOrderAmt) : 0,
        notes: form.notes.trim() || null,
        isActive: true,
      }
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push(`/vendors/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
  const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'

  return (
    <>
      <TopBar title="New Vendor" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/vendors"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Vendors
          </Link>

          <Card className="bg-[#16213e] border border-zinc-800/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-zinc-400" />
                Create Vendor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={labelCls}>Vendor Name <span className="text-red-400">*</span></label>
                    <input type="text" value={form.name} onChange={set('name')} placeholder="Acme Supply Co." className={inputCls} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Vendor Code</label>
                    <input type="text" value={form.vendorCode} onChange={set('vendorCode')} placeholder="Auto-generated if blank" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Contact Name</label>
                    <input type="text" value={form.contactName} onChange={set('contactName')} placeholder="Jane Smith" className={inputCls} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Email</label>
                    <input type="email" value={form.email} onChange={set('email')} placeholder="vendor@email.com" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input type="tel" value={form.phone} onChange={set('phone')} placeholder="512-555-0100" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Street Address</label>
                  <input type="text" value={form.address} onChange={set('address')} placeholder="123 Industrial Blvd" className={inputCls} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>City</label>
                    <input type="text" value={form.city} onChange={set('city')} placeholder="Austin" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>State</label>
                    <input type="text" value={form.state} onChange={set('state')} placeholder="TX" className={inputCls} maxLength={2} />
                  </div>
                  <div>
                    <label className={labelCls}>Country</label>
                    <input type="text" value={form.country} onChange={set('country')} placeholder="US" className={inputCls} maxLength={2} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Payment Terms</label>
                    <select value={form.paymentTerms} onChange={set('paymentTerms')} className={inputCls}>
                      <option value="">— Select —</option>
                      <option value="Net 15">Net 15</option>
                      <option value="Net 30">Net 30</option>
                      <option value="Net 60">Net 60</option>
                      <option value="Net 90">Net 90</option>
                      <option value="Due on Receipt">Due on Receipt</option>
                      <option value="2/10 Net 30">2/10 Net 30</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Currency</label>
                    <input type="text" value={form.currency} onChange={set('currency')} placeholder="USD" className={inputCls} maxLength={3} />
                  </div>
                  <div>
                    <label className={labelCls}>Lead Time (days)</label>
                    <input type="number" min="0" value={form.leadTimeDays} onChange={set('leadTimeDays')} placeholder="14" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Minimum Order Amount ($)</label>
                  <input type="number" min="0" step="0.01" value={form.minimumOrderAmt} onChange={set('minimumOrderAmt')} placeholder="0.00" className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>Notes</label>
                  <textarea value={form.notes} onChange={set('notes')} placeholder="Internal notes about this vendor…" rows={3} className={inputCls + ' resize-none'} />
                </div>

                {error && (
                  <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
                )}

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Link href="/vendors">
                    <Button type="button" variant="outline" size="sm">Cancel</Button>
                  </Link>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? 'Creating…' : 'Create Vendor'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
