'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import {
  RotateCw, FileText, Package, Search, Filter, X, ChevronDown,
  ChevronUp, ArrowUpDown, CheckSquare, Square, ExternalLink,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type ReturnStatus = 'Draft' | 'Open' | 'Posted' | 'Closed' | 'Cancelled'

interface ReturnRow {
  id: string
  returnNo: string
  customer: string
  originalOrder: string
  returnDate: string
  items: string
  amount: number
  reason: string
  status: ReturnStatus
  creditMemo: string
}

interface ReturnLine {
  lineNo: number
  itemNo: string
  description: string
  qtyReturned: number
  condition: string
  restock: boolean
  refundAmount: number
}

// ─── Static data ──────────────────────────────────────────────────────────────

const ROWS: ReturnRow[] = [
  { id: '1', returnNo: 'RTN-2026-0291', customer: 'The Cannon Group', originalOrder: 'SO-2026-4801', returnDate: 'Apr 20', items: '1 item', amount: 54.11, reason: 'Changed Mind', status: 'Posted', creditMemo: 'CM-2026-0182' },
  { id: '2', returnNo: 'RTN-2026-0290', customer: 'Fabrikam Inc', originalOrder: 'SO-2026-4750', returnDate: 'Apr 18', items: '3 items', amount: 287.50, reason: 'Defective', status: 'Open', creditMemo: 'Pending' },
  { id: '3', returnNo: 'RTN-2026-0289', customer: 'Adatum Corp', originalOrder: 'SO-2026-4720', returnDate: 'Apr 16', items: '1 item', amount: 145.00, reason: 'Wrong Item', status: 'Posted', creditMemo: 'CM-2026-0180' },
  { id: '4', returnNo: 'RTN-2026-0288', customer: 'Contoso Ltd', originalOrder: 'POS-TXN-2026', returnDate: 'Apr 15', items: '2 items', amount: 89.99, reason: 'Damaged', status: 'Posted', creditMemo: 'Store Credit' },
  { id: '5', returnNo: 'RTN-2026-0287', customer: 'Litware Inc', originalOrder: 'SO-2026-4700', returnDate: 'Apr 14', items: '1 item', amount: 312.00, reason: 'Defective', status: 'Open', creditMemo: 'Pending' },
  { id: '6', returnNo: 'RTN-2026-0286', customer: 'Northwind Traders', originalOrder: 'SO-2026-4688', returnDate: 'Apr 12', items: '4 items', amount: 520.40, reason: 'Not As Described', status: 'Posted', creditMemo: 'CM-2026-0178' },
  { id: '7', returnNo: 'RTN-2026-0285', customer: 'Woodgrove Bank', originalOrder: 'SO-2026-4660', returnDate: 'Apr 11', items: '2 items', amount: 198.00, reason: 'Changed Mind', status: 'Closed', creditMemo: 'CM-2026-0175' },
  { id: '8', returnNo: 'RTN-2026-0284', customer: 'Alpine Ski House', originalOrder: 'SO-2026-4644', returnDate: 'Apr 10', items: '1 item', amount: 75.50, reason: 'Wrong Item', status: 'Draft', creditMemo: '—' },
  { id: '9', returnNo: 'RTN-2026-0283', customer: 'Trey Research', originalOrder: 'SO-2026-4630', returnDate: 'Apr 9', items: '3 items', amount: 430.00, reason: 'Defective', status: 'Open', creditMemo: 'Pending' },
  { id: '10', returnNo: 'RTN-2026-0282', customer: 'Fabrikam Inc', originalOrder: 'SO-2026-4610', returnDate: 'Apr 8', items: '1 item', amount: 55.00, reason: 'Damaged', status: 'Cancelled', creditMemo: 'Voided' },
  { id: '11', returnNo: 'RTN-2026-0281', customer: 'Contoso Ltd', originalOrder: 'SO-2026-4598', returnDate: 'Apr 7', items: '2 items', amount: 210.00, reason: 'Not As Described', status: 'Posted', creditMemo: 'CM-2026-0171' },
  { id: '12', returnNo: 'RTN-2026-0280', customer: 'Adatum Corp', originalOrder: 'SO-2026-4580', returnDate: 'Apr 5', items: '1 item', amount: 99.99, reason: 'Changed Mind', status: 'Closed', creditMemo: 'CM-2026-0169' },
  { id: '13', returnNo: 'RTN-2026-0279', customer: 'Litware Inc', originalOrder: 'SO-2026-4560', returnDate: 'Apr 3', items: '5 items', amount: 875.00, reason: 'Defective', status: 'Posted', creditMemo: 'CM-2026-0167' },
  { id: '14', returnNo: 'RTN-2026-0278', customer: 'Northwind Traders', originalOrder: 'SO-2026-4540', returnDate: 'Apr 2', items: '2 items', amount: 140.00, reason: 'Wrong Item', status: 'Posted', creditMemo: 'CM-2026-0165' },
  { id: '15', returnNo: 'RTN-2026-0277', customer: 'The Cannon Group', originalOrder: 'SO-2026-4521', returnDate: 'Apr 1', items: '1 item', amount: 37.50, reason: 'Damaged', status: 'Draft', creditMemo: '—' },
]

const DETAIL_LINES: ReturnLine[] = [
  { lineNo: 1, itemNo: '1000', description: 'Widget Assembly A100', qtyReturned: 1, condition: 'Unopened', restock: true, refundAmount: 34.99 },
  { lineNo: 2, itemNo: 'SRV-001', description: 'Installation Service', qtyReturned: 1, condition: 'N/A', restock: false, refundAmount: 19.12 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
}

const STATUS_CHIP: Record<ReturnStatus, string> = {
  Draft: 'bg-zinc-700 text-zinc-300',
  Open: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  Posted: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  Closed: 'bg-zinc-800 text-zinc-500 border border-zinc-700',
  Cancelled: 'bg-red-500/20 text-red-300 border border-red-500/30',
}

// ─── KPI Tile ─────────────────────────────────────────────────────────────────

function KpiTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg px-5 py-4 flex flex-col gap-1" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}>
      <span className="text-[11px] uppercase tracking-widest" style={{ color: '#94a3b8' }}>{label}</span>
      <span className="text-2xl font-semibold" style={{ color: '#e2e8f0' }}>{value}</span>
      {sub && <span className="text-xs" style={{ color: '#94a3b8' }}>{sub}</span>}
    </div>
  )
}

// ─── Return Detail Drawer ─────────────────────────────────────────────────────

function DetailDrawer({ row, onClose }: { row: ReturnRow; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div
        className="w-full max-w-2xl h-full overflow-y-auto flex flex-col"
        style={{ background: '#0d0e24', borderLeft: '1px solid rgba(99,102,241,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
          <div>
            <div className="text-base font-semibold" style={{ color: '#e2e8f0' }}>{row.returnNo}</div>
            <div className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{row.customer} · {row.originalOrder}</div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-white/5 transition-colors">
            <X className="w-4 h-4" style={{ color: '#94a3b8' }} />
          </button>
        </div>

        {/* Return Header */}
        <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
          <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#94a3b8' }}>Return Header</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Return No.', row.returnNo],
              ['Customer', row.customer],
              ['Original Order', row.originalOrder],
              ['Return Date', row.returnDate + ', 2026'],
              ['Reason', row.reason],
              ['Status', row.status],
              ['Amount', fmt(row.amount)],
              ['Credit Memo', row.creditMemo],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-[11px]" style={{ color: '#94a3b8' }}>{k}</div>
                <div className="text-sm mt-0.5" style={{ color: '#e2e8f0' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Return Lines */}
        <div className="px-6 py-5">
          <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#94a3b8' }}>Return Lines</div>
          <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                  {['Item', 'Description', 'Qty', 'Condition', 'Restock', 'Refund'].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-medium" style={{ color: '#94a3b8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DETAIL_LINES.map(line => (
                  <tr key={line.lineNo} style={{ borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
                    <td className="px-3 py-2.5 font-mono" style={{ color: '#a5b4fc' }}>{line.itemNo}</td>
                    <td className="px-3 py-2.5" style={{ color: '#e2e8f0' }}>{line.description}</td>
                    <td className="px-3 py-2.5" style={{ color: '#e2e8f0' }}>{line.qtyReturned}</td>
                    <td className="px-3 py-2.5" style={{ color: '#e2e8f0' }}>{line.condition}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${line.restock ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-700 text-zinc-400'}`}>
                        {line.restock ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-medium" style={{ color: '#e2e8f0' }}>{fmt(line.refundAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Credit Memo Link */}
          {row.creditMemo !== 'Pending' && row.creditMemo !== '—' && row.creditMemo !== 'Voided' && (
            <div className="mt-4 flex items-center gap-2 text-xs" style={{ color: '#94a3b8' }}>
              <FileText className="w-3.5 h-3.5" />
              <span>Credit Memo:</span>
              <a href="#" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                {row.creditMemo} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Create Return Panel ──────────────────────────────────────────────────────

function CreateReturnPanel({ onClose }: { onClose: () => void }) {
  const [refundMethod, setRefundMethod] = useState('credit-memo')

  return (
    <div className="rounded-xl p-6 mt-4" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.2)' }}>
      <div className="flex items-center justify-between mb-5">
        <div className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>Create Return</div>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/5 transition-colors">
          <X className="w-4 h-4" style={{ color: '#94a3b8' }} />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Customer search */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>Customer</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search customer..."
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
            />
          </div>
        </div>
        {/* Original order lookup */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>Original Order</label>
          <input
            type="text"
            placeholder="SO-2026-XXXX"
            className="w-full px-3 py-2 text-sm rounded-lg outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
          />
        </div>
        {/* Reason */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>Reason</label>
          <select
            className="w-full px-3 py-2 text-sm rounded-lg outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
          >
            <option value="">Select reason...</option>
            {['Changed Mind', 'Defective', 'Wrong Item', 'Damaged', 'Not As Described', 'Duplicate Order'].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        {/* Refund method */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>Refund Method</label>
          <select
            value={refundMethod}
            onChange={e => setRefundMethod(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
          >
            <option value="original-tender">Original Tender</option>
            <option value="credit-memo">Credit Memo</option>
            <option value="store-credit">Store Credit</option>
            <option value="exchange">Exchange</option>
          </select>
        </div>
      </div>

      {/* Items to return */}
      <div className="mt-5">
        <div className="text-[11px] font-medium mb-2" style={{ color: '#94a3b8' }}>Items to Return</div>
        <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                {['Item No.', 'Description', 'Qty Ordered', 'Qty to Return', 'Condition'].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-medium" style={{ color: '#94a3b8' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
                <td className="px-3 py-2.5 font-mono" style={{ color: '#a5b4fc' }}>1000</td>
                <td className="px-3 py-2.5" style={{ color: '#e2e8f0' }}>Widget Assembly A100</td>
                <td className="px-3 py-2.5" style={{ color: '#94a3b8' }}>50</td>
                <td className="px-3 py-2.5">
                  <input type="number" min="0" max="50" defaultValue={1} className="w-16 px-2 py-1 text-xs rounded outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }} />
                </td>
                <td className="px-3 py-2.5">
                  <select className="text-xs px-2 py-1 rounded outline-none" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}>
                    {['Unopened', 'Like New', 'Used', 'Damaged'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg transition-colors hover:bg-white/5" style={{ color: '#94a3b8' }}>
          Cancel
        </button>
        <button className="px-5 py-2 text-sm font-medium rounded-lg transition-colors" style={{ background: 'rgba(99,102,241,0.85)', color: '#fff' }}>
          Create Return
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SalesReturnsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [reasonFilter, setReasonFilter] = useState('')
  const [sortCol, setSortCol] = useState<keyof ReturnRow>('returnNo')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [drawerRow, setDrawerRow] = useState<ReturnRow | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const statuses: ReturnStatus[] = ['Draft', 'Open', 'Posted', 'Closed', 'Cancelled']

  function toggleSort(col: keyof ReturnRow) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const filtered = ROWS.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !q || r.returnNo.toLowerCase().includes(q) || r.customer.toLowerCase().includes(q) || r.originalOrder.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'All' || r.status === statusFilter
    const matchReason = !reasonFilter || r.reason === reasonFilter
    return matchSearch && matchStatus && matchReason
  }).sort((a, b) => {
    const av = a[sortCol]; const bv = b[sortCol]
    const cmp = typeof av === 'number' ? av - (bv as number) : String(av).localeCompare(String(bv))
    return sortDir === 'asc' ? cmp : -cmp
  })

  const allSelected = filtered.length > 0 && filtered.every(r => selected.has(r.id))

  function toggleAll() {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(filtered.map(r => r.id)))
  }

  function SortIcon({ col }: { col: keyof ReturnRow }) {
    if (sortCol !== col) return <ArrowUpDown className="w-3 h-3 opacity-30" />
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" style={{ color: '#a5b4fc' }} /> : <ChevronDown className="w-3 h-3" style={{ color: '#a5b4fc' }} />
  }

  const actions = (
    <div className="flex items-center gap-2">
      <button onClick={() => setShowCreate(s => !s)} className="px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors" style={{ background: 'rgba(99,102,241,0.85)', color: '#fff' }}>
        New Return
      </button>
      <button className="px-3.5 py-1.5 text-sm rounded-lg transition-colors hover:bg-white/5" style={{ border: '1px solid rgba(99,102,241,0.3)', color: '#e2e8f0' }}>
        Credit Memo
      </button>
      <button className="px-3.5 py-1.5 text-sm rounded-lg transition-colors hover:bg-white/5" style={{ border: '1px solid rgba(99,102,241,0.3)', color: '#e2e8f0' }}>
        Restock Report
      </button>
    </div>
  )

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: '#0d0e24', color: '#e2e8f0' }}>
      <TopBar
        title="Sales Returns"
        breadcrumb={[
          { label: 'Sales', href: '/sales' },
          { label: 'Returns', href: '/sales/returns' },
        ]}
        actions={actions}
      />

      <main className="flex-1 px-6 py-5 flex flex-col gap-5">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiTile label="Returns This Month" value="47" />
          <KpiTile label="Return Value" value="$8,420" />
          <KpiTile label="Restocked Items" value="38" />
          <KpiTile label="Credit Issued" value="$7,890" />
        </div>

        {/* Create Return Panel */}
        {showCreate && <CreateReturnPanel onClose={() => setShowCreate(false)} />}

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Return # · Customer · Order…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm rounded-lg outline-none w-56"
              style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg outline-none"
            style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
          >
            <option value="All">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Reason */}
          <select
            value={reasonFilter}
            onChange={e => setReasonFilter(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg outline-none"
            style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
          >
            <option value="">All Reasons</option>
            {['Changed Mind', 'Defective', 'Wrong Item', 'Damaged', 'Not As Described', 'Duplicate Order'].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {/* Date range placeholders */}
          <input type="date" className="px-3 py-1.5 text-sm rounded-lg outline-none" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8' }} />
          <span className="text-xs" style={{ color: '#94a3b8' }}>to</span>
          <input type="date" className="px-3 py-1.5 text-sm rounded-lg outline-none" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8' }} />

          {(search || statusFilter !== 'All' || reasonFilter) && (
            <button onClick={() => { setSearch(''); setStatusFilter('All'); setReasonFilter('') }} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <X className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
            </button>
          )}

          <span className="ml-auto text-xs" style={{ color: '#94a3b8' }}>{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Table */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                  {/* Checkbox */}
                  <th className="px-4 py-3 w-8">
                    <button onClick={toggleAll} className="flex items-center">
                      {allSelected
                        ? <CheckSquare className="w-3.5 h-3.5" style={{ color: '#a5b4fc' }} />
                        : <Square className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} />}
                    </button>
                  </th>
                  {([
                    ['returnNo', 'Return #'],
                    ['customer', 'Customer'],
                    ['originalOrder', 'Original Order'],
                    ['returnDate', 'Return Date'],
                    ['items', 'Items'],
                    ['amount', 'Amount'],
                    ['reason', 'Reason'],
                    ['status', 'Status'],
                    ['creditMemo', 'Credit Memo'],
                  ] as [keyof ReturnRow, string][]).map(([col, label]) => (
                    <th
                      key={col}
                      className="px-3 py-3 text-left text-xs font-medium cursor-pointer select-none"
                      style={{ color: '#94a3b8' }}
                      onClick={() => toggleSort(col)}
                    >
                      <div className="flex items-center gap-1">
                        {label} <SortIcon col={col} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => {
                  const isSelected = selected.has(row.id)
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setDrawerRow(row)}
                      className="cursor-pointer transition-colors"
                      style={{
                        background: isSelected ? 'rgba(99,102,241,0.08)' : idx % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent',
                        borderBottom: '1px solid rgba(99,102,241,0.08)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = isSelected ? 'rgba(99,102,241,0.08)' : idx % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent')}
                    >
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <button onClick={() => {
                          const s = new Set(selected)
                          s.has(row.id) ? s.delete(row.id) : s.add(row.id)
                          setSelected(s)
                        }}>
                          {isSelected
                            ? <CheckSquare className="w-3.5 h-3.5" style={{ color: '#a5b4fc' }} />
                            : <Square className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} />}
                        </button>
                      </td>
                      <td className="px-3 py-3 font-mono text-xs font-medium" style={{ color: '#a5b4fc' }}>{row.returnNo}</td>
                      <td className="px-3 py-3" style={{ color: '#e2e8f0' }}>{row.customer}</td>
                      <td className="px-3 py-3 font-mono text-xs" style={{ color: '#94a3b8' }}>{row.originalOrder}</td>
                      <td className="px-3 py-3 text-xs" style={{ color: '#94a3b8' }}>{row.returnDate}, 2026</td>
                      <td className="px-3 py-3 text-xs" style={{ color: '#e2e8f0' }}>{row.items}</td>
                      <td className="px-3 py-3 font-medium text-xs tabular-nums" style={{ color: '#e2e8f0' }}>{fmt(row.amount)}</td>
                      <td className="px-3 py-3 text-xs" style={{ color: '#94a3b8' }}>{row.reason}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${STATUS_CHIP[row.status]}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs" style={{ color: row.creditMemo === 'Pending' ? '#f59e0b' : row.creditMemo === '—' ? '#94a3b8' : '#a5b4fc' }}>
                        {row.creditMemo}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Detail Drawer */}
      {drawerRow && <DetailDrawer row={drawerRow} onClose={() => setDrawerRow(null)} />}
    </div>
  )
}
