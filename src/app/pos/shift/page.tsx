'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  Clock, DollarSign, TrendingUp, Receipt,
  CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronRight
} from 'lucide-react'

type ShiftStatus = 'open' | 'closed' | 'scheduled'

type Shift = {
  id: string
  employeeId: string
  storeId: string
  startTime: string
  endTime: string
  status: ShiftStatus
  notes: string | null
  employee?: {
    firstName: string
    lastName: string
    position: string
  }
}

type ZReport = {
  totalSales: number
  totalTransactions: number
  totalTax: number
  totalDiscounts: number
  cashSales: number
  cardSales: number
  returns: number
  voids: number
  netSales: number
}

export default function ShiftPage() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [activeShift, setActiveShift] = useState<Shift | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Open shift form
  const [startAmount, setStartAmount] = useState('')
  const [openNotes, setOpenNotes] = useState('')
  const [showOpenForm, setShowOpenForm] = useState(false)

  // Close shift form
  const [cashCounted, setCashCounted] = useState('')
  const [cardTotal, setCardTotal] = useState('')
  const [closeNotes, setCloseNotes] = useState('')
  const [showCloseForm, setShowCloseForm] = useState(false)

  // Z-report summary
  const [zReport, setZReport] = useState<ZReport | null>(null)
  const [shiftClosed, setShiftClosed] = useState(false)

  // Tender declaration rows
  const DENOMINATIONS = [100, 50, 20, 10, 5, 1, 0.25, 0.10, 0.05, 0.01]
  const [denomCounts, setDenomCounts] = useState<Record<number, string>>(
    Object.fromEntries(DENOMINATIONS.map(d => [d, '']))
  )

  const declaredCash = DENOMINATIONS.reduce((sum, d) => {
    const count = parseFloat(denomCounts[d] || '0')
    return sum + (isNaN(count) ? 0 : count * d)
  }, 0)

  useEffect(() => {
    loadShifts()
  }, [])

  const loadShifts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/shifts')
      if (res.ok) {
        const data = await res.json()
        const list: Shift[] = data.shifts ?? data ?? []
        setShifts(list)
        const open = list.find(s => s.status === 'open') ?? null
        setActiveShift(open)
      }
    } catch {
      // API may not be wired yet
    } finally {
      setLoading(false)
    }
  }

  const openShift = async () => {
    const amount = parseFloat(startAmount)
    if (isNaN(amount) || amount < 0) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'open',
          startAmount: amount,
          notes: openNotes,
        }),
      })
      if (res.ok) {
        setShowOpenForm(false)
        setStartAmount('')
        setOpenNotes('')
        await loadShifts()
      }
    } finally {
      setActionLoading(false)
    }
  }

  const closeShift = async () => {
    if (!activeShift) return
    setActionLoading(true)
    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'close',
          shiftId: activeShift.id,
          cashCounted: declaredCash,
          cardTotal: parseFloat(cardTotal || '0'),
          notes: closeNotes,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.zReport) setZReport(data.zReport)
        setShiftClosed(true)
        setShowCloseForm(false)
        await loadShifts()
      }
    } finally {
      setActionLoading(false)
    }
  }

  const statusColor = (status: ShiftStatus) => {
    if (status === 'open') return 'bg-emerald-900/50 text-emerald-300 border-emerald-800'
    if (status === 'closed') return 'bg-zinc-800 text-zinc-400 border-zinc-700'
    return 'bg-blue-900/50 text-blue-300 border-blue-800'
  }

  return (
    <>
      <TopBar title="Shift Management" />
      <div className="p-6 max-w-4xl mx-auto">

        {/* Current Status Banner */}
        <div className={`rounded-xl border p-5 mb-6 flex items-center gap-4 ${
          activeShift
            ? 'bg-emerald-900/20 border-emerald-800/50'
            : 'bg-zinc-900 border-zinc-800'
        }`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            activeShift ? 'bg-emerald-500/20' : 'bg-zinc-800'
          }`}>
            <Clock className={`w-6 h-6 ${activeShift ? 'text-emerald-400' : 'text-zinc-500'}`} />
          </div>
          <div className="flex-1">
            <div className="text-base font-semibold text-zinc-100">
              {activeShift ? 'Shift Open' : 'No Active Shift'}
            </div>
            <div className="text-sm text-zinc-400">
              {activeShift
                ? `Started ${formatDate(activeShift.startTime)}${activeShift.employee ? ` · ${activeShift.employee.firstName} ${activeShift.employee.lastName}` : ''}`
                : 'Open a shift to begin taking sales'}
            </div>
          </div>
          <div className="flex gap-2">
            {!activeShift && !shiftClosed && (
              <Button onClick={() => setShowOpenForm(o => !o)}>
                Open Shift
              </Button>
            )}
            {activeShift && (
              <Button variant="destructive" onClick={() => setShowCloseForm(o => !o)}>
                Close Shift
              </Button>
            )}
            <a href="/pos">
              <Button variant="outline">Go to POS</Button>
            </a>
          </div>
        </div>

        {/* Z Report (shown after close) */}
        {shiftClosed && zReport && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-semibold text-zinc-100">Z Report — Shift Closed</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {[
                { label: 'Net Sales', value: formatCurrency(zReport.netSales), color: 'text-emerald-400' },
                { label: 'Transactions', value: zReport.totalTransactions.toString(), color: 'text-blue-400' },
                { label: 'Tax Collected', value: formatCurrency(zReport.totalTax), color: 'text-zinc-100' },
                { label: 'Discounts', value: formatCurrency(zReport.totalDiscounts), color: 'text-amber-400' },
              ].map(stat => (
                <div key={stat.label} className="bg-zinc-800 rounded-lg p-3">
                  <div className="text-xs text-zinc-500 mb-1">{stat.label}</div>
                  <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-800 rounded-lg p-3">
                <div className="text-xs text-zinc-500 mb-1">Cash Sales</div>
                <div className="text-sm font-semibold text-zinc-100">{formatCurrency(zReport.cashSales)}</div>
              </div>
              <div className="bg-zinc-800 rounded-lg p-3">
                <div className="text-xs text-zinc-500 mb-1">Card Sales</div>
                <div className="text-sm font-semibold text-zinc-100">{formatCurrency(zReport.cardSales)}</div>
              </div>
              <div className="bg-zinc-800 rounded-lg p-3">
                <div className="text-xs text-zinc-500 mb-1">Returns / Voids</div>
                <div className="text-sm font-semibold text-zinc-100">
                  {formatCurrency(zReport.returns)} / {zReport.voids}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Open Shift Form */}
        {showOpenForm && !activeShift && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Open Shift — Starting Float
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Starting Cash Amount</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={startAmount}
                  onChange={e => setStartAmount(e.target.value)}
                  className="max-w-xs text-lg font-bold"
                  autoFocus
                />
                <p className="text-xs text-zinc-600 mt-1">Count all bills and coins in the drawer</p>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Notes (optional)</label>
                <Input
                  placeholder="Any notes about this shift..."
                  value={openNotes}
                  onChange={e => setOpenNotes(e.target.value)}
                  className="max-w-md"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={openShift} disabled={actionLoading || !startAmount}>
                  {actionLoading ? 'Opening...' : 'Confirm Open Shift'}
                </Button>
                <Button variant="outline" onClick={() => setShowOpenForm(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}

        {/* Close Shift Form */}
        {showCloseForm && activeShift && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
            <h2 className="text-sm font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-red-400" />
              Close Shift — Tender Declaration
            </h2>

            {/* Denomination count */}
            <div className="mb-5">
              <div className="text-xs text-zinc-400 mb-2">Cash Count by Denomination</div>
              <div className="grid grid-cols-2 gap-2 max-w-lg">
                {DENOMINATIONS.map(d => (
                  <div key={d} className="flex items-center gap-2">
                    <label className="text-xs text-zinc-400 w-12 text-right">
                      {d >= 1 ? `$${d}` : `${Math.round(d * 100)}¢`}
                    </label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={denomCounts[d]}
                      onChange={e => setDenomCounts(prev => ({ ...prev, [d]: e.target.value }))}
                      className="h-8 text-sm w-20"
                    />
                    <span className="text-xs text-zinc-500 w-16">
                      = {formatCurrency((parseFloat(denomCounts[d] || '0') || 0) * d)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-zinc-400">Total Cash Counted:</span>
                <span className="text-base font-bold text-emerald-400">{formatCurrency(declaredCash)}</span>
              </div>
            </div>

            {/* Card total */}
            <div className="mb-4">
              <label className="text-xs text-zinc-400 block mb-1">Total Card Sales (from terminal)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={cardTotal}
                onChange={e => setCardTotal(e.target.value)}
                className="max-w-xs"
              />
            </div>

            <div className="mb-4">
              <label className="text-xs text-zinc-400 block mb-1">Closing Notes (optional)</label>
              <Input
                placeholder="Any notes about end of shift..."
                value={closeNotes}
                onChange={e => setCloseNotes(e.target.value)}
                className="max-w-md"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="destructive" onClick={closeShift} disabled={actionLoading}>
                {actionLoading ? 'Closing...' : 'Confirm Close Shift & Print Z Report'}
              </Button>
              <Button variant="outline" onClick={() => setShowCloseForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Recent Shifts */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-100">Recent Shifts</h2>
          </div>
          {loading ? (
            <div className="p-6 text-center text-zinc-500 text-sm">Loading shifts...</div>
          ) : shifts.length === 0 ? (
            <div className="p-6 text-center text-zinc-500 text-sm">No shift records found</div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {shifts.slice(0, 10).map(shift => (
                <div key={shift.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-zinc-100">
                      {shift.employee
                        ? `${shift.employee.firstName} ${shift.employee.lastName}`
                        : 'Unknown Employee'}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {formatDate(shift.startTime)}
                      {shift.endTime && shift.status === 'closed' && ` → ${formatDate(shift.endTime)}`}
                    </div>
                    {shift.notes && (
                      <div className="text-xs text-zinc-600 truncate mt-0.5">{shift.notes}</div>
                    )}
                  </div>
                  <Badge className={`text-[10px] border ${statusColor(shift.status)}`}>
                    {shift.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  )
}
