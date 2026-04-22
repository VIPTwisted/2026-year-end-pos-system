'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ─── Types ───────────────────────────────────────────────────────────────────

type POStatus = 'Expected' | 'In Progress' | 'Complete' | 'Exception'
type ReceiptStatus = 'Posted' | 'Draft' | 'Voided'
type LineCondition = 'Acceptable' | 'Damaged' | 'Rejected'

interface ExpectedPO {
  id: string
  poNo: string
  vendor: string
  expectedDate: string
  items: number
  expectedUnits: number | null
  status: POStatus
  buyer: string
}

interface ReceiptLine {
  line: number
  item: string
  sku: string
  description: string
  qtyOrdered: number
  previouslyReceived: number
  qtyThisReceipt: number
  unitCost: number
  condition: LineCondition
  notes: string
}

interface ReceiptHistory {
  id: string
  receiptNo: string
  date: string
  poNo: string
  vendor: string
  items: number
  units: number
  totalCost: number
  postedBy: string
  status: ReceiptStatus
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const WAREHOUSE_LOCATIONS = [
  'Main Warehouse', 'Main Warehouse — Zone A', 'Main Warehouse — Zone B',
  'Main Warehouse — Bin 01-A', 'Main Warehouse — Bin 02-B',
  'East Warehouse', 'East Warehouse — Receiving Dock',
]

const EXPECTED_POS: ExpectedPO[] = [
  { id: 'po1202', poNo: 'PO-2026-1202', vendor: 'Fabrikam Electronics', expectedDate: 'Apr 24', items: 5, expectedUnits: 120, status: 'Expected', buyer: 'Sarah Chen' },
  { id: 'po1203', poNo: 'PO-2026-1203', vendor: 'City Power & Light', expectedDate: 'Apr 30', items: 1, expectedUnits: null, status: 'Expected', buyer: 'Mike Johnson' },
  { id: 'po1206', poNo: 'PO-2026-1206', vendor: 'Global Imports LLC', expectedDate: 'Apr 23', items: 12, expectedUnits: 450, status: 'In Progress', buyer: 'Alice Brown' },
  { id: 'po1207', poNo: 'PO-2026-1207', vendor: 'Northwind Traders', expectedDate: 'Apr 25', items: 8, expectedUnits: 320, status: 'Expected', buyer: 'Carlos M.' },
  { id: 'po1208', poNo: 'PO-2026-1208', vendor: 'Wide World Importers', expectedDate: 'Apr 26', items: 3, expectedUnits: 75, status: 'Expected', buyer: 'Sarah Chen' },
  { id: 'po1209', poNo: 'PO-2026-1209', vendor: 'Adventure Works', expectedDate: 'Apr 27', items: 15, expectedUnits: 600, status: 'Expected', buyer: 'Tom Reed' },
  { id: 'po1210', poNo: 'PO-2026-1210', vendor: 'Contoso Supplies', expectedDate: 'Apr 29', items: 6, expectedUnits: 180, status: 'Expected', buyer: 'Mike Johnson' },
  { id: 'po1211', poNo: 'PO-2026-1211', vendor: 'Fabrikam Electronics', expectedDate: 'May 2', items: 4, expectedUnits: 96, status: 'Expected', buyer: 'Alice Brown' },
]

const ACTIVE_PO_LINES: ReceiptLine[] = [
  { line: 1, item: '5000', sku: 'WGT-PREM-A', description: 'Widget Premium Grade A', qtyOrdered: 100, previouslyReceived: 0, qtyThisReceipt: 100, unitCost: 12.50, condition: 'Acceptable', notes: '' },
  { line: 2, item: '5001', sku: 'WGT-PREM-B', description: 'Widget Premium Grade B', qtyOrdered: 80, previouslyReceived: 0, qtyThisReceipt: 80, unitCost: 9.75, condition: 'Acceptable', notes: '' },
  { line: 3, item: '5002', sku: 'MTR-HSNG-LG', description: 'Motor Housing Large', qtyOrdered: 24, previouslyReceived: 0, qtyThisReceipt: 24, unitCost: 45.00, condition: 'Acceptable', notes: '' },
  { line: 4, item: '5003', sku: 'CTL-PNL-STD', description: 'Control Panel Standard', qtyOrdered: 16, previouslyReceived: 0, qtyThisReceipt: 14, unitCost: 120.00, condition: 'Damaged', notes: 'Box corner crushed, 2 units appear cracked' },
  { line: 5, item: '5004', sku: 'CBL-PWR-3M', description: 'Power Cable 3m', qtyOrdered: 50, previouslyReceived: 20, qtyThisReceipt: 30, unitCost: 8.25, condition: 'Acceptable', notes: '' },
  { line: 6, item: '5005', sku: 'FLT-AIR-H60', description: 'Air Filter H60 Commercial', qtyOrdered: 40, previouslyReceived: 0, qtyThisReceipt: 40, unitCost: 22.00, condition: 'Acceptable', notes: '' },
  { line: 7, item: '5006', sku: 'SNS-TEMP-X2', description: 'Temp Sensor X2 Series', qtyOrdered: 30, previouslyReceived: 0, qtyThisReceipt: 30, unitCost: 35.00, condition: 'Acceptable', notes: '' },
  { line: 8, item: '5007', sku: 'VLV-GATE-3IN', description: 'Gate Valve 3" Industrial', qtyOrdered: 12, previouslyReceived: 0, qtyThisReceipt: 0, unitCost: 185.00, condition: 'Rejected', notes: 'Wrong specification — gate valves are 2" not 3"' },
  { line: 9, item: '5008', sku: 'BRG-RLR-6200', description: 'Roller Bearing 6200', qtyOrdered: 200, previouslyReceived: 0, qtyThisReceipt: 200, unitCost: 3.50, condition: 'Acceptable', notes: '' },
  { line: 10, item: '5009', sku: 'SEAL-ORNG-50', description: 'O-Ring Seal Set 50pc', qtyOrdered: 60, previouslyReceived: 0, qtyThisReceipt: 60, unitCost: 14.00, condition: 'Acceptable', notes: '' },
  { line: 11, item: '5010', sku: 'GRK-NPRN-100', description: 'Neoprene Gasket 100mm', qtyOrdered: 80, previouslyReceived: 0, qtyThisReceipt: 80, unitCost: 6.75, condition: 'Acceptable', notes: '' },
  { line: 12, item: '5011', sku: 'MTR-STEP-NEMA', description: 'Stepper Motor NEMA 23', qtyOrdered: 20, previouslyReceived: 0, qtyThisReceipt: 20, unitCost: 65.00, condition: 'Acceptable', notes: '' },
]

const RECEIPT_HISTORY: ReceiptHistory[] = [
  { id: 'rc1', receiptNo: 'RC-2026-0890', date: 'Apr 21', poNo: 'PO-2026-1200', vendor: 'Northwind Traders', items: 6, units: 240, totalCost: 8450.00, postedBy: 'Sarah Chen', status: 'Posted' },
  { id: 'rc2', receiptNo: 'RC-2026-0889', date: 'Apr 20', poNo: 'PO-2026-1198', vendor: 'Adventure Works', items: 3, units: 90, totalCost: 3200.00, postedBy: 'Tom Reed', status: 'Posted' },
  { id: 'rc3', receiptNo: 'RC-2026-0888', date: 'Apr 19', poNo: 'PO-2026-1195', vendor: 'Fabrikam Electronics', items: 8, units: 320, totalCost: 12750.00, postedBy: 'Alice Brown', status: 'Posted' },
  { id: 'rc4', receiptNo: 'RC-2026-0887', date: 'Apr 18', poNo: 'PO-2026-1192', vendor: 'Wide World Importers', items: 4, units: 160, totalCost: 5840.00, postedBy: 'Carlos M.', status: 'Posted' },
  { id: 'rc5', receiptNo: 'RC-2026-0886', date: 'Apr 17', poNo: 'PO-2026-1190', vendor: 'Contoso Supplies', items: 10, units: 450, totalCost: 18200.00, postedBy: 'Mike Johnson', status: 'Posted' },
  { id: 'rc6', receiptNo: 'RC-2026-0885', date: 'Apr 16', poNo: 'PO-2026-1188', vendor: 'Northwind Traders', items: 5, units: 200, totalCost: 7650.00, postedBy: 'Sarah Chen', status: 'Posted' },
  { id: 'rc7', receiptNo: 'RC-2026-0884', date: 'Apr 15', poNo: 'PO-2026-1185', vendor: 'Global Imports LLC', items: 7, units: 280, totalCost: 9900.00, postedBy: 'Alice Brown', status: 'Posted' },
  { id: 'rc8', receiptNo: 'RC-2026-0883', date: 'Apr 14', poNo: 'PO-2026-1182', vendor: 'Adventure Works', items: 2, units: 60, totalCost: 2450.00, postedBy: 'Tom Reed', status: 'Posted' },
  { id: 'rc9', receiptNo: 'RC-2026-0882', date: 'Apr 12', poNo: 'PO-2026-1180', vendor: 'Fabrikam Electronics', items: 9, units: 360, totalCost: 14300.00, postedBy: 'Mike Johnson', status: 'Posted' },
  { id: 'rc10', receiptNo: 'RC-2026-0881', date: 'Apr 11', poNo: 'PO-2026-1178', vendor: 'Contoso Supplies', items: 3, units: 120, totalCost: 4200.00, postedBy: 'Carlos M.', status: 'Voided' },
]

// ─── Status helpers ───────────────────────────────────────────────────────────

function poStatusChip(status: POStatus) {
  const cfg: Record<POStatus, { bg: string; text: string; pulse?: boolean }> = {
    Expected: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa' },
    'In Progress': { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', pulse: true },
    Complete: { bg: 'rgba(16,185,129,0.15)', text: '#34d399' },
    Exception: { bg: 'rgba(239,68,68,0.15)', text: '#f87171' },
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

function conditionStyle(condition: LineCondition) {
  if (condition === 'Damaged') return { rowBg: 'rgba(245,158,11,0.04)', inputBorder: 'rgba(245,158,11,0.3)', textColor: '#fbbf24' }
  if (condition === 'Rejected') return { rowBg: 'rgba(239,68,68,0.04)', inputBorder: 'rgba(239,68,68,0.3)', textColor: '#f87171' }
  return { rowBg: 'transparent', inputBorder: 'rgba(99,102,241,0.15)', textColor: '#e2e8f0' }
}

// ─── Post Confirmation Dialog ─────────────────────────────────────────────────

function PostConfirmDialog({ lines, location, onClose }: { lines: ReceiptLine[]; location: string; onClose: () => void }) {
  const accepted = lines.filter(l => l.condition === 'Acceptable')
  const damaged = lines.filter(l => l.condition === 'Damaged')
  const rejected = lines.filter(l => l.condition === 'Rejected')
  const totalUnits = accepted.reduce((s, l) => s + l.qtyThisReceipt, 0)
  const totalCost = lines.reduce((s, l) => s + (l.qtyThisReceipt * l.unitCost), 0)
  const [addLandedCost, setAddLandedCost] = useState(false)
  const [freight, setFreight] = useState('')
  const [duties, setDuties] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-md rounded-xl shadow-2xl" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
          <h2 className="text-[15px] font-semibold" style={{ color: '#e2e8f0' }}>Confirm Receipt Post</h2>
          <button onClick={onClose} style={{ color: '#94a3b8' }} className="hover:text-white text-lg">✕</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="rounded-lg p-4 space-y-2" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)' }}>
            <div className="text-[12px] font-semibold" style={{ color: '#34d399' }}>Inventory will be updated:</div>
            <div className="text-[13px]" style={{ color: '#e2e8f0' }}>+{totalUnits} units → On Hand at {location || 'Main Warehouse'}</div>
            <div className="text-[12px]" style={{ color: '#94a3b8' }}>PO-2026-1206 → Partial Receipt (RC-2026-0891)</div>
          </div>
          {(damaged.length > 0 || rejected.length > 0) && (
            <div className="rounded-lg p-4 space-y-1.5" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <div className="text-[12px] font-semibold" style={{ color: '#fbbf24' }}>Exception Items:</div>
              {damaged.length > 0 && <div className="text-[12px]" style={{ color: '#e2e8f0' }}>{damaged.length} damaged line(s) — will NOT enter inventory. Vendor return created.</div>}
              {rejected.length > 0 && <div className="text-[12px]" style={{ color: '#e2e8f0' }}>{rejected.length} rejected line(s) — will NOT enter inventory. Vendor return created.</div>}
            </div>
          )}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="landedcost" checked={addLandedCost} onChange={e => setAddLandedCost(e.target.checked)} className="accent-indigo-500" />
            <label htmlFor="landedcost" className="text-[13px] cursor-pointer" style={{ color: '#94a3b8' }}>Add landed costs (freight/duties)</label>
          </div>
          {addLandedCost && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium mb-1" style={{ color: '#94a3b8' }}>Freight ($)</label>
                <input type="number" value={freight} onChange={e => setFreight(e.target.value)} placeholder="0.00"
                  className="w-full h-8 rounded px-2 text-[13px]"
                  style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }} />
              </div>
              <div>
                <label className="block text-[11px] font-medium mb-1" style={{ color: '#94a3b8' }}>Import Duties ($)</label>
                <input type="number" value={duties} onChange={e => setDuties(e.target.value)} placeholder="0.00"
                  className="w-full h-8 rounded px-2 text-[13px]"
                  style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }} />
              </div>
            </div>
          )}
          <div className="flex items-center justify-between text-[13px]">
            <span style={{ color: '#94a3b8' }}>Total receipt value</span>
            <span className="font-semibold" style={{ color: '#e2e8f0' }}>${totalCost.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid rgba(99,102,241,0.1)' }}>
          <button onClick={onClose} className="h-9 px-4 rounded text-[13px]"
            style={{ border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8' }}>Cancel</button>
          <button onClick={onClose} className="h-9 px-5 rounded text-[13px] font-medium"
            style={{ background: 'rgba(16,185,129,0.8)', color: '#fff' }}>Post Receipt</button>
        </div>
      </div>
    </div>
  )
}

// ─── Receipt Detail Drawer ────────────────────────────────────────────────────

function ReceiptDrawer({ receipt, onClose }: { receipt: ReceiptHistory; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex" onClick={onClose}>
      <div className="flex-1 bg-black/40" />
      <div className="w-[520px] h-full overflow-y-auto shadow-2xl" style={{ background: '#16213e', borderLeft: '1px solid rgba(99,102,241,0.2)' }}
        onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between px-6 py-4"
          style={{ background: '#16213e', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
          <div>
            <div className="text-[16px] font-bold" style={{ color: '#e2e8f0' }}>{receipt.receiptNo}</div>
            <div className="text-[12px] mt-0.5" style={{ color: '#94a3b8' }}>{receipt.poNo} · {receipt.vendor}</div>
          </div>
          <button onClick={onClose} style={{ color: '#94a3b8' }} className="hover:text-white text-lg">✕</button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-3 gap-3 text-[12px]">
            {[
              ['Date', receipt.date],
              ['Items', String(receipt.items)],
              ['Total Units', receipt.units.toLocaleString()],
              ['Total Cost', '$' + receipt.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })],
              ['Posted By', receipt.postedBy],
              ['Status', receipt.status],
            ].map(([k, v]) => (
              <div key={k} className="rounded p-3" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
                <div style={{ color: '#64748b' }}>{k}</div>
                <div className="font-semibold mt-0.5" style={{ color: '#e2e8f0' }}>{v}</div>
              </div>
            ))}
          </div>
          <div className="rounded p-4 text-center" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
            <p className="text-[12px]" style={{ color: '#64748b' }}>Detailed line items available after full integration</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ['All', 'Expected', 'In Progress', 'Complete', 'Exception'] as const

export default function ReceivingPage() {
  const [expectedPOs, setExpectedPOs] = useState<ExpectedPO[]>([])
  const [receiptHistory, setReceiptHistory] = useState<ReceiptHistory[]>([])
  const [receiptLines, setReceiptLines] = useState<ReceiptLine[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterSearch, setFilterSearch] = useState('')
  const [filterPO, setFilterPO] = useState('')
  const [filterVendor, setFilterVendor] = useState('')
  const [activePO, setActivePO] = useState<ExpectedPO | null>(null)
  const [receiptNo] = useState('RC-2026-0891')
  const [receiptDate, setReceiptDate] = useState('2026-04-22')
  const [deliveryNote, setDeliveryNote] = useState('')
  const [carrier, setCarrier] = useState('')
  const [warehouseLocation, setWarehouseLocation] = useState('Main Warehouse')
  const [receiptNotes, setReceiptNotes] = useState('')
  const [showPostConfirm, setShowPostConfirm] = useState(false)
  const [historyDrawer, setHistoryDrawer] = useState<ReceiptHistory | null>(null)

  useEffect(() => {
    fetch('/api/procurement/receiving')
      .then(r => r.json())
      .then(d => {
        setExpectedPOs(d.expectedPOs?.length ? d.expectedPOs : EXPECTED_POS)
        setReceiptHistory(d.receiptHistory?.length ? d.receiptHistory : RECEIPT_HISTORY)
        setReceiptLines(d.receiptLines?.length ? d.receiptLines : ACTIVE_PO_LINES)
        setActivePO(d.expectedPOs?.[2] ?? EXPECTED_POS[2])
        setLoading(false)
      })
      .catch(() => {
        setExpectedPOs(EXPECTED_POS)
        setReceiptHistory(RECEIPT_HISTORY)
        setReceiptLines(ACTIVE_PO_LINES)
        setActivePO(EXPECTED_POS[2])
        setLoading(false)
      })
  }, [])

  function updateLine(i: number, k: keyof ReceiptLine, v: string | number) {
    setReceiptLines(l => l.map((x, idx) => idx === i ? { ...x, [k]: v } : x))
  }

  const filteredPOs = expectedPOs
    .filter(p => filterStatus === 'All' || p.status === filterStatus)
    .filter(p => !filterPO || p.poNo.toLowerCase().includes(filterPO.toLowerCase()))
    .filter(p => !filterVendor || p.vendor.toLowerCase().includes(filterVendor.toLowerCase()))
    .filter(p => !filterSearch || p.poNo.toLowerCase().includes(filterSearch.toLowerCase()) || p.vendor.toLowerCase().includes(filterSearch.toLowerCase()))

  const totalUnits = receiptLines.filter(l => l.condition !== 'Rejected').reduce((s, l) => s + l.qtyThisReceipt, 0)
  const totalCost = receiptLines.reduce((s, l) => s + (l.qtyThisReceipt * l.unitCost), 0)

  return (
    <>
      <TopBar
        title="Receiving"
        breadcrumb={[{ label: 'Procurement', href: '/procurement' }]}
        actions={
          <>
            <button className="h-8 px-4 rounded text-[13px] font-medium"
              style={{ background: 'rgba(99,102,241,0.8)', color: '#fff' }}>New Receipt</button>
            <button className="h-8 px-3 rounded text-[13px]"
              style={{ border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8' }}>Return to Vendor</button>
          </>
        }
      />

      <main className="flex-1 overflow-auto" style={{ background: '#0d0e24', minHeight: '100dvh' }}>
        <div className="px-6 py-5 space-y-5">

          {/* Filter bar */}
          <div className="flex flex-wrap gap-3">
            <input placeholder="Receipt # / Search…" value={filterSearch} onChange={e => setFilterSearch(e.target.value)}
              className="h-8 rounded px-3 text-[13px] w-44"
              style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', color: '#e2e8f0' }} />
            <input placeholder="PO #…" value={filterPO} onChange={e => setFilterPO(e.target.value)}
              className="h-8 rounded px-3 text-[13px] w-36"
              style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', color: '#e2e8f0' }} />
            <input placeholder="Vendor…" value={filterVendor} onChange={e => setFilterVendor(e.target.value)}
              className="h-8 rounded px-3 text-[13px] w-40"
              style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', color: '#e2e8f0' }} />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="h-8 rounded px-3 text-[13px]"
              style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)', color: '#e2e8f0' }}>
              {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Expected Receipts */}
          <div className="rounded-xl overflow-hidden" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}>
            <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
              <span className="text-[13px] font-semibold" style={{ color: '#e2e8f0' }}>Expected Receipts</span>
              <span className="ml-auto text-[12px]" style={{ color: '#64748b' }}>{filteredPOs.length} POs pending</span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(99,102,241,0.2)', borderTopColor: '#818cf8' }} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                      {['PO #', 'Vendor', 'Expected Date', 'Items', 'Expected Units', 'Status', 'Buyer', ''].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPOs.map(po => {
                      const isInProgress = po.status === 'In Progress'
                      return (
                        <tr key={po.id} className="cursor-pointer hover:bg-indigo-500/5 transition-colors"
                          style={{
                            borderBottom: '1px solid rgba(99,102,241,0.07)',
                            borderLeft: isInProgress ? '2px solid rgba(245,158,11,0.6)' : '2px solid transparent',
                          }}
                          onClick={() => setActivePO(po)}>
                          <td className="px-4 py-3 font-mono text-[13px] font-semibold" style={{ color: '#818cf8' }}>{po.poNo}</td>
                          <td className="px-4 py-3 text-[13px]" style={{ color: '#e2e8f0' }}>{po.vendor}</td>
                          <td className="px-4 py-3 text-[13px]" style={{ color: '#94a3b8' }}>{po.expectedDate}</td>
                          <td className="px-4 py-3 text-[13px] tabular-nums text-right" style={{ color: '#94a3b8' }}>{po.items}</td>
                          <td className="px-4 py-3 text-[13px] tabular-nums text-right" style={{ color: '#e2e8f0' }}>
                            {po.expectedUnits !== null ? po.expectedUnits.toLocaleString() : 'N/A'}
                          </td>
                          <td className="px-4 py-3">{poStatusChip(po.status)}</td>
                          <td className="px-4 py-3 text-[13px]" style={{ color: '#94a3b8' }}>{po.buyer}</td>
                          <td className="px-4 py-3">
                            <button className="text-[11px] px-2 py-0.5 rounded"
                              style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}
                              onClick={e => { e.stopPropagation(); setActivePO(po) }}>
                              Receive
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Receive Against PO */}
          {activePO && (
            <details open className="rounded-xl overflow-hidden" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}>
              <summary className="flex items-center gap-3 px-5 py-3 cursor-pointer select-none"
                style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                <span className="text-[13px] font-semibold" style={{ color: '#e2e8f0' }}>
                  Receiving — {activePO.poNo} — {activePO.vendor}
                </span>
                {poStatusChip(activePO.status)}
              </summary>
              <div className="px-5 py-4 space-y-5">

                {/* PO meta */}
                <div className="grid grid-cols-4 gap-3 text-[12px]">
                  {[
                    ['PO Date', 'Apr 8'],
                    ['Delivery Date', activePO.expectedDate],
                    ['Buyer', activePO.buyer],
                    ['Terms', 'Net 30'],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded p-3" style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
                      <div style={{ color: '#64748b' }}>{k}</div>
                      <div className="font-semibold mt-0.5" style={{ color: '#e2e8f0' }}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Receipt header fields */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium mb-1" style={{ color: '#94a3b8' }}>Receipt #</label>
                    <input readOnly value={receiptNo}
                      className="w-full h-8 rounded px-3 text-[13px] font-mono"
                      style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)', color: '#818cf8' }} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium mb-1" style={{ color: '#94a3b8' }}>Receipt Date</label>
                    <input type="date" value={receiptDate} onChange={e => setReceiptDate(e.target.value)}
                      className="w-full h-8 rounded px-3 text-[13px]"
                      style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium mb-1" style={{ color: '#94a3b8' }}>Delivery Note #</label>
                    <input value={deliveryNote} onChange={e => setDeliveryNote(e.target.value)} placeholder="Optional"
                      className="w-full h-8 rounded px-3 text-[13px]"
                      style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium mb-1" style={{ color: '#94a3b8' }}>Carrier</label>
                    <input value={carrier} onChange={e => setCarrier(e.target.value)} placeholder="Optional"
                      className="w-full h-8 rounded px-3 text-[13px]"
                      style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium mb-1" style={{ color: '#94a3b8' }}>Warehouse Location</label>
                    <select value={warehouseLocation} onChange={e => setWarehouseLocation(e.target.value)}
                      className="w-full h-8 rounded px-3 text-[13px]"
                      style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}>
                      {WAREHOUSE_LOCATIONS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium mb-1" style={{ color: '#94a3b8' }}>Received By</label>
                    <input readOnly value="Alice Brown"
                      className="w-full h-8 rounded px-3 text-[13px]"
                      style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)', color: '#94a3b8' }} />
                  </div>
                </div>

                {/* Receipt Lines */}
                <div className="rounded overflow-hidden" style={{ border: '1px solid rgba(99,102,241,0.1)' }}>
                  <table className="w-full">
                    <thead>
                      <tr style={{ background: 'rgba(99,102,241,0.05)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                        {['Line', 'Item', 'SKU', 'Description', 'Qty Ordered', 'Prev. Recd', 'Qty This Receipt', 'Unit Cost', 'Condition'].map(h => (
                          <th key={h} className="text-left px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {receiptLines.map((ln, i) => {
                        const cs = conditionStyle(ln.condition)
                        return (
                          <>
                            <tr key={i} style={{ borderBottom: ln.condition !== 'Acceptable' ? '0' : '1px solid rgba(99,102,241,0.06)', background: cs.rowBg }}>
                              <td className="px-3 py-2.5 text-[12px]" style={{ color: '#64748b' }}>{ln.line}</td>
                              <td className="px-3 py-2.5 font-mono text-[12px]" style={{ color: '#818cf8' }}>{ln.item}</td>
                              <td className="px-3 py-2.5 font-mono text-[11px]" style={{ color: '#64748b' }}>{ln.sku}</td>
                              <td className="px-3 py-2.5 text-[13px]" style={{ color: '#e2e8f0' }}>{ln.description}</td>
                              <td className="px-3 py-2.5 text-[13px] text-right tabular-nums" style={{ color: '#94a3b8' }}>{ln.qtyOrdered}</td>
                              <td className="px-3 py-2.5 text-[13px] text-right tabular-nums" style={{ color: '#475569' }}>{ln.previouslyReceived}</td>
                              <td className="px-3 py-2.5">
                                <input type="number" min={0} max={ln.qtyOrdered - ln.previouslyReceived}
                                  value={ln.qtyThisReceipt}
                                  onChange={e => updateLine(i, 'qtyThisReceipt', Number(e.target.value))}
                                  className="w-20 h-7 rounded px-2 text-[12px] text-right"
                                  style={{ background: '#0d0e24', border: `1px solid ${cs.inputBorder}`, color: cs.textColor }} />
                              </td>
                              <td className="px-3 py-2.5 text-[13px] text-right tabular-nums" style={{ color: '#94a3b8' }}>
                                ${ln.unitCost.toFixed(2)}
                              </td>
                              <td className="px-3 py-2.5">
                                <select value={ln.condition}
                                  onChange={e => updateLine(i, 'condition', e.target.value as LineCondition)}
                                  className="h-7 rounded px-2 text-[11px] w-28"
                                  style={{ background: '#0d0e24', border: `1px solid ${cs.inputBorder}`, color: cs.textColor }}>
                                  {(['Acceptable', 'Damaged', 'Rejected'] as LineCondition[]).map(c => <option key={c}>{c}</option>)}
                                </select>
                              </td>
                            </tr>
                            {ln.condition !== 'Acceptable' && (
                              <tr key={`${i}-notes`} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)', background: cs.rowBg }}>
                                <td colSpan={2} />
                                <td colSpan={7} className="px-3 pb-2.5">
                                  <input value={ln.notes} onChange={e => updateLine(i, 'notes', e.target.value)}
                                    placeholder="Notes required for damaged/rejected items…"
                                    className="w-full h-7 rounded px-2 text-[12px]"
                                    style={{ background: '#0d0e24', border: `1px solid ${cs.inputBorder}`, color: cs.textColor }} />
                                </td>
                              </tr>
                            )}
                          </>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Totals + Notes */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <label className="block text-[11px] font-medium mb-1" style={{ color: '#94a3b8' }}>Notes</label>
                    <textarea rows={2} value={receiptNotes} onChange={e => setReceiptNotes(e.target.value)} placeholder="Optional receipt notes…"
                      className="w-full rounded px-3 py-2 text-[13px] resize-none"
                      style={{ background: '#0d0e24', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }} />
                  </div>
                  <div className="rounded-lg p-4 w-56 space-y-2" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
                    <div className="flex items-center justify-between text-[12px]">
                      <span style={{ color: '#94a3b8' }}>Total units receiving</span>
                      <span className="font-semibold" style={{ color: '#e2e8f0' }}>{totalUnits.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span style={{ color: '#94a3b8' }}>Total cost</span>
                      <span className="font-semibold" style={{ color: '#e2e8f0' }}>${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={() => setShowPostConfirm(true)}
                    className="h-9 px-6 rounded text-[13px] font-semibold"
                    style={{ background: 'rgba(16,185,129,0.8)', color: '#fff' }}>
                    Post Receipt
                  </button>
                </div>
              </div>
            </details>
          )}

          {/* Receipt History */}
          <div className="rounded-xl overflow-hidden" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}>
            <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
              <span className="text-[13px] font-semibold" style={{ color: '#e2e8f0' }}>Receipt History</span>
              <span className="ml-auto text-[12px]" style={{ color: '#64748b' }}>{receiptHistory.length} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                    {['Receipt #', 'Date', 'PO #', 'Vendor', 'Items', 'Units', 'Total Cost', 'Posted By', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#64748b' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {receiptHistory.map(r => (
                    <tr key={r.id} className="cursor-pointer hover:bg-indigo-500/5 transition-colors"
                      style={{ borderBottom: '1px solid rgba(99,102,241,0.07)' }}
                      onClick={() => setHistoryDrawer(r)}>
                      <td className="px-4 py-3 font-mono text-[13px] font-semibold" style={{ color: '#818cf8' }}>{r.receiptNo}</td>
                      <td className="px-4 py-3 text-[13px]" style={{ color: '#94a3b8' }}>{r.date}</td>
                      <td className="px-4 py-3 font-mono text-[12px]" style={{ color: '#64748b' }}>{r.poNo}</td>
                      <td className="px-4 py-3 text-[13px]" style={{ color: '#e2e8f0' }}>{r.vendor}</td>
                      <td className="px-4 py-3 text-[13px] tabular-nums text-right" style={{ color: '#94a3b8' }}>{r.items}</td>
                      <td className="px-4 py-3 text-[13px] tabular-nums text-right" style={{ color: '#e2e8f0' }}>{r.units.toLocaleString()}</td>
                      <td className="px-4 py-3 text-[13px] tabular-nums text-right" style={{ color: '#e2e8f0' }}>
                        ${r.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-[13px]" style={{ color: '#94a3b8' }}>{r.postedBy}</td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] px-2 py-0.5 rounded"
                          style={{
                            background: r.status === 'Posted' ? 'rgba(16,185,129,0.1)' : r.status === 'Voided' ? 'rgba(239,68,68,0.1)' : 'rgba(100,116,139,0.1)',
                            color: r.status === 'Posted' ? '#34d399' : r.status === 'Voided' ? '#f87171' : '#94a3b8',
                          }}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {showPostConfirm && (
        <PostConfirmDialog lines={receiptLines} location={warehouseLocation} onClose={() => setShowPostConfirm(false)} />
      )}
      {historyDrawer && <ReceiptDrawer receipt={historyDrawer} onClose={() => setHistoryDrawer(null)} />}
    </>
  )
}
