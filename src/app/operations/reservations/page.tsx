'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, Edit2, CheckCircle, XCircle, LogIn, LogOut, FileText, ChevronRight, Calendar } from 'lucide-react'

type Reservation = {
  id: string
  reservationNo: string
  resource: string
  customer: string
  from: string
  to: string
  status: 'Tentative' | 'Confirmed' | 'In Use' | 'Completed' | 'Cancelled'
  amount: number
  notes: string
}

const STATUS_STYLES: Record<string, string> = {
  Tentative:  'bg-zinc-700/40 text-zinc-400 border-zinc-600',
  Confirmed:  'bg-blue-500/15 text-blue-300 border-blue-500/30',
  'In Use':   'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Completed:  'bg-teal-500/15 text-teal-300 border-teal-500/30',
  Cancelled:  'bg-red-500/15 text-red-400 border-red-500/30',
}

const STATUS_DOT: Record<string, string> = {
  Tentative: 'bg-zinc-500', Confirmed: 'bg-blue-400', 'In Use': 'bg-emerald-400', Completed: 'bg-teal-400', Cancelled: 'bg-red-400',
}

const STATUS_BLOCK: Record<string, string> = {
  Tentative: 'bg-zinc-700/60 border-zinc-600 text-zinc-400',
  Confirmed: 'bg-blue-600/40 border-blue-500/50 text-blue-200',
  'In Use': 'bg-emerald-600/40 border-emerald-500/50 text-emerald-200',
  Completed: 'bg-teal-600/30 border-teal-500/40 text-teal-300',
  Cancelled: 'bg-red-600/20 border-red-500/30 text-red-400 line-through opacity-60',
}

function buildMonthDays() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return { year, month, firstDay, daysInMonth, today: now.getDate() }
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function resOnDay(r: Reservation, year: number, month: number, day: number) {
  const from = new Date(r.from)
  const to = new Date(r.to)
  const d = new Date(year, month, day)
  return d >= from && d <= to
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const { year, month, firstDay, daysInMonth, today } = buildMonthDays()
  const monthName = new Date(year, month, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })

  useEffect(() => {
    fetch('/api/operations/reservations')
      .then(r => r.ok ? r.json() : [])
      .then(setReservations)
      .finally(() => setLoading(false))
  }, [])

  const todayStr = new Date().toISOString().split('T')[0]
  const todayCount = reservations.filter(r => r.from <= todayStr && r.to >= todayStr).length
  const weekEnd = new Date(); weekEnd.setDate(weekEnd.getDate() + 7)
  const weekEndStr = weekEnd.toISOString().split('T')[0]
  const weekCount = reservations.filter(r => r.from <= weekEndStr && r.to >= todayStr).length
  const activeRes = reservations.filter(r => r.status !== 'Cancelled' && r.status !== 'Completed')
  const utilRate = reservations.length ? Math.round((activeRes.length / reservations.length) * 100) : 0
  const revenueBooked = reservations.filter(r => r.status !== 'Cancelled').reduce((s, r) => s + r.amount, 0)

  const calPadding = firstDay
  const totalCells = Math.ceil((calPadding + daysInMonth) / 7) * 7

  return (
    <>
      <TopBar title="Reservation Management" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">Operations</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-300">Reservations</span>
        </nav>

        {/* Action Ribbon */}
        <div className="flex items-center gap-2 flex-wrap">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
            <Plus className="w-3.5 h-3.5" /> New reservation
          </button>
          {[
            { icon: Edit2, label: 'Edit' },
            { icon: CheckCircle, label: 'Confirm' },
            { icon: XCircle, label: 'Cancel' },
            { icon: LogIn, label: 'Check in' },
            { icon: LogOut, label: 'Check out' },
            { icon: FileText, label: 'Invoice' },
          ].map(({ icon: Icon, label }) => (
            <button key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-colors">
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        {/* KPI Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Today's Reservations", value: todayCount, sub: 'Active today' },
            { label: 'This Week', value: weekCount, sub: 'Next 7 days' },
            { label: 'Utilization Rate', value: `${utilRate}%`, sub: 'Active / total', valueClass: utilRate > 80 ? 'text-amber-400' : 'text-emerald-400' },
            { label: 'Revenue Booked', value: `$${revenueBooked.toLocaleString()}`, sub: 'Non-cancelled', valueClass: 'text-indigo-300' },
          ].map(k => (
            <div key={k.label} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
              <p className="text-[11px] text-zinc-500 mb-1">{k.label}</p>
              <p className={`text-2xl font-bold ${k.valueClass ?? 'text-zinc-100'}`}>{k.value}</p>
              <p className="text-[11px] text-zinc-600 mt-0.5">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* Calendar View */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-500" />
            <h3 className="text-xs font-semibold text-zinc-300">{monthName}</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-[10px] font-semibold text-zinc-600 py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: totalCells }, (_, i) => {
                const dayNum = i - calPadding + 1
                if (dayNum < 1 || dayNum > daysInMonth) return <div key={i} className="h-16 rounded bg-zinc-800/20" />
                const dayRes = reservations.filter(r => resOnDay(r, year, month, dayNum))
                const isToday = dayNum === today
                return (
                  <div key={i} className={`h-16 rounded p-1 border ${isToday ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-zinc-800/50 bg-zinc-800/10'} overflow-hidden`}>
                    <span className={`text-[10px] font-semibold block mb-0.5 ${isToday ? 'text-indigo-400' : 'text-zinc-600'}`}>{dayNum}</span>
                    <div className="space-y-0.5">
                      {dayRes.slice(0, 2).map(r => (
                        <div key={r.id} className={`text-[9px] px-1 py-0.5 rounded border truncate ${STATUS_BLOCK[r.status]}`}>
                          {r.resource}
                        </div>
                      ))}
                      {dayRes.length > 2 && <div className="text-[9px] text-zinc-600">+{dayRes.length - 2} more</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Reservation List Table */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Reservation List</h3>
          </div>
          {loading ? (
            <div className="text-center py-12 text-xs text-zinc-600">Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Reservation #', 'Resource', 'Customer', 'From', 'To', 'Status', 'Amount', 'Notes'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-zinc-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r, idx) => (
                    <tr key={r.id} className={`border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors ${idx % 2 === 0 ? '' : 'bg-zinc-800/10'}`}>
                      <td className="px-4 py-3 font-mono text-zinc-500">{r.reservationNo}</td>
                      <td className="px-4 py-3 text-zinc-200 font-medium">{r.resource}</td>
                      <td className="px-4 py-3 text-zinc-400">{r.customer}</td>
                      <td className="px-4 py-3 text-zinc-400">{formatDate(r.from)}</td>
                      <td className="px-4 py-3 text-zinc-400">{formatDate(r.to)}</td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1.5 w-fit px-2 py-0.5 rounded-full text-[11px] border ${STATUS_STYLES[r.status]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[r.status]}`} />
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-300 font-mono">{r.amount > 0 ? `$${r.amount.toLocaleString()}` : '—'}</td>
                      <td className="px-4 py-3 text-zinc-500 max-w-[200px] truncate">{r.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
