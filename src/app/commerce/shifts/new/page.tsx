'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Clock, DollarSign } from 'lucide-react'
import Link from 'next/link'

interface Channel {
  id: string
  name: string
  channelCode: string
}

interface Register {
  id: string
  registerId: string
  name: string
  isActive: boolean
  channel: Channel
}

const DENOMS = [
  { label: '$100', value: 100 },
  { label: '$50', value: 50 },
  { label: '$20', value: 20 },
  { label: '$10', value: 10 },
  { label: '$5', value: 5 },
  { label: '$1', value: 1 },
  { label: 'Quarters ($.25)', value: 0.25 },
  { label: 'Dimes ($.10)', value: 0.10 },
  { label: 'Nickels ($.05)', value: 0.05 },
  { label: 'Pennies ($.01)', value: 0.01 },
]

export default function NewShiftPage() {
  const router = useRouter()
  const [registers, setRegisters] = useState<Register[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [registerId, setRegisterId] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [useDenominations, setUseDenominations] = useState(true)
  const [counts, setCounts] = useState<Record<number, number>>({})
  const [manualFloat, setManualFloat] = useState('')

  useEffect(() => {
    fetch('/api/commerce/registers')
      .then(r => r.json())
      .then((data: Register[]) => setRegisters(data.filter(r => r.isActive)))
      .finally(() => setLoading(false))
  }, [])

  const denomTotal = DENOMS.reduce((sum, d) => sum + (counts[d.value] ?? 0) * d.value, 0)
  const openingFloat = useDenominations ? denomTotal : parseFloat(manualFloat || '0')

  function setCount(value: number, qty: string) {
    const n = parseInt(qty) || 0
    setCounts(prev => ({ ...prev, [value]: n }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!registerId) { setError('Select a register.'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/commerce/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registerId,
          employeeId: employeeId || undefined,
          openingFloat,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to open shift'); return }
      router.push(`/commerce/shifts/${data.id}`)
    } finally {
      setSaving(false)
    }
  }

  const selectedRegister = registers.find(r => r.id === registerId)

  return (
    <>
      <TopBar title="Open New Shift" />
      <main className="flex-1 p-6 overflow-auto max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/commerce/shifts" className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Open New Shift</h1>
            <p className="text-sm text-zinc-500">Select register, count opening cash drawer</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardContent className="pt-5 pb-5 space-y-4">
              <h3 className="text-sm font-semibold text-zinc-100">Register & Employee</h3>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Register *</label>
                {loading ? (
                  <p className="text-xs text-zinc-600">Loading registers…</p>
                ) : (
                  <select
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    value={registerId}
                    onChange={e => setRegisterId(e.target.value)}
                    required
                  >
                    <option value="">— Select register —</option>
                    {registers.map(reg => (
                      <option key={reg.id} value={reg.id}>
                        {reg.name} ({reg.registerId}) — {reg.channel.name}
                      </option>
                    ))}
                  </select>
                )}
                {selectedRegister && (
                  <p className="text-xs text-zinc-600 mt-1">
                    Channel: {selectedRegister.channel.name} ({selectedRegister.channel.channelCode})
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Employee ID (optional)</label>
                <input
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  placeholder="EMP-001"
                  value={employeeId}
                  onChange={e => setEmployeeId(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-100">Opening Float</h3>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400">
                  <input
                    type="checkbox"
                    checked={useDenominations}
                    onChange={e => setUseDenominations(e.target.checked)}
                    className="w-4 h-4 accent-blue-500"
                  />
                  Count by denomination
                </label>
              </div>

              {useDenominations ? (
                <div className="space-y-2">
                  {DENOMS.map(d => (
                    <div key={d.value} className="flex items-center gap-3">
                      <span className="text-sm text-zinc-400 w-36">{d.label}</span>
                      <input
                        type="number"
                        min="0"
                        className="w-24 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 text-right tabular-nums"
                        placeholder="0"
                        value={counts[d.value] ?? ''}
                        onChange={e => setCount(d.value, e.target.value)}
                      />
                      <span className="text-xs text-zinc-600 tabular-nums w-20 text-right">
                        = {formatCurrency((counts[d.value] ?? 0) * d.value)}
                      </span>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-zinc-800 flex justify-between items-center">
                    <span className="text-sm font-semibold text-zinc-100">Total Float</span>
                    <span className="text-xl font-bold text-emerald-400 tabular-nums">{formatCurrency(denomTotal)}</span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Opening Float Amount ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 tabular-nums"
                      placeholder="0.00"
                      value={manualFloat}
                      onChange={e => setManualFloat(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="pt-4 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-zinc-300">Opening float:</span>
                <span className="text-lg font-bold text-emerald-400 tabular-nums">{formatCurrency(openingFloat)}</span>
              </div>
              <div className="flex gap-3">
                <Link href="/commerce/shifts" className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors">
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving || !registerId}
                  className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? 'Opening…' : 'Open Shift'}
                </button>
              </div>
            </CardContent>
          </Card>

          {error && (
            <p className="text-xs text-rose-400 text-center">{error}</p>
          )}
        </form>
      </main>
    </>
  )
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}
