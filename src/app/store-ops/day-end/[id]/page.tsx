'use client'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, X, Clock, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step { stepName: string; status: 'pending' | 'in-progress' | 'completed'; completedBy: string | null; completedAt: string | null }
interface DayEndProcedure {
  id: string; storeName?: string; businessDate: string; status: string; steps: string
  cashExpected: number; cashCounted: number; cashVariance: number; cardTotal: number; giftCardTotal: number
  totalSales: number; totalReturns: number; totalDiscounts: number; netSales: number
  closedBy?: string; closedAt?: string; reconciledBy?: string; reconciledAt?: string; notes?: string
}
const STATUS_BADGE: Record<string, string> = { open: 'bg-zinc-700 text-zinc-300', 'in-progress': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40', closing: 'bg-orange-500/20 text-orange-400 border border-orange-500/40', closed: 'bg-blue-500/20 text-blue-400 border border-blue-500/40', reconciled: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' }

export default function DayEndDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [procedure, setProcedure] = useState<DayEndProcedure | null>(null)
  const [loading, setLoading] = useState(true)
  const [steps, setSteps] = useState<Step[]>([])
  const [cashCounted, setCashCounted] = useState('')
  const [notes, setNotes] = useState('')
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [closeForm, setCloseForm] = useState({ closedBy: '', cashCounted: '' })
  const [stepModal, setStepModal] = useState<string | null>(null)
  const [completedBy, setCompletedBy] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    const data = await fetch(`/api/store-ops/day-end/${id}`).then(r => r.json())
    setProcedure(data); setSteps(JSON.parse(data.steps || '[]')); setCashCounted(data.cashCounted?.toString() || ''); setNotes(data.notes || ''); setLoading(false)
  }
  useEffect(() => { load() }, [id])

  async function completeStep(stepName: string) {
    if (!completedBy.trim()) return; setSaving(true)
    await fetch(`/api/store-ops/day-end/${id}/complete-step`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stepName, completedBy }) })
    setStepModal(null); setCompletedBy(''); setSaving(false); load()
  }

  async function updateFinancials() {
    setSaving(true); const counted = parseFloat(cashCounted) || 0
    await fetch(`/api/store-ops/day-end/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cashCounted: counted, cashVariance: counted - (procedure?.cashExpected ?? 0), notes }) })
    setSaving(false); load()
  }

  async function closeProcedure() {
    setSaving(true)
    await fetch(`/api/store-ops/day-end/${id}/close`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(closeForm) })
    setShowCloseModal(false); setSaving(false); load()
  }

  async function reconcile() {
    const name = prompt('Reconciled by (name):'); if (!name) return
    await fetch(`/api/store-ops/day-end/${id}/reconcile`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reconciledBy: name }) }); load()
  }

  if (loading) return <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center text-zinc-500">Loading…</div>
  if (!procedure) return <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center text-zinc-500">Not found</div>

  const allDone = steps.every(s => s.status === 'completed')
  const doneCount = steps.filter(s => s.status === 'completed').length
  const variance = parseFloat(cashCounted || '0') - procedure.cashExpected

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100">
      <div className="border-b border-zinc-800 bg-zinc-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-zinc-500 hover:text-zinc-300"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <div className="flex items-center gap-3"><h1 className="text-lg font-bold text-zinc-100">{procedure.storeName || 'Store'}</h1><span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_BADGE[procedure.status])}>{procedure.status}</span></div>
            <p className="text-zinc-500 text-sm">{new Date(procedure.businessDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {procedure.status === 'closed' && <button onClick={reconcile} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium">Reconcile</button>}
          {(procedure.status === 'closing' || allDone) && procedure.status !== 'closed' && procedure.status !== 'reconciled' && <button onClick={() => setShowCloseModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium">Close Day-End</button>}
        </div>
      </div>
      <div className="p-6 grid grid-cols-3 gap-6">
        {/* Steps */}
        <div>
          <h2 className="font-semibold text-zinc-200 mb-3">Checklist <span className="ml-2 text-sm text-zinc-500">{doneCount}/{steps.length} done</span></h2>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 mb-4"><div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${steps.length ? (doneCount / steps.length) * 100 : 0}%` }} /></div>
          <div className="space-y-2">
            {steps.map((step, i) => (
              <div key={step.stepName} className={cn('rounded-xl border p-4 transition-colors', step.status === 'completed' ? 'border-emerald-800 bg-emerald-500/5' : 'border-zinc-800 bg-zinc-900')}>
                <div className="flex items-center gap-3 mb-1">
                  <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0', step.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-zinc-700 text-zinc-400')}>{step.status === 'completed' ? <Check className="w-3 h-3" /> : i + 1}</div>
                  <span className={cn('text-sm font-medium', step.status === 'completed' ? 'text-emerald-400' : 'text-zinc-200')}>{step.stepName}</span>
                </div>
                {step.status === 'completed' ? <p className="text-xs text-zinc-500 ml-9">{step.completedBy} · {step.completedAt ? new Date(step.completedAt).toLocaleTimeString() : ''}</p>
                  : procedure.status !== 'closed' && procedure.status !== 'reconciled' ? <button onClick={() => setStepModal(step.stepName)} className="ml-9 text-xs text-blue-400 hover:text-blue-300 border border-blue-800 rounded px-2 py-0.5 mt-1">Complete Step</button> : null}
              </div>
            ))}
          </div>
        </div>
        {/* Financials */}
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h3 className="font-semibold text-zinc-200 mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-400" /> Cash Reconciliation</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center"><span className="text-zinc-500 text-sm">Expected Cash</span><span className="font-mono text-zinc-200">${procedure.cashExpected.toFixed(2)}</span></div>
              <div className="flex justify-between items-center"><span className="text-zinc-500 text-sm">Counted Cash</span><input type="number" step="0.01" value={cashCounted} onChange={e => setCashCounted(e.target.value)} disabled={procedure.status === 'closed' || procedure.status === 'reconciled'} className="w-28 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-sm text-right font-mono text-zinc-200 focus:outline-none focus:border-zinc-500 disabled:opacity-50" /></div>
              <div className="flex justify-between items-center border-t border-zinc-800 pt-3"><span className="text-zinc-500 text-sm font-medium">Variance</span><span className={cn('font-mono font-bold', variance < -20 ? 'text-red-400' : variance < 0 ? 'text-yellow-400' : variance > 0 ? 'text-emerald-400' : 'text-zinc-400')}>{variance >= 0 ? '+' : ''}{variance.toFixed(2)}</span></div>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h3 className="font-semibold text-zinc-200 mb-3">Tender Breakdown</h3>
            <div className="space-y-2">{[{ label: 'Cash', value: procedure.cashExpected }, { label: 'Card', value: procedure.cardTotal }, { label: 'Gift Card', value: procedure.giftCardTotal }].map(({ label, value }) => <div key={label} className="flex justify-between items-center"><span className="text-zinc-500 text-sm">{label}</span><span className="font-mono text-zinc-300">${value.toFixed(2)}</span></div>)}</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h3 className="font-semibold text-zinc-200 mb-3">Sales Summary</h3>
            <div className="space-y-2">{[{ label: 'Total Sales', value: procedure.totalSales, color: 'text-emerald-400' }, { label: 'Returns', value: procedure.totalReturns, color: 'text-red-400' }, { label: 'Discounts', value: procedure.totalDiscounts, color: 'text-yellow-400' }, { label: 'Net Sales', value: procedure.netSales, color: 'text-blue-400' }].map(({ label, value, color }) => <div key={label} className="flex justify-between items-center"><span className="text-zinc-500 text-sm">{label}</span><span className={cn('font-mono font-medium', color)}>${value.toFixed(2)}</span></div>)}</div>
          </div>
          {procedure.status !== 'closed' && procedure.status !== 'reconciled' && <button onClick={updateFinancials} disabled={saving} className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50">{saving ? 'Saving…' : 'Update Financials'}</button>}
        </div>
        {/* Summary */}
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h3 className="font-semibold text-zinc-200 mb-4">Procedure Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-zinc-500">Steps Remaining</span><span className="text-zinc-200 font-semibold">{steps.length - doneCount}</span></div>
              {procedure.closedBy && <div className="flex justify-between"><span className="text-zinc-500">Closed By</span><span className="text-zinc-300">{procedure.closedBy}</span></div>}
              {procedure.closedAt && <div className="flex justify-between"><span className="text-zinc-500">Closed At</span><span className="text-zinc-300">{new Date(procedure.closedAt).toLocaleTimeString()}</span></div>}
              {procedure.reconciledBy && <div className="flex justify-between"><span className="text-zinc-500">Reconciled By</span><span className="text-emerald-400">{procedure.reconciledBy}</span></div>}
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h3 className="font-semibold text-zinc-200 mb-3">Notes</h3>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} disabled={procedure.status === 'closed' || procedure.status === 'reconciled'} rows={5} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 resize-none disabled:opacity-50" placeholder="Add notes…" />
          </div>
          {!allDone && <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-500"><Clock className="w-4 h-4 mb-2 text-zinc-600" />Complete all {steps.length - doneCount} remaining steps to close the day.</div>}
        </div>
      </div>
      {/* Step Modal */}
      {stepModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="font-semibold text-zinc-100">Complete Step</h2><button onClick={() => setStepModal(null)} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button></div>
            <p className="text-zinc-400 text-sm mb-4">Completing: <span className="text-zinc-200 font-medium">{stepModal}</span></p>
            <input value={completedBy} onChange={e => setCompletedBy(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500 mb-4" placeholder="Your name" autoFocus />
            <div className="flex gap-3"><button onClick={() => setStepModal(null)} className="flex-1 border border-zinc-700 rounded-lg py-2 text-sm text-zinc-300 hover:bg-zinc-800">Cancel</button><button onClick={() => completeStep(stepModal)} disabled={saving || !completedBy.trim()} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50">{saving ? 'Saving…' : 'Mark Complete'}</button></div>
          </div>
        </div>
      )}
      {/* Close Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="font-semibold text-zinc-100">Close Day-End</h2><button onClick={() => setShowCloseModal(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button></div>
            <div className="space-y-4">
              <div><label className="text-xs text-zinc-400 block mb-1">Final Cash Count ($)</label><input type="number" step="0.01" value={closeForm.cashCounted} onChange={e => setCloseForm(p => ({ ...p, cashCounted: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" placeholder="0.00" /></div>
              <div><label className="text-xs text-zinc-400 block mb-1">Closed By</label><input value={closeForm.closedBy} onChange={e => setCloseForm(p => ({ ...p, closedBy: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" placeholder="Manager name" /></div>
            </div>
            <div className="flex gap-3 mt-4"><button onClick={() => setShowCloseModal(false)} className="flex-1 border border-zinc-700 rounded-lg py-2 text-sm text-zinc-300 hover:bg-zinc-800">Cancel</button><button onClick={closeProcedure} disabled={saving || !closeForm.closedBy} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50">{saving ? 'Closing…' : 'Close Day-End'}</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
