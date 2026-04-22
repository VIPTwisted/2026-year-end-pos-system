'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ─── Types ────────────────────────────────────────────────────────────────────
type ReplenishTab = 'alerts' | 'rules' | 'history'
type RuleMethod = 'Auto PO' | 'Auto Transfer' | 'Manual'
type OrderType = 'PO' | 'Transfer'
type OrderStatus = 'Pending' | 'Approved' | 'Ordered' | 'In Transit' | 'Received' | 'Partial'

interface AlertRow {
  id: string
  item: string
  store: string
  onHand: number
  reorderPoint: number
  suggestedQty: number
  source: string
  estCost: string
  actions: ('po' | 'transfer')[]
}

interface Rule {
  id: string
  name: string
  itemCategory: string
  location: string
  minQty: number
  maxQty: number
  reorderPoint: number
  leadTime: string
  method: RuleMethod
  active: boolean
}

interface HistoryRow {
  id: string
  orderNum: string
  type: OrderType
  item: string
  store: string
  qty: number
  status: OrderStatus
  created: string
  received: string
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

// ─── Static Data ──────────────────────────────────────────────────────────────
const ALERTS: AlertRow[] = [
  { id: 'a1', item: 'Widget A100', store: 'Chicago Store', onHand: 8, reorderPoint: 50, suggestedQty: 200, source: 'Main Warehouse', estCost: '$6,998', actions: ['po', 'transfer'] },
  { id: 'a2', item: 'Coffee Blend Premium', store: 'NY Store', onHand: 12, reorderPoint: 30, suggestedQty: 100, source: 'Vendor V10006', estCost: '$850', actions: ['po'] },
  { id: 'a3', item: 'Motor Housing B200', store: 'Main Warehouse', onHand: 5, reorderPoint: 25, suggestedQty: 50, source: 'Vendor V10001', estCost: '$4,450', actions: ['po'] },
  { id: 'a4', item: 'Steel Rod 12mm', store: 'Main Warehouse', onHand: 18, reorderPoint: 100, suggestedQty: 500, source: 'Vendor V10003', estCost: '$3,750', actions: ['po'] },
  { id: 'a5', item: 'Bluetooth Earbuds X5', store: 'Chicago Store', onHand: 3, reorderPoint: 15, suggestedQty: 40, source: 'Vendor V10009', estCost: '$1,199', actions: ['po', 'transfer'] },
  { id: 'a6', item: 'Coffee Blend Premium', store: 'LA Store', onHand: 9, reorderPoint: 30, suggestedQty: 100, source: 'Vendor V10006', estCost: '$850', actions: ['po', 'transfer'] },
  { id: 'a7', item: 'Widget A100', store: 'Dallas Store', onHand: 11, reorderPoint: 50, suggestedQty: 200, source: 'Main Warehouse', estCost: '$6,998', actions: ['po', 'transfer'] },
  { id: 'a8', item: 'Hex Bolt M8x30', store: 'Main Warehouse', onHand: 240, reorderPoint: 1000, suggestedQty: 5000, source: 'Vendor V10002', estCost: '$620', actions: ['po'] },
  { id: 'a9', item: 'USB-C Hub 7-Port', store: 'NY Store', onHand: 2, reorderPoint: 10, suggestedQty: 25, source: 'Vendor V10009', estCost: '$1,875', actions: ['po', 'transfer'] },
  { id: 'a10', item: 'Wireless Mouse Pro', store: 'Miami Store', onHand: 4, reorderPoint: 12, suggestedQty: 30, source: 'Vendor V10009', estCost: '$2,100', actions: ['po', 'transfer'] },
  { id: 'a11', item: 'Drill Bit Set 20pc', store: 'Chicago Store', onHand: 6, reorderPoint: 20, suggestedQty: 60, source: 'Vendor V10005', estCost: '$1,440', actions: ['po'] },
  { id: 'a12', item: 'Coffee Blend Premium', store: 'Dallas Store', onHand: 14, reorderPoint: 30, suggestedQty: 100, source: 'Vendor V10006', estCost: '$850', actions: ['po', 'transfer'] },
  { id: 'a13', item: 'Packing Foam Sheet', store: 'Main Warehouse', onHand: 80, reorderPoint: 500, suggestedQty: 2000, source: 'Vendor V10007', estCost: '$980', actions: ['po'] },
  { id: 'a14', item: 'Label Printer Rolls', store: 'Main Warehouse', onHand: 12, reorderPoint: 50, suggestedQty: 200, source: 'Vendor V10008', estCost: '$380', actions: ['po'] },
  { id: 'a15', item: 'Bluetooth Earbuds X5', store: 'Miami Store', onHand: 1, reorderPoint: 15, suggestedQty: 40, source: 'Vendor V10009', estCost: '$1,199', actions: ['po', 'transfer'] },
]

const RULES: Rule[] = [
  { id: 'r1', name: 'Rule-001', itemCategory: 'Finished Goods Category', location: 'All Stores', minQty: 50, maxQty: 500, reorderPoint: 75, leadTime: '14 days', method: 'Auto PO', active: true },
  { id: 'r2', name: 'Rule-002', itemCategory: 'Raw Materials', location: 'Main Warehouse', minQty: 100, maxQty: 2000, reorderPoint: 200, leadTime: '21 days', method: 'Auto PO', active: true },
  { id: 'r3', name: 'Rule-003', itemCategory: 'Coffee Blend', location: 'All Stores', minQty: 20, maxQty: 200, reorderPoint: 30, leadTime: '2 days', method: 'Auto Transfer', active: true },
  { id: 'r4', name: 'Rule-004', itemCategory: 'Electronics', location: 'Chicago Store', minQty: 10, maxQty: 100, reorderPoint: 15, leadTime: '14 days', method: 'Manual', active: true },
  { id: 'r5', name: 'Rule-005', itemCategory: 'Fasteners & Hardware', location: 'Main Warehouse', minQty: 500, maxQty: 10000, reorderPoint: 1000, leadTime: '7 days', method: 'Auto PO', active: true },
  { id: 'r6', name: 'Rule-006', itemCategory: 'Packaging Materials', location: 'Main Warehouse', minQty: 200, maxQty: 5000, reorderPoint: 500, leadTime: '5 days', method: 'Auto PO', active: false },
  { id: 'r7', name: 'Rule-007', itemCategory: 'Electronics', location: 'All Stores', minQty: 5, maxQty: 50, reorderPoint: 10, leadTime: '14 days', method: 'Auto Transfer', active: true },
  { id: 'r8', name: 'Rule-008', itemCategory: 'Tools & Equipment', location: 'All Stores', minQty: 10, maxQty: 80, reorderPoint: 20, leadTime: '10 days', method: 'Manual', active: false },
]

const HISTORY: HistoryRow[] = [
  { id: 'h1', orderNum: 'PO-2026-0441', type: 'PO', item: 'Widget A100', store: 'Main Warehouse', qty: 200, status: 'Received', created: 'Apr 8', received: 'Apr 15' },
  { id: 'h2', orderNum: 'TR-2026-0089', type: 'Transfer', item: 'Coffee Blend Premium', store: 'NY Store', qty: 100, status: 'In Transit', created: 'Apr 20', received: '—' },
  { id: 'h3', orderNum: 'PO-2026-0440', type: 'PO', item: 'Steel Rod 12mm', store: 'Main Warehouse', qty: 500, status: 'Ordered', created: 'Apr 18', received: '—' },
  { id: 'h4', orderNum: 'TR-2026-0088', type: 'Transfer', item: 'Bluetooth Earbuds X5', store: 'Chicago Store', qty: 40, status: 'Pending', created: 'Apr 21', received: '—' },
  { id: 'h5', orderNum: 'PO-2026-0439', type: 'PO', item: 'Motor Housing B200', store: 'Main Warehouse', qty: 50, status: 'Approved', created: 'Apr 21', received: '—' },
  { id: 'h6', orderNum: 'PO-2026-0438', type: 'PO', item: 'USB-C Hub 7-Port', store: 'Main Warehouse', qty: 25, status: 'Received', created: 'Apr 5', received: 'Apr 12' },
  { id: 'h7', orderNum: 'TR-2026-0087', type: 'Transfer', item: 'Wireless Mouse Pro', store: 'Miami Store', qty: 30, status: 'In Transit', created: 'Apr 21', received: '—' },
  { id: 'h8', orderNum: 'PO-2026-0437', type: 'PO', item: 'Drill Bit Set 20pc', store: 'Main Warehouse', qty: 60, status: 'Partial', created: 'Apr 10', received: 'Apr 17 (partial)' },
  { id: 'h9', orderNum: 'PO-2026-0436', type: 'PO', item: 'Coffee Blend Premium', store: 'Main Warehouse', qty: 300, status: 'Received', created: 'Apr 1', received: 'Apr 4' },
  { id: 'h10', orderNum: 'TR-2026-0086', type: 'Transfer', item: 'Widget A100', store: 'Dallas Store', qty: 100, status: 'Received', created: 'Apr 12', received: 'Apr 14' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────
function OrderStatusChip({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, string> = {
    Pending: 'bg-zinc-700/60 text-zinc-400',
    Approved: 'bg-blue-500/15 text-blue-400',
    Ordered: 'bg-indigo-500/15 text-indigo-400',
    'In Transit': 'bg-amber-500/15 text-amber-400',
    Received: 'bg-emerald-500/15 text-emerald-400',
    Partial: 'bg-orange-500/15 text-orange-400',
  }
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${map[status]}`}>{status}</span>
}

// ─── New Rule Modal ────────────────────────────────────────────────────────────
function NewRuleModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="rounded-2xl border p-6 w-full max-w-lg mx-4 space-y-4" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.25)' }}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#e2e8f0]">New Replenishment Rule</h3>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-[#e2e8f0]"><XIcon /></button>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          {[
            { label: 'Rule Name', placeholder: 'Rule-009', type: 'text' },
            { label: 'Item / Category', placeholder: 'Electronics', type: 'text' },
            { label: 'Store / Warehouse', placeholder: 'All Stores', type: 'text' },
            { label: 'Lead Time (days)', placeholder: '14', type: 'number' },
            { label: 'Min Qty', placeholder: '10', type: 'number' },
            { label: 'Max Qty', placeholder: '100', type: 'number' },
            { label: 'Reorder Point', placeholder: '15', type: 'number' },
          ].map(f => (
            <div key={f.label} className="flex flex-col gap-1">
              <label className="text-[#94a3b8] font-medium">{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                className="rounded-lg border px-3 py-2 text-[#e2e8f0] placeholder:text-zinc-600 outline-none focus:border-indigo-500 transition-colors"
                style={{ background: 'rgba(13,14,36,0.8)', borderColor: 'rgba(99,102,241,0.2)' }}
              />
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <label className="text-[#94a3b8] font-medium">Method</label>
            <select className="rounded-lg border px-3 py-2 text-[#e2e8f0] outline-none focus:border-indigo-500 transition-colors" style={{ background: 'rgba(13,14,36,0.8)', borderColor: 'rgba(99,102,241,0.2)' }}>
              <option>Auto PO</option>
              <option>Auto Transfer</option>
              <option>Manual</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="rounded-lg border px-4 py-2 text-xs text-[#94a3b8] hover:text-[#e2e8f0] transition-colors" style={{ borderColor: 'rgba(99,102,241,0.2)' }}>Cancel</button>
          <button onClick={onClose} className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors">Save Rule</button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReplenishmentPage() {
  const [mounted, setMounted] = useState(false)
  const [tab, setTab] = useState<ReplenishTab>('alerts')
  const [selected, setSelected] = useState<string[]>([])
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function toggleRow(id: string) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  const kpis = [
    { label: 'Items Below Reorder Point', value: '34', color: '#f59e0b' },
    { label: 'Pending Replenishment', value: '$42,300', color: '#e2e8f0' },
    { label: 'Auto-Orders Created Today', value: '8', color: '#e2e8f0' },
    { label: 'Transfer Orders Pending', value: '3', color: '#e2e8f0' },
    { label: 'Last Rules Run', value: '6:00 AM', color: '#94a3b8' },
  ]

  const TABS: { id: ReplenishTab; label: string }[] = [
    { id: 'alerts', label: 'Replenishment Alerts' },
    { id: 'rules', label: 'Rules' },
    { id: 'history', label: 'Order History' },
  ]

  const actions = (
    <>
      <button onClick={() => showToast('Creating replenishment order…')} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors">
        <PlusIcon /> Create Replenishment Order
      </button>
      <button onClick={() => showToast('Running replenishment rules…')} className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(99,102,241,0.3)] px-3 py-1.5 text-xs font-medium text-[#e2e8f0] hover:bg-[#16213e] transition-colors">
        Run Rules
      </button>
      <button onClick={() => showToast('Transfer order wizard opened')} className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(99,102,241,0.3)] px-3 py-1.5 text-xs font-medium text-[#e2e8f0] hover:bg-[#16213e] transition-colors">
        Transfer
      </button>
    </>
  )

  if (!mounted) return null

  return (
    <>
      <TopBar
        title="Replenishment"
        breadcrumb={[{ label: 'Retail', href: '/retail' }]}
        actions={actions}
      />

      {showModal && <NewRuleModal onClose={() => setShowModal(false)} />}

      {toast && (
        <div className="fixed top-16 right-6 z-50 rounded-lg border border-[rgba(99,102,241,0.3)] bg-[#16213e] px-4 py-2.5 text-xs text-[#e2e8f0] shadow-xl">
          {toast}
        </div>
      )}

      <main className="flex-1 overflow-auto p-6 space-y-6" style={{ background: '#0d0e24', minHeight: '100dvh' }}>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {kpis.map(k => (
            <div key={k.label} className="rounded-xl border p-4" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
              <p className="text-[11px] font-medium uppercase tracking-wider text-[#94a3b8] mb-2">{k.label}</p>
              <p className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-1 rounded-xl border p-1" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)', width: 'fit-content' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="rounded-lg px-4 py-2 text-xs font-medium transition-colors"
              style={{
                background: tab === t.id ? '#6366f1' : 'transparent',
                color: tab === t.id ? '#fff' : '#94a3b8',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ALERTS TAB */}
        {tab === 'alerts' && (
          <div className="rounded-xl border overflow-hidden" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(99,102,241,0.15)' }}>
              <h2 className="text-sm font-semibold text-[#e2e8f0]">Replenishment Alerts <span className="ml-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-400">{ALERTS.length}</span></h2>
              <button
                onClick={() => showToast(`Creating ${selected.length > 0 ? selected.length : 'all'} purchase orders…`)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                <PlusIcon /> Create All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: 'rgba(99,102,241,0.06)' }}>
                    <th className="w-10 px-4 py-3"></th>
                    {['Item', 'Store', 'On Hand', 'Reorder Point', 'Suggested Qty', 'Replenishment Source', 'Est. Cost', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-semibold uppercase tracking-wider text-[#94a3b8]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ALERTS.map(row => (
                    <tr key={row.id} onClick={() => toggleRow(row.id)} className="border-t cursor-pointer transition-colors hover:bg-[rgba(99,102,241,0.05)]" style={{ borderColor: 'rgba(99,102,241,0.08)', background: selected.includes(row.id) ? 'rgba(99,102,241,0.08)' : 'transparent' }}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggleRow(row.id)} onClick={e => e.stopPropagation()} className="accent-indigo-500 w-3 h-3" />
                      </td>
                      <td className="px-4 py-3 font-medium text-[#e2e8f0]">{row.item}</td>
                      <td className="px-4 py-3 text-[#94a3b8]">{row.store}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-red-400">{row.onHand}</span>
                        <span className="text-[#94a3b8]"> units</span>
                      </td>
                      <td className="px-4 py-3 text-[#94a3b8]">{row.reorderPoint} units</td>
                      <td className="px-4 py-3 text-[#e2e8f0] font-semibold">{row.suggestedQty} units</td>
                      <td className="px-4 py-3 text-[#94a3b8]">{row.source}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-400">{row.estCost}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                          {row.actions.includes('po') && (
                            <button onClick={() => showToast(`PO created for ${row.item}`)} className="rounded-md bg-indigo-600/80 px-2 py-1 text-[10px] font-semibold text-white hover:bg-indigo-500 transition-colors whitespace-nowrap">
                              Create PO
                            </button>
                          )}
                          {row.actions.includes('transfer') && (
                            <button onClick={() => showToast(`Transfer order created for ${row.item}`)} className="rounded-md border px-2 py-1 text-[10px] font-medium text-[#94a3b8] hover:text-[#e2e8f0] transition-colors whitespace-nowrap" style={{ borderColor: 'rgba(99,102,241,0.2)' }}>
                              Transfer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* RULES TAB */}
        {tab === 'rules' && (
          <div className="rounded-xl border overflow-hidden" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(99,102,241,0.15)' }}>
              <h2 className="text-sm font-semibold text-[#e2e8f0]">Replenishment Rules</h2>
              <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors">
                <PlusIcon /> New Rule
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: 'rgba(99,102,241,0.06)' }}>
                    {['Rule Name', 'Item / Category', 'Store / Warehouse', 'Min Qty', 'Max Qty', 'Reorder Point', 'Lead Time', 'Method', 'Active'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-semibold uppercase tracking-wider text-[#94a3b8]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RULES.map(rule => {
                    const methodColor =
                      rule.method === 'Auto PO' ? 'bg-indigo-500/15 text-indigo-400' :
                      rule.method === 'Auto Transfer' ? 'bg-emerald-500/15 text-emerald-400' :
                      'bg-zinc-700/60 text-zinc-400'
                    return (
                      <tr key={rule.id} className="border-t transition-colors hover:bg-[rgba(99,102,241,0.05)]" style={{ borderColor: 'rgba(99,102,241,0.08)' }}>
                        <td className="px-4 py-3 font-mono font-medium text-[#e2e8f0]">{rule.name}</td>
                        <td className="px-4 py-3 text-[#94a3b8]">{rule.itemCategory}</td>
                        <td className="px-4 py-3 text-[#94a3b8]">{rule.location}</td>
                        <td className="px-4 py-3 text-[#e2e8f0]">{rule.minQty.toLocaleString()}</td>
                        <td className="px-4 py-3 text-[#e2e8f0]">{rule.maxQty.toLocaleString()}</td>
                        <td className="px-4 py-3 text-[#e2e8f0]">{rule.reorderPoint.toLocaleString()}</td>
                        <td className="px-4 py-3 text-[#94a3b8]">{rule.leadTime}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${methodColor}`}>{rule.method}</span>
                        </td>
                        <td className="px-4 py-3">
                          {rule.active
                            ? <span className="inline-flex items-center gap-1 text-emerald-400"><CheckIcon /> Active</span>
                            : <span className="text-[#94a3b8]">Inactive</span>
                          }
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === 'history' && (
          <div className="rounded-xl border overflow-hidden" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(99,102,241,0.15)' }}>
              <h2 className="text-sm font-semibold text-[#e2e8f0]">Order History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: 'rgba(99,102,241,0.06)' }}>
                    {['Order #', 'Type', 'Item', 'Store', 'Qty', 'Status', 'Created', 'Received'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-semibold uppercase tracking-wider text-[#94a3b8]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HISTORY.map(row => (
                    <tr key={row.id} className="border-t transition-colors hover:bg-[rgba(99,102,241,0.05)]" style={{ borderColor: 'rgba(99,102,241,0.08)' }}>
                      <td className="px-4 py-3 font-mono text-indigo-400">{row.orderNum}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${row.type === 'PO' ? 'bg-indigo-500/15 text-indigo-400' : 'bg-amber-500/15 text-amber-400'}`}>{row.type}</span>
                      </td>
                      <td className="px-4 py-3 text-[#e2e8f0]">{row.item}</td>
                      <td className="px-4 py-3 text-[#94a3b8]">{row.store}</td>
                      <td className="px-4 py-3 text-[#e2e8f0]">{row.qty.toLocaleString()}</td>
                      <td className="px-4 py-3"><OrderStatusChip status={row.status} /></td>
                      <td className="px-4 py-3 text-[#94a3b8]">{row.created}</td>
                      <td className="px-4 py-3 text-[#94a3b8]">{row.received}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </>
  )
}
