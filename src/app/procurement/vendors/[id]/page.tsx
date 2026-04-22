'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Vendor {
  id: string
  vendorNo: string
  name: string
  group: string
  paymentTerms: string
  currency: string
  balance: number
  contactName: string
  contactPhone: string
  contactEmail: string
  buyer: string
  address: string
  city: string
  website: string
  leadTimeDays: number
  minOrderAmt: number
  taxStatus: string
  taxId: string
  w9Status: 'On File' | 'Pending' | 'Missing'
  insuranceStatus: 'Current' | 'Expired' | 'Missing'
  ytdPurchases: number
  lastYearPurchases: number
  threeYearAvg: number
  onTimeDeliveryRate: number
  qualityRating: number
  priceCompetitiveness: number
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_VENDOR: Vendor = {
  id: 'V10000',
  vendorNo: 'V10000',
  name: 'Acme Office Supplies',
  group: 'Office Supplies',
  paymentTerms: 'Net 30',
  currency: 'USD',
  balance: 4230.00,
  contactName: 'Mike Torres',
  contactPhone: '+1 555 0300',
  contactEmail: 'm.torres@acme.com',
  buyer: 'Mike Johnson',
  address: '123 Supply Drive',
  city: 'Chicago IL 60602',
  website: 'acme.com',
  leadTimeDays: 5,
  minOrderAmt: 100,
  taxStatus: 'Taxable',
  taxId: '98-7654321',
  w9Status: 'On File',
  insuranceStatus: 'Current',
  ytdPurchases: 28420,
  lastYearPurchases: 24180,
  threeYearAvg: 22410,
  onTimeDeliveryRate: 94.2,
  qualityRating: 4.6,
  priceCompetitiveness: 3.8,
}

const OPEN_POS = [
  { poNum: 'PO-2026-0441', date: 'Apr 20', amount: 1240.00, status: 'Open' },
  { poNum: 'PO-2026-0418', date: 'Apr 15', amount: 875.50, status: 'Partially Received' },
  { poNum: 'PO-2026-0392', date: 'Apr 8', amount: 2100.00, status: 'Open' },
  { poNum: 'PO-2026-0371', date: 'Apr 2', amount: 660.00, status: 'Partially Received' },
  { poNum: 'PO-2026-0350', date: 'Mar 28', amount: 450.00, status: 'Open' },
]

const OPEN_INVOICES = [
  { invoiceNum: 'INV-2026-8821', date: 'Apr 18', due: 'May 18', amount: 1240.00, status: 'Open' },
  { invoiceNum: 'INV-2026-8756', date: 'Apr 10', due: 'May 10', amount: 875.50, status: 'Open' },
  { invoiceNum: 'INV-2026-8612', date: 'Mar 25', due: 'Apr 24', amount: 660.00, status: 'Overdue' },
  { invoiceNum: 'INV-2026-8540', date: 'Mar 18', due: 'Apr 17', amount: 450.00, status: 'Overdue' },
  { invoiceNum: 'INV-2026-8401', date: 'Mar 5', due: 'Apr 4', amount: 1005.00, status: 'Partially Paid' },
]

const PAYMENT_HISTORY = [
  { paymentNum: 'PMT-2026-1102', date: 'Apr 12', amount: 2100.00, method: 'ACH' },
  { paymentNum: 'PMT-2026-1044', date: 'Mar 28', amount: 1450.00, method: 'Check' },
  { paymentNum: 'PMT-2026-0988', date: 'Mar 14', amount: 3200.00, method: 'ACH' },
  { paymentNum: 'PMT-2026-0921', date: 'Feb 28', amount: 875.00, method: 'ACH' },
  { paymentNum: 'PMT-2026-0850', date: 'Feb 14', amount: 1920.00, method: 'Check' },
]

const CONTACTS = [
  { name: 'Mike Torres', title: 'Accounts Receivable', phone: '+1 555 0300', email: 'm.torres@acme.com' },
  { name: 'Sarah Chen', title: 'Sales Representative', phone: '+1 555 0301', email: 's.chen@acme.com' },
  { name: 'Dave Willis', title: 'Shipping / Receiving', phone: '+1 555 0302', email: 'd.willis@acme.com' },
]

const RECENT_ACTIVITY = [
  { date: 'Apr 22', event: 'Invoice INV-2026-8821 received', type: 'invoice' },
  { date: 'Apr 20', event: 'PO PO-2026-0441 sent', type: 'po' },
  { date: 'Apr 12', event: 'Payment PMT-2026-1102 posted — $2,100.00', type: 'payment' },
  { date: 'Apr 10', event: 'Goods received against PO-2026-0418', type: 'receipt' },
  { date: 'Apr 8', event: 'PO PO-2026-0392 sent', type: 'po' },
]

const DELIVERY_MONTHS = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr']
const ON_TIME = [10, 9, 11, 10, 8, 12, 11, 10, 9, 11, 10, 9]
const LATE = [1, 1, 0, 1, 2, 0, 1, 0, 1, 0, 1, 1]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    'Open': { bg: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: 'rgba(99,102,241,0.3)' },
    'Partially Received': { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
    'Partially Paid': { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
    'Overdue': { bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'rgba(239,68,68,0.25)' },
    'On File': { bg: 'rgba(34,197,94,0.12)', color: '#4ade80', border: 'rgba(34,197,94,0.25)' },
    'Current': { bg: 'rgba(34,197,94,0.12)', color: '#4ade80', border: 'rgba(34,197,94,0.25)' },
    'Pending': { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
    'Expired': { bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'rgba(239,68,68,0.25)' },
  }
  const s = map[status] ?? { bg: 'rgba(148,163,184,0.1)', color: '#94a3b8', border: 'rgba(148,163,184,0.2)' }
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
      {status}
    </span>
  )
}

function fmt(n: number) { return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }

// ─── Radar Chart ─────────────────────────────────────────────────────────────

function RadarChart({ vendor }: { vendor: Vendor }) {
  const cx = 120, cy = 120, r = 80
  const axes = [
    { label: 'On-Time', value: vendor.onTimeDeliveryRate / 100 },
    { label: 'Quality', value: vendor.qualityRating / 5 },
    { label: 'Price', value: vendor.priceCompetitiveness / 5 },
    { label: 'Lead Time', value: 0.78 },
    { label: 'Compliance', value: 0.92 },
  ]
  const n = axes.length
  const angleStep = (2 * Math.PI) / n
  const startAngle = -Math.PI / 2

  const gridLevels = [0.25, 0.5, 0.75, 1.0]
  const pointsForLevel = (level: number) =>
    axes.map((_, i) => {
      const a = startAngle + i * angleStep
      return `${cx + r * level * Math.cos(a)},${cy + r * level * Math.sin(a)}`
    }).join(' ')

  const dataPoints = axes.map((ax, i) => {
    const a = startAngle + i * angleStep
    return `${cx + r * ax.value * Math.cos(a)},${cy + r * ax.value * Math.sin(a)}`
  }).join(' ')

  return (
    <svg width={240} height={240} style={{ display: 'block' }}>
      {gridLevels.map(l => (
        <polygon key={l} points={pointsForLevel(l)} fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth={1} />
      ))}
      {axes.map((_, i) => {
        const a = startAngle + i * angleStep
        return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="rgba(99,102,241,0.2)" strokeWidth={1} />
      })}
      <polygon points={dataPoints} fill="rgba(99,102,241,0.2)" stroke="rgba(99,102,241,0.8)" strokeWidth={2} />
      {axes.map((ax, i) => {
        const a = startAngle + i * angleStep
        const px = cx + (r + 16) * Math.cos(a)
        const py = cy + (r + 16) * Math.sin(a)
        return (
          <text key={i} x={px} y={py} textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize={10}>
            {ax.label}
          </text>
        )
      })}
      {axes.map((ax, i) => {
        const a = startAngle + i * angleStep
        return <circle key={i} cx={cx + r * ax.value * Math.cos(a)} cy={cy + r * ax.value * Math.sin(a)} r={4} fill="rgba(99,102,241,0.9)" />
      })}
    </svg>
  )
}

// ─── Delivery Bar Chart ───────────────────────────────────────────────────────

function DeliveryChart() {
  const maxTotal = Math.max(...ON_TIME.map((v, i) => v + LATE[i]))
  const chartH = 100, chartW = 420, barW = 26, gap = 8
  const totalBars = DELIVERY_MONTHS.length
  const groupW = barW * 2 + gap
  const totalW = totalBars * (groupW + 4)

  return (
    <svg width={Math.max(chartW, totalW + 20)} height={chartH + 40} style={{ display: 'block' }}>
      {DELIVERY_MONTHS.map((month, i) => {
        const x = 10 + i * (groupW + 4)
        const onH = (ON_TIME[i] / maxTotal) * chartH
        const lateH = (LATE[i] / maxTotal) * chartH
        return (
          <g key={i}>
            <rect x={x} y={chartH - onH} width={barW} height={onH} fill="rgba(34,197,94,0.6)" rx={2} />
            <rect x={x + barW + gap} y={chartH - lateH} width={barW} height={lateH} fill="rgba(239,68,68,0.5)" rx={2} />
            <text x={x + barW} y={chartH + 14} textAnchor="middle" fill="#94a3b8" fontSize={9}>{month}</text>
          </g>
        )
      })}
      <line x1={0} y1={chartH} x2={Math.max(chartW, totalW + 20)} y2={chartH} stroke="rgba(99,102,241,0.15)" strokeWidth={1} />
      <rect x={10} y={chartH + 22} width={10} height={8} fill="rgba(34,197,94,0.6)" rx={1} />
      <text x={24} y={chartH + 30} fill="#94a3b8" fontSize={9}>On-Time</text>
      <rect x={80} y={chartH + 22} width={10} height={8} fill="rgba(239,68,68,0.5)" rx={1} />
      <text x={94} y={chartH + 30} fill="#94a3b8" fontSize={9}>Late</text>
    </svg>
  )
}

// ─── FastTab ──────────────────────────────────────────────────────────────────

function FastTab({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ background: '#0d0e24', borderRadius: 8, border: '1px solid rgba(99,102,241,0.1)', marginBottom: 12, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
      >
        {title}
        <span style={{ fontSize: 10, color: '#94a3b8' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div style={{ padding: '0 16px 16px' }}>{children}</div>}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VendorDetailPage({ params }: { params: { id: string } }) {
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [activeTab, setActiveTab] = useState('General')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/procurement/vendors/${params.id}`)
      .then(r => r.json())
      .catch(() => ({ vendor: MOCK_VENDOR }))
      .then(d => { setVendor(d.vendor ?? MOCK_VENDOR); setLoading(false) })
  }, [params.id])

  const v = vendor ?? MOCK_VENDOR

  const thStyle: React.CSSProperties = { padding: '8px 12px', color: '#94a3b8', fontSize: 11, fontWeight: 600, textAlign: 'left', borderBottom: '1px solid rgba(99,102,241,0.1)', whiteSpace: 'nowrap' }
  const tdStyle: React.CSSProperties = { padding: '9px 12px', fontSize: 12, color: '#e2e8f0', borderBottom: '1px solid rgba(99,102,241,0.06)' }

  const TABS = ['General', 'Purchasing', 'Payments', 'Performance', 'Contact Info']

  return (
    <div style={{ minHeight: '100dvh', background: '#0d0e24', color: '#e2e8f0' }}>
      <TopBar
        title={loading ? 'Vendor Detail' : v.name}
        breadcrumb={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Vendors', href: '/procurement/vendors' },
          { label: v.name, href: `/procurement/vendors/${params.id}` },
        ]}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ background: 'rgba(99,102,241,0.85)', border: 'none', borderRadius: 6, color: '#fff', padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
            {['Transactions', 'Statistics', 'Contact'].map(a => (
              <button key={a} style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 6, color: '#a5b4fc', padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}>{a}</button>
            ))}
          </div>
        }
      />

      <div style={{ padding: '20px 28px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
        <div>
          {/* Header FactBox */}
          <div style={{ background: '#16213e', borderRadius: 10, border: '1px solid rgba(99,102,241,0.12)', padding: 20, marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
            <div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vendor</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#a5b4fc', marginBottom: 2 }}>{v.vendorNo}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 2 }}>{v.name}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{v.group}</div>
            </div>
            <div>
              <KV label="Payment Terms" value={v.paymentTerms} />
              <KV label="Currency" value={v.currency} />
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balance</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#f87171' }}>{fmt(v.balance)}</div>
              </div>
            </div>
            <div>
              <KV label="Contact" value={v.contactName} />
              <KV label="Phone" value={v.contactPhone} />
              <KV label="Email" value={v.contactEmail} />
              <KV label="Buyer" value={v.buyer} />
            </div>
          </div>

          {/* Tab Strip */}
          <div style={{ display: 'flex', gap: 2, marginBottom: 16, borderBottom: '1px solid rgba(99,102,241,0.12)', paddingBottom: 0 }}>
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '8px 16px',
                  fontSize: 13, fontWeight: activeTab === t ? 600 : 400,
                  color: activeTab === t ? '#a5b4fc' : '#94a3b8',
                  borderBottom: activeTab === t ? '2px solid rgba(99,102,241,0.8)' : '2px solid transparent',
                  marginBottom: -1,
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* General Tab */}
          {activeTab === 'General' && (
            <>
              <FastTab title="Address &amp; Contact">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <KV label="Street" value={v.address} />
                    <KV label="City / State / ZIP" value={v.city} />
                    <KV label="Phone" value={v.contactPhone} />
                    <KV label="Website" value={v.website} />
                  </div>
                  <div>
                    <KV label="Vendor Group" value={v.group} />
                    <KV label="Lead Time" value={`${v.leadTimeDays} days`} />
                    <KV label="Min Order" value={fmt(v.minOrderAmt)} />
                  </div>
                </div>
              </FastTab>
              <FastTab title="Tax &amp; Compliance">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <KV label="Tax Status" value={v.taxStatus} />
                    <KV label="Tax ID" value={v.taxId} />
                  </div>
                  <div>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>W-9 Status</div>
                      <StatusBadge status={v.w9Status} />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Insurance</div>
                      <StatusBadge status={v.insuranceStatus} />
                    </div>
                  </div>
                </div>
              </FastTab>
            </>
          )}

          {/* Purchasing Tab */}
          {activeTab === 'Purchasing' && (
            <>
              <FastTab title="Open Purchase Orders">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: 'rgba(99,102,241,0.06)' }}>
                      {['PO #', 'Date', 'Amount', 'Status'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {OPEN_POS.map(po => (
                      <tr key={po.poNum}>
                        <td style={{ ...tdStyle, color: '#a5b4fc', fontWeight: 600 }}>{po.poNum}</td>
                        <td style={tdStyle}>{po.date}</td>
                        <td style={tdStyle}>{fmt(po.amount)}</td>
                        <td style={tdStyle}><StatusBadge status={po.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </FastTab>
              <FastTab title="Purchase History">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                  {[['YTD Purchases', fmt(v.ytdPurchases)], ['Last Year', fmt(v.lastYearPurchases)], ['3-Year Avg', fmt(v.threeYearAvg)]].map(([label, val]) => (
                    <div key={label as string} style={{ background: '#16213e', borderRadius: 8, padding: '14px 16px' }}>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>{val}</div>
                    </div>
                  ))}
                </div>
              </FastTab>
            </>
          )}

          {/* Payments Tab */}
          {activeTab === 'Payments' && (
            <>
              <FastTab title="Open Invoices">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: 'rgba(99,102,241,0.06)' }}>
                      {['Invoice #', 'Date', 'Due', 'Amount', 'Status'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {OPEN_INVOICES.map(inv => (
                      <tr key={inv.invoiceNum}>
                        <td style={{ ...tdStyle, color: '#a5b4fc', fontWeight: 600 }}>{inv.invoiceNum}</td>
                        <td style={tdStyle}>{inv.date}</td>
                        <td style={{ ...tdStyle, color: inv.status === 'Overdue' ? '#f87171' : '#e2e8f0' }}>{inv.due}</td>
                        <td style={tdStyle}>{fmt(inv.amount)}</td>
                        <td style={tdStyle}><StatusBadge status={inv.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </FastTab>
              <FastTab title="Payment History">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: 'rgba(99,102,241,0.06)' }}>
                      {['Payment #', 'Date', 'Amount', 'Method'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {PAYMENT_HISTORY.map(p => (
                      <tr key={p.paymentNum}>
                        <td style={{ ...tdStyle, color: '#a5b4fc', fontWeight: 600 }}>{p.paymentNum}</td>
                        <td style={tdStyle}>{p.date}</td>
                        <td style={{ ...tdStyle, color: '#4ade80' }}>{fmt(p.amount)}</td>
                        <td style={tdStyle}>{p.method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </FastTab>
            </>
          )}

          {/* Performance Tab */}
          {activeTab === 'Performance' && (
            <>
              <FastTab title="Performance Scores">
                <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24, alignItems: 'start' }}>
                  <div>
                    <RadarChart vendor={v} />
                  </div>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {[
                      { label: 'On-Time Delivery Rate', value: `${v.onTimeDeliveryRate}%`, pct: v.onTimeDeliveryRate, color: '#4ade80' },
                      { label: 'Quality Rating', value: `${v.qualityRating} / 5`, pct: v.qualityRating * 20, color: '#a5b4fc' },
                      { label: 'Price Competitiveness', value: `${v.priceCompetitiveness} / 5`, pct: v.priceCompetitiveness * 20, color: '#fbbf24' },
                    ].map(m => (
                      <div key={m.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>{m.label}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{m.value}</span>
                        </div>
                        <div style={{ height: 6, background: 'rgba(99,102,241,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${m.pct}%`, background: m.color, borderRadius: 3 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FastTab>
              <FastTab title="Delivery History (12 Months)">
                <DeliveryChart />
              </FastTab>
            </>
          )}

          {/* Contact Info Tab */}
          {activeTab === 'Contact Info' && (
            <FastTab title="Contacts">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'rgba(99,102,241,0.06)' }}>
                    {['Name', 'Title', 'Phone', 'Email'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {CONTACTS.map(c => (
                    <tr key={c.name}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{c.name}</td>
                      <td style={{ ...tdStyle, color: '#94a3b8' }}>{c.title}</td>
                      <td style={tdStyle}>{c.phone}</td>
                      <td style={{ ...tdStyle, color: '#a5b4fc' }}>{c.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </FastTab>
          )}
        </div>

        {/* FactBox Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#16213e', borderRadius: 10, border: '1px solid rgba(99,102,241,0.12)', padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vendor Statistics</div>
            <KV label="YTD Purchases" value={fmt(v.ytdPurchases)} highlight />
            <KV label="Open Orders" value="5 POs" />
            <KV label="Open Balance" value={fmt(v.balance)} highlight />
            <KV label="Last Delivery" value="Apr 20, 2026" />
            <KV label="Avg Lead Time" value={`${v.leadTimeDays} days`} />
          </div>
          <div style={{ background: '#16213e', borderRadius: 10, border: '1px solid rgba(99,102,241,0.12)', padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Activity</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {RECENT_ACTIVITY.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(99,102,241,0.6)', marginTop: 3, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, color: '#e2e8f0', lineHeight: 1.4 }}>{a.event}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{a.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function KV({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: 13, color: highlight ? '#e2e8f0' : '#cbd5e1', fontWeight: highlight ? 600 : 400 }}>{value}</div>
    </div>
  )
}
