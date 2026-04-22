'use client'

import { useState, useEffect, useRef } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ─── Types ───────────────────────────────────────────────────────────────────

type SessionStatus = 'In Progress' | 'Pending Post' | 'Posted'

interface CountSession {
  id: string
  sessionNo: string
  location: string
  type: string
  totalItems: number
  countedItems: number
  varianceItems: number
  status: SessionStatus
  startedBy: string
  date: string
}

type CountLineStatus = 'Counted' | 'Variance' | 'Not Counted'

interface CountLine {
  itemNo: string
  description: string
  systemQty: number
  countedQty: number | null
  status: CountLineStatus
}

type VarianceAction = 'Accept' | 'Reject' | 'Recount' | null

interface VarianceLine {
  itemNo: string
  description: string
  systemQty: number
  countedQty: number
  variance: number
  estimatedValue: number
  action: VarianceAction
  reason: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const LOCATIONS_LIST = [
  'Main Warehouse', 'Main Warehouse Zone A', 'Main Warehouse Zone B',
  'East Warehouse', 'Chicago Store', 'New York Store', 'LA Store',
  'Dallas Store', 'Miami Store', 'Seattle Store',
]

const COUNT_TYPES = ['Full Count', 'Zone Count', 'Category Count', 'Spot Check']
const REASON_CODES = ['Damage', 'Theft', 'Counting Error', 'System Error']

const ACTIVE_SESSIONS: CountSession[] = [
  {
    id: 'cc041', sessionNo: 'CC-2026-041', location: 'Main Warehouse Zone A', type: 'Zone Count',
    totalItems: 245, countedItems: 198, varianceItems: 12, status: 'In Progress',
    startedBy: 'Mike J.', date: 'Apr 22',
  },
  {
    id: 'cc040', sessionNo: 'CC-2026-040', location: 'Chicago Store', type: 'Full Store Count',
    totalItems: 847, countedItems: 847, varianceItems: 8, status: 'Pending Post',
    startedBy: 'Alice C.', date: 'Apr 20',
  },
  {
    id: 'cc039', sessionNo: 'CC-2026-039', location: 'East Warehouse', type: 'Spot Check',
    totalItems: 50, countedItems: 50, varianceItems: 0, status: 'Posted',
    startedBy: 'Sarah C.', date: 'Apr 18',
  },
]

const COUNT_LINES: CountLine[] = [
  { itemNo: '1000', description: 'Widget Assembly A100', systemQty: 450, countedQty: 452, status: 'Counted' },
  { itemNo: '1001', description: 'Motor Housing B200', systemQty: 28, countedQty: 25, status: 'Variance' },
  { itemNo: '1002', description: 'Control Panel C300', systemQty: 0, countedQty: 2, status: 'Variance' },
  { itemNo: '1003', description: 'Power Cable 2m', systemQty: 120, countedQty: 120, status: 'Counted' },
  { itemNo: '1004', description: 'Standard Bolt M8 x100', systemQty: 12400, countedQty: 12400, status: 'Counted' },
  { itemNo: '1005', description: 'Air Filter H50', systemQty: 75, countedQty: 74, status: 'Variance' },
  { itemNo: '1006', description: 'Coffee Blend Premium', systemQty: 340, countedQty: null, status: 'Not Counted' },
  { itemNo: '1007', description: 'Temp Sensor T100', systemQty: 22, countedQty: 22, status: 'Counted' },
  { itemNo: '1008', description: 'Gate Valve G200', systemQty: 15, countedQty: 15, status: 'Counted' },
  { itemNo: '1009', description: 'Display Unit 21"', systemQty: 8, countedQty: 7, status: 'Variance' },
  { itemNo: '1010', description: 'Wireless Keyboard', systemQty: 44, countedQty: null, status: 'Not Counted' },
  { itemNo: '1011', description: 'Optical Mouse', systemQty: 56, countedQty: 56, status: 'Counted' },
  { itemNo: '1012', description: 'Vanilla Syrup 1L', systemQty: 200, countedQty: 198, status: 'Variance' },
  { itemNo: '1013', description: 'Paper Cup 12oz x50', systemQty: 88, countedQty: null, status: 'Not Counted' },
  { itemNo: '1014', description: 'Green Tea Organic', systemQty: 160, countedQty: 162, status: 'Counted' },
]

const VARIANCE_LINES_CC040: VarianceLine[] = [
  { itemNo: '2000', description: 'Laptop Pro 15"', systemQty: 24, countedQty: 22, variance: -2, estimatedValue: -1598.00, action: null, reason: '' },
  { itemNo: '2001', description: 'Tablet 10"', systemQty: 45, countedQty: 47, variance: 2, estimatedValue: 498.00, action: null, reason: '' },
  { itemNo: '2002', description: 'Phone Case Deluxe', systemQty: 120, countedQty: 115, variance: -5, estimatedValue: -124.75, action: null, reason: '' },
  { itemNo: '2003', description: 'USB-C Hub 7-port', systemQty: 38, countedQty: 36, variance: -2, estimatedValue: -79.90, action: null, reason: '' },
  { itemNo: '2004', description: 'Wireless Earbuds Pro', systemQty: 18, countedQty: 20, variance: 2, estimatedValue: 259.80, action: null, reason: '' },
  { itemNo: '2005', description: 'Screen Protector 3pk', systemQty: 200, countedQty: 196, variance: -4, estimatedValue: -47.96, action: null, reason: '' },
  { itemNo: '2006', description: 'Smart Watch Band', systemQty: 67, countedQty: 65, variance: -2, estimatedValue: -49.98, action: null, reason: '' },
  { itemNo: '2007', description: 'Power Bank 20k', systemQty: 30, countedQty: 31, variance: 1, estimatedValue: 44.99, action: null, reason: '' },
]

// ─── Status chip ──────────────────────────────────────────────────────────────

function sessionChip(status: SessionStatus) {
  const cfg: Record<SessionStatus, { bg: string; text: string; pulse?: boolean }> = {
    'In Progress': { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', pulse: true },
    'Pending Post': { bg: 'rgba(99,102,241,0.15)', text: '#818cf8' },
    'Posted': { bg: 'rgba(16,185,129,0.15)', text: '#34d399' },
  }
  const c = cfg[status]
  return (
    <span style={{ background: c.bg, color: c.text }}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium">
      {c.pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: c.text }} />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: c.text }} />
        </span>
      )}
      {status}
    </span>
  )
}

function countLineStatusChip(status: CountLineStatus) {
  if (status === 'Counted') return <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: '#34d399' }}><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />Counted</span>
  if (status === 'Variance') return <span className="text-[11px] font-medium" style={{ color: '#fbbf24' }}>Variance</span>
  return <span className="text-[11px]" style={{ color: '#475569' }}>Not Counted</span>
}

// ─── New Count Session Modal ──────────────────────────────────────────────────

function NewSessionModal({ onClose }: { onClose: () => void }) {
  const [location, setLocation] = useState('')
  const [type, setType] = useState('Zone Count')
  const [zone, setZone] = useState('')
  const [category, setCategory] = useState('')
  const [assignTo, setAssignTo] = useState('')
  const estimatedItems = type === 'Full Count' ? 847 : type === 'Zone Count' ? 245 : type === 'Category Count' ? 180 : 50

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-lg rounded-xl shadow-2xl" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
          <h2 className="text-[15px] font-semibold" style={{ color: '#e2e8f0' }}>New Count Session</h2>
          <button onClick={onClose} style={{ color: '#94a3b8' }} className="hover:text-white text-lg">✕</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[11px] font-medium mb-1" style={{ color: '#94a3b8' }}>Location</label>
            <select value={location} onChange={e => setLocation(e.target.value)}
              className="w-full h-9 rounded px-3 text-[13px]"
              style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}>
              <option value="">Select location…</option>
              {LOCATIONS_LIST.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium mb-1" style={{ color: '#94a3b8' }}>Count Type</label>
            <select value={type} onChange={e => setType(e.target.value)}
              className="w-full h-9 rounded px-3 text-[13px]"
              style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}>
              {COUNT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          {type === 'Zone Count' && (
            <div>
              <label className="block text-[11px] font-medium mb-1" style={{ color: '#94a3b8' }}>Zone</label>
              <select value={zone} onChange={e => setZone(e.target.value)}
                className="w-full h-9 rounded px-3 text-[13px]"
                style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}>
                <option value="">Select zone…</option>
                {['Zone A', 'Zone B', 'Zone C', 'Zone D', 'Receiving Dock', 'Shipping Dock'].map(z => <option key={z}>{z}</option>)}
              </select>
            </div>
          )}
          {type === 'Category Count' && (
            <div>
              <label className="block text-[11px] font-medium mb-1" style={{ color: '#94a3b8' }}>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full h-9 rounded px-3 text-[13px]"
                style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}>
                <option value="">Select category…</option>
                {['Electronics', 'Beverages', 'Hardware', 'Office Supplies', 'Accessories'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          )}
          <div className="flex items-center justify-between rounded p-3" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.1)' }}>
            <span className="text-[12px]" style={{ color: '#94a3b8' }}>Items to count (estimated)</span>
            <span className="text-[15px] font-bold" style={{ color: '#818cf8' }}>{estimatedItems.toLocaleString()}</span>
          </div>
          <div>
            <label className="block text-[11px] font-medium mb-1" style={{ color: '#94a3b8' }}>Assign To</label>
            <select value={assignTo} onChange={e => setAssignTo(e.target.value)}
              className="w-full h-9 rounded px-3 text-[13px]"
              style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}>
              <option value="">Select user…</option>
              {['Mike Johnson', 'Sarah Chen', 'Alice Brown', 'Carlos M.', 'Tom Reed'].map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}>
          <button onClick={onClose} className="h-9 px-4 rounded text-[13px]"
            style={{ border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8' }}>Cancel</button>
          <button onClick={onClose} className="h-9 px-5 rounded text-[13px] font-medium"
            style={{ background: 'rgba(99,102,241,0.8)', color: '#fff' }}>Create Session</button>
        </div>
      </div>
    </div>
  )
}

// ─── Post Adjustments Panel ───────────────────────────────────────────────────

function PostAdjustmentsPanel({ onClose }: { onClose: () => void }) {
  const [lines, setLines] = useState<VarianceLine[]>(VARIANCE_LINES_CC040)
  const [globalReason, setGlobalReason] = useState('')

  function setAction(i: number, action: VarianceAction) {
    setLines(l => l.map((x, idx) => idx === i ? { ...x, action } : x))
  }
  function setReason(i: number, reason: string) {
    setLines(l => l.map((x, idx) => idx === i ? { ...x, reason } : x))
  }
  function acceptAll() { setLines(l => l.map(x => ({ ...x, action: 'Accept' }))) }
  function rejectAll() { setLines(l => l.map(x => ({ ...x, action: 'Reject' }))) }

  const accepted = lines.filter(l => l.action === 'Accept')
  const totalValueAdj = accepted.reduce((s, l) => s + l.estimatedValue, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-4xl rounded-xl shadow-2xl max-h-[90vh] flex flex-col" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
          <div>
            <h2 className="text-[15px] font-semibold" style={{ color: '#e2e8f0' }}>Post Adjustments — CC-2026-040</h2>
            <p className="text-[12px] mt-0.5" style={{ color: '#94a3b8' }}>Chicago Store · Full Store Count · {lines.length} variances to review</p>
          </div>
          <button onClick={onClose} style={{ color: '#94a3b8' }} className="hover:text-white text-lg">✕</button>
        </div>
        <div className="flex items-center justify-between px-6 py-3" style={{ borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
          <div className="flex gap-2">
            <button onClick={acceptAll} className="h-7 px-3 rounded text-[12px]"
              style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>Accept All</button>
            <button onClick={rejectAll} className="h-7 px-3 rounded text-[12px]"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>Reject All</button>
          </div>
          <select value={globalReason} onChange={e => setGlobalReason(e.target.value)}
            className="h-7 rounded px-2 text-[12px]"
            style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}>
            <option value="">Bulk reason code…</option>
            {REASON_CODES.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0" style={{ background: '#16213e', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
              <tr>
                {['Item', 'Description', 'System Qty', 'Counted', 'Variance', 'Est. Value', 'Reason', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lines.map((ln, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(99,102,241,0.07)', background: ln.variance < 0 ? 'rgba(239,68,68,0.02)' : ln.variance > 0 ? 'rgba(16,185,129,0.02)' : 'transparent' }}>
                  <td className="px-4 py-3 font-mono text-[12px]" style={{ color: '#818cf8' }}>{ln.itemNo}</td>
                  <td className="px-4 py-3 text-[13px]" style={{ color: '#e2e8f0' }}>{ln.description}</td>
                  <td className="px-4 py-3 text-[13px] text-right tabular-nums" style={{ color: '#94a3b8' }}>{ln.systemQty}</td>
                  <td className="px-4 py-3 text-[13px] text-right tabular-nums" style={{ color: '#e2e8f0' }}>{ln.countedQty}</td>
                  <td className="px-4 py-3 text-[13px] text-right tabular-nums font-semibold"
                    style={{ color: ln.variance < 0 ? '#f87171' : '#34d399' }}>
                    {ln.variance > 0 ? '+' : ''}{ln.variance}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-right tabular-nums"
                    style={{ color: ln.estimatedValue < 0 ? '#f87171' : '#34d399' }}>
                    {ln.estimatedValue < 0 ? '-' : '+'}${Math.abs(ln.estimatedValue).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <select value={ln.reason} onChange={e => setReason(i, e.target.value)}
                      className="h-7 rounded px-2 text-[11px] w-32"
                      style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.15)', color: '#e2e8f0' }}>
                      <option value="">Reason…</option>
                      {REASON_CODES.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {(['Accept', 'Reject', 'Recount'] as VarianceAction[]).map(act => (
                        <button key={act!} onClick={() => setAction(i, act)}
                          className="h-6 px-2 rounded text-[10px] font-medium transition-all"
                          style={{
                            background: ln.action === act
                              ? act === 'Accept' ? 'rgba(16,185,129,0.3)' : act === 'Reject' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'
                              : 'rgba(99,102,241,0.08)',
                            color: ln.action === act
                              ? act === 'Accept' ? '#34d399' : act === 'Reject' ? '#f87171' : '#fbbf24'
                              : '#64748b',
                            border: `1px solid ${ln.action === act ? 'transparent' : 'rgba(99,102,241,0.1)'}`,
                          }}>
                          {act}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}>
          <div className="text-[12px]" style={{ color: '#94a3b8' }}>
            {accepted.length} of {lines.length} accepted ·
            <span style={{ color: totalValueAdj < 0 ? '#f87171' : '#34d399' }}> Net adjustment: {totalValueAdj < 0 ? '-' : '+'}${Math.abs(totalValueAdj).toFixed(2)}</span>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="h-9 px-4 rounded text-[13px]"
              style={{ border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8' }}>Cancel</button>
            <button onClick={onClose} className="h-9 px-5 rounded text-[13px] font-medium"
              style={{ background: accepted.length > 0 ? 'rgba(99,102,241,0.8)' : 'rgba(99,102,241,0.3)', color: '#fff' }}>
              Post {accepted.length} Accepted Adjustments
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CycleCountPage() {
  const [sessions, setSessions] = useState<CountSession[]>([])
  const [lines, setLines] = useState<CountLine[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSession, setActiveSession] = useState<CountSession | null>(null)
  const [scanInput, setScanInput] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showPost, setShowPost] = useState(false)
  const scanRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/inventory/cycle-count')
      .then(r => r.json())
      .then(d => {
        setSessions(d.sessions?.length ? d.sessions : ACTIVE_SESSIONS)
        setLines(d.lines?.length ? d.lines : COUNT_LINES)
        setActiveSession(d.sessions?.[0] ?? ACTIVE_SESSIONS[0])
        setLoading(false)
      })
      .catch(() => {
        setSessions(ACTIVE_SESSIONS)
        setLines(COUNT_LINES)
        setActiveSession(ACTIVE_SESSIONS[0])
        setLoading(false)
      })
  }, [])

  const active = activeSession ?? ACTIVE_SESSIONS[0]
  const progress = Math.round((active.countedItems / active.totalItems) * 100)
  const noVariance = lines.filter(l => l.status === 'Counted').length
  const withVariance = lines.filter(l => l.status === 'Variance').length
  const posVarianceUnits = lines.filter(l => l.status === 'Variance' && l.countedQty !== null && l.countedQty > l.systemQty)
    .reduce((s, l) => s + ((l.countedQty ?? 0) - l.systemQty), 0)
  const negVarianceUnits = lines.filter(l => l.status === 'Variance' && l.countedQty !== null && l.countedQty < l.systemQty)
    .reduce((s, l) => s + (l.systemQty - (l.countedQty ?? 0)), 0)

  function handleScan(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && scanInput.trim()) {
      setScanInput('')
    }
  }

  return (
    <>
      <TopBar
        title="Cycle Count"
        breadcrumb={[{ label: 'Inventory', href: '/inventory' }]}
        actions={
          <>
            <button onClick={() => setShowNew(true)} className="h-8 px-4 rounded text-[13px] font-medium"
              style={{ background: 'rgba(99,102,241,0.8)', color: '#fff' }}>New Count Session</button>
            <button onClick={() => setShowPost(true)} className="h-8 px-3 rounded text-[13px]"
              style={{ border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8' }}>Post Adjustments</button>
            <button className="h-8 px-3 rounded text-[13px]"
              style={{ border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8' }}>Count History</button>
          </>
        }
      />

      <main className="flex-1 overflow-auto" style={{ background: '#0d0e24', minHeight: '100dvh' }}>
        <div className="px-6 py-5 space-y-5">

          {/* Active Sessions */}
          <div className="rounded-xl overflow-hidden" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}>
            <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
              <span className="text-[13px] font-semibold" style={{ color: '#e2e8f0' }}>Active Count Sessions</span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(99,102,241,0.2)', borderTopColor: '#818cf8' }} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                      {['Session #', 'Location', 'Type', 'Items', 'Counted', 'Variances', 'Status', 'Started By', 'Date', ''].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map(s => (
                      <tr key={s.id} className="cursor-pointer hover:bg-indigo-500/5 transition-colors"
                        style={{ borderBottom: '1px solid rgba(99,102,241,0.07)' }}
                        onClick={() => setActiveSession(s)}>
                        <td className="px-4 py-3 font-mono text-[13px] font-semibold" style={{ color: '#818cf8' }}>{s.sessionNo}</td>
                        <td className="px-4 py-3 text-[13px]" style={{ color: '#e2e8f0' }}>{s.location}</td>
                        <td className="px-4 py-3 text-[13px]" style={{ color: '#94a3b8' }}>{s.type}</td>
                        <td className="px-4 py-3 text-[13px] tabular-nums text-right" style={{ color: '#94a3b8' }}>{s.totalItems.toLocaleString()}</td>
                        <td className="px-4 py-3 text-[13px] tabular-nums text-right" style={{ color: '#e2e8f0' }}>{s.countedItems.toLocaleString()}</td>
                        <td className="px-4 py-3 text-[13px] tabular-nums text-right"
                          style={{ color: s.varianceItems > 0 ? '#fbbf24' : '#34d399' }}>
                          {s.varianceItems}
                        </td>
                        <td className="px-4 py-3">{sessionChip(s.status)}</td>
                        <td className="px-4 py-3 text-[13px]" style={{ color: '#94a3b8' }}>{s.startedBy}</td>
                        <td className="px-4 py-3 text-[13px]" style={{ color: '#94a3b8' }}>{s.date}</td>
                        <td className="px-4 py-3">
                          <button className="text-[11px] px-2 py-0.5 rounded"
                            style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                            Open
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Count Entry + Variance Summary */}
          <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 280px' }}>

            {/* Count Sheet */}
            <details open className="rounded-xl overflow-hidden" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}>
              <summary className="flex items-center gap-3 px-5 py-3 cursor-pointer select-none"
                style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                <span className="text-[13px] font-semibold" style={{ color: '#e2e8f0' }}>
                  Count Sheet — Zone A (In Progress)
                </span>
                <span className="ml-auto text-[12px]" style={{ color: '#64748b' }}>
                  {active.countedItems}/{active.totalItems} items
                </span>
              </summary>
              <div className="px-5 py-4 space-y-4">
                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px]" style={{ color: '#94a3b8' }}>Progress</span>
                    <span className="text-[12px] font-semibold" style={{ color: '#818cf8' }}>{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(99,102,241,0.1)' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #6366f1, #818cf8)' }} />
                  </div>
                  <div className="text-[11px] mt-1" style={{ color: '#475569' }}>{active.countedItems} counted of {active.totalItems} total items</div>
                </div>

                {/* Scan input */}
                <div className="flex gap-2">
                  <input
                    ref={scanRef}
                    placeholder="Scan barcode or enter SKU…"
                    value={scanInput}
                    onChange={e => setScanInput(e.target.value)}
                    onKeyDown={handleScan}
                    className="flex-1 h-9 rounded px-3 text-[13px]"
                    style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
                    autoFocus
                  />
                  <button className="h-9 px-4 rounded text-[13px]"
                    style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                    Enter
                  </button>
                </div>

                {/* Lines table */}
                <div className="rounded overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.1)' }}>
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: 'rgba(99,102,241,0.05)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                        {['Item No.', 'Description', 'System Qty', 'Counted Qty', 'Variance', 'Status'].map(h => (
                          <th key={h} className="text-left px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((ln, i) => {
                        const variance = ln.countedQty !== null ? ln.countedQty - ln.systemQty : null
                        const isVariance = ln.status === 'Variance'
                        return (
                          <tr key={i} style={{
                            borderBottom: '1px solid rgba(99,102,241,0.06)',
                            background: isVariance ? 'rgba(245,158,11,0.04)' : 'transparent',
                          }}>
                            <td className="px-3 py-2.5 font-mono text-[12px]" style={{ color: '#818cf8' }}>{ln.itemNo}</td>
                            <td className="px-3 py-2.5 text-[13px]" style={{ color: '#e2e8f0' }}>{ln.description}</td>
                            <td className="px-3 py-2.5 text-[13px] text-right tabular-nums" style={{ color: '#94a3b8' }}>
                              {ln.systemQty.toLocaleString()}
                            </td>
                            <td className="px-3 py-2.5 text-[13px] text-right tabular-nums"
                              style={{ color: ln.countedQty !== null ? '#e2e8f0' : '#475569' }}>
                              {ln.countedQty !== null ? ln.countedQty.toLocaleString() : '—'}
                            </td>
                            <td className="px-3 py-2.5 text-[13px] text-right tabular-nums font-semibold"
                              style={{ color: variance === null ? '#475569' : variance === 0 ? '#34d399' : variance < 0 ? '#f87171' : '#34d399' }}>
                              {variance === null ? '—' : variance === 0 ? '0' : (variance > 0 ? '+' : '') + variance}
                            </td>
                            <td className="px-3 py-2.5">{countLineStatusChip(ln.status)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </details>

            {/* Variance Summary card */}
            <div className="rounded-xl p-5 space-y-3 self-start" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}>
              <div className="text-[13px] font-semibold pb-2" style={{ color: '#e2e8f0', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                Variance Summary
              </div>
              {[
                { label: 'Total items in session', value: active.totalItems.toLocaleString(), color: '#e2e8f0' },
                { label: `Items counted (${progress}%)`, value: active.countedItems.toLocaleString(), color: '#818cf8' },
                { label: 'No variance', value: noVariance.toString(), color: '#34d399' },
                { label: 'With variance', value: withVariance.toString(), color: '#fbbf24' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="text-[12px]" style={{ color: '#94a3b8' }}>{row.label}</span>
                  <span className="text-[13px] font-semibold tabular-nums" style={{ color: row.color }}>{row.value}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid rgba(99,102,241,0.1)', paddingTop: '0.75rem' }} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px]" style={{ color: '#94a3b8' }}>Total variance units</span>
                  <span className="text-[12px] font-medium">
                    <span style={{ color: '#34d399' }}>+{posVarianceUnits}</span>
                    {' / '}
                    <span style={{ color: '#f87171' }}>-{negVarianceUnits}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px]" style={{ color: '#94a3b8' }}>Est. variance value</span>
                  <span className="text-[13px] font-semibold" style={{ color: '#f87171' }}>-$234.50</span>
                </div>
                <div className="text-[10px] mt-1" style={{ color: '#475569' }}>Using standard cost</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showNew && <NewSessionModal onClose={() => setShowNew(false)} />}
      {showPost && <PostAdjustmentsPanel onClose={() => setShowPost(false)} />}
    </>
  )
}
