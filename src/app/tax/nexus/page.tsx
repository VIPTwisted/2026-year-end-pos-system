'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type TaxNexus = {
  id: string
  stateCode: string
  stateName: string
  hasNexus: boolean
  nexusType: string | null
  registrationNumber: string | null
  effectiveDate: string | null
  thresholdAmt: number | null
}

export default function TaxNexusPage() {
  const [nexus, setNexus] = useState<TaxNexus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tax/nexus')
      .then((r) => r.json())
      .then(setNexus)
      .finally(() => setLoading(false))
  }, [])

  async function toggleNexus(item: TaxNexus) {
    const res = await fetch(`/api/tax/nexus/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hasNexus: !item.hasNexus }),
    })
    const updated = await res.json()
    setNexus((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
  }

  async function updateField(item: TaxNexus, field: string, value: string) {
    const res = await fetch(`/api/tax/nexus/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    })
    const updated = await res.json()
    setNexus((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">State Nexus</h1>
        <p className="text-zinc-400 text-sm mt-1">Configure tax nexus for all 50 states</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-zinc-400 font-medium px-4 py-3">State</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Nexus</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Type</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Reg #</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Effective Date</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Threshold ($)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center text-zinc-500 py-8">Loading states...</td></tr>
            ) : nexus.map((n) => (
              <tr key={n.id} className={cn('border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors', n.hasNexus && 'bg-emerald-500/5')}>
                <td className="px-4 py-3">
                  <span className="font-mono text-zinc-300">{n.stateCode}</span>
                  <span className="text-zinc-500 ml-2 text-xs">{n.stateName}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleNexus(n)}
                    className={cn('relative inline-flex h-5 w-9 rounded-full transition-colors', n.hasNexus ? 'bg-emerald-500' : 'bg-zinc-700')}>
                    <span className={cn('absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform', n.hasNexus && 'translate-x-4')} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <input className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 w-24 focus:outline-none focus:border-blue-500"
                    defaultValue={n.nexusType ?? ''} onBlur={(e) => updateField(n, 'nexusType', e.target.value)} placeholder="physical" />
                </td>
                <td className="px-4 py-3">
                  <input className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 w-28 focus:outline-none focus:border-blue-500"
                    defaultValue={n.registrationNumber ?? ''} onBlur={(e) => updateField(n, 'registrationNumber', e.target.value)} placeholder="REG-000" />
                </td>
                <td className="px-4 py-3">
                  <input type="date" className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 w-32 focus:outline-none focus:border-blue-500"
                    defaultValue={n.effectiveDate ? n.effectiveDate.slice(0, 10) : ''} onBlur={(e) => updateField(n, 'effectiveDate', e.target.value)} />
                </td>
                <td className="px-4 py-3">
                  <input type="number" className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 w-24 focus:outline-none focus:border-blue-500"
                    defaultValue={n.thresholdAmt ?? ''} onBlur={(e) => updateField(n, 'thresholdAmt', e.target.value)} placeholder="100000" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
