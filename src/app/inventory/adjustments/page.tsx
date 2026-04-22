'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Adjustment {
  id: string
  adjNum: string
  date: string
  item: string
  sku: string
  location: string
  qtyAdj: number
  unitCost: number
  totalValue: number
  reason: string
  postedBy: string
  status: 'Draft' | 'Posted' | 'Reversed'
}

interface AdjLine {
  item: string
  sku: string
  systemQty: number
  adjQty: number
  newQty: number
  unitCost: number
  reason: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_ADJUSTMENTS: Adjustment[] = [
  { id: '1', adjNum: 'ADJ-2026-0891', date: 'Apr 22', item: 'Widget A100', sku: '1000', location: 'Main WH', qtyAdj: 12, unitCost: 22.00, totalValue: 264.00, reason: 'Cycle Count', postedBy: 'Tom J.', status: 'Posted' },
  { id: '2', adjNum: 'ADJ-2026-0890', date: 'Apr 21', item: 'Motor B200', sku: '1001', location: 'Main WH', qtyAdj: -3, unitCost: 89.00, totalValue: -267.00, reason: 'Damaged', postedBy: 'Tom J.', status: 'Posted' },
  { id: '3', adjNum: 'ADJ-2026-0889', date: 'Apr 20', item: 'Coffee Blend', sku: '1006', location: 'Chicago', qtyAdj: 100, unitCost: 8.50, totalValue: 850.00, reason: 'Transfer Receipt', postedBy: 'Alice C.', status: 'Posted' },
  { id: '4', adjNum: 'ADJ-2026-0888', date: 'Apr 19', item: 'Control Panel', sku: '1002', location: 'Main WH', qtyAdj: -5, unitCost: 145.00, totalValue: -725.00, reason: 'Theft/Shrinkage', postedBy: 'Manager', status: 'Posted' },
  { id: '5', adjNum: 'ADJ-2026-0887', date: 'Apr 22', item: 'Bolt M8', sku: '1004', location: 'East WH', qtyAdj: 500, unitCost: 0.12, totalValue: 60.00, reason: 'Recount', postedBy: 'Tom J.', status: 'Draft' },
  { id: '6', adjNum: 'ADJ-2026-0886', date: 'Apr 18', item: 'Gasket Set', sku: '1010', location: 'Main WH', qtyAdj: -8, unitCost: 34.50, totalValue: -276.00, reason: 'Damaged', postedBy: 'Alice C.', status: 'Posted' },
  { id: '7', adjNum: 'ADJ-2026-0885', date: 'Apr 17', item: 'Drive Shaft', sku: '1011', location: 'East WH', qtyAdj: 2, unitCost: 210.00, totalValue: 420.00, reason: 'Receiving Error', postedBy: 'Tom J.', status: 'Reversed' },
  { id: '8', adjNum: 'ADJ-2026-0884', date: 'Apr 16', item: 'Filter Pack', sku: '1012', location: 'Chicago', qtyAdj: 24, unitCost: 6.75, totalValue: 162.00, reason: 'Cycle Count', postedBy: 'Alice C.', status: 'Posted' },
  { id: '9', adjNum: 'ADJ-2026-0883', date: 'Apr 15', item: 'Relay Switch', sku: '1013', location: 'Main WH', qtyAdj: -10, unitCost: 18.40, totalValue: -184.00, reason: 'System Error', postedBy: 'Manager', status: 'Posted' },
  { id: '10', adjNum: 'ADJ-2026-0882', date: 'Apr 14', item: 'Cable Bundle', sku: '1014', location: 'NY Store', qtyAdj: 50, unitCost: 4.20, totalValue: 210.00, reason: 'Transfer Receipt', postedBy: 'Tom J.', status: 'Posted' },
  { id: '11', adjNum: 'ADJ-2026-0881', date: 'Apr 13', item: 'Piston Ring', sku: '1015', location: 'Main WH', qtyAdj: -2, unitCost: 67.00, totalValue: -134.00, reason: 'Theft/Shrinkage', postedBy: 'Manager', status: 'Reversed' },
  { id: '12', adjNum: 'ADJ-2026-0880', date: 'Apr 12', item: 'Valve Core', sku: '1016', location: 'East WH', qtyAdj: 18, unitCost: 11.25, totalValue: 202.50, reason: 'Recount', postedBy: 'Alice C.', status: 'Posted' },
  { id: '13', adjNum: 'ADJ-2026-0879', date: 'Apr 11', item: 'Washer Set', sku: '1017', location: 'Chicago', qtyAdj: 200, unitCost: 0.08, totalValue: 16.00, reason: 'Cycle Count', postedBy: 'Tom J.', status: 'Draft' },
  { id: '14', adjNum: 'ADJ-2026-0878', date: 'Apr 10', item: 'Bearing 6203', sku: '1018', location: 'Main WH', qtyAdj: -6, unitCost: 28.90, totalValue: -173.40, reason: 'Damaged', postedBy: 'Alice C.', status: 'Posted' },
  { id: '15', adjNum: 'ADJ-2026-0877', date: 'Apr 9', item: 'Seal Kit', sku: '1019', location: 'NY Store', qtyAdj: 15, unitCost: 14.00, totalValue: 210.00, reason: 'Receiving Error', postedBy: 'Tom J.', status: 'Posted' },
]

const LOCATIONS = ['Main Warehouse', 'East Warehouse', 'Chicago Store', 'NY Store', 'West Coast DC']
const REASONS = ['Cycle Count', 'Damage', 'Theft', 'Receiving Error', 'System Error', 'Transfer', 'Other']
const EMPTY_LINE: AdjLine = { item: '', sku: '', systemQty: 0, adjQty: 0, newQty: 0, unitCost: 0, reason: 'Cycle Count' }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusChip({ status }: { status: Adjustment['status'] }) {
  const map = {
    Posted: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80', border: 'rgba(34,197,94,0.3)' },
    Draft: { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: 'rgba(251,191,36,0.3)' },
    Reversed: { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8', border: 'rgba(148,163,184,0.2)' },
  }
  const s = map[status]
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600, letterSpacing: '0.02em' }}>
      {status}
    </span>
  )
}

function fmt(n: number) { return n < 0 ? `-$${Math.abs(n).toFixed(2)}` : `$${n.toFixed(2)}` }

// ─── Drawer ───────────────────────────────────────────────────────────────────

function DetailDrawer({ adj, onClose }: { adj: Adjustment; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.6)' }} onClick={onClose} />
      <div style={{ width: 480, background: '#16213e', borderLeft: '1px solid rgba(99,102,241,0.2)', overflowY: 'auto', padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>{adj.adjNum}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{adj.date} · {adj.location}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}>&#x2715;</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {([['Item', adj.item], ['SKU', adj.sku], ['Reason', adj.reason], ['Posted By', adj.postedBy], ['Qty Adjustment', adj.qtyAdj > 0 ? `+${adj.qtyAdj}` : String(adj.qtyAdj)], ['Unit Cost', `$${adj.unitCost.toFixed(2)}`], ['Total Value', fmt(adj.totalValue)], ['Status', '']] as [string, string][]).map(([k, v]) => (
            <div key={k} style={{ background: '#0d0e24', borderRadius: 6, padding: '10px 14px' }}>
              <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k}</div>
              {k === 'Status' ? <StatusChip status={adj.status} /> : (
                <div style={{ fontSize: 13, color: k === 'Qty Adjustment' ? (adj.qtyAdj >= 0 ? '#4ade80' : '#f87171') : '#e2e8f0', fontWeight: 600 }}>{v}</div>
              )}
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>GL Entries Generated</div>
          <div style={{ background: '#0d0e24', borderRadius: 6, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'rgba(99,102,241,0.08)' }}>
                  {['Account', 'Description', 'Debit', 'Credit'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', color: '#94a3b8', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['14100', 'Inventory Asset', adj.totalValue > 0 ? fmt(Math.abs(adj.totalValue)) : '—', adj.totalValue < 0 ? fmt(Math.abs(adj.totalValue)) : '—'],
                  ['50200', 'Inventory Adj. Expense', adj.totalValue < 0 ? fmt(Math.abs(adj.totalValue)) : '—', adj.totalValue > 0 ? fmt(Math.abs(adj.totalValue)) : '—'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: '8px 12px', color: '#e2e8f0' }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── New Adjustment Modal ─────────────────────────────────────────────────────

function NewAdjModal({ onClose, onPost }: { onClose: () => void; onPost: () => void }) {
  const [date, setDate] = useState('2026-04-22')
  const [location, setLocation] = useState('Main Warehouse')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<AdjLine[]>([{ ...EMPTY_LINE }])
  const [confirmPost, setConfirmPost] = useState(false)

  const addLine = () => setLines(l => [...l, { ...EMPTY_LINE }])
  const updateLine = (i: number, k: keyof AdjLine, v: string | number) => {
    setLines(l => l.map((ln, idx) => {
      if (idx !== i) return ln
      const updated = { ...ln, [k]: v }
      if (k === 'adjQty') updated.newQty = updated.systemQty + Number(v)
      if (k === 'systemQty') updated.newQty = Number(v) + updated.adjQty
      return updated
    }))
  }
  const removeLine = (i: number) => setLines(l => l.filter((_, idx) => idx !== i))

  const inputStyle: React.CSSProperties = {
    background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6,
    color: '#e2e8f0', fontSize: 13, padding: '6px 10px', width: '100%', outline: 'none',
  }

  if (confirmPost) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)' }}>
        <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 10, padding: 32, width: 420 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: 12 }}>Confirm Post</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24, lineHeight: 1.6 }}>
            Posting will update inventory quantities and create GL journal entries. This action cannot be undone.<br /><br />Continue?
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setConfirmPost(false)} style={{ background: 'none', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, color: '#94a3b8', padding: '8px 18px', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
            <button onClick={() => { setConfirmPost(false); onPost(); onClose() }} style={{ background: 'rgba(99,102,241,0.85)', border: 'none', borderRadius: 6, color: '#fff', padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Post</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)' }}>
      <div style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 10, padding: 28, width: 820, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>New Inventory Adjustment</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 20, cursor: 'pointer' }}>&#x2715;</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Adjustment Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</label>
            <select value={location} onChange={e => setLocation(e.target.value)} style={inputStyle}>
              {LOCATIONS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lines</div>
            <button onClick={addLine} style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, color: '#a5b4fc', fontSize: 12, padding: '5px 12px', cursor: 'pointer', fontWeight: 600 }}>+ Add Line</button>
          </div>
          <div style={{ background: '#0d0e24', borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'rgba(99,102,241,0.08)' }}>
                  {['Item', 'SKU', 'System Qty', 'Adj Qty', 'New Qty', 'Unit Cost', 'Reason', ''].map(h => (
                    <th key={h} style={{ padding: '8px 10px', color: '#94a3b8', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid rgba(99,102,241,0.1)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lines.map((ln, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
                    <td style={{ padding: '6px 8px' }}><input value={ln.item} onChange={e => updateLine(i, 'item', e.target.value)} placeholder="Search item..." style={{ ...inputStyle, width: 130 }} /></td>
                    <td style={{ padding: '6px 8px' }}><input value={ln.sku} onChange={e => updateLine(i, 'sku', e.target.value)} style={{ ...inputStyle, width: 70 }} /></td>
                    <td style={{ padding: '6px 8px' }}><input type="number" value={ln.systemQty} onChange={e => updateLine(i, 'systemQty', Number(e.target.value))} style={{ ...inputStyle, width: 80 }} /></td>
                    <td style={{ padding: '6px 8px' }}><input type="number" value={ln.adjQty} onChange={e => updateLine(i, 'adjQty', Number(e.target.value))} style={{ ...inputStyle, width: 80, color: ln.adjQty >= 0 ? '#4ade80' : '#f87171' }} /></td>
                    <td style={{ padding: '6px 8px', color: '#e2e8f0', fontWeight: 600, textAlign: 'center' }}>{ln.newQty}</td>
                    <td style={{ padding: '6px 8px' }}><input type="number" step="0.01" value={ln.unitCost} onChange={e => updateLine(i, 'unitCost', Number(e.target.value))} style={{ ...inputStyle, width: 90 }} /></td>
                    <td style={{ padding: '6px 8px' }}>
                      <select value={ln.reason} onChange={e => updateLine(i, 'reason', e.target.value)} style={{ ...inputStyle, width: 130 }}>
                        {REASONS.map(r => <option key={r}>{r}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      {lines.length > 1 && <button onClick={() => removeLine(i)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: 14 }}>&#x2715;</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 11, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Optional notes..." />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, color: '#94a3b8', padding: '8px 18px', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
          <button style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, color: '#a5b4fc', padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Save Draft</button>
          <button onClick={() => setConfirmPost(true)} style={{ background: 'rgba(99,102,241,0.85)', border: 'none', borderRadius: 6, color: '#fff', padding: '8px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Post Immediately (Manager)</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InventoryAdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortKey, setSortKey] = useState<keyof Adjustment>('adjNum')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [drawerAdj, setDrawerAdj] = useState<Adjustment | null>(null)
  const [showNew, setShowNew] = useState(false)

  useEffect(() => {
    fetch('/api/inventory/adjustments')
      .then(r => r.json())
      .catch(() => ({ adjustments: MOCK_ADJUSTMENTS }))
      .then(d => { setAdjustments(d.adjustments ?? MOCK_ADJUSTMENTS); setLoading(false) })
  }, [])

  const handleSort = (k: keyof Adjustment) => {
    if (k === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(k); setSortDir('asc') }
  }

  const filtered = adjustments
    .filter(a => statusFilter === 'All' || a.status === statusFilter)
    .filter(a => !search || [a.adjNum, a.item, a.sku, a.reason, a.postedBy].some(v => v.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(a => a.id)))
  }
  const toggleRow = (id: string) => {
    const s = new Set(selected)
    s.has(id) ? s.delete(id) : s.add(id)
    setSelected(s)
  }

  const SortIcon = ({ k }: { k: keyof Adjustment }) => (
    <span style={{ marginLeft: 4, opacity: sortKey === k ? 1 : 0.3, fontSize: 10 }}>
      {sortKey === k ? (sortDir === 'asc' ? '▲' : '▼') : '▲'}
    </span>
  )

  const thStyle: React.CSSProperties = {
    padding: '10px 12px', color: '#94a3b8', fontSize: 11, fontWeight: 600, textAlign: 'left',
    borderBottom: '1px solid rgba(99,102,241,0.12)', cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none',
  }
  const tdStyle: React.CSSProperties = {
    padding: '10px 12px', fontSize: 12, color: '#e2e8f0',
    borderBottom: '1px solid rgba(99,102,241,0.06)', whiteSpace: 'nowrap',
  }
  const inputStyle: React.CSSProperties = {
    background: '#16213e', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6,
    color: '#e2e8f0', fontSize: 12, padding: '6px 10px', outline: 'none',
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#0d0e24', color: '#e2e8f0' }}>
      <TopBar
        title="Inventory Adjustments"
        breadcrumb={[
          { label: 'Inventory', href: '/inventory' },
          { label: 'Adjustments', href: '/inventory/adjustments' },
        ]}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowNew(true)} style={{ background: 'rgba(99,102,241,0.85)', border: 'none', borderRadius: 6, color: '#fff', padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>New Adjustment</button>
            <button style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 6, color: '#a5b4fc', padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}>Post</button>
            <button style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 6, color: '#a5b4fc', padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}>Reverse</button>
          </div>
        }
      />

      <div style={{ padding: '20px 28px' }}>
        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
          {['All', 'Draft', 'Posted', 'Reversed'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                background: statusFilter === s ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.06)',
                border: `1px solid ${statusFilter === s ? 'rgba(99,102,241,0.5)' : 'rgba(99,102,241,0.15)'}`,
                borderRadius: 6, color: statusFilter === s ? '#a5b4fc' : '#94a3b8',
                padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontWeight: statusFilter === s ? 600 : 400,
              }}
            >
              {s}
            </button>
          ))}
          <div style={{ flex: 1, minWidth: 200 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search Adj #, Item, Reason, Posted By..."
              style={{ ...inputStyle, width: '100%' }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ background: '#16213e', borderRadius: 10, border: '1px solid rgba(99,102,241,0.12)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>Loading adjustments...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'rgba(99,102,241,0.05)' }}>
                  <tr>
                    <th style={{ ...thStyle, width: 36 }}>
                      <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} />
                    </th>
                    {([
                      ['adjNum', 'Adj #'], ['date', 'Date'], ['item', 'Item'], ['sku', 'SKU'],
                      ['location', 'Location'], ['qtyAdj', 'Qty Adj'], ['unitCost', 'Unit Cost'],
                      ['totalValue', 'Total Value'], ['reason', 'Reason'], ['postedBy', 'Posted By'], ['status', 'Status'],
                    ] as [keyof Adjustment, string][]).map(([k, label]) => (
                      <th key={k} style={thStyle} onClick={() => handleSort(k)}>
                        {label}<SortIcon k={k} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr
                      key={a.id}
                      onClick={() => setDrawerAdj(a)}
                      style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.05)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={tdStyle} onClick={e => { e.stopPropagation(); toggleRow(a.id) }}>
                        <input type="checkbox" checked={selected.has(a.id)} readOnly />
                      </td>
                      <td style={{ ...tdStyle, color: '#a5b4fc', fontWeight: 600 }}>{a.adjNum}</td>
                      <td style={tdStyle}>{a.date}</td>
                      <td style={tdStyle}>{a.item}</td>
                      <td style={{ ...tdStyle, color: '#94a3b8' }}>{a.sku}</td>
                      <td style={tdStyle}>{a.location}</td>
                      <td style={{ ...tdStyle, color: a.qtyAdj >= 0 ? '#4ade80' : '#f87171', fontWeight: 700 }}>
                        {a.qtyAdj >= 0 ? `+${a.qtyAdj}` : a.qtyAdj}
                      </td>
                      <td style={tdStyle}>${a.unitCost.toFixed(2)}</td>
                      <td style={{ ...tdStyle, color: a.totalValue >= 0 ? '#4ade80' : '#f87171' }}>{fmt(a.totalValue)}</td>
                      <td style={tdStyle}>{a.reason}</td>
                      <td style={tdStyle}>{a.postedBy}</td>
                      <td style={tdStyle}><StatusChip status={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(99,102,241,0.08)', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8' }}>
            <span>{selected.size > 0 ? `${selected.size} selected · ` : ''}{filtered.length} adjustment{filtered.length !== 1 ? 's' : ''}</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>

      {drawerAdj && <DetailDrawer adj={drawerAdj} onClose={() => setDrawerAdj(null)} />}
      {showNew && <NewAdjModal onClose={() => setShowNew(false)} onPost={() => {}} />}
    </div>
  )
}
