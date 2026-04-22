'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'

/* ─── types ─────────────────────────────────────────────────────── */
interface POLine {
  lineNum: number; item: string; description: string
  qtyOrdered: number; qtyReceived: number; qtyInvoiced: number
  unitCost: number; extCost: number; status: string
}

interface Receipt {
  num: string; date: string; lines: number; units: number; postedBy: string
}

/* ─── static data ────────────────────────────────────────────────── */
const PO_LINES: POLine[] = [
  { lineNum:10, item:'1001',         description:'Motor Housing B200',  qtyOrdered:50,  qtyReceived:50, qtyInvoiced:0, unitCost:89.00,   extCost:4450.00,  status:'Received' },
  { lineNum:20, item:'1002',         description:'Control Panel C300',  qtyOrdered:30,  qtyReceived:0,  qtyInvoiced:0, unitCost:145.00,  extCost:4350.00,  status:'Open' },
  { lineNum:30, item:'CABLE-USB',    description:'USB Cable 3m',         qtyOrdered:100, qtyReceived:100,qtyInvoiced:0, unitCost:8.50,    extCost:850.00,   status:'Received' },
  { lineNum:40, item:'POWER-PSU',    description:'Power Supply 24V',    qtyOrdered:25,  qtyReceived:0,  qtyInvoiced:0, unitCost:42.00,   extCost:1050.00,  status:'Open' },
  { lineNum:50, item:'CONNECTOR-B',  description:'B-Type Connector',    qtyOrdered:200, qtyReceived:50, qtyInvoiced:0, unitCost:1.75,    extCost:350.00,   status:'Partial' },
]

const RECEIPTS: Receipt[] = [
  { num:'REC-2026-0481', date:'Apr 8, 2026',  lines:2, units:150, postedBy:'Warehouse Staff' },
  { num:'REC-2026-0512', date:'Apr 14, 2026', lines:1, units:50,  postedBy:'Warehouse Staff' },
  { num:'REC-2026-0538', date:'Apr 18, 2026', lines:1, units:0,   postedBy:'Pending' },
]

const LINE_STATUS: Record<string, { bg: string; color: string; border: string }> = {
  'Received': { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80', border: 'rgba(34,197,94,0.3)' },
  'Open':     { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: 'rgba(100,116,139,0.3)' },
  'Partial':  { bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  'Invoiced': { bg: 'rgba(99,102,241,0.15)',  color: '#a5b4fc', border: 'rgba(99,102,241,0.3)' },
}

function fmt(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function StatusChip({ status }: { status: string }) {
  const c = LINE_STATUS[status] ?? LINE_STATUS['Open']
  return (
    <span style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
      {status}
    </span>
  )
}

function FastTab({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  return (
    <details open={defaultOpen} style={{ border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, overflow: 'hidden' }}>
      <summary style={{
        padding: '12px 20px', fontSize: 13, fontWeight: 700, color: '#e2e8f0',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(99,102,241,0.05)', listStyle: 'none',
        userSelect: 'none',
      }}>
        <svg width="12" height="12" viewBox="0 0 12 12" style={{ transition: 'transform 0.2s', flexShrink: 0 }}>
          <path d="M2 4l4 4 4-4" stroke="#6366f1" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {title}
      </summary>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </details>
  )
}

function FieldGrid({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px 24px' }}>
      {items.map(([label, value]) => (
        <div key={label}>
          <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>{label}</div>
          <div style={{ fontSize: 13, color: '#e2e8f0' }}>{value}</div>
        </div>
      ))}
    </div>
  )
}

/* ─── page ───────────────────────────────────────────────────────── */
export default function PurchaseOrderDetailPage({ params }: { params: { id: string } }) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch(`/api/procurement/purchase-orders/${params.id}`).then(r => r.json()).then(() => setLoaded(true)).catch(() => setLoaded(true))
  }, [params.id])

  const subtotal = PO_LINES.reduce((s, l) => s + l.extCost, 0)
  const received = PO_LINES.filter(l => l.status === 'Received').reduce((s, l) => s + l.extCost, 0)
    + PO_LINES.find(l => l.status === 'Partial')!.extCost * 0.25

  return (
    <div style={{ minHeight: '100dvh', background: '#0d0e24', color: '#e2e8f0' }}>
      <TopBar
        title={`Purchase Order ${params.id}`}
        breadcrumb={[
          { label: 'Procurement', href: '/procurement' },
          { label: 'Purchase Orders', href: '/procurement/purchase-orders' },
          { label: params.id, href: `/procurement/purchase-orders/${params.id}` },
        ]}
        actions={
          <>
            <button style={{ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', border: 'none', cursor: 'pointer' }}>Edit</button>
            {['Confirm','Receive','Invoice','Cancel'].map(a => (
              <button key={a} style={{ padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)', cursor: 'pointer' }}>{a}</button>
            ))}
          </>
        }
      />

      <div style={{ padding: '20px 24px', display: 'flex', gap: 20 }}>
        {/* Main column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

          {/* General FastTab */}
          <FastTab title="General">
            <FieldGrid items={[
              ['PO Number',         'PO-2026-1202'],
              ['Order Date',        'Apr 3, 2026'],
              ['Vendor',            'Fabrikam Electronics (V10001)'],
              ['Currency',          'USD'],
              ['Payment Terms',     'Net 45'],
              ['Buyer',             'Sarah Chen'],
              ['Order Status',      <StatusChip key="s" status="Partial" />],
              ['Expected Delivery', 'Apr 20, 2026'],
            ]} />
          </FastTab>

          {/* Shipping FastTab */}
          <FastTab title="Shipping">
            <FieldGrid items={[
              ['Deliver To',       'Main Warehouse'],
              ['Address',          '123 Innovation Drive, Chicago IL 60601'],
              ['Shipping Method',  'UPS Ground'],
              ['Carrier Account',  "Vendor's account"],
              ['Received Status',  (
                <div key="rp" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  <div style={{ width: 120, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
                    <div style={{ width: '65%', height: '100%', borderRadius: 3, background: '#fbbf24' }} />
                  </div>
                  <span style={{ fontSize: 12, color: '#fbbf24', fontWeight: 600 }}>65% received</span>
                </div>
              )],
            ]} />
          </FastTab>

          {/* Purchase Lines FastTab */}
          <FastTab title="Purchase Lines">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'rgba(99,102,241,0.05)' }}>
                    {['Line #','Item','Description','Qty Ordered','Qty Received','Qty Invoiced','Unit Cost','Ext. Cost','Status'].map(h => (
                      <th key={h} style={{ padding: '9px 12px', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: ['Unit Cost','Ext. Cost'].includes(h) ? 'right' : ['Qty Ordered','Qty Received','Qty Invoiced'].includes(h) ? 'center' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PO_LINES.map((l, i) => (
                    <tr key={l.lineNum} style={{ borderTop: '1px solid rgba(99,102,241,0.08)', background: i % 2 === 1 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                      <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{l.lineNum}</td>
                      <td style={{ padding: '10px 12px', color: '#a5b4fc', fontWeight: 600, fontFamily: 'monospace' }}>{l.item}</td>
                      <td style={{ padding: '10px 12px', color: '#e2e8f0' }}>{l.description}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#e2e8f0' }}>{l.qtyOrdered}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: l.qtyReceived > 0 ? '#4ade80' : '#64748b' }}>{l.qtyReceived}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#64748b' }}>{l.qtyInvoiced}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: '#94a3b8' }}>{fmt(l.unitCost)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#e2e8f0' }}>{fmt(l.extCost)}</td>
                      <td style={{ padding: '10px 12px' }}><StatusChip status={l.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Totals */}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(99,102,241,0.12)', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 280 }}>
                {[['Subtotal', fmt(subtotal)], ['Tax', '$0.00 (vendor exempt)'], ].map(([l,v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#94a3b8' }}>
                    <span>{l}</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, borderTop: '1px solid rgba(99,102,241,0.15)', paddingTop: 8, marginTop: 4 }}>
                  <span style={{ color: '#e2e8f0' }}>Total</span>
                  <span style={{ color: '#a5b4fc', fontVariantNumeric: 'tabular-nums' }}>{fmt(subtotal)}</span>
                </div>
              </div>
            </div>
          </FastTab>

          {/* Receipts FastTab */}
          <FastTab title="Receipts" defaultOpen={false}>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>3 receipts linked to this purchase order.</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'rgba(99,102,241,0.05)' }}>
                  {['Receipt #','Date','Lines','Units','Posted By'].map(h => (
                    <th key={h} style={{ padding: '9px 12px', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECEIPTS.map((r, i) => (
                  <tr key={r.num} style={{ borderTop: '1px solid rgba(99,102,241,0.08)', background: i % 2 === 1 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                    <td style={{ padding: '10px 12px', color: '#a5b4fc', fontWeight: 600 }}>{r.num}</td>
                    <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{r.date}</td>
                    <td style={{ padding: '10px 12px', color: '#e2e8f0' }}>{r.lines}</td>
                    <td style={{ padding: '10px 12px', color: '#e2e8f0' }}>{r.units}</td>
                    <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{r.postedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </FastTab>

          {/* Invoices FastTab */}
          <FastTab title="Invoices" defaultOpen={false}>
            <div style={{ padding: '24px', textAlign: 'center', color: '#475569', fontSize: 13 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }}>
                <rect x="4" y="3" width="16" height="18" rx="2" stroke="#94a3b8" strokeWidth="1.5"/>
                <path d="M8 8h8M8 12h5" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              No invoices have been created for this purchase order.
            </div>
          </FastTab>
        </div>

        {/* FactBox sidebar */}
        <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, background: '#16213e', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(99,102,241,0.1)', fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Statistics</div>
            <div style={{ padding: '16px' }}>
              {[
                { label:'Ordered',     value:fmt(subtotal), color:'#e2e8f0',  sub:'' },
                { label:'Received',    value:fmt(5300),     color:'#4ade80',  sub:'48.2%' },
                { label:'Invoiced',    value:'$0.00',       color:'#64748b',  sub:'' },
                { label:'Outstanding', value:fmt(5700),     color:'#fbbf24',  sub:'' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '9px 0', borderBottom: '1px solid rgba(99,102,241,0.07)' }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>{item.label}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: item.color, fontVariantNumeric: 'tabular-nums' }}>{item.value}</div>
                    {item.sub && <div style={{ fontSize: 10, color: '#64748b' }}>{item.sub}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, background: '#16213e', padding: '12px 16px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>Vendor Info</div>
            {[['Name','Fabrikam Electronics'],['Account','V10001'],['Contact','orders@fabrikam.com'],['Payment','Net 45'],['Currency','USD']].map(([l,v]) => (
              <div key={l} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
                <div style={{ fontSize: 12, color: '#e2e8f0', marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
