'use client'

import { TopBar } from '@/components/layout/TopBar'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { Save, X, ChevronDown, Calculator } from 'lucide-react'

type AssetGroup = {
  id: string
  code: string
  name: string
  depreciationMethod: string
  usefulLifeYears: number
  salvageValuePct: number
}

function calcAnnualDeprec(method: string, cost: number, salvage: number, life: number): number {
  if (life <= 0 || cost <= 0) return 0
  if (method === 'straight_line') return (cost - salvage) / life
  if (method === 'declining_balance') return cost * (2 / life)
  if (method === 'sum_of_years') {
    const s = (life * (life + 1)) / 2
    return ((cost - salvage) * life) / s
  }
  return 0
}

const inp = 'w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-colors'
const labelCls = 'block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5'

function FF({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  )
}

export default function NewFixedAssetPage() {
  const router = useRouter()
  const [groups, setGroups] = useState<AssetGroup[]>([])
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

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

  const handleGroupChange = useCallback((groupId: string) => {
    const g = groups.find(g => g.id === groupId)
    if (!g) { setForm(f => ({ ...f, groupId })); return }
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

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function notify(msg: string, type: 'ok' | 'err' = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const cost = parseFloat(form.acquisitionCost) || 0
  const salvage = parseFloat(form.salvageValue) || 0
  const life = parseFloat(form.usefulLifeYears) || 0
  const annualDeprec = calcAnnualDeprec(form.depreciationMethod, cost, salvage, life)
  const monthlyDeprec = annualDeprec / 12

  async function handleSave() {
    if (!form.name.trim()) { notify('Description is required', 'err'); return }
    if (!form.groupId) { notify('Asset group (FA Class) is required', 'err'); return }
    if (!form.acquisitionDate) { notify('Acquisition date is required', 'err'); return }
    if (cost <= 0) { notify('Acquisition cost must be greater than zero', 'err'); return }
    if (life <= 0) { notify('Useful life must be greater than zero', 'err'); return }

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
      if (!res.ok) { notify(data.error ?? 'Save failed', 'err'); return }
      notify('Fixed asset created')
      router.push(`/finance/fixed-assets/${data.id}`)
    } catch {
      notify('Network error — please try again', 'err')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar
        title="Fixed Asset Card"
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Fixed Assets', href: '/finance/fixed-assets' },
        ]}
        actions={
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-[12px] font-medium rounded transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => router.push('/finance/fixed-assets')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        }
      />

      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded shadow-lg text-[13px] font-medium ${
            toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {toast.msg}
          </div>
        )}

        <div className="max-w-3xl space-y-3">

          {/* General FastTab */}
          <details open className="group bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <summary className="flex items-center justify-between px-5 py-3 cursor-pointer select-none bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors list-none">
              <span className="text-[13px] font-semibold text-zinc-100">General</span>
              <ChevronDown className="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="px-5 py-5 grid grid-cols-2 gap-x-8 gap-y-5">
              <FF label="No.">
                <input value={form.assetNumber} onChange={e => set('assetNumber', e.target.value)} className={inp} placeholder="FA-XXXXXX" />
              </FF>
              <FF label="FA Class *">
                <select value={form.groupId} onChange={e => handleGroupChange(e.target.value)} className={inp}>
                  <option value="">Select FA class…</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.code} · {g.name}</option>
                  ))}
                </select>
              </FF>
              <div className="col-span-2">
                <FF label="Description *">
                  <input value={form.name} onChange={e => set('name', e.target.value)} className={inp} placeholder="e.g. POS Terminal System" />
                </FF>
              </div>
              <FF label="Description 2">
                <input value={form.description} onChange={e => set('description', e.target.value)} className={inp} placeholder="Optional" />
              </FF>
              <FF label="Location Code">
                <input value={form.location} onChange={e => set('location', e.target.value)} className={inp} placeholder="e.g. MAIN, STORE-1" />
              </FF>
              <FF label="Serial No.">
                <input value={form.serialNumber} onChange={e => set('serialNumber', e.target.value)} className={inp} placeholder="Optional serial #" />
              </FF>
            </div>
          </details>

          {/* Depreciation Book FastTab */}
          <details open className="group bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <summary className="flex items-center justify-between px-5 py-3 cursor-pointer select-none bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors list-none">
              <span className="text-[13px] font-semibold text-zinc-100">Depreciation Book</span>
              <ChevronDown className="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="px-5 py-5 grid grid-cols-2 gap-x-8 gap-y-5">
              <FF label="Depreciation Book Code">
                <input value="DEFAULT" readOnly className={inp + ' opacity-60 cursor-not-allowed'} />
              </FF>
              <FF label="Depreciation Method *">
                <select value={form.depreciationMethod} onChange={e => set('depreciationMethod', e.target.value)} className={inp}>
                  <option value="straight_line">Straight-Line</option>
                  <option value="declining_balance">Declining Balance (200%)</option>
                  <option value="sum_of_years">Sum-of-Years&apos; Digits</option>
                </select>
              </FF>
              <FF label="FA Posting Date (Acquisition) *">
                <input type="date" value={form.acquisitionDate} onChange={e => set('acquisitionDate', e.target.value)} className={inp} />
              </FF>
              <FF label="Acquisition Cost *">
                <input type="number" min="0" step="0.01" value={form.acquisitionCost} onChange={e => set('acquisitionCost', e.target.value)} className={inp} placeholder="0.00" />
              </FF>
              <FF label="Salvage Value">
                <input type="number" min="0" step="0.01" value={form.salvageValue} onChange={e => set('salvageValue', e.target.value)} className={inp} placeholder="0.00" />
              </FF>
              <FF label="Depreciation Starting Date">
                <input type="date" value={form.acquisitionDate} readOnly className={inp + ' opacity-60 cursor-not-allowed'} />
              </FF>
              <FF label="No. of Depreciation Years *">
                <input type="number" min="1" step="1" value={form.usefulLifeYears} onChange={e => set('usefulLifeYears', e.target.value)} className={inp} placeholder="5" />
              </FF>

              {/* Depreciation Preview */}
              {cost > 0 && life > 0 && (
                <div className="col-span-2 bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="w-4 h-4 text-indigo-400" />
                    <span className="text-[12px] font-medium text-indigo-300">Depreciation Preview</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-[10px] text-zinc-500 mb-1">Depreciable Amount</div>
                      <div className="text-[15px] font-bold text-zinc-100 tabular-nums">
                        ${(cost - salvage).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500 mb-1">Annual Depreciation (Yr 1)</div>
                      <div className="text-[15px] font-bold text-amber-400 tabular-nums">
                        ${annualDeprec.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500 mb-1">Monthly Depreciation</div>
                      <div className="text-[15px] font-bold text-emerald-400 tabular-nums">
                        ${monthlyDeprec.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </details>

          {/* Maintenance FastTab */}
          <details className="group bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <summary className="flex items-center justify-between px-5 py-3 cursor-pointer select-none bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors list-none">
              <span className="text-[13px] font-semibold text-zinc-100">Maintenance</span>
              <ChevronDown className="w-4 h-4 text-zinc-500 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="px-5 py-5 grid grid-cols-2 gap-x-8 gap-y-5">
              <FF label="Maintenance Vendor No.">
                <input value="" readOnly className={inp + ' opacity-60 cursor-not-allowed'} placeholder="—" />
              </FF>
              <FF label="Under Maintenance">
                <select className={inp}>
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </FF>
              <div className="col-span-2">
                <FF label="Notes">
                  <textarea
                    value={form.notes}
                    onChange={e => set('notes', e.target.value)}
                    rows={3}
                    className={inp + ' resize-none'}
                    placeholder="Internal notes, warranty info, etc."
                  />
                </FF>
              </div>
            </div>
          </details>

        </div>
      </div>
    </>
  )
}
