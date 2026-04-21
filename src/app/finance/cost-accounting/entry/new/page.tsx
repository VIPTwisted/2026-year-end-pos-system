'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Save, Loader2 } from 'lucide-react'

type CostCenter = { id: string; code: string; name: string }
type CostCategory = { id: string; code: string; name: string; type: string }

const SOURCE_TYPES = ['manual', 'journal', 'payroll', 'fixed_asset', 'allocation'] as const

export default function NewCostEntryPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [centers, setCenters] = useState<CostCenter[]>([])
  const [categories, setCategories] = useState<CostCategory[]>([])
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    costCenterId: '',
    costCategoryId: '',
    amount: '',
    description: '',
    sourceType: 'manual',
    fiscalYear: 'FY2026',
    periodNumber: '',
    entryDate: today,
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/finance/cost-accounting/centers').then(r => r.json()),
      fetch('/api/finance/cost-accounting/categories').then(r => r.json()),
    ]).then(([c, cats]) => {
      setCenters(c)
      setCategories(cats)
      setForm(prev => ({
        ...prev,
        costCenterId: c[0]?.id ?? '',
        costCategoryId: cats[0]?.id ?? '',
      }))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  function handleChange(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    if (!form.costCenterId || !form.costCategoryId) {
      setError('Cost center and category are required.')
      return
    }
    const amount = Number(form.amount)
    if (isNaN(amount) || amount === 0) {
      setError('Amount must be a non-zero number.')
      return
    }
    if (!form.entryDate) {
      setError('Entry date is required.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch('/api/finance/cost-accounting/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          costCenterId: form.costCenterId,
          costCategoryId: form.costCategoryId,
          amount,
          description: form.description.trim() || undefined,
          sourceType: form.sourceType,
          fiscalYear: form.fiscalYear.trim() || undefined,
          periodNumber: form.periodNumber ? Number(form.periodNumber) : undefined,
          entryDate: form.entryDate,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Failed to post entry.')
        setSaving(false)
        return
      }

      router.push('/finance/cost-accounting')
    } catch {
      setError('Network error. Please try again.')
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="Post Cost Entry" />
      <main className="flex-1 p-6 overflow-auto space-y-6 max-w-2xl">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Post Cost Ledger Entry</h2>
          <p className="text-sm text-zinc-500">Record an actual cost against a cost center and category</p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12 text-zinc-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading cost centers and categories…
            </CardContent>
          </Card>
        ) : (
          <Card>
            <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-900/60 rounded-t-lg">
              <h3 className="text-sm font-semibold text-zinc-200">Entry Details</h3>
            </div>
            <CardContent className="pt-5 pb-6 space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1.5">Cost Center *</label>
                  <select
                    value={form.costCenterId}
                    onChange={e => handleChange('costCenterId', e.target.value)}
                    className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {centers.length === 0 && (
                      <option value="" className="bg-zinc-900">No cost centers found</option>
                    )}
                    {centers.map(c => (
                      <option key={c.id} value={c.id} className="bg-zinc-900">
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1.5">Category *</label>
                  <select
                    value={form.costCategoryId}
                    onChange={e => handleChange('costCategoryId', e.target.value)}
                    className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {categories.length === 0 && (
                      <option value="" className="bg-zinc-900">No categories found</option>
                    )}
                    {categories.map(c => (
                      <option key={c.id} value={c.id} className="bg-zinc-900">
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1.5">Amount *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.amount}
                      onChange={e => handleChange('amount', e.target.value)}
                      placeholder="0.00"
                      className="bg-zinc-900 border-zinc-700 text-zinc-100 pl-7"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1.5">Entry Date *</label>
                  <Input
                    type="date"
                    value={form.entryDate}
                    onChange={e => handleChange('entryDate', e.target.value)}
                    className="bg-zinc-900 border-zinc-700 text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1.5">Description</label>
                <Input
                  value={form.description}
                  onChange={e => handleChange('description', e.target.value)}
                  placeholder="Describe the cost being recorded"
                  className="bg-zinc-900 border-zinc-700 text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1.5">Source Type</label>
                  <select
                    value={form.sourceType}
                    onChange={e => handleChange('sourceType', e.target.value)}
                    className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {SOURCE_TYPES.map(t => (
                      <option key={t} value={t} className="bg-zinc-900 capitalize">
                        {t.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1.5">Fiscal Year</label>
                  <Input
                    value={form.fiscalYear}
                    onChange={e => handleChange('fiscalYear', e.target.value)}
                    placeholder="FY2026"
                    className="bg-zinc-900 border-zinc-700 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1.5">Period #</label>
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={form.periodNumber}
                    onChange={e => handleChange('periodNumber', e.target.value)}
                    placeholder="4"
                    className="bg-zinc-900 border-zinc-700 text-zinc-100"
                  />
                </div>
              </div>

            </CardContent>
          </Card>
        )}

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Posting…</>
            ) : (
              <><Save className="w-4 h-4 mr-1" />Post Entry</>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/finance/cost-accounting')}
            disabled={saving}
          >
            Cancel
          </Button>
        </div>
      </main>
    </>
  )
}
