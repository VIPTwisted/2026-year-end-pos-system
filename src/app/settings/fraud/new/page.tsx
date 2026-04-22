'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewFraudRulePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    ruleType: 'ORDER_AMOUNT',
    threshold: '',
    action: 'flag',
    isActive: true,
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Rule name is required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/fraud/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          ruleType: form.ruleType,
          threshold: form.threshold ? parseFloat(form.threshold) : undefined,
          action: form.action,
          isActive: form.isActive,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push('/settings/fraud')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
  const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'

  const RULE_TYPE_DESCRIPTIONS: Record<string, string> = {
    ORDER_AMOUNT: 'Flag orders exceeding a dollar threshold',
    VELOCITY: 'Flag customers placing too many orders in a short window',
    IP_BLOCK: 'Block transactions from specific IP ranges',
    PAYMENT_METHOD: 'Flag or block specific payment methods',
  }

  return (
    <>
      <TopBar title="Add Fraud Rule" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4">
          <div className="max-w-xl">
            <Link
              href="/settings/fraud"
              className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Fraud Protection
            </Link>

            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-5 py-3.5 border-b border-zinc-800/40">
                <h2 className="text-[14px] font-semibold text-zinc-100">New Fraud Rule</h2>
              </div>
              <div className="p-5">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Name */}
                <div>
                  <label className={labelCls}>Rule Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    placeholder="e.g. High Value Order Alert"
                    className={inputCls}
                    required
                  />
                </div>

                {/* Rule Type */}
                <div>
                  <label className={labelCls}>Rule Type</label>
                  <select value={form.ruleType} onChange={set('ruleType')} className={inputCls}>
                    <option value="ORDER_AMOUNT">ORDER_AMOUNT</option>
                    <option value="VELOCITY">VELOCITY</option>
                    <option value="IP_BLOCK">IP_BLOCK</option>
                    <option value="PAYMENT_METHOD">PAYMENT_METHOD</option>
                  </select>
                  <p className="text-xs text-zinc-600 mt-1">
                    {RULE_TYPE_DESCRIPTIONS[form.ruleType]}
                  </p>
                </div>

                {/* Threshold */}
                <div>
                  <label className={labelCls}>Threshold (optional)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.threshold}
                    onChange={set('threshold')}
                    placeholder="e.g. 5000 for ORDER_AMOUNT"
                    className={inputCls}
                  />
                </div>

                {/* Action */}
                <div>
                  <label className={labelCls}>Action</label>
                  <select value={form.action} onChange={set('action')} className={inputCls}>
                    <option value="flag">Flag — alert only, allow transaction</option>
                    <option value="review">Review — hold for manual approval</option>
                    <option value="block">Block — reject transaction immediately</option>
                  </select>
                </div>

                {/* Active */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 accent-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm text-zinc-300 cursor-pointer">
                    Enable rule immediately
                  </label>
                </div>

                {error && (
                  <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Link href="/settings/fraud">
                    <Button type="button" variant="outline" size="sm">Cancel</Button>
                  </Link>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? 'Saving…' : 'Create Rule'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
          </div>
        </div>
      </main>
    </>
  )
}
