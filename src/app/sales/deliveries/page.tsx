'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import {
  Search, X, ChevronDown, ChevronUp, ArrowUpDown,
  CheckSquare, Square, ExternalLink, Truck, MapPin,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type DeliveryStatus = 'Pending' | 'Picked' | 'Shipped' | 'In Transit' | 'Delivered' | 'Exception'

interface DeliveryRow {
  id: string
  deliveryNo: string
  salesOrder: string
  customer: string
  carrier: string
  trackingNo: string
  shipDate: string
  estDelivery: string
  status: DeliveryStatus
  items: string
}

// ─── Static data ──────────────────────────────────────────────────────────────

const CARRIER_TRACK_URL: Record<string, string> = {
  'UPS Ground': 'https://www.ups.com/track?tracknum=',
  'FedEx 2Day': 'https://www.fedex.com/fedextrack/?tracknumbers=',
  'USPS Priority': 'https://tools.usps.com/go/TrackConfirmAction?tLabels=',
  'FedEx Ground': 'https://www.fedex.com/fedextrack/?tracknumbers=',
  'DHL Express': 'https://www.dhl.com/en/express/tracking.html?AWB=',
}

const ROWS: DeliveryRow[] = [
  { id: '1', deliveryNo: 'DEL-2026-0841', salesOrder: 'SO-2026-4901', customer: 'Fabrikam Inc', carrier: 'UPS Ground', trackingNo: '1Z999AA10123456784', shipDate: 'Apr 22', estDelivery: 'Apr 25', status: 'In Transit', items: '3 items' },
  { id: '2', deliveryNo: 'DEL-2026-0840', salesOrder: 'SO-2026-4899', customer: 'Contoso Ltd', carrier: 'FedEx 2Day', trackingNo: '449044304137821', shipDate: 'Apr 22', estDelivery: 'Apr 24', status: 'Shipped', items: '1 item' },
  { id: '3', deliveryNo: 'DEL-2026-0839', salesOrder: 'SO-2026-4897', customer: 'Adatum Corp', carrier: 'USPS Priority', trackingNo: '9400111899223397623910', shipDate: 'Apr 21', estDelivery: 'Apr 24', status: 'Exception', items: '2 items' },
  { id: '4', deliveryNo: 'DEL-2026-0838', salesOrder: 'SO-2026-4890', customer: 'Litware Inc', carrier: 'UPS Ground', trackingNo: '1Z999AA10123456001', shipDate: 'Apr 20', estDelivery: 'Apr 23', status: 'Delivered', items: '5 items' },
  { id: '5', deliveryNo: 'DEL-2026-0837', salesOrder: 'SO-2026-4885', customer: 'The Cannon Group', carrier: 'FedEx Ground', trackingNo: '270548910798298', shipDate: 'Apr 19', estDelivery: 'Apr 23', status: 'Delivered', items: '2 items' },
  { id: '6', deliveryNo: 'DEL-2026-0836', salesOrder: 'SO-2026-4879', customer: 'Northwind Traders', carrier: 'UPS Ground', trackingNo: '1Z999AA10123411100', shipDate: 'Apr 18', estDelivery: 'Apr 22', status: 'Delivered', items: '4 items' },
  { id: '7', deliveryNo: 'DEL-2026-0835', salesOrder: 'SO-2026-4870', customer: 'Woodgrove Bank', carrier: 'FedEx 2Day', trackingNo: '449044304100001', shipDate: 'Apr 17', estDelivery: 'Apr 19', status: 'Delivered', items: '1 item' },
  { id: '8', deliveryNo: 'DEL-2026-0834', salesOrder: 'SO-2026-4860', customer: 'Trey Research', carrier: 'DHL Express', trackingNo: '1234567890', shipDate: 'Apr 22', estDelivery: 'Apr 24', status: 'Picked', items: '3 items' },
  { id: '9', deliveryNo: 'DEL-2026-0833', salesOrder: 'SO-2026-4855', customer: 'Alpine Ski House', carrier: 'UPS Ground', trackingNo: '1Z999AA10123499900', shipDate: 'Apr 22', estDelivery: 'Apr 26', status: 'Pending', items: '2 items' },
  { id: '10', deliveryNo: 'DEL-2026-0832', salesOrder: 'SO-2026-4849', customer: 'Fabrikam Inc', carrier: 'USPS Priority', trackingNo: '9400111899223300000001', shipDate: 'Apr 21', estDelivery: 'Apr 25', status: 'In Transit', items: '1 item' },
  { id: '11', deliveryNo: 'DEL-2026-0831', salesOrder: 'SO-2026-4840', customer: 'Contoso Ltd', carrier: 'FedEx 2Day', trackingNo: '449044304190000', shipDate: 'Apr 20', estDelivery: 'Apr 22', status: 'Delivered', items: '6 items' },
  { id: '12', deliveryNo: 'DEL-2026-0830', salesOrder: 'SO-2026-4830', customer: 'Adatum Corp', carrier: 'UPS Ground', trackingNo: '1Z999AA10123488800', shipDate: 'Apr 19', estDelivery: 'Apr 22', status: 'Exception', items: '1 item' },
  { id: '13', deliveryNo: 'DEL-2026-0829', salesOrder: 'SO-2026-4820', customer: 'Litware Inc', carrier: 'FedEx Ground', trackingNo: '270548910799999', shipDate: 'Apr 18', estDelivery: 'Apr 22', status: 'Delivered', items: '3 items' },
  { id: '14', deliveryNo: 'DEL-2026-0828', salesOrder: 'SO-2026-4810', customer: 'Northwind Traders', carrier: 'DHL Express', trackingNo: '9876543210', shipDate: 'Apr 22', estDelivery: 'Apr 23', status: 'Shipped', items: '2 items' },
  { id: '15', deliveryNo: 'DEL-2026-0827', salesOrder: 'SO-2026-4800', customer: 'The Cannon Group', carrier: 'UPS Ground', trackingNo: '1Z999AA10123477700', shipDate: 'Apr 22', estDelivery: 'Apr 25', status: 'Pending', items: '4 items' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CHIP: Record<DeliveryStatus, string> = {
  Pending: 'bg-zinc-700 text-zinc-300',
  Picked: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
  Shipped: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  'In Transit': 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  Delivered: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  Exception: 'bg-red-500/20 text-red-300 border border-red-500/30',
}

// ─── KPI Tile ─────────────────────────────────────────────────────────────────

function KpiTile({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="rounded-lg px-5 py-4 flex flex-col gap-1" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.15)' }}>
      <span className="text-[11px] uppercase tracking-widest" style={{ color: '#94a3b8' }}>{label}</span>
      <span className="text-2xl font-semibold" style={{ color: accent ? '#f87171' : '#e2e8f0' }}>{value}</span>
    </div>
  )
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function DetailDrawer({ row, onClose }: { row: DeliveryRow; onClose: () => void }) {
  const trackUrl = CARRIER_TRACK_URL[row.carrier] ? `${CARRIER_TRACK_URL[row.carrier]}${row.trackingNo}` : '#'

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div
        className="w-full max-w-xl h-full overflow-y-auto flex flex-col"
        style={{ background: '#0d0e24', borderLeft: '1px solid rgba(99,102,241,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold" style={{ color: '#e2e8f0' }}>{row.deliveryNo}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${STATUS_CHIP[row.status]}`}>{row.status}</span>
            </div>
            <div className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{row.customer} · {row.salesOrder}</div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-white/5 transition-colors">
            <X className="w-4 h-4" style={{ color: '#94a3b8' }} />
          </button>
        </div>

        {/* Carrier info */}
        <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
          <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#94a3b8' }}>Carrier &amp; Tracking</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Carrier', row.carrier],
              ['Ship Date', row.shipDate + ', 2026'],
              ['Est. Delivery', row.estDelivery + ', 2026'],
              ['Items', row.items],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-[11px]" style={{ color: '#94a3b8' }}>{k}</div>
                <div className="text-sm mt-0.5" style={{ color: '#e2e8f0' }}>{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <div className="text-[11px]" style={{ color: '#94a3b8' }}>Tracking Number</div>
            <a
              href={trackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-0.5 text-sm font-mono hover:underline transition-colors"
              style={{ color: '#a5b4fc' }}
            >
              {row.trackingNo} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Shipping address */}
        <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
          <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#94a3b8' }}>Shipping Address</div>
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#94a3b8' }} />
            <div className="text-sm" style={{ color: '#e2e8f0' }}>
              <div>{row.customer}</div>
              <div style={{ color: '#94a3b8' }}>192 Fisher Road</div>
              <div style={{ color: '#94a3b8' }}>Detroit, MI 48201</div>
              <div style={{ color: '#94a3b8' }}>United States</div>
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="px-6 py-5">
          <div className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#94a3b8' }}>Line Items Shipped</div>
          <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid rgba(99,102,241,0.15)' }}>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                  {['Item No.', 'Description', 'Qty', 'Unit'].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-medium" style={{ color: '#94a3b8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
                  <td className="px-3 py-2.5 font-mono" style={{ color: '#a5b4fc' }}>1000</td>
                  <td className="px-3 py-2.5" style={{ color: '#e2e8f0' }}>Widget Assembly A100</td>
                  <td className="px-3 py-2.5" style={{ color: '#e2e8f0' }}>2</td>
                  <td className="px-3 py-2.5" style={{ color: '#94a3b8' }}>EA</td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 font-mono" style={{ color: '#a5b4fc' }}>1002</td>
                  <td className="px-3 py-2.5" style={{ color: '#e2e8f0' }}>Control Panel C300</td>
                  <td className="px-3 py-2.5" style={{ color: '#e2e8f0' }}>1</td>
                  <td className="px-3 py-2.5" style={{ color: '#94a3b8' }}>EA</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Delivery confirmation */}
          {row.status === 'Delivered' && (
            <div className="mt-4 rounded-lg px-4 py-3" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div className="text-xs font-medium" style={{ color: '#34d399' }}>Delivery Confirmed</div>
              <div className="text-xs mt-1" style={{ color: '#94a3b8' }}>Package delivered at front door. Signed by: Recipient</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DeliveriesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortCol, setSortCol] = useState<keyof DeliveryRow>('deliveryNo')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [drawerRow, setDrawerRow] = useState<DeliveryRow | null>(null)

  const statuses: DeliveryStatus[] = ['Pending', 'Picked', 'Shipped', 'In Transit', 'Delivered', 'Exception']

  function toggleSort(col: keyof DeliveryRow) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const filtered = ROWS.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !q || r.deliveryNo.toLowerCase().includes(q) || r.customer.toLowerCase().includes(q) || r.salesOrder.toLowerCase().includes(q) || r.trackingNo.includes(q)
    const matchStatus = statusFilter === 'All' || r.status === statusFilter
    return matchSearch && matchStatus
  }).sort((a, b) => {
    const av = a[sortCol]; const bv = b[sortCol]
    const cmp = String(av).localeCompare(String(bv))
    return sortDir === 'asc' ? cmp : -cmp
  })

  const allSelected = filtered.length > 0 && filtered.every(r => selected.has(r.id))
  function toggleAll() {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(filtered.map(r => r.id)))
  }

  function SortIcon({ col }: { col: keyof DeliveryRow }) {
    if (sortCol !== col) return <ArrowUpDown className="w-3 h-3 opacity-30" />
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" style={{ color: '#a5b4fc' }} /> : <ChevronDown className="w-3 h-3" style={{ color: '#a5b4fc' }} />
  }

  const actions = (
    <div className="flex items-center gap-2">
      <button className="px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors" style={{ background: 'rgba(99,102,241,0.85)', color: '#fff' }}>
        New Delivery
      </button>
      <button className="px-3.5 py-1.5 text-sm rounded-lg transition-colors hover:bg-white/5" style={{ border: '1px solid rgba(99,102,241,0.3)', color: '#e2e8f0' }}>
        Post Shipment
      </button>
      <button className="px-3.5 py-1.5 text-sm rounded-lg transition-colors hover:bg-white/5" style={{ border: '1px solid rgba(99,102,241,0.3)', color: '#e2e8f0' }}>
        Track
      </button>
    </div>
  )

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: '#0d0e24', color: '#e2e8f0' }}>
      <TopBar
        title="Deliveries"
        breadcrumb={[
          { label: 'Sales', href: '/sales' },
          { label: 'Deliveries', href: '/sales/deliveries' },
        ]}
        actions={actions}
      />

      <main className="flex-1 px-6 py-5 flex flex-col gap-5">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <KpiTile label="Pending Shipment" value="23" />
          <KpiTile label="Shipped Today" value="14" />
          <KpiTile label="In Transit" value="47" />
          <KpiTile label="Delivered" value="203" />
          <KpiTile label="Exceptions" value="3" accent />
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Delivery # · Order # · Customer · Tracking…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm rounded-lg outline-none w-72"
              style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg outline-none"
            style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.2)', color: '#e2e8f0' }}
          >
            <option value="All">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <input type="date" className="px-3 py-1.5 text-sm rounded-lg outline-none" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8' }} />
          <span className="text-xs" style={{ color: '#94a3b8' }}>to</span>
          <input type="date" className="px-3 py-1.5 text-sm rounded-lg outline-none" style={{ background: '#16213e', border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8' }} />

          {(search || statusFilter !== 'All') && (
            <button onClick={() => { setSearch(''); setStatusFilter('All') }} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
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
                  <th className="px-4 py-3 w-8">
                    <button onClick={toggleAll} className="flex items-center">
                      {allSelected
                        ? <CheckSquare className="w-3.5 h-3.5" style={{ color: '#a5b4fc' }} />
                        : <Square className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} />}
                    </button>
                  </th>
                  {([
                    ['deliveryNo', 'Delivery #'],
                    ['salesOrder', 'Sales Order'],
                    ['customer', 'Customer'],
                    ['carrier', 'Carrier'],
                    ['trackingNo', 'Tracking #'],
                    ['shipDate', 'Ship Date'],
                    ['estDelivery', 'Est. Delivery'],
                    ['status', 'Status'],
                    ['items', 'Items'],
                  ] as [keyof DeliveryRow, string][]).map(([col, label]) => (
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
                  const isException = row.status === 'Exception'
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setDrawerRow(row)}
                      className="cursor-pointer transition-colors"
                      style={{
                        background: isSelected ? 'rgba(99,102,241,0.08)' : idx % 2 === 1 ? 'rgba(255,255,255,0.015)' : 'transparent',
                        borderBottom: '1px solid rgba(99,102,241,0.08)',
                        borderLeft: isException ? '3px solid #ef4444' : '3px solid transparent',
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
                      <td className="px-3 py-3 font-mono text-xs font-medium" style={{ color: '#a5b4fc' }}>{row.deliveryNo}</td>
                      <td className="px-3 py-3 font-mono text-xs" style={{ color: '#94a3b8' }}>{row.salesOrder}</td>
                      <td className="px-3 py-3 text-xs" style={{ color: '#e2e8f0' }}>{row.customer}</td>
                      <td className="px-3 py-3 text-xs" style={{ color: '#94a3b8' }}>{row.carrier}</td>
                      <td className="px-3 py-3 font-mono text-[11px]" style={{ color: '#94a3b8' }}>
                        <a
                          href={`${CARRIER_TRACK_URL[row.carrier] || '#'}${row.trackingNo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-indigo-400 transition-colors flex items-center gap-1"
                          onClick={e => e.stopPropagation()}
                        >
                          {row.trackingNo.length > 16 ? row.trackingNo.slice(0, 16) + '…' : row.trackingNo}
                          <ExternalLink className="w-3 h-3 opacity-50" />
                        </a>
                      </td>
                      <td className="px-3 py-3 text-xs" style={{ color: '#94a3b8' }}>{row.shipDate}</td>
                      <td className="px-3 py-3 text-xs" style={{ color: '#e2e8f0' }}>{row.estDelivery}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${STATUS_CHIP[row.status]}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs" style={{ color: '#94a3b8' }}>{row.items}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {drawerRow && <DetailDrawer row={drawerRow} onClose={() => setDrawerRow(null)} />}
    </div>
  )
}
