'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Store { id: string; name: string }
interface Customer { id: string; firstName: string; lastName: string; email: string }

export default function NewWorkOrderPage() {
  const router = useRouter()

  const [stores, setStores]       = useState<Store[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  const [form, setForm] = useState({
    title:        '',
    description:  '',
    priority:     'medium',
    storeId:      '',
    customerId:   '',
    assignedTo:   '',
    scheduledAt:  '',
    estimatedHrs: '',
  })

  useEffect(() => {
    fetch('/api/stores').then(r => r.json()).then(setStores).catch(() => setStores([]))
    fetch('/api/customers').then(r => r.json()).then(setCustomers).catch(() => setCustomers([]))
  }, [])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }

    setLoading(true)
    setError('')
    try {
      const body: Record<string, unknown> = {
        title:       form.title.trim(),
        description: form.description.trim() || undefined,
        priority:    form.priority,
        storeId:     form.storeId     || undefined,
        customerId:  form.customerId  || undefined,
        assignedTo:  form.assignedTo.trim() || undefined,
        scheduledAt: form.scheduledAt || undefined,
        estimatedHrs: form.estimatedHrs ? parseFloat(form.estimatedHrs) : undefined,
      }

      const res  = await fetch('/api/field-service/work-orders', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push(`/field-service/${data.id}`)
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
      <TopBar title="New Work Order" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/field-service"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Field Service
          </Link>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Create Work Order</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Title */}
                <div>
                  <label className={labelCls}>Title <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={set('title')}
                    placeholder="e.g. HVAC Unit Repair — Downtown Store"
                    className={inputCls}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={set('description')}
                    placeholder="Detailed description of the work to be performed…"
                    rows={4}
                    className={inputCls + ' resize-none'}
                  />
                </div>

                {/* Priority + Store */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Priority</label>
                    <select value={form.priority} onChange={set('priority')} className={inputCls}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Store</label>
                    <select value={form.storeId} onChange={set('storeId')} className={inputCls}>
                      <option value="">— Select store —</option>
                      {stores.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Customer + Assigned To */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Customer (optional)</label>
                    <select value={form.customerId} onChange={set('customerId')} className={inputCls}>
                      <option value="">— Select customer —</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.firstName} {c.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Assigned To</label>
                    <input
                      type="text"
                      value={form.assignedTo}
                      onChange={set('assignedTo')}
                      placeholder="Technician name"
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Scheduled Date + Estimated Hours */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Scheduled Date</label>
                    <input
                      type="datetime-local"
                      value={form.scheduledAt}
                      onChange={set('scheduledAt')}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Estimated Hours</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={form.estimatedHrs}
                      onChange={set('estimatedHrs')}
                      placeholder="e.g. 4.5"
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
                  <Link href="/field-service">
                    <Button type="button" variant="outline" size="sm">Cancel</Button>
                  </Link>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? 'Creating…' : 'Create Work Order'}
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
