'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings2 } from 'lucide-react'

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'

export default function NewWorkCenterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    capacity: '1',
    unitOfMeasure: 'hours',
    costPerHour: '0',
    efficiency: '100',
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code.trim() || !form.name.trim()) {
      setError('Code and name are required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/manufacturing/work-centers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.trim(),
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          capacity: parseFloat(form.capacity) || 1,
          unitOfMeasure: form.unitOfMeasure.trim() || 'hours',
          costPerHour: parseFloat(form.costPerHour) || 0,
          efficiency: parseFloat(form.efficiency) || 100,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push(`/manufacturing/work-centers/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <TopBar title="New Work Center" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-xl mx-auto">
          <Link
            href="/manufacturing/work-centers"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Work Centers
          </Link>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-zinc-400" />
                Create Work Center
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Code <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={form.code}
                      onChange={set('code')}
                      placeholder="WC-WELD"
                      className={inputCls}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={set('name')}
                      placeholder="Welding Station"
                      className={inputCls}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={set('description')}
                    placeholder="MIG welding station for steel frames…"
                    rows={2}
                    className={inputCls + ' resize-none'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Capacity (units per UOM)</label>
                    <input type="number" min="0.001" step="any" value={form.capacity} onChange={set('capacity')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Unit of Measure</label>
                    <input type="text" value={form.unitOfMeasure} onChange={set('unitOfMeasure')} placeholder="hours" className={inputCls} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Cost per Hour ($)</label>
                    <input type="number" min="0" step="0.01" value={form.costPerHour} onChange={set('costPerHour')} placeholder="0.00" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Efficiency (%)</label>
                    <input type="number" min="1" max="200" step="0.1" value={form.efficiency} onChange={set('efficiency')} placeholder="100" className={inputCls} />
                  </div>
                </div>

                {error && (
                  <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
                )}

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Link href="/manufacturing/work-centers">
                    <Button type="button" variant="outline" size="sm">Cancel</Button>
                  </Link>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? 'Creating…' : 'Create Work Center'}
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
