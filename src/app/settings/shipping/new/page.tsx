'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewShippingMethodPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    code: '',
    carrier: '',
    serviceType: '',
    baseRate: '0',
    perLbRate: '0',
    freeThreshold: '',
    estimatedDays: '',
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.code.trim()) {
      setError('Name and code are required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/shipping-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          code: form.code.trim(),
          carrier: form.carrier || undefined,
          serviceType: form.serviceType.trim() || undefined,
          baseRate: parseFloat(form.baseRate || '0'),
          perLbRate: parseFloat(form.perLbRate || '0'),
          freeThreshold: form.freeThreshold ? parseFloat(form.freeThreshold) : undefined,
          estimatedDays: form.estimatedDays ? parseInt(form.estimatedDays) : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push('/settings/shipping')
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
      <TopBar title="Add Shipping Method" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-xl mx-auto">
          <Link
            href="/settings/shipping"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Shipping Methods
          </Link>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">New Shipping Method</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Name + Code */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={set('name')}
                      placeholder="e.g. Standard Ground"
                      className={inputCls}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Code <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={form.code}
                      onChange={set('code')}
                      placeholder="e.g. UPS_GROUND"
                      className={inputCls + ' font-mono uppercase'}
                      required
                    />
                  </div>
                </div>

                {/* Carrier + Service Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Carrier</label>
                    <select value={form.carrier} onChange={set('carrier')} className={inputCls}>
                      <option value="">— Select carrier —</option>
                      <option value="UPS">UPS</option>
                      <option value="FedEx">FedEx</option>
                      <option value="USPS">USPS</option>
                      <option value="Local">Local</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Service Type</label>
                    <input
                      type="text"
                      value={form.serviceType}
                      onChange={set('serviceType')}
                      placeholder="e.g. Ground, 2-Day Air"
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Base Rate + Per Lb Rate */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Base Rate ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.baseRate}
                      onChange={set('baseRate')}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Per Lb Rate ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.perLbRate}
                      onChange={set('perLbRate')}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Free Threshold + Est. Days */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Free Shipping Threshold ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.freeThreshold}
                      onChange={set('freeThreshold')}
                      placeholder="e.g. 99.00 (optional)"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Estimated Days</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={form.estimatedDays}
                      onChange={set('estimatedDays')}
                      placeholder="e.g. 5"
                      className={inputCls}
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Link href="/settings/shipping">
                    <Button type="button" variant="outline" size="sm">Cancel</Button>
                  </Link>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? 'Saving…' : 'Save Shipping Method'}
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
