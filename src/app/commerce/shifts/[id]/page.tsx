'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, RefreshCw, DollarSign, TrendingDown, Lock } from 'lucide-react'
import Link from 'next/link'

interface SafeDropEntry {
  id: string
  type: string
  amount: number
  notes: string | null
  createdAt: string
}

interface ShiftTender {
  id: string
  method: string
  amount: number
  count: number
}

interface Register {
  id: string
  name: string
  registerId: string
  channel: { name: string; channelCode: string }
}

interface Shift {
  id: string
  shiftNumber: string
  registerId: string
  employeeId: string | null
  status: string
  openingFloat: number
  cashSales: number
  cardSales: number
  giftCardSales: number
  returns: number
  safeDrops: number
  bankDrops: number
  expectedCash: number
  countedCash: number | null
  variance: number | null
  openedAt: string
  closedAt: string | null
  notes: string | null
  register: Register
  tenders: ShiftTender[]
  safeDropEntries: SafeDropEntry[]
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

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function duration(openedAt: string, closedAt?: string | null): string {
  const end = closedAt ? new Date(closedAt) : new Date()
  const mins = Math.floor((end.getTime() - new Date(openedAt).getTime()) / 60000)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

const STATUS_VARIANT: Record<string, 'success' | 'destructive' | 'warning' | 'default'> = {
  open: 'success',
  closed: 'default',
  blind_closed: 'default',
  suspended: 'warning',
}

export default function ShiftDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [shift, setShift] = useState<Shift | null>(null)
  const [loading, setLoading] = useState(true)

  // Safe drop form
  const [dropType, setDropType] = useState('safe_drop')
  const [dropAmount, setDropAmount] = useState('')
  const [dropNotes, setDropNotes] = useState('')
  const [droppingBusy, setDroppingBusy] = useState(false)
  const [dropError, setDropError] = useState('')

  // Close shift form
  const [showClose, setShowClose] = useState(false)
  const [blind, setBlind] = useState(false)
  const [closeCounts, setCloseCounts] = useState<Record<number, number>>({})
  const [closeNotes, setCloseNotes] = useState('')
  const [closingBusy, setClosingBusy] = useState(false)
  const [closeError, setCloseError] = useState('')

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/commerce/shifts/${id}`)
      if (!res.ok) return
      setShift(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const closeCounted = DENOMS.reduce((s, d) => s + (closeCounts[d.value] ?? 0) * d.value, 0)

  async function handleSafeDrop(e: React.FormEvent) {
    e.preventDefault()
    setDroppingBusy(true)
    setDropError('')
    try {
      const res = await fetch(`/api/commerce/shifts/${id}/safe-drop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: dropType, amount: parseFloat(dropAmount), notes: dropNotes || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setDropError(data.error || 'Failed'); return }
      setDropAmount('')
      setDropNotes('')
      load()
    } finally {
      setDroppingBusy(false)
    }
  }

  async function handleClose(e: React.FormEvent) {
    e.preventDefault()
    setClosingBusy(true)
    setCloseError('')
    try {
      const res = await fetch(`/api/commerce/shifts/${id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blind,
          countedCash: blind ? undefined : closeCounted,
          notes: closeNotes || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setCloseError(data.error || 'Failed to close'); return }
      router.push('/commerce/shifts')
    } finally {
      setClosingBusy(false)
    }
  }

  if (loading) {
    return (
      <>
        <TopBar title="Shift Detail" />
        <main className="flex-1 p-6 flex items-center justify-center text-zinc-500">
          <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading…
        </main>
      </>
    )
  }

  if (!shift) {
    return (
      <>
        <TopBar title="Shift Not Found" />
        <main className="flex-1 p-6"><p className="text-zinc-500">Shift not found.</p></main>
      </>
    )
  }

  const isOpen = shift.status === 'open'
  const expectedCash = shift.openingFloat + shift.cashSales - shift.returns - shift.safeDrops - shift.bankDrops
  const variance = shift.countedCash !== null ? shift.countedCash - expectedCash : null

  return (
    <>
      <TopBar title={shift.shiftNumber} />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/commerce/shifts" className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-zinc-100 font-mono">{shift.shiftNumber}</h1>
              <Badge variant={STATUS_VARIANT[shift.status] ?? 'default'}>{shift.status.replace('_', ' ')}</Badge>
            </div>
            <p className="text-xs text-zinc-500">
              {shift.register.name} &middot; {shift.register.channel.name} &middot; Opened {new Date(shift.openedAt).toLocaleString()}
            </p>
          </div>
          {isOpen && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">{duration(shift.openedAt)}</span>
              <button
                onClick={() => setShowClose(v => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-sm font-medium border border-rose-500/20 transition-colors"
              >
                <Lock className="w-4 h-4" /> Close Shift
              </button>
            </div>
          )}
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Opening Float', val: shift.openingFloat, color: 'text-zinc-300' },
            { label: 'Cash Sales', val: shift.cashSales, color: 'text-emerald-400' },
            { label: 'Card Sales', val: shift.cardSales, color: 'text-blue-400' },
            { label: 'Gift Card Sales', val: shift.giftCardSales, color: 'text-violet-400' },
            { label: 'Returns', val: shift.returns, color: 'text-rose-400' },
            { label: 'Safe Drops', val: shift.safeDrops, color: 'text-amber-400' },
            { label: 'Bank Drops', val: shift.bankDrops, color: 'text-amber-500' },
            { label: 'Expected Cash', val: expectedCash, color: 'text-zinc-100' },
          ].map(({ label, val, color }) => (
            <Card key={label}>
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{label}</p>
                <p className={`text-xl font-bold tabular-nums ${color}`}>{fmt(val)}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Counted cash / variance if closed */}
        {shift.countedCash !== null && (
          <Card className={`border ${Math.abs(variance ?? 0) > 5 ? 'border-rose-500/30 bg-rose-500/5' : 'border-emerald-500/30 bg-emerald-500/5'}`}>
            <CardContent className="pt-4 pb-4 flex items-center gap-6">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Counted Cash</p>
                <p className="text-2xl font-bold text-zinc-100 tabular-nums">{fmt(shift.countedCash)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Expected</p>
                <p className="text-2xl font-bold text-zinc-300 tabular-nums">{fmt(expectedCash)}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Variance</p>
                <p className={`text-2xl font-bold tabular-nums ${Math.abs(variance ?? 0) > 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {(variance ?? 0) >= 0 ? '+' : ''}{fmt(variance ?? 0)}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Safe drop log */}
          <Card>
            <CardContent className="pt-5 pb-2">
              <h3 className="text-sm font-semibold text-zinc-100 mb-4">
                Safe Drop / Bank Drop Log
                <span className="text-xs text-zinc-500 font-normal ml-2">({shift.safeDropEntries.length} entries)</span>
              </h3>
              {shift.safeDropEntries.length === 0 ? (
                <p className="text-sm text-zinc-600 py-4 text-center">No drops recorded.</p>
              ) : (
                <div className="space-y-2 pb-3">
                  {shift.safeDropEntries.map(d => (
                    <div key={d.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                      <div>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${d.type === 'bank_drop' ? 'bg-amber-500/10 text-amber-400' : d.type === 'float_entry' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                          {d.type.replace('_', ' ')}
                        </span>
                        {d.notes && <span className="text-xs text-zinc-500 ml-2">{d.notes}</span>}
                        <p className="text-xs text-zinc-600 mt-0.5">{new Date(d.createdAt).toLocaleTimeString()}</p>
                      </div>
                      <span className="text-sm font-bold text-amber-400 tabular-nums">{fmt(d.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Record safe drop (only if open) */}
          {isOpen && (
            <Card>
              <CardContent className="pt-5 pb-5">
                <h3 className="text-sm font-semibold text-zinc-100 mb-4">Record Drop / Float Entry</h3>
                <form onSubmit={handleSafeDrop} className="space-y-3">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Type</label>
                    <select
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                      value={dropType}
                      onChange={e => setDropType(e.target.value)}
                    >
                      <option value="safe_drop">Safe Drop</option>
                      <option value="bank_drop">Bank Drop</option>
                      <option value="float_entry">Float Entry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Amount ($) *</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 tabular-nums"
                        placeholder="0.00"
                        value={dropAmount}
                        onChange={e => setDropAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Notes</label>
                    <input
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                      placeholder="Optional note"
                      value={dropNotes}
                      onChange={e => setDropNotes(e.target.value)}
                    />
                  </div>
                  {dropError && <p className="text-xs text-rose-400">{dropError}</p>}
                  <button
                    type="submit"
                    disabled={droppingBusy}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/20 text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <TrendingDown className="w-4 h-4" /> {droppingBusy ? 'Recording…' : 'Record Drop'}
                  </button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Close shift panel */}
        {isOpen && showClose && (
          <Card className="border-rose-500/20 bg-rose-500/5">
            <CardContent className="pt-5 pb-5">
              <h3 className="text-sm font-semibold text-rose-300 mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4" /> Close Shift
              </h3>
              <form onSubmit={handleClose} className="space-y-4">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={blind}
                      onChange={e => setBlind(e.target.checked)}
                      className="w-4 h-4 accent-rose-500"
                    />
                    <span className="text-sm text-zinc-300">Blind Close (no cash count required)</span>
                  </label>
                </div>

                {!blind && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-3">Count closing cash drawer by denomination:</p>
                    <div className="space-y-2">
                      {DENOMS.map(d => (
                        <div key={d.value} className="flex items-center gap-3">
                          <span className="text-sm text-zinc-400 w-36">{d.label}</span>
                          <input
                            type="number"
                            min="0"
                            className="w-24 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-rose-500 text-right tabular-nums"
                            placeholder="0"
                            value={closeCounts[d.value] ?? ''}
                            onChange={e => {
                              const n = parseInt(e.target.value) || 0
                              setCloseCounts(prev => ({ ...prev, [d.value]: n }))
                            }}
                          />
                          <span className="text-xs text-zinc-600 tabular-nums w-20 text-right">
                            = {fmt((closeCounts[d.value] ?? 0) * d.value)}
                          </span>
                        </div>
                      ))}
                      <div className="pt-3 border-t border-zinc-700 flex justify-between">
                        <div>
                          <p className="text-sm font-semibold text-zinc-100">Counted: <span className="tabular-nums text-zinc-100">{fmt(closeCounted)}</span></p>
                          <p className="text-sm text-zinc-500">Expected: <span className="tabular-nums">{fmt(expectedCash)}</span></p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-zinc-500 mb-1">Variance</p>
                          <p className={`text-xl font-bold tabular-nums ${Math.abs(closeCounted - expectedCash) > 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {(closeCounted - expectedCash) >= 0 ? '+' : ''}{fmt(closeCounted - expectedCash)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Closing Notes</label>
                  <textarea
                    rows={2}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-rose-500 resize-none"
                    placeholder="Any notes for this shift closing…"
                    value={closeNotes}
                    onChange={e => setCloseNotes(e.target.value)}
                  />
                </div>

                {closeError && <p className="text-xs text-rose-400">{closeError}</p>}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowClose(false)} className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={closingBusy}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" /> {closingBusy ? 'Closing…' : blind ? 'Blind Close' : 'Close Shift'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}
