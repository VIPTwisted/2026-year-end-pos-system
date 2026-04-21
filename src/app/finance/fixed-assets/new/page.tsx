'use client'

import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Calculator } from 'lucide-react'
import Link from 'next/link'

type AssetGroup = {
  id: string
  code: string
  name: string
  depreciationMethod: string
  usefulLifeYears: number
  salvageValuePct: number
}

function calcAnnualDeprec(
  method: string,
  cost: number,
  salvage: number,
  lifeYears: number,
  bookValue?: number
): number {
  if (lifeYears <= 0 || cost <= 0) return 0
  if (method === 'straight_line') {
    return (cost - salvage) / lifeYears
  }
  if (method === 'declining_balance') {
    const bv = bookValue ?? cost
    return bv * (2 / lifeYears)
  }
  if (method === 'sum_of_years') {
    const sumYears = (lifeYears * (lifeYears + 1)) / 2
    return ((cost - salvage) * lifeYears) / sumYears
  }
  return 0
}

export default function NewFixedAssetPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<AssetGroup[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    assetNumber: `FA-${Date.now().toString(36).toUpperCase()}`,
    name: '',
    description: '',
    groupId: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    acquisitionCost: '',
    salvageValue: '',
    usefulLifeYears: '',
    depreciationMethod: 'straight_line',
    location: '',
    serialNumber: '',
    notes: '',
  })

  useEffect(() => {
    fetch('/api/finance/asset-groups')
      .then(r => r.json())
      .then(setGroups)
      .catch(() => setGroups([]))
  }, [])

  // When group changes, auto-fill method + life + salvage
  const handleGroupChange = useCallback((groupId: string) => {
    const g = groups.find(g => g.id === groupId)
    if (!g) {
      setForm(f => ({ ...f, groupId }))
      return
    }
    setForm(f => ({
      ...f,
      groupId,
      depreciationMethod: g.depreciationMethod,
      usefulLifeYears: String(g.usefulLifeYears),
      salvageValue: f.acquisitionCost
        ? String((parseFloat(f.acquisitionCost) * g.salvageValuePct).toFixed(2))
        : f.salvageValue,
    }))
  }, [groups])

  const cost = parseFloat(form.acquisitionCost) || 0
  const salvage = parseFloat(form.salvageValue) || 0
  const life = parseFloat(form.usefulLifeYears) || 0
  const annualDeprec = calcAnnualDeprec(form.depreciationMethod, cost, salvage, life)
  const monthlyDeprec = annualDeprec / 12

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) { setError('Name is required'); return }
    if (!form.groupId) { setError('Asset group is required'); return }
    if (!form.acquisitionDate) { setError('Acquisition date is required'); return }
    if (cost <= 0) { setError('Acquisition cost must be greater than zero'); return }
    if (life <= 0) { setError('Useful life must be greater than zero'); return }

    setSaving(true)
    try {
      const res = await fetch('/api/finance/fixed-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetNumber: form.assetNumber || undefined,
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          groupId: form.groupId,
          acquisitionDate: new Date(form.acquisitionDate).toISOString(),
          acquisitionCost: cost,
          salvageValue: salvage,
          usefulLifeYears: life,
          depreciationMethod: form.depreciationMethod,
          location: form.location.trim() || undefined,
          serialNumber: form.serialNumber.trim() || undefined,
          notes: form.notes.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to create asset'); return }
      router.push(`/finance/fixed-assets/${data.id}`)
    } catch {
      setError('Network error — please try again')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors'
  const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5'

  return (
    <div className="flex flex-col min-h-[100dvh] bg-zinc-950">
      <TopBar title="New Fixed Asset" />

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto">

          {/* Back */}
          <Link href="/finance/fixed-assets" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Fixed Assets
          </Link>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-zinc-100">Register New Asset</h2>
            <p className="text-sm text-zinc-500 mt-1">Add a capital asset to the depreciation ledger</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Identification */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-zinc-300 mb-5">Identification</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Asset Number</label>
                  <input
                    className={inputCls}
                    value={form.assetNumber}
                    onChange={e => set('assetNumber', e.target.value)}
                    placeholder="FA-XXXXXX"
                  />
                </div>
                <div>
                  <label className={labelCls}>Asset Group <span className="text-red-400">*</span></label>
                  <select
                    className={inputCls}
                    value={form.groupId}
                    onChange={e => handleGroupChange(e.target.value)}
                    required
                  >
                    <option value="">Select group…</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Asset Name <span className="text-red-400">*</span></label>
                  <input
                    className={inputCls}
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="e.g. POS Terminal System"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Description</label>
                  <textarea
                    className={inputCls + ' resize-none'}
                    rows={2}
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="Optional description"
                  />
                </div>
                <div>
                  <label className={labelCls}>Location</label>
                  <input
                    className={inputCls}
                    value={form.location}
                    onChange={e => set('location', e.target.value)}
                    placeholder="e.g. Store Floor, Warehouse"
                  />
                </div>
                <div>
                  <label className={labelCls}>Serial Number</label>
                  <input
                    className={inputCls}
                    value={form.serialNumber}
                    onChange={e => set('serialNumber', e.target.value)}
                    placeholder="Optional serial #"
                  />
                </div>
              </div>
            </div>

            {/* Acquisition */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-zinc-300 mb-5">Acquisition & Valuation</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Acquisition Date <span className="text-red-400">*</span></label>
                  <input
                    type="date"
                    className={inputCls}
                    value={form.acquisitionDate}
                    onChange={e => set('acquisitionDate', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Acquisition Cost ($) <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputCls}
                    value={form.acquisitionCost}
                    onChange={e => set('acquisitionCost', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Salvage Value ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputCls}
                    value={form.salvageValue}
                    onChange={e => set('salvageValue', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className={labelCls}>Useful Life (years) <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className={inputCls}
                    value={form.usefulLifeYears}
                    onChange={e => set('usefulLifeYears', e.target.value)}
                    placeholder="e.g. 5"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Depreciation Method <span className="text-red-400">*</span></label>
                  <select
                    className={inputCls}
                    value={form.depreciationMethod}
                    onChange={e => set('depreciationMethod', e.target.value)}
                  >
                    <option value="straight_line">Straight-Line</option>
                    <option value="declining_balance">Declining Balance (200%)</option>
                    <option value="sum_of_years">Sum of Years&apos; Digits</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Depreciation Preview */}
            {cost > 0 && life > 0 && (
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-300">Depreciation Preview</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Depreciable Amount</p>
                    <p className="text-lg font-bold text-zinc-100">
                      ${(cost - salvage).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Annual Depreciation (Yr 1)</p>
                    <p className="text-lg font-bold text-amber-400">
                      ${annualDeprec.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Monthly Depreciation</p>
                    <p className="text-lg font-bold text-emerald-400">
                      ${monthlyDeprec.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-zinc-300 mb-5">Notes</h3>
              <textarea
                className={inputCls + ' resize-none'}
                rows={3}
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Internal notes, warranty info, etc."
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pb-4">
              <Link href="/finance/fixed-assets">
                <Button type="button" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-500 text-white gap-2"
              >
                {saving ? 'Saving…' : 'Register Asset'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
