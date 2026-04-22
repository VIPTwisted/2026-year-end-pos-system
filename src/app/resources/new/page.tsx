'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'

const RESOURCE_TYPES = ['person', 'machine', 'tool', 'other']

export default function NewResourcePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    type: 'person',
    unitCost: '',
    unitPrice: '',
    capacity: '8',
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          type: form.type,
          unitCost: form.unitCost || undefined,
          unitPrice: form.unitPrice || undefined,
          capacity: form.capacity || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push('/resources')
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
      <TopBar title="New Resource" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a]">
        <div className="max-w-lg mx-auto">
          <Link href="/resources" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Resources
          </Link>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-400" />
                Create Resource
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className={labelCls}>Name <span className="text-red-400">*</span></label>
                  <input type="text" value={form.name} onChange={set('name')} placeholder="John Smith" className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>Type</label>
                  <select value={form.type} onChange={set('type')} className={inputCls}>
                    {RESOURCE_TYPES.map(t => (
                      <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Unit Cost ($)</label>
                    <input type="number" min="0" step="0.01" value={form.unitCost} onChange={set('unitCost')} placeholder="0.00" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Unit Price ($)</label>
                    <input type="number" min="0" step="0.01" value={form.unitPrice} onChange={set('unitPrice')} placeholder="0.00" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Daily Capacity (h)</label>
                    <input type="number" min="0" step="0.5" value={form.capacity} onChange={set('capacity')} placeholder="8" className={inputCls} />
                  </div>
                </div>
                {error && (
                  <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
                )}
                <div className="flex items-center justify-end gap-3 pt-1">
                  <Link href="/resources">
                    <Button type="button" variant="outline" size="sm">Cancel</Button>
                  </Link>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? 'Creating…' : 'Create Resource'}
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
