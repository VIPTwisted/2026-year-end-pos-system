'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Building2 } from 'lucide-react'

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'

export default function NewConsolidationGroupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    description: '',
    currency: 'USD',
    periodStart: '',
    periodEnd: '',
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) {
      setError('Name is required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/consolidation/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description || undefined,
          currency: form.currency,
          periodStart: form.periodStart || undefined,
          periodEnd: form.periodEnd || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push(`/finance/consolidation/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <TopBar title="New Consolidation Group" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-xl mx-auto">
          <Link
            href="/finance/consolidation"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Consolidation
          </Link>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-zinc-400" />
                New Consolidation Group
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className={labelCls}>Group Name <span className="text-red-400">*</span></label>
                  <input type="text" value={form.name} onChange={set('name')} placeholder="US Consolidated Group" className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea value={form.description} onChange={set('description')} rows={2} placeholder="Group description…" className={inputCls + ' resize-none'} />
                </div>
                <div>
                  <label className={labelCls}>Base Currency</label>
                  <input type="text" value={form.currency} onChange={set('currency')} placeholder="USD" maxLength={3} className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Default Period Start</label>
                    <input type="date" value={form.periodStart} onChange={set('periodStart')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Default Period End</label>
                    <input type="date" value={form.periodEnd} onChange={set('periodEnd')} className={inputCls} />
                  </div>
                </div>
                {error && (
                  <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
                )}
                <div className="flex items-center justify-end gap-3 pt-1">
                  <Link href="/finance/consolidation">
                    <Button type="button" variant="outline" size="sm">Cancel</Button>
                  </Link>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? 'Creating…' : 'Create Group'}
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
