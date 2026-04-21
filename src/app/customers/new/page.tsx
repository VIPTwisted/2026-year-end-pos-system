'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, UserPlus } from 'lucide-react'

export default function NewCustomerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', zip: '',
    creditLimit: '', notes: '', tags: '',
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First and last name are required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const body: Record<string, unknown> = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        zip: form.zip.trim() || undefined,
        notes: form.notes.trim() || undefined,
        tags: form.tags.trim() || undefined,
        creditLimit: form.creditLimit ? parseFloat(form.creditLimit) : 0,
      }
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push(`/customers/${data.id}`)
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
      <TopBar title="New Customer" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/customers"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Customers
          </Link>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-zinc-400" />
                Create Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>First Name <span className="text-red-400">*</span></label>
                    <input type="text" value={form.firstName} onChange={set('firstName')} placeholder="First" className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Last Name <span className="text-red-400">*</span></label>
                    <input type="text" value={form.lastName} onChange={set('lastName')} placeholder="Last" className={inputCls} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Email</label>
                    <input type="email" value={form.email} onChange={set('email')} placeholder="customer@email.com" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input type="tel" value={form.phone} onChange={set('phone')} placeholder="512-555-0100" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Street Address</label>
                  <input type="text" value={form.address} onChange={set('address')} placeholder="123 Main St" className={inputCls} />
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
                    <label className={labelCls}>ZIP</label>
                    <input type="text" value={form.zip} onChange={set('zip')} placeholder="78701" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Credit Limit ($)</label>
                  <input type="number" min="0" step="0.01" value={form.creditLimit} onChange={set('creditLimit')} placeholder="0.00" className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>Tags</label>
                  <input type="text" value={form.tags} onChange={set('tags')} placeholder="wholesale, vip, contractor" className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>Notes</label>
                  <textarea value={form.notes} onChange={set('notes')} placeholder="Internal notes about this customer…" rows={3} className={inputCls + ' resize-none'} />
                </div>

                {error && (
                  <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
                )}

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Link href="/customers">
                    <Button type="button" variant="outline" size="sm">Cancel</Button>
                  </Link>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? 'Creating…' : 'Create Customer'}
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
