'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Filter } from 'lucide-react'

export default function NewRulePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    description: '',
    ruleType: 'nearest_store',
    priority: '0',
    isActive: true,
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const toggle = () => setForm(prev => ({ ...prev, isActive: !prev.isActive }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/dom/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          ruleType: form.ruleType,
          priority: parseInt(form.priority) || 0,
          isActive: form.isActive,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push('/dom/rules')
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
      <TopBar title="New Fulfillment Rule" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <Link href="/dom/rules" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Rules
          </Link>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="w-4 h-4 text-zinc-400" />
                Create Fulfillment Rule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                  <label className={labelCls}>Rule Name <span className="text-red-400">*</span></label>
                  <input type="text" value={form.name} onChange={set('name')} placeholder="e.g. Ship from Nearest Store" className={inputCls} required />
                </div>

                <div>
                  <label className={labelCls}>Description</label>
                  <textarea value={form.description} onChange={set('description')} placeholder="When this rule applies and what it does…" rows={2} className={inputCls + ' resize-none'} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Rule Type</label>
                    <select value={form.ruleType} onChange={set('ruleType')} className={inputCls}>
                      <option value="nearest_store">Nearest Store</option>
                      <option value="lowest_cost">Lowest Cost</option>
                      <option value="highest_stock">Highest Stock</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Priority (higher = first)</label>
                    <input type="number" min="0" value={form.priority} onChange={set('priority')} placeholder="0" className={inputCls} />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                  <div>
                    <p className="text-sm text-zinc-200">Active Rule</p>
                    <p className="text-xs text-zinc-500">Inactive rules are skipped during fulfillment routing</p>
                  </div>
                  <button
                    type="button"
                    onClick={toggle}
                    className={`relative w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-blue-600' : 'bg-zinc-700'}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {error && (
                  <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
                )}

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Link href="/dom/rules">
                    <Button type="button" variant="outline" size="sm">Cancel</Button>
                  </Link>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? 'Creating…' : 'Create Rule'}
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
