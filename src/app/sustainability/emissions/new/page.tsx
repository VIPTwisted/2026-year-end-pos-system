'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Wind } from 'lucide-react'

// TODO: Wire to POST /api/sustainability/emissions once EmissionEntry model is added to schema

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'

const CATEGORIES = ['Fuel', 'Electricity', 'Travel', 'Supply Chain', 'Waste', 'Refrigerants', 'Process', 'Other']

const FACTOR_HINTS: Record<string, string> = {
  Fuel: 'Diesel: 2.68 kg/L · Petrol: 2.31 kg/L · Natural gas: 2.04 kg/m³',
  Electricity: 'US avg grid: ~0.45 kg/kWh · Renewable: ~0.02 kg/kWh',
  Travel: 'Short-haul flight: 0.255 kg/km · Car: 0.21 kg/km · Train: 0.04 kg/km',
  'Supply Chain': 'Road freight: 0.062 kg/tonne-km · Air freight: 0.602 kg/tonne-km',
  Waste: 'Landfill: 0.58 kg/kg · Incineration: 0.21 kg/kg',
  Refrigerants: 'R-410A GWP 2088 · R-134a GWP 1430',
}

interface FormState {
  date: string
  scope: string
  category: string
  description: string
  quantity: string
  unit: string
  emissionFactor: string
  source: string
}

export default function NewEmissionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState<FormState>({
    date: new Date().toISOString().slice(0, 10),
    scope: '1',
    category: 'Fuel',
    description: '',
    quantity: '',
    unit: 'liters',
    emissionFactor: '',
    source: '',
  })

  const set = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const co2eKg =
    parseFloat(form.quantity) > 0 && parseFloat(form.emissionFactor) > 0
      ? parseFloat(form.quantity) * parseFloat(form.emissionFactor)
      : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.quantity || !form.emissionFactor) {
      setError('Quantity and emission factor are required')
      return
    }
    setLoading(true)
    setError('')
    try {
      // TODO: Replace with real API call when model exists
      // const res = await fetch('/api/sustainability/emissions', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     date: form.date,
      //     scope: parseInt(form.scope),
      //     category: form.category,
      //     description: form.description,
      //     quantity: parseFloat(form.quantity),
      //     unit: form.unit,
      //     emissionFactor: parseFloat(form.emissionFactor),
      //     co2eKg: co2eKg,
      //     source: form.source || undefined,
      //   }),
      // })
      // const data = await res.json()
      // if (!res.ok) throw new Error(data.error ?? 'Create failed')
      await new Promise(r => setTimeout(r, 400)) // stub
      router.push('/sustainability/emissions')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const hint = FACTOR_HINTS[form.category]
  const unitSuggestions: Record<string, string> = {
    Fuel: 'liters',
    Electricity: 'kWh',
    Travel: 'km',
    'Supply Chain': 'tonne-km',
    Waste: 'kg',
    Refrigerants: 'kg',
  }

  return (
    <>
      <TopBar title="Log Emission Entry" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <Link href="/sustainability/emissions" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Emissions
          </Link>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wind className="w-4 h-4 text-orange-400" />
                  Log Emission Entry
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Date <span className="text-red-400">*</span></label>
                    <input type="date" value={form.date} onChange={set('date')} className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Scope <span className="text-red-400">*</span></label>
                    <select value={form.scope} onChange={set('scope')} className={inputCls} required>
                      <option value="1">Scope 1 — Direct emissions (fuel, vehicles, on-site)</option>
                      <option value="2">Scope 2 — Indirect (purchased electricity/heat)</option>
                      <option value="3">Scope 3 — Value chain (travel, supply chain, waste)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Category <span className="text-red-400">*</span></label>
                  <select
                    value={form.category}
                    onChange={e => {
                      const c = e.target.value
                      setForm(prev => ({
                        ...prev,
                        category: c,
                        unit: unitSuggestions[c] ?? prev.unit,
                      }))
                    }}
                    className={inputCls}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {hint && (
                    <p className="text-[11px] text-zinc-600 mt-1.5">{hint}</p>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Description</label>
                  <input type="text" value={form.description} onChange={set('description')} placeholder="e.g. Fleet diesel consumption April 2026" className={inputCls} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Quantity <span className="text-red-400">*</span></label>
                    <input type="number" min="0.001" step="any" value={form.quantity} onChange={set('quantity')} placeholder="0" className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Unit</label>
                    <input type="text" value={form.unit} onChange={set('unit')} placeholder="liters / kWh / km" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Emission Factor (kgCO₂e per unit) <span className="text-red-400">*</span></label>
                  <input type="number" min="0.0001" step="any" value={form.emissionFactor} onChange={set('emissionFactor')} placeholder="e.g. 2.68" className={inputCls} required />
                </div>

                {/* Live CO2e preview */}
                {co2eKg !== null && (
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                    <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">Calculated CO₂e</p>
                    <p className="text-2xl font-bold text-orange-400">
                      {co2eKg.toLocaleString('en-US', { maximumFractionDigits: 1 })} kg
                      <span className="text-sm font-normal text-zinc-500 ml-2">
                        = {(co2eKg / 1000).toFixed(3)} tCO₂e
                      </span>
                    </p>
                  </div>
                )}

                <div>
                  <label className={labelCls}>Data Source</label>
                  <input type="text" value={form.source} onChange={set('source')} placeholder="Utility bill, meter reading, DEFRA factor, etc." className={inputCls} />
                </div>

              </CardContent>
            </Card>

            {error && (
              <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
            )}

            <div className="flex items-center justify-end gap-3">
              <Link href="/sustainability/emissions">
                <Button type="button" variant="outline" size="sm">Cancel</Button>
              </Link>
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? 'Saving…' : 'Log Entry'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
