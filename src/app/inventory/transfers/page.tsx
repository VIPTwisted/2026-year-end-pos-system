'use client'

import { useState, useEffect, useRef } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ─── Types ───────────────────────────────────────────────────────────────────

interface TransferLine {
  item: string
  sku: string
  description: string
  qtyOrdered: number
  qtyShipped: number
  qtyReceived: number
  status: 'Pending' | 'Shipped' | 'Received' | 'Partial'
}

interface TransferOrder {
  id: string
  transferNo: string
  fromLocation: string
  toLocation: string
  items: number
  totalQty: number
  status: 'Draft' | 'Confirmed' | 'In Transit' | 'Received' | 'Cancelled'
  requestedBy: string
  createdDate: string
  expectedDelivery: string
  lines: TransferLine[]
  timeline: { event: string; date: string; done: boolean }[]
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const LOCATIONS = [
  'Main Warehouse', 'East Warehouse', 'Chicago Store', 'New York Store',
  'LA Store', 'Dallas Store', 'Miami Store', 'Seattle Store',
]

const MOCK_TRANSFERS: TransferOrder[] = [
  {
    id: '1', transferNo: 'TO-2026-0101', fromLocation: 'Main Warehouse', toLocation: 'Chicago Store',
    items: 8, totalQty: 240, status: 'In Transit', requestedBy: 'Mike Johnson',
    createdDate: 'Apr 18', expectedDelivery: 'Apr 24',
    lines: [
      { item: '1000', sku: 'WGT-A100', description: 'Widget Assembly A100', qtyOrdered: 50, qtyShipped: 50, qtyReceived: 0, status: 'Shipped' },
      { item: '1001', sku: 'MTR-B200', description: 'Motor Housing B200', qtyOrdered: 30, qtyShipped: 30, qtyReceived: 0, status: 'Shipped' },
      { item: '1002', sku: 'CPL-C300', description: 'Control Panel C300', qtyOrdered: 20, qtyShipped: 20, qtyReceived: 0, status: 'Shipped' },
      { item: '1003', sku: 'BLT-M8', description: 'Standard Bolt M8 x100', qtyOrdered: 40, qtyShipped: 40, qtyReceived: 0, status: 'Shipped' },
      { item: '1004', sku: 'CBL-001', description: 'Power Cable 2m', qtyOrdered: 25, qtyShipped: 25, qtyReceived: 0, status: 'Shipped' },
      { item: '1005', sku: 'FLT-H50', description: 'Air Filter H50', qtyOrdered: 15, qtyShipped: 15, qtyReceived: 0, status: 'Shipped' },
      { item: '1006', sku: 'SNS-T100', description: 'Temp Sensor T100', qtyOrdered: 35, qtyShipped: 35, qtyReceived: 0, status: 'Shipped' },
      { item: '1007', sku: 'VLV-G200', description: 'Gate Valve G200', qtyOrdered: 25, qtyShipped: 25, qtyReceived: 0, status: 'Shipped' },
    ],
    timeline: [
      { event: 'Transfer Created', date: 'Apr 18, 10:02 AM', done: true },
      { event: 'Confirmed', date: 'Apr 18, 2:30 PM', done: true },
      { event: 'Picked', date: 'Apr 19, 9:15 AM', done: true },
      { event: 'Shipped', date: 'Apr 19, 3:45 PM', done: true },
      { event: 'Received', date: 'Pending', done: false },
    ],
  },
  {
    id: '2', transferNo: 'TO-2026-0102', fromLocation: 'Main Warehouse', toLocation: 'New York Store',
    items: 5, totalQty: 120, status: 'Confirmed', requestedBy: 'Sarah Chen',
    createdDate: 'Apr 20', expectedDelivery: 'Apr 26',
    lines: [
      { item: '2000', sku: 'CFE-BLD', description: 'Coffee Blend Premium', qtyOrdered: 40, qtyShipped: 0, qtyReceived: 0, status: 'Pending' },
      { item: '2001', sku: 'TEA-GRN', description: 'Green Tea Organic', qtyOrdered: 20, qtyShipped: 0, qtyReceived: 0, status: 'Pending' },
      { item: '2002', sku: 'SYR-VNL', description: 'Vanilla Syrup 1L', qtyOrdered: 25, qtyShipped: 0, qtyReceived: 0, status: 'Pending' },
      { item: '2003', sku: 'CUP-12Z', description: 'Paper Cup 12oz x50', qtyOrdered: 20, qtyShipped: 0, qtyReceived: 0, status: 'Pending' },
      { item: '2004', sku: 'LID-FLT', description: 'Flat Lid 12oz x50', qtyOrdered: 15, qtyShipped: 0, qtyReceived: 0, status: 'Pending' },
    ],
    timeline: [
      { event: 'Transfer Created', date: 'Apr 20, 8:10 AM', done: true },
      { event: 'Confirmed', date: 'Apr 20, 11:00 AM', done: true },
      { event: 'Picked', date: 'Pending', done: false },
      { event: 'Shipped', date: 'Pending', done: false },
      { event: 'Received', date: 'Pending', done: false },
    ],
  },
  {
    id: '3', transferNo: 'TO-2026-0103', fromLocation: 'Chicago Store', toLocation: 'LA Store',
    items: 3, totalQty: 45, status: 'Draft', requestedBy: 'Carlos M.',
    createdDate: 'Apr 21', expectedDelivery: 'Apr 28',
    lines: [
      { item: '3000', sku: 'DSP-21', description: 'Display Unit 21"', qtyOrdered: 15, qtyShipped: 0, qtyReceived: 0, status: 'Pending' },
      { item: '3001', sku: 'KBD-WRL', description: 'Wireless Keyboard', qtyOrdered: 15, qtyShipped: 0, qtyReceived: 0, status: 'Pending' },
      { item: '3002', sku: 'MSE-OPT', description: 'Optical Mouse', qtyOrdered: 15, qtyShipped: 0, qtyReceived: 0, status: 'Pending' },
    ],
    timeline: [
      { event: 'Transfer Created', date: 'Apr 21, 9:00 AM', done: true },
      { event: 'Confirmed', date: 'Pending', done: false },
      { event: 'Picked', date: 'Pending', done: false },
      { event: 'Shipped', date: 'Pending', done: false },
      { event: 'Received', date: 'Pending', done: false },
    ],
  },
  {
    id: '4', transferNo: 'TO-2026-0104', fromLocation: 'East Warehouse', toLocation: 'Dallas Store',
    items: 12, totalQty: 380, status: 'Received', requestedBy: 'Mike Johnson',
    createdDate: 'Apr 15', expectedDelivery: 'Apr 20',
    lines: [
      { item: '4000', sku: 'PRD-001', description: 'Product Alpha', qtyOrdered: 80, qtyShipped: 80, qtyReceived: 80, status: 'Received' },
      { item: '4001', sku: 'PRD-002', description: 'Product Beta', qtyOrdered: 60, qtyShipped: 60, qtyReceived: 60, status: 'Received' },
    ],
    timeline: [
      { event: 'Transfer Created', date: 'Apr 15', done: true },
      { event: 'Confirmed', date: 'Apr 15', done: true },
      { event: 'Picked', date: 'Apr 16', done: true },
      { event: 'Shipped', date: 'Apr 17', done: true },
      { event: 'Received', date: 'Apr 20', done: true },
    ],
  },
  {
    id: '5', transferNo: 'TO-2026-0105', fromLocation: 'Main Warehouse', toLocation: 'Miami Store',
    items: 6, totalQty: 200, status: 'Cancelled', requestedBy: 'Alice Chen',
    createdDate: 'Apr 10', expectedDelivery: '—',
    lines: [],
    timeline: [
      { event: 'Transfer Created', date: 'Apr 10', done: true },
      { event: 'Cancelled', date: 'Apr 11', done: true },
    ],
  },
  {
    id: '6', transferNo: 'TO-2026-0106', fromLocation: 'East Warehouse', toLocation: 'Seattle Store',
    items: 4, totalQty: 160, status: 'In Transit', requestedBy: 'Tom Reed',
    createdDate: 'Apr 17', expectedDelivery: 'Apr 23',
    lines: [],
    timeline: [
      { event: 'Transfer Created', date: 'Apr 17', done: true },
      { event: 'Confirmed', date: 'Apr 17', done: true },
      { event: 'Picked', date: 'Apr 18', done: true },
      { event: 'Shipped', date: 'Apr 18', done: true },
      { event: 'Received', date: 'Pending', done: false },
    ],
  },
  {
    id: '7', transferNo: 'TO-2026-0107', fromLocation: 'Main Warehouse', toLocation: 'Dallas Store',
    items: 9, totalQty: 300, status: 'Confirmed', requestedBy: 'Sarah Chen',
    createdDate: 'Apr 19', expectedDelivery: 'Apr 25',
    lines: [], timeline: [],
  },
  {
    id: '8', transferNo: 'TO-2026-0108', fromLocation: 'Chicago Store', toLocation: 'New York Store',
    items: 2, totalQty: 60, status: 'Draft', requestedBy: 'Alice Chen',
    createdDate: 'Apr 21', expectedDelivery: 'Apr 29',
    lines: [], timeline: [],
  },
  {
    id: '9', transferNo: 'TO-2026-0109', fromLocation: 'Main Warehouse', toLocation: 'LA Store',
    items: 7, totalQty: 175, status: 'Received', requestedBy: 'Mike Johnson',
    createdDate: 'Apr 12', expectedDelivery: 'Apr 17',
    lines: [], timeline: [],
  },
  {
    id: '10', transferNo: 'TO-2026-0110', fromLocation: 'East Warehouse', toLocation: 'Miami Store',
    items: 3, totalQty: 90, status: 'In Transit', requestedBy: 'Carlos M.',
    createdDate: 'Apr 16', expectedDelivery: 'Apr 22',
    lines: [], timeline: [],
  },
  {
    id: '11', transferNo: 'TO-2026-0111', fromLocation: 'Main Warehouse', toLocation: 'Chicago Store',
    items: 5, totalQty: 140, status: 'Confirmed', requestedBy: 'Tom Reed',
    createdDate: 'Apr 20', expectedDelivery: 'Apr 27',
    lines: [], timeline: [],
  },
  {
    id: '12', transferNo: 'TO-2026-0112', fromLocation: 'LA Store', toLocation: 'Seattle Store',
    items: 2, totalQty: 50, status: 'Draft', requestedBy: 'Sarah Chen',
    createdDate: 'Apr 21', expectedDelivery: 'Apr 30',
    lines: [], timeline: [],
  },
  {
    id: '13', transferNo: 'TO-2026-0113', fromLocation: 'Dallas Store', toLocation: 'Main Warehouse',
    items: 6, totalQty: 220, status: 'Received', requestedBy: 'Alice Chen',
    createdDate: 'Apr 8', expectedDelivery: 'Apr 13',
    lines: [], timeline: [],
  },
  {
    id: '14', transferNo: 'TO-2026-0114', fromLocation: 'East Warehouse', toLocation: 'New York Store',
    items: 10, totalQty: 400, status: 'Cancelled', requestedBy: 'Mike Johnson',
    createdDate: 'Apr 5', expectedDelivery: '—',
    lines: [], timeline: [],
  },
  {
    id: '15', transferNo: 'TO-2026-0115', fromLocation: 'Main Warehouse', toLocation: 'East Warehouse',
    items: 1, totalQty: 25, status: 'In Transit', requestedBy: 'Carlos M.',
    createdDate: 'Apr 18', expectedDelivery: 'Apr 22',
    lines: [], timeline: [],
  },
]

// ─── Status helpers ───────────────────────────────────────────────────────────

function statusChip(status: TransferOrder['status']) {
  const cfg: Record<string, { bg: string; text: string; pulse?: boolean }> = {
    Draft: { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8' },
    Confirmed: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa' },
    'In Transit': { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', pulse: true },
    Received: { bg: 'rgba(16,185,129,0.15)', text: '#34d399' },
    Cancelled: { bg: 'rgba(239,68,68,0.15)', text: '#f87171' },
  }
  const c = cfg[status] ?? cfg.Draft
  return (
    <span
      style={{ background: c.bg, color: c.text }}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
    >
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

// ─── New Transfer Modal ───────────────────────────────────────────────────────

interface AddLine { itemSearch: string; sku: string; availableQty: number; transferQty: number }

function NewTransferModal({ onClose }: { onClose: () => void }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<AddLine[]>([{ itemSearch: '', sku: '', availableQty: 0, transferQty: 0 }])

  const toOptions = LOCATIONS.filter(l => l !== from)

  function addLine() { setLines(l => [...l, { itemSearch: '', sku: '', availableQty: 0, transferQty: 0 }]) }
  function removeLine(i: number) { setLines(l => l.filter((_, idx) => idx !== i)) }
  function updateLine(i: number, k: keyof AddLine, v: string | number) {
    setLines(l => l.map((x, idx) => idx === i ? { ...x, [k]: v } : x))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-2xl rounded-xl shadow-2xl" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
          <h2 className="text-[15px] font-semibold" style={{ color: '#e2e8f0' }}>New Transfer Order</h2>
          <button onClick={onClose} style={{ color: '#94a3b8' }} className="hover:text-white text-lg">✕</button>
        </div>
        <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium mb-1" style={{ color: '#94a3b8' }}>From Location</label>
              <select value={from} onChange={e => { setFrom(e.target.value); setTo('') }}
                className="w-full h-9 rounded px-3 text-[13px]"
                style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}>
                <option value="">Select location…</option>
                {LOCATIONS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-1" style={{ color: '#94a3b8' }}>To Location</label>
              <select value={to} onChange={e => setTo(e.target.value)}
                className="w-full h-9 rounded px-3 text-[13px]"
                style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}>
                <option value="">Select location…</option>
                {toOptions.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium mb-1" style={{ color: '#94a3b8' }}>Expected Delivery Date</label>
            <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)}
              className="h-9 rounded px-3 text-[13px]"
              style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }} />
          </div>

          {/* Transfer Lines */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-semibold" style={{ color: '#e2e8f0' }}>Transfer Lines</span>
              <button onClick={addLine} className="text-[12px] px-3 py-1 rounded"
                style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>+ Add Item</button>
            </div>
            <div className="rounded overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.1)' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'rgba(99,102,241,0.05)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                    {['Item Search', 'SKU', 'Avail Qty', 'Transfer Qty', ''].map(h => (
                      <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lines.map((ln, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
                      <td className="px-3 py-2">
                        <input placeholder="Search item…" value={ln.itemSearch} onChange={e => updateLine(i, 'itemSearch', e.target.value)}
                          className="w-full h-7 rounded px-2 text-[12px]"
                          style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.15)', color: '#e2e8f0' }} />
                      </td>
                      <td className="px-3 py-2">
                        <input placeholder="SKU" value={ln.sku} onChange={e => updateLine(i, 'sku', e.target.value)}
                          className="w-24 h-7 rounded px-2 text-[12px]"
                          style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.15)', color: '#e2e8f0' }} />
                      </td>
                      <td className="px-3 py-2 text-[12px]" style={{ color: '#64748b' }}>{ln.availableQty}</td>
                      <td className="px-3 py-2">
                        <input type="number" min={0} value={ln.transferQty} onChange={e => updateLine(i, 'transferQty', Number(e.target.value))}
                          className="w-20 h-7 rounded px-2 text-[12px] text-right"
                          style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.15)', color: '#e2e8f0' }} />
                      </td>
                      <td className="px-3 py-2">
                        <button onClick={() => removeLine(i)} style={{ color: '#ef4444' }} className="hover:opacity-70 text-sm">✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium mb-1" style={{ color: '#94a3b8' }}>Notes</label>
            <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes…"
              className="w-full rounded px-3 py-2 text-[13px] resize-none"
              style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }} />
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}>
          <button onClick={onClose} className="h-9 px-4 rounded text-[13px]"
            style={{ border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8' }}>Cancel</button>
          <button className="h-9 px-5 rounded text-[13px] font-medium"
            style={{ background: 'rgba(99,102,241,0.8)', color: '#fff' }} onClick={onClose}>Create Transfer</button>
        </div>
      </div>
    </div>
  )
}

// ─── Ship Modal ───────────────────────────────────────────────────────────────

function ShipModal({ transfer, onClose }: { transfer: TransferOrder; onClose: () => void }) {
  const [shipDate, setShipDate] = useState('2026-04-22')
  const [carrier, setCarrier] = useState('')
  const [tracking, setTracking] = useState('')
  const [qtys, setQtys] = useState<Record<number, number>>(
    Object.fromEntries(transfer.lines.map((l, i) => [i, l.qtyOrdered]))
  )
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-xl rounded-xl shadow-2xl" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
          <h2 className="text-[15px] font-semibold" style={{ color: '#e2e8f0' }}>Ship Transfer Order {transfer.transferNo}</h2>
          <button onClick={onClose} style={{ color: '#94a3b8' }} className="hover:text-white text-lg">✕</button>
        </div>
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-medium mb-1" style={{ color: '#94a3b8' }}>Shipping Date</label>
              <input type="date" value={shipDate} onChange={e => setShipDate(e.target.value)}
                className="w-full h-9 rounded px-3 text-[13px]"
                style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }} />
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-1" style={{ color: '#94a3b8' }}>Carrier</label>
              <input value={carrier} onChange={e => setCarrier(e.target.value)} placeholder="UPS, FedEx…"
                className="w-full h-9 rounded px-3 text-[13px]"
                style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }} />
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-1" style={{ color: '#94a3b8' }}>Tracking #</label>
              <input value={tracking} onChange={e => setTracking(e.target.value)} placeholder="1Z9999…"
                className="w-full h-9 rounded px-3 text-[13px]"
                style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }} />
            </div>
          </div>
          {transfer.lines.length > 0 && (
            <div className="rounded overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.1)' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'rgba(99,102,241,0.05)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                    {['Description', 'Qty Ordered', 'Qty Ship'].map(h => (
                      <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transfer.lines.map((ln, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
                      <td className="px-3 py-2 text-[13px]" style={{ color: '#e2e8f0' }}>{ln.description}</td>
                      <td className="px-3 py-2 text-[13px] text-center" style={{ color: '#94a3b8' }}>{ln.qtyOrdered}</td>
                      <td className="px-3 py-2">
                        <input type="number" min={0} max={ln.qtyOrdered} value={qtys[i] ?? ln.qtyOrdered}
                          onChange={e => setQtys(q => ({ ...q, [i]: Number(e.target.value) }))}
                          className="w-20 h-7 rounded px-2 text-[12px] text-right"
                          style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.15)', color: '#e2e8f0' }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}>
          <button onClick={onClose} className="h-9 px-4 rounded text-[13px]"
            style={{ border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8' }}>Cancel</button>
          <button className="h-9 px-5 rounded text-[13px] font-medium"
            style={{ background: 'rgba(245,158,11,0.8)', color: '#fff' }} onClick={onClose}>Confirm Shipment</button>
        </div>
      </div>
    </div>
  )
}

// ─── Receive Modal ────────────────────────────────────────────────────────────

function ReceiveModal({ transfer, onClose }: { transfer: TransferOrder; onClose: () => void }) {
  const [receiveDate, setReceiveDate] = useState('2026-04-22')
  const [qtys, setQtys] = useState<Record<number, number>>(
    Object.fromEntries(transfer.lines.map((l, i) => [i, l.qtyShipped]))
  )
  const [discrepancyNotes, setDiscrepancyNotes] = useState('')
  const hasDiscrepancy = transfer.lines.some((l, i) => (qtys[i] ?? l.qtyShipped) !== l.qtyShipped)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-xl rounded-xl shadow-2xl" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
          <h2 className="text-[15px] font-semibold" style={{ color: '#e2e8f0' }}>Receive Transfer {transfer.transferNo}</h2>
          <button onClick={onClose} style={{ color: '#94a3b8' }} className="hover:text-white text-lg">✕</button>
        </div>
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-[11px] font-medium mb-1" style={{ color: '#94a3b8' }}>Date Received</label>
            <input type="date" value={receiveDate} onChange={e => setReceiveDate(e.target.value)}
              className="h-9 rounded px-3 text-[13px]"
              style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }} />
          </div>
          {transfer.lines.length > 0 && (
            <div className="rounded overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.1)' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'rgba(99,102,241,0.05)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                    {['Description', 'Qty Shipped', 'Qty Received'].map(h => (
                      <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transfer.lines.map((ln, i) => {
                    const received = qtys[i] ?? ln.qtyShipped
                    const mismatch = received !== ln.qtyShipped
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)', background: mismatch ? 'rgba(245,158,11,0.05)' : 'transparent' }}>
                        <td className="px-3 py-2 text-[13px]" style={{ color: '#e2e8f0' }}>{ln.description}</td>
                        <td className="px-3 py-2 text-[13px] text-center" style={{ color: '#94a3b8' }}>{ln.qtyShipped}</td>
                        <td className="px-3 py-2">
                          <input type="number" min={0} value={received}
                            onChange={e => setQtys(q => ({ ...q, [i]: Number(e.target.value) }))}
                            className="w-20 h-7 rounded px-2 text-[12px] text-right"
                            style={{ background: '#0d0e24', border: `1px solid ${mismatch ? 'rgba(245,158,11,0.4)' : 'rgba(99,102,241,0.15)'}`, color: mismatch ? '#fbbf24' : '#e2e8f0' }} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          {hasDiscrepancy && (
            <div>
              <label className="block text-[11px] font-medium mb-1" style={{ color: '#fbbf24' }}>Discrepancy Notes (required)</label>
              <textarea rows={2} value={discrepancyNotes} onChange={e => setDiscrepancyNotes(e.target.value)}
                placeholder="Explain quantity discrepancies…"
                className="w-full rounded px-3 py-2 text-[13px] resize-none"
                style={{ background: '#0d0e24', border: '1px solid rgba(245,158,11,0.3)', color: '#e2e8f0' }} />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}>
          <button onClick={onClose} className="h-9 px-4 rounded text-[13px]"
            style={{ border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8' }}>Cancel</button>
          <button className="h-9 px-5 rounded text-[13px] font-medium"
            style={{ background: 'rgba(16,185,129,0.8)', color: '#fff' }} onClick={onClose}>Confirm Receipt</button>
        </div>
      </div>
    </div>
  )
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function DetailDrawer({ transfer, onClose }: { transfer: TransferOrder; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex" onClick={onClose}>
      <div className="flex-1 bg-black/40" />
      <div
        className="w-[480px] h-full overflow-y-auto shadow-2xl"
        style={{ background: '#16213e', borderLeft: '1px solid rgba(99,102,241,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{ background: '#16213e', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
          <div>
            <div className="text-[16px] font-bold" style={{ color: '#e2e8f0' }}>{transfer.transferNo}</div>
            <div className="text-[12px] mt-0.5" style={{ color: '#94a3b8' }}>
              {transfer.fromLocation} → {transfer.toLocation}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {statusChip(transfer.status)}
            <button onClick={onClose} style={{ color: '#94a3b8' }} className="hover:text-white text-lg">✕</button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-5">
          {/* Meta */}
          <div className="grid grid-cols-2 gap-3 text-[12px]">
            {[
              ['Requested By', transfer.requestedBy],
              ['Created', transfer.createdDate],
              ['Expected Delivery', transfer.expectedDelivery],
              ['Total Items', String(transfer.items)],
            ].map(([k, v]) => (
              <div key={k} className="rounded p-3" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
                <div style={{ color: '#64748b' }}>{k}</div>
                <div className="font-semibold mt-0.5" style={{ color: '#e2e8f0' }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Lines */}
          {transfer.lines.length > 0 && (
            <div>
              <div className="text-[12px] font-semibold mb-2" style={{ color: '#e2e8f0' }}>Transfer Lines</div>
              <div className="rounded overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.1)' }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'rgba(99,102,241,0.05)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                      {['Item', 'SKU', 'Ordered', 'Shipped', 'Received', 'Status'].map(h => (
                        <th key={h} className="text-left px-2 py-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transfer.lines.map((ln, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
                        <td className="px-2 py-2 text-[12px]" style={{ color: '#94a3b8' }}>{ln.item}</td>
                        <td className="px-2 py-2 text-[11px] font-mono" style={{ color: '#64748b' }}>{ln.sku}</td>
                        <td className="px-2 py-2 text-[12px] text-right" style={{ color: '#e2e8f0' }}>{ln.qtyOrdered}</td>
                        <td className="px-2 py-2 text-[12px] text-right" style={{ color: '#e2e8f0' }}>{ln.qtyShipped}</td>
                        <td className="px-2 py-2 text-[12px] text-right" style={{ color: ln.qtyReceived < ln.qtyShipped ? '#fbbf24' : '#e2e8f0' }}>{ln.qtyReceived}</td>
                        <td className="px-2 py-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{
                            background: ln.status === 'Received' ? 'rgba(16,185,129,0.1)' : ln.status === 'Shipped' ? 'rgba(245,158,11,0.1)' : 'rgba(100,116,139,0.1)',
                            color: ln.status === 'Received' ? '#34d399' : ln.status === 'Shipped' ? '#fbbf24' : '#94a3b8',
                          }}>{ln.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Timeline */}
          {transfer.timeline.length > 0 && (
            <div>
              <div className="text-[12px] font-semibold mb-3" style={{ color: '#e2e8f0' }}>Timeline</div>
              <div className="relative pl-4">
                {/* Vertical line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: 'rgba(99,102,241,0.15)' }} />
                <div className="space-y-4">
                  {transfer.timeline.map((ev, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="relative z-10 w-3.5 h-3.5 rounded-full flex items-center justify-center mt-0.5 shrink-0"
                        style={{ background: ev.done ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.1)', border: `2px solid ${ev.done ? '#34d399' : 'rgba(99,102,241,0.3)'}` }}>
                        {ev.done && <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#34d399' }} />}
                      </div>
                      <div>
                        <div className="text-[13px] font-medium" style={{ color: ev.done ? '#e2e8f0' : '#475569' }}>{ev.event}</div>
                        <div className="text-[11px] mt-0.5" style={{ color: ev.done ? '#64748b' : '#334155' }}>{ev.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ['All', 'Draft', 'Confirmed', 'In Transit', 'Received', 'Cancelled'] as const

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<TransferOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [sortCol, setSortCol] = useState<keyof TransferOrder>('transferNo')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [drawer, setDrawer] = useState<TransferOrder | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [shipTarget, setShipTarget] = useState<TransferOrder | null>(null)
  const [receiveTarget, setReceiveTarget] = useState<TransferOrder | null>(null)

  useEffect(() => {
    fetch('/api/inventory/transfers')
      .then(r => r.json())
      .then(data => { setTransfers(data.length ? data : MOCK_TRANSFERS); setLoading(false) })
      .catch(() => { setTransfers(MOCK_TRANSFERS); setLoading(false) })
  }, [])

  const filtered = transfers
    .filter(t => filterStatus === 'All' || t.status === filterStatus)
    .filter(t => !filterFrom || t.fromLocation.toLowerCase().includes(filterFrom.toLowerCase()))
    .filter(t => !filterTo || t.toLocation.toLowerCase().includes(filterTo.toLowerCase()))
    .filter(t => !search || t.transferNo.toLowerCase().includes(search.toLowerCase()) ||
      t.requestedBy.toLowerCase().includes(search.toLowerCase()) ||
      t.fromLocation.toLowerCase().includes(search.toLowerCase()) ||
      t.toLocation.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const av = String(a[sortCol] ?? ''), bv = String(b[sortCol] ?? '')
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })

  function toggleSort(col: keyof TransferOrder) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(t => t.id)))
  }

  function toggleOne(id: string) {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const selectedTransfer = filtered.find(t => selected.has(t.id) && selected.size === 1)

  const sortIcon = (col: keyof TransferOrder) =>
    sortCol !== col ? ' ↕' : sortDir === 'asc' ? ' ↑' : ' ↓'

  const cols: { key: keyof TransferOrder; label: string; align?: string }[] = [
    { key: 'transferNo', label: 'Transfer #' },
    { key: 'fromLocation', label: 'From Location' },
    { key: 'toLocation', label: 'To Location' },
    { key: 'items', label: 'Items', align: 'right' },
    { key: 'totalQty', label: 'Total Qty', align: 'right' },
    { key: 'status', label: 'Status', align: 'center' },
    { key: 'requestedBy', label: 'Requested By' },
    { key: 'createdDate', label: 'Created Date' },
    { key: 'expectedDelivery', label: 'Expected Delivery' },
  ]

  return (
    <>
      <TopBar
        title="Transfer Orders"
        breadcrumb={[{ label: 'Inventory', href: '/inventory' }]}
        actions={
          <>
            <button onClick={() => setShowNew(true)} className="h-8 px-4 rounded text-[13px] font-medium"
              style={{ background: 'rgba(99,102,241,0.8)', color: '#fff' }}>New Transfer</button>
            <button
              onClick={() => { const t = transfers.find(x => x.status === 'Confirmed'); if (t) setShipTarget(t) }}
              className="h-8 px-3 rounded text-[13px]"
              style={{ border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8' }}>Ship</button>
            <button
              onClick={() => { const t = transfers.find(x => x.status === 'In Transit'); if (t) setReceiveTarget(t) }}
              className="h-8 px-3 rounded text-[13px]"
              style={{ border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8' }}>Receive</button>
            <button className="h-8 px-3 rounded text-[13px]"
              style={{ border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8' }}>Cancel</button>
          </>
        }
      />

      <main className="flex-1 overflow-auto" style={{ background: '#0d0e24', minHeight: '100dvh' }}>
        <div className="px-6 py-5 space-y-4">

          {/* Filter bar */}
          <div className="flex flex-wrap gap-3">
            <input placeholder="Transfer # / Name…" value={search} onChange={e => setSearch(e.target.value)}
              className="h-8 rounded px-3 text-[13px] w-44"
              style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', color: '#e2e8f0' }} />
            <input placeholder="From Location…" value={filterFrom} onChange={e => setFilterFrom(e.target.value)}
              className="h-8 rounded px-3 text-[13px] w-40"
              style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', color: '#e2e8f0' }} />
            <input placeholder="To Location…" value={filterTo} onChange={e => setFilterTo(e.target.value)}
              className="h-8 rounded px-3 text-[13px] w-40"
              style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', color: '#e2e8f0' }} />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="h-8 rounded px-3 text-[13px]"
              style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', color: '#e2e8f0' }}>
              {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="rounded-xl overflow-hidden" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}>
            <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
              <span className="text-[13px] font-semibold" style={{ color: '#e2e8f0' }}>Transfer Orders</span>
              <span className="ml-auto text-[12px]" style={{ color: '#64748b' }}>{filtered.length} records</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(99,102,241,0.2)', borderTopColor: '#818cf8' }} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                      <th className="px-4 py-3 w-10">
                        <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0}
                          onChange={toggleAll} className="accent-indigo-500" />
                      </th>
                      {cols.map(c => (
                        <th key={c.key}
                          className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wider cursor-pointer select-none ${c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left'}`}
                          style={{ color: '#64748b' }}
                          onClick={() => toggleSort(c.key)}>
                          {c.label}{sortIcon(c.key)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(t => {
                      const isTransit = t.status === 'In Transit'
                      return (
                        <tr key={t.id}
                          onClick={() => setDrawer(t)}
                          className="cursor-pointer transition-colors hover:bg-indigo-500/5"
                          style={{
                            borderBottom: '1px solid rgba(99,102,241,0.07)',
                            borderLeft: isTransit ? '2px solid rgba(245,158,11,0.6)' : '2px solid transparent',
                          }}>
                          <td className="px-4 py-3" onClick={e => { e.stopPropagation(); toggleOne(t.id) }}>
                            <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggleOne(t.id)} className="accent-indigo-500" />
                          </td>
                          <td className="px-4 py-3 font-mono text-[13px] font-semibold" style={{ color: '#818cf8' }}>{t.transferNo}</td>
                          <td className="px-4 py-3 text-[13px]" style={{ color: '#e2e8f0' }}>{t.fromLocation}</td>
                          <td className="px-4 py-3 text-[13px]" style={{ color: '#e2e8f0' }}>{t.toLocation}</td>
                          <td className="px-4 py-3 text-[13px] text-right tabular-nums" style={{ color: '#94a3b8' }}>{t.items}</td>
                          <td className="px-4 py-3 text-[13px] text-right tabular-nums" style={{ color: '#e2e8f0' }}>{t.totalQty.toLocaleString()}</td>
                          <td className="px-4 py-3 text-center">{statusChip(t.status)}</td>
                          <td className="px-4 py-3 text-[13px]" style={{ color: '#94a3b8' }}>{t.requestedBy}</td>
                          <td className="px-4 py-3 text-[13px]" style={{ color: '#94a3b8' }}>{t.createdDate}</td>
                          <td className="px-4 py-3 text-[13px]" style={{ color: t.expectedDelivery === '—' ? '#475569' : '#94a3b8' }}>{t.expectedDelivery}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {drawer && <DetailDrawer transfer={drawer} onClose={() => setDrawer(null)} />}
      {showNew && <NewTransferModal onClose={() => setShowNew(false)} />}
      {shipTarget && <ShipModal transfer={shipTarget} onClose={() => setShipTarget(null)} />}
      {receiveTarget && <ReceiveModal transfer={receiveTarget} onClose={() => setReceiveTarget(null)} />}
    </>
  )
}
