'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  bg:     '#0d0e24',
  card:   '#16213e',
  border: 'rgba(99,102,241,0.15)',
  text:   '#e2e8f0',
  muted:  '#94a3b8',
  indigo: '#6366f1',
}

// ── Static data ────────────────────────────────────────────────────────────
const ENTITIES = ['USMF','USRT','DEMF','GBSI']

type RelType = 'both' | 'supplier' | 'customer' | 'none'
const RELATIONSHIPS: Record<string, RelType> = {
  'USMF-USRT': 'both', 'USMF-DEMF': 'supplier', 'USMF-GBSI': 'customer',
  'USRT-USMF': 'both', 'USRT-DEMF': 'customer', 'USRT-GBSI': 'none',
  'DEMF-USMF': 'customer', 'DEMF-USRT': 'supplier', 'DEMF-GBSI': 'both',
  'GBSI-USMF': 'supplier', 'GBSI-USRT': 'none', 'GBSI-DEMF': 'both',
}

const REL_STYLE: Record<RelType, { bg: string; color: string; label: string }> = {
  both:     { bg:'rgba(99,102,241,0.18)',  color:'#a5b4fc', label:'Both'     },
  supplier: { bg:'rgba(52,211,153,0.12)',  color:'#34d399', label:'Supplier' },
  customer: { bg:'rgba(251,191,36,0.12)',  color:'#fbbf24', label:'Customer' },
  none:     { bg:'rgba(255,255,255,0.04)', color:'#475569', label:'—'        },
}

type TxStatus = 'Open' | 'Posted' | 'Reconciled' | 'Dispute'
const STATUS_STYLE: Record<TxStatus, { bg: string; color: string }> = {
  Open:       { bg:'rgba(148,163,184,0.15)', color:'#94a3b8' },
  Posted:     { bg:'rgba(52,211,153,0.12)',  color:'#34d399' },
  Reconciled: { bg:'rgba(6,182,212,0.12)',   color:'#22d3ee' },
  Dispute:    { bg:'rgba(239,68,68,0.12)',   color:'#f87171' },
}

const TRANSACTIONS = [
  { no:'IC-2026-0841', from:'USMF', to:'USRT', type:'Product Sale',    amount:'$84,200',  date:'Apr 22', status:'Open'       as TxStatus },
  { no:'IC-2026-0840', from:'USMF', to:'DEMF', type:'Service',         amount:'$12,400',  date:'Apr 21', status:'Posted'     as TxStatus },
  { no:'IC-2026-0839', from:'USRT', to:'USMF', type:'Loan Repayment',  amount:'$100,000', date:'Apr 20', status:'Posted'     as TxStatus },
  { no:'IC-2026-0838', from:'DEMF', to:'GBSI', type:'Product Sale',    amount:'€18,400',  date:'Apr 19', status:'Reconciled' as TxStatus },
  { no:'IC-2026-0837', from:'GBSI', to:'USMF', type:'Royalty',         amount:'£5,200',   date:'Apr 18', status:'Posted'     as TxStatus },
  { no:'IC-2026-0836', from:'USMF', to:'GBSI', type:'Management Fee',  amount:'$8,400',   date:'Apr 17', status:'Posted'     as TxStatus },
  { no:'IC-2026-0835', from:'USRT', to:'GBSI', type:'Consulting',      amount:'$9,600',   date:'Apr 16', status:'Open'       as TxStatus },
  { no:'IC-2026-0834', from:'DEMF', to:'USMF', type:'Dividend',        amount:'€20,000',  date:'Apr 14', status:'Reconciled' as TxStatus },
  { no:'IC-2026-0833', from:'USMF', to:'USRT', type:'IT Services',     amount:'$14,800',  date:'Apr 12', status:'Open'       as TxStatus },
  { no:'IC-2026-0832', from:'GBSI', to:'DEMF', type:'Loan Repayment',  amount:'£15,000',  date:'Apr 10', status:'Posted'     as TxStatus },
  { no:'IC-2026-0831', from:'USRT', to:'DEMF', type:'Cost Allocation', amount:'$22,100',  date:'Apr 8',  status:'Dispute'    as TxStatus },
  { no:'IC-2026-0830', from:'DEMF', to:'GBSI', type:'License Fee',     amount:'€11,500',  date:'Apr 5',  status:'Reconciled' as TxStatus },
]

const RECON_PAIRS = [
  { pair:'USMF ↔ USRT', balance:'$84,200 unreconciled', ok:false },
  { pair:'USMF ↔ DEMF', balance:'$0 balanced',           ok:true  },
  { pair:'USRT ↔ GBSI', balance:'$0 balanced',           ok:true  },
  { pair:'DEMF ↔ GBSI', balance:'€11,500 unreconciled',  ok:false },
]

const ELIMINATIONS = [
  { entry:'EL-001', description:'USMF→USRT Product Sale elimination',   amount:'$84,200'  },
  { entry:'EL-002', description:'USRT→USMF Loan Repayment elimination', amount:'$100,000' },
  { entry:'EL-003', description:'DEMF→GBSI License Fee elimination',    amount:'€11,500'  },
  { entry:'EL-004', description:'GBSI→USMF Royalty elimination',        amount:'£5,200'   },
  { entry:'EL-005', description:'USMF→GBSI Management Fee elimination', amount:'$8,400'   },
]

// ── Component ──────────────────────────────────────────────────────────────
export default function IntercompanyPage() {
  const [, setData] = useState<unknown>(null)

  useEffect(() => {
    fetch('/api/finance/intercompany').then(r => r.json()).then(setData).catch(() => {})
  }, [])

  return (
    <div style={{ minHeight:'100dvh', background:C.bg, color:C.text, fontFamily:'system-ui,sans-serif' }}>
      <TopBar
        title="Intercompany Accounting"
        breadcrumb={[
          { label:'Finance', href:'/finance' },
          { label:'Intercompany', href:'/finance/intercompany' },
        ]}
        actions={
          <>
            <button style={btnPrimary}>New Intercompany Transaction</button>
            <button style={btnSecondary}>Post</button>
            <button style={btnSecondary}>Reconcile</button>
          </>
        }
      />

      <div style={{ padding:'24px 28px' }}>
        {/* KPI Strip */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
          <KpiCard label="Open IC Transactions" value="12" color={C.muted} />
          <KpiCard label="Pending Reconciliation" value="5" color="#f59e0b" />
          <KpiCard label="Total IC Receivables" value="$284,120" color="#34d399" />
          <KpiCard label="Total IC Payables" value="$284,120" color="#34d399" note="Balanced" />
        </div>

        {/* 2-column layout */}
        <div style={{ display:'grid', gridTemplateColumns:'60% 40%', gap:20 }}>
          {/* LEFT */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

            {/* Intercompany Relationships matrix */}
            <div style={card}>
              <SectionTitle label="Intercompany Relationships" color={C.indigo} />
              <div style={{ overflowX:'auto' }}>
                <table style={{ borderCollapse:'collapse', fontSize:12, width:'100%' }}>
                  <thead>
                    <tr>
                      <th style={{ ...th, textAlign:'left', width:80 }}>Entity</th>
                      {ENTITIES.map(e => <th key={e} style={{ ...th, width:80 }}>{e}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {ENTITIES.map(rowE => (
                      <tr key={rowE}>
                        <td style={{ ...td, fontWeight:700, color:C.indigo }}>{rowE}</td>
                        {ENTITIES.map(colE => {
                          if (rowE === colE) return <td key={colE} style={{ ...td, textAlign:'center', background:'rgba(255,255,255,0.03)', color:'#334155' }}>—</td>
                          const rel = RELATIONSHIPS[`${rowE}-${colE}`] || 'none'
                          const s = REL_STYLE[rel]
                          return (
                            <td key={colE} style={{ ...td, textAlign:'center' }}>
                              <span style={{ background:s.bg, color:s.color, borderRadius:4, padding:'3px 8px', fontSize:11, fontWeight:600 }}>{s.label}</span>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* IC Transactions table */}
            <div style={card}>
              <SectionTitle label="IC Transactions" color={C.indigo} />
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                  <thead>
                    <tr>
                      {['TXN #','From','To','Type','Amount','Date','Status'].map(h =>
                        <th key={h} style={{ ...th, textAlign: h==='Amount' ? 'right' : 'left' }}>{h}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {TRANSACTIONS.map((tx, i) => {
                      const s = STATUS_STYLE[tx.status]
                      return (
                        <tr key={tx.no} style={{ background: i%2===0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                          <td style={{ ...td, color:C.indigo, fontWeight:600 }}>{tx.no}</td>
                          <td style={td}>{tx.from}</td>
                          <td style={td}>{tx.to}</td>
                          <td style={{ ...td, color:C.muted }}>{tx.type}</td>
                          <td style={{ ...td, textAlign:'right', fontWeight:600, fontVariantNumeric:'tabular-nums' }}>{tx.amount}</td>
                          <td style={{ ...td, color:C.muted }}>{tx.date}</td>
                          <td style={td}>
                            <span style={{ background:s.bg, color:s.color, borderRadius:4, padding:'2px 8px', fontSize:11, fontWeight:600 }}>{tx.status}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

            {/* Reconciliation Status */}
            <div style={card}>
              <SectionTitle label="Reconciliation Status" color="#f59e0b" />
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {RECON_PAIRS.map(p => (
                  <div key={p.pair} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,255,255,0.03)', borderRadius:6, padding:'10px 14px', border:`1px solid ${p.ok ? 'rgba(52,211,153,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13, color:C.text }}>{p.pair}</div>
                      <div style={{ fontSize:11, color: p.ok ? '#34d399' : '#f59e0b', marginTop:2 }}>{p.balance}</div>
                    </div>
                    {!p.ok && <button style={{ background:'rgba(245,158,11,0.15)', color:'#f59e0b', border:'1px solid rgba(245,158,11,0.3)', borderRadius:5, padding:'4px 10px', fontSize:11, fontWeight:600, cursor:'pointer' }}>Reconcile</button>}
                    {p.ok && <span style={{ color:'#34d399', fontSize:18 }}>✓</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Elimination Preview */}
            <div style={card}>
              <SectionTitle label="Elimination Preview" color="#22d3ee" />
              <div style={{ fontSize:12, color:C.muted, marginBottom:12 }}>5 elimination entries needed for consolidation</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {ELIMINATIONS.map(el => (
                  <div key={el.entry} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid rgba(99,102,241,0.07)' }}>
                    <div>
                      <span style={{ color:'#22d3ee', fontWeight:600, fontSize:12 }}>{el.entry}</span>
                      <div style={{ color:C.muted, fontSize:11, marginTop:2 }}>{el.description}</div>
                    </div>
                    <span style={{ fontWeight:700, fontSize:13, color:C.text, fontVariantNumeric:'tabular-nums' }}>{el.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────
function KpiCard({ label, value, color, note }: { label: string; value: string; color: string; note?: string }) {
  return (
    <div style={{ background:'#16213e', border:'1px solid rgba(99,102,241,0.15)', borderRadius:8, padding:'16px 18px' }}>
      <div style={{ fontSize:11, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:22, fontWeight:700, color, fontVariantNumeric:'tabular-nums' }}>{value}</div>
      {note && <div style={{ fontSize:11, color:'#34d399', marginTop:4 }}>{note}</div>}
    </div>
  )
}
function SectionTitle({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ fontSize:13, fontWeight:700, color:'#e2e8f0', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
      <span style={{ width:8, height:8, borderRadius:2, background:color, display:'inline-block', flexShrink:0 }} />
      {label}
    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background:'#16213e', border:'1px solid rgba(99,102,241,0.15)', borderRadius:8, padding:16,
}
const th: React.CSSProperties = {
  padding:'8px 10px', color:'#94a3b8', fontSize:11, fontWeight:600,
  textTransform:'uppercase', letterSpacing:'0.05em', borderBottom:'1px solid rgba(99,102,241,0.12)',
}
const td: React.CSSProperties = {
  padding:'9px 10px', color:'#e2e8f0', fontSize:12, borderBottom:'1px solid rgba(99,102,241,0.07)',
}
const btnPrimary: React.CSSProperties = {
  background:'#6366f1', color:'#fff', border:'none', borderRadius:6,
  padding:'7px 14px', fontSize:13, fontWeight:600, cursor:'pointer',
}
const btnSecondary: React.CSSProperties = {
  background:'rgba(99,102,241,0.12)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.3)',
  borderRadius:6, padding:'7px 14px', fontSize:13, fontWeight:500, cursor:'pointer',
}
