'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const COMMON_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
]

export default function NewCurrencyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    code: '',
    name: '',
    symbol: '',
    isBase: false,
    isActive: true,
  })

  const prefill = (preset: typeof COMMON_CURRENCIES[0]) => {
    setForm(prev => ({ ...prev, code: preset.code, name: preset.name, symbol: preset.symbol }))
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(prev => ({ ...prev, [k]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code.trim() || !form.name.trim() || !form.symbol.trim()) {
      setError('Code, name, and symbol are required')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/finance/currencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          name: form.name.trim(),
          symbol: form.symbol.trim(),
          isBase: form.isBase,
          isActive: form.isActive,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push('/finance/currency')
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
      <TopBar title="Add Currency" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-xl mx-auto">
          <Link
            href="/finance/currency"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Currencies
          </Link>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Add Currency</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Quick Presets */}
                <div>
                  <label className={labelCls}>Quick Select</label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_CURRENCIES.map(c => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => prefill(c)}
                        className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                          form.code === c.code
                            ? 'bg-blue-600/20 border-blue-600 text-blue-300'
                            : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                        }`}
                      >
                        {c.code}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Code + Symbol */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Currency Code <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={form.code}
                      onChange={set('code')}
                      placeholder="USD"
                      maxLength={5}
                      className={inputCls + ' uppercase'}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Symbol <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={form.symbol}
                      onChange={set('symbol')}
                      placeholder="$"
                      maxLength={5}
                      className={inputCls}
                      required
                    />
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className={labelCls}>Currency Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    placeholder="e.g. US Dollar"
                    className={inputCls}
                    required
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isBase"
                      checked={form.isBase}
                      onChange={set('isBase')}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <label htmlFor="isBase" className="text-sm text-zinc-300 cursor-pointer">
                      Set as base currency{' '}
                      <span className="text-xs text-zinc-600">(existing base will be unset)</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={form.isActive}
                      onChange={set('isActive')}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <label htmlFor="isActive" className="text-sm text-zinc-300 cursor-pointer">Active</label>
                  </div>
                </div>

                {error && (
                  <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Link href="/finance/currency">
                    <Button type="button" variant="outline" size="sm">Cancel</Button>
                  </Link>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? 'Adding…' : 'Add Currency'}
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
