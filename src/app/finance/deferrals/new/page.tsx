'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewDeferralTemplatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    deferralType: 'REVENUE',
    method: 'STRAIGHT_LINE',
    periodsCount: '12',
    glAccountId: '',
    deferralAccountId: '',
    isActive: true,
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setForm(prev => ({ ...prev, [k]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/finance/deferrals/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          deferralType: form.deferralType,
          method: form.method,
          periodsCount: parseInt(form.periodsCount),
          glAccountId: form.glAccountId.trim() || undefined,
          deferralAccountId: form.deferralAccountId.trim() || undefined,
          isActive: form.isActive,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push('/finance/deferrals')
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
      <TopBar title="New Deferral Template" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-xl mx-auto">
          <Link
            href="/finance/deferrals"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Deferrals
          </Link>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Create Deferral Template</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                  <label className={labelCls}>Template Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    placeholder="e.g. 12-Month Revenue Deferral"
                    className={inputCls}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Deferral Type</label>
                    <select value={form.deferralType} onChange={set('deferralType')} className={inputCls}>
                      <option value="REVENUE">Revenue</option>
                      <option value="EXPENSE">Expense</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Recognition Method</label>
                    <select value={form.method} onChange={set('method')} className={inputCls}>
                      <option value="STRAIGHT_LINE">Straight Line</option>
                      <option value="EQUAL_PER_PERIOD">Equal Per Period</option>
                      <option value="USER_DEFINED">User Defined</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Number of Periods (months)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={form.periodsCount}
                    onChange={set('periodsCount')}
                    className={inputCls}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>GL Account ID (optional)</label>
                    <input
                      type="text"
                      value={form.glAccountId}
                      onChange={set('glAccountId')}
                      placeholder="Account ID"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Deferral Account ID (optional)</label>
                    <input
                      type="text"
                      value={form.deferralAccountId}
                      onChange={set('deferralAccountId')}
                      placeholder="Account ID"
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 accent-blue-600"
                  />
                  <label htmlFor="isActive" className="text-sm text-zinc-300 cursor-pointer">Active</label>
                </div>

                {error && (
                  <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Link href="/finance/deferrals">
                    <Button type="button" variant="outline" size="sm">Cancel</Button>
                  </Link>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? 'Creating…' : 'Create Template'}
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
