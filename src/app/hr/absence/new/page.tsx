'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const CAUSES = ['Sick Leave', 'Vacation', 'Personal', 'Bereavement', 'FMLA', 'Other']
const UOM = ['Days', 'Hours']

export default function NewAbsencePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fmt = (d: Date) => d.toISOString().split('T')[0]
  const today = new Date()

  const [employeeNo, setEmployeeNo] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  const [causeOfAbsence, setCauseOfAbsence] = useState('Sick Leave')
  const [fromDate, setFromDate] = useState(fmt(today))
  const [toDate, setToDate] = useState(fmt(today))
  const [qty, setQty] = useState('1')
  const [unitOfMeasure, setUnitOfMeasure] = useState('Days')
  const [notes, setNotes] = useState('')

  const handleSubmit = async () => {
    if (!fromDate || !toDate) { setError('From/To dates are required'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/hr/absence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeNo: employeeNo || null,
          employeeName: employeeName || null,
          causeOfAbsence,
          fromDate,
          toDate,
          qty: parseFloat(qty) || 0,
          unitOfMeasure,
          notes: notes || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to register absence')
      router.push('/hr/absence')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Absence" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5 max-w-2xl">

          <Link href="/hr/absence" className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300">
            <ArrowLeft className="w-3 h-3" /> Back to Absence
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">HR</p>
              <h2 className="text-[18px] font-semibold text-zinc-100">Register Absence</h2>
            </div>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-medium"
            >
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Register'}
            </button>
          </div>

          {error && <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">{error}</div>}

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-zinc-800/40 border-b border-zinc-800/60">
              <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-widest">Absence Details</span>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Employee No.</label>
                <input value={employeeNo} onChange={e => setEmployeeNo(e.target.value)} placeholder="EMP-001" className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-md px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500/60" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Employee Name</label>
                <input value={employeeName} onChange={e => setEmployeeName(e.target.value)} placeholder="Full name" className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-md px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500/60" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Cause of Absence</label>
                <select value={causeOfAbsence} onChange={e => setCauseOfAbsence(e.target.value)} className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-md px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500/60">
                  {CAUSES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">From Date</label>
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-md px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500/60" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">To Date</label>
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-md px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500/60" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Quantity</label>
                <input type="number" min="0" step="0.5" value={qty} onChange={e => setQty(e.target.value)} className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-md px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500/60" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Unit of Measure</label>
                <select value={unitOfMeasure} onChange={e => setUnitOfMeasure(e.target.value)} className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-md px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500/60">
                  {UOM.map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Optional notes…" className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-md px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500/60 resize-none" />
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
