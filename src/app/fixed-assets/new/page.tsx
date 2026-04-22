'use client'

import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ArrowLeft, Calculator } from 'lucide-react'
import Link from 'next/link'

type AssetClass = { id: string; code: string; name: string }
type AssetSubclass = { id: string; code: string; name: string; classId: string | null }

function calcMonthlyDeprec(
  method: string,
  cost: number,
  salvage: number,
  years: number
): number {
  if (years <= 0 || cost <= 0) return 0
  const depreciable = cost - salvage
  const totalMonths = years * 12
  if (method === 'straight_line') return depreciable / totalMonths
  if (method === 'declining_balance') return (cost * (2 / years)) / 12
  if (method === 'sum_of_years') {
    const sumYears = (years * (years + 1)) / 2
    return (depreciable * years) / (sumYears * 12)
  }
  return 0
}

export default function NewFixedAssetPage() {
  const router = useRouter()
  const [classes, setClasses] = useState<AssetClass[]>([])
  const [subclasses, setSubclasses] = useState<AssetSubclass[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    description: '',
    classId: '',
    subclassId: '',
    serialNumber: '',
    location: '',
    responsibleEmployee: '',
    acquisitionDate: new Date().toISOString().split('T')[0],
    acquisitionCost: '',
    salvageValue: '',
    depreciationMethod: 'straight_line',
    noOfDepreciationYears: '5',
    depreciationStartDate: new Date().toISOString().split('T')[0],
    notes: '',
  })

  useEffect(() => {
    fetch('/api/fixed-assets/classes').then(r => r.json()).then(setClasses).catch(() => [])
  }, [])

  const filteredSubclasses = subclasses.filter(
    s => !form.classId || s.classId === form.classId
  )

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  const cost = parseFloat(form.acquisitionCost) || 0
  const salvage = parseFloat(form.salvageValue) || 0
  const years = parseFloat(form.noOfDepreciationYears) || 0
  const monthly = calcMonthlyDeprec(form.depreciationMethod, cost, salvage, years)
  const annual = monthly * 12

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.description.trim()) { setError('Description is required'); return }

    setSaving(true)
    try {
      const res = await fetch('/api/fixed-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: form.description.trim(),
          classId: form.classId || null,
          subclassId: form.subclassId || null,
          serialNumber: form.serialNumber.trim() || null,
          location: form.location.trim() || null,
          responsibleEmployee: form.responsibleEmployee.trim() || null,
          acquisitionDate: form.acquisitionDate ? new Date(form.acquisitionDate).toISOString() : null,
          acquisitionCost: cost,
          salvageValue: salvage,
          notes: form.notes.trim() || null,
          depreciationMethod: form.depreciationMethod,
          noOfDepreciationYears: years || 5,
          depreciationStartDate: form.depreciationStartDate
            ? new Date(form.depreciationStartDate).toISOString()
            : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to create asset'); return }
      router.push(`/fixed-assets/${data.id}`)
    } catch {
      setError('Network error — please try again')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors'
  const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5'

  return (
    <>
      <TopBar title="New Fixed Asset" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a]">
        <div className="max-w-3xl mx-auto">
          <Link href="/fixed-assets" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Fixed Assets
          </Link>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-zinc-100">Register New Asset</h2>
            <p className="text-sm text-zinc-500 mt-1">Add a capital asset to the fixed assets register</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Identification */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-zinc-300 mb-5">Identification</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Description <span className="text-red-400">*</span></label>
                  <input
                    className={inputCls}
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="e.g. POS Terminal System — Store 01"
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Asset Class</label>
                  <select
                    className={inputCls}
                    value={form.classId}
                    onChange={e => { set('classId', e.target.value); set('subclassId', '') }}
                  >
                    <option value="">Select class…</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Asset Subclass</label>
                  <select
                    className={inputCls}
                    value={form.subclassId}
                    onChange={e => set('subclassId', e.target.value)}
                    disabled={filteredSubclasses.length === 0}
                  >
                    <option value="">Select subclass…</option>
                    {filteredSubclasses.map(s => (
                      <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
                    ))}
                  </select>
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
                <div>
                  <label className={labelCls}>Location</label>
                  <input
                    className={inputCls}
                    value={form.location}
                    onChange={e => set('location', e.target.value)}
                    placeholder="e.g. Store Floor, Warehouse A"
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Responsible Employee</label>
                  <input
                    className={inputCls}
                    value={form.responsibleEmployee}
                    onChange={e => set('responsibleEmployee', e.target.value)}
                    placeholder="Name of responsible employee"
                  />
                </div>
              </div>
            </div>

            {/* Acquisition */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-zinc-300 mb-5">Acquisition & Valuation</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Acquisition Date</label>
                  <input
                    type="date"
                    className={inputCls}
                    value={form.acquisitionDate}
                    onChange={e => set('acquisitionDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelCls}>Acquisition Cost ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputCls}
                    value={form.acquisitionCost}
                    onChange={e => set('acquisitionCost', e.target.value)}
                    placeholder="0.00"
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
              </div>
            </div>

            {/* Depreciation Book */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-zinc-300 mb-5">Depreciation Book (COMPANY)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Depreciation Method</label>
                  <select
                    className={inputCls}
                    value={form.depreciationMethod}
                    onChange={e => set('depreciationMethod', e.target.value)}
                  >
                    <option value="straight_line">Straight-Line</option>
                    <option value="declining_balance">Declining Balance (200%)</option>
                    <option value="sum_of_years">Sum of Years&apos; Digits</option>
                    <option value="units_of_production">Units of Production</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Depreciation Years</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    className={inputCls}
                    value={form.noOfDepreciationYears}
                    onChange={e => set('noOfDepreciationYears', e.target.value)}
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className={labelCls}>Depreciation Start Date</label>
                  <input
                    type="date"
                    className={inputCls}
                    value={form.depreciationStartDate}
                    onChange={e => set('depreciationStartDate', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            {cost > 0 && years > 0 && (
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
                    <p className="text-xs text-zinc-500 mb-1">Annual (Year 1)</p>
                    <p className="text-lg font-bold text-amber-400">
                      ${annual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Monthly</p>
                    <p className="text-lg font-bold text-emerald-400">
                      ${monthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-zinc-300 mb-5">Notes</h3>
              <textarea
                className={inputCls + ' resize-none'}
                rows={3}
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Internal notes, warranty info, purchase details…"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pb-4">
              <Link href="/fixed-assets">
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
    </>
  )
}
