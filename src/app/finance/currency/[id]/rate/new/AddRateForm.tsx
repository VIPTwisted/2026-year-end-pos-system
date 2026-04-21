'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

interface Rate {
  id: string
  rate: number
  rateDate: string | Date
  source: string
}

interface Props {
  currencyId: string
  currencyCode: string
  currencyName: string
  symbol: string
  recentRates: Rate[]
}

export function AddRateForm({ currencyId, currencyCode, currencyName, symbol, recentRates }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    rate: '',
    rateDate: new Date().toISOString().split('T')[0],
    source: 'manual',
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.rate || parseFloat(form.rate) <= 0) {
      setError('Rate must be a positive number')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/finance/currencies/${currencyId}/rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rate: parseFloat(form.rate),
          rateDate: form.rateDate,
          source: form.source,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to add rate')
      setSuccess(`Rate ${parseFloat(form.rate).toFixed(6)} added successfully.`)
      setForm(prev => ({ ...prev, rate: '' }))
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
  const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">
            Add Exchange Rate — {currencyCode} ({symbol}) {currencyName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Rate (per 1 base currency) <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  min="0.000001"
                  step="any"
                  value={form.rate}
                  onChange={set('rate')}
                  placeholder="e.g. 1.085"
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Rate Date</label>
                <input
                  type="date"
                  value={form.rateDate}
                  onChange={set('rateDate')}
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Source</label>
              <select value={form.source} onChange={set('source')} className={inputCls}>
                <option value="manual">Manual</option>
                <option value="auto">Auto / Feed</option>
              </select>
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
            )}
            {success && (
              <div className="text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 rounded px-3 py-2">{success}</div>
            )}

            <div className="flex items-center justify-end gap-3 pt-1">
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? 'Adding…' : 'Add Rate'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Rate History */}
      {recentRates.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-400">Recent Rate History</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-2 font-medium">Rate</th>
                  <th className="text-left pb-2 font-medium">Date</th>
                  <th className="text-left pb-2 font-medium">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {recentRates.map((r, idx) => (
                  <tr key={r.id} className={idx === 0 ? 'bg-zinc-900/30' : ''}>
                    <td className="py-2 font-mono text-zinc-100 tabular-nums">{r.rate.toFixed(6)}</td>
                    <td className="py-2 text-zinc-400 text-xs">{formatDate(r.rateDate)}</td>
                    <td className="py-2 text-zinc-500 text-xs capitalize">{r.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
