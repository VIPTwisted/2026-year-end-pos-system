'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PlayCircle, ChevronRight, Tag, RefreshCw, Percent } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PriceBook {
  id: string
  name: string
  currency: string
}

interface AppliedRule {
  ruleName: string
  ruleType: string
  discountAmt: number
  description: string
}

interface SimResult {
  sku: string
  qty: number
  basePrice: number
  appliedRules: AppliedRule[]
  finalPrice: number
  discountAmt: number
  savingsPct: number
  priceBookId: string | null
  customerGroup: string | null
}

const RULE_TYPE_COLOR: Record<string, string> = {
  BOGO: 'bg-violet-500/20 text-violet-300',
  BULK_DISCOUNT: 'bg-blue-500/20 text-blue-300',
  FIXED_DISCOUNT: 'bg-emerald-500/20 text-emerald-300',
  PCT_DISCOUNT: 'bg-amber-500/20 text-amber-300',
  CUSTOMER_GROUP: 'bg-rose-500/20 text-rose-300',
}

export default function SimulatePage() {
  const [books, setBooks] = useState<PriceBook[]>([])
  const [form, setForm] = useState({ sku: '', qty: '1', customerGroup: '', priceBookId: '' })
  const [result, setResult] = useState<SimResult | null>(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/pricing/price-books')
      .then(r => r.json())
      .then(d => setBooks(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.sku.trim()) return
    setRunning(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/pricing/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: form.sku.trim(),
          qty: Number(form.qty),
          customerGroup: form.customerGroup || undefined,
          priceBookId: form.priceBookId || undefined,
        }),
      })
      if (!res.ok) throw new Error('Simulation failed')
      const data = await res.json()
      setResult(data)
    } catch {
      setError('Simulation failed. Please try again.')
    } finally {
      setRunning(false)
    }
  }

  function handleReset() {
    setResult(null)
    setForm({ sku: '', qty: '1', customerGroup: '', priceBookId: '' })
    setError('')
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/pricing" className="text-zinc-500 hover:text-zinc-300 text-sm">Pricing</Link>
        <ChevronRight className="w-4 h-4 text-zinc-600" />
        <span className="text-zinc-100 font-semibold">Price Simulator</span>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <PlayCircle className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-zinc-100">Simulate Pricing</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">SKU *</label>
                <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} required placeholder="e.g. SKU-001"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-amber-500 font-mono" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Quantity</label>
                <input value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} type="number" min="1"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-amber-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Price Book</label>
              <select value={form.priceBookId} onChange={e => setForm(f => ({ ...f, priceBookId: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-amber-500">
                <option value="">— Use default —</option>
                {books.map(b => <option key={b.id} value={b.id}>{b.name} ({b.currency})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Customer Group</label>
              <input value={form.customerGroup} onChange={e => setForm(f => ({ ...f, customerGroup: e.target.value }))} placeholder="e.g. VIP, Wholesale"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 text-sm focus:outline-none focus:border-amber-500" />
            </div>
            <button type="submit" disabled={running}
              className={cn('w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors', running && 'opacity-50 cursor-not-allowed')}>
              <PlayCircle className="w-4 h-4" />
              {running ? 'Simulating…' : 'Run Simulation'}
            </button>
          </form>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>}

        {result && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-zinc-100">Simulation Result</span>
              </div>
              <button onClick={handleReset} className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 text-sm">
                <RefreshCw className="w-3.5 h-3.5" /> Simulate Another
              </button>
            </div>
            <div className="grid grid-cols-3 divide-x divide-zinc-800 border-b border-zinc-800">
              <div className="p-4 text-center">
                <div className="text-xs text-zinc-500 mb-1">Base Price × Qty</div>
                <div className="text-lg font-bold text-zinc-300">${(result.basePrice * result.qty).toFixed(2)}</div>
                <div className="text-xs text-zinc-600">{result.qty} × ${result.basePrice.toFixed(2)}</div>
              </div>
              <div className="p-4 text-center">
                <div className="text-xs text-zinc-500 mb-1">Total Discount</div>
                <div className="text-lg font-bold text-red-400">-${result.discountAmt.toFixed(2)}</div>
                <div className="text-xs text-zinc-600">{result.savingsPct}% off</div>
              </div>
              <div className="p-4 text-center">
                <div className="text-xs text-zinc-500 mb-1">Final Price</div>
                <div className="text-xl font-bold text-emerald-400">${result.finalPrice.toFixed(2)}</div>
                {result.savingsPct > 0 && <div className="text-xs text-emerald-500">You save ${result.discountAmt.toFixed(2)}</div>}
              </div>
            </div>
            {result.appliedRules.length > 0 ? (
              <div className="p-5 space-y-3">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Applied Rules ({result.appliedRules.length})</div>
                {result.appliedRules.map((rule, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 bg-zinc-800/50 rounded-lg px-4 py-3">
                    <div className="flex items-start gap-3">
                      <Tag className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm text-zinc-200 font-medium">{rule.ruleName}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">{rule.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', RULE_TYPE_COLOR[rule.ruleType] ?? 'bg-zinc-700 text-zinc-400')}>
                        {rule.ruleType.replace(/_/g, ' ')}
                      </span>
                      <span className="text-red-400 font-mono text-sm">-${rule.discountAmt.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 text-center text-zinc-500 text-sm">No discount rules applied for this combination.</div>
            )}
            <div className="px-5 pb-5 text-xs text-zinc-600 flex gap-4">
              <span>SKU: <span className="text-zinc-400 font-mono">{result.sku}</span></span>
              {result.priceBookId && <span>Book: <span className="text-zinc-400">{books.find(b => b.id === result.priceBookId)?.name ?? result.priceBookId}</span></span>}
              {result.customerGroup && <span>Group: <span className="text-zinc-400">{result.customerGroup}</span></span>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
