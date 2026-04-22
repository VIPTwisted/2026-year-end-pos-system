'use client'

import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ── types ────────────────────────────────────────────────────────────────────
interface TBRow {
  accountNo: string
  accountName: string
  openingDebit: number
  openingCredit: number
  periodDebit: number
  periodCredit: number
  closingDebit: number
  closingCredit: number
}

interface TBTotals {
  openingDebit: number
  openingCredit: number
  periodDebit: number
  periodCredit: number
  closingDebit: number
  closingCredit: number
}

interface TBData {
  period: string
  entity: string
  dateFrom: string
  dateTo: string
  rows: TBRow[]
  totals: TBTotals
}

interface DrawerEntry {
  date: string
  ref: string
  description: string
  debit: number | null
  credit: number | null
}

// ── static seed ──────────────────────────────────────────────────────────────
const SEED_ROWS: TBRow[] = [
  { accountNo:'1000', accountName:'Cash and Cash Equivalents',  openingDebit:5000000,  openingCredit:0,        periodDebit:847293,   periodCredit:613193,  closingDebit:5234100,  closingCredit:0        },
  { accountNo:'1100', accountName:'Accounts Receivable',        openingDebit:8100000,  openingCredit:0,        periodDebit:1247400,  periodCredit:915300,  closingDebit:8432100,  closingCredit:0        },
  { accountNo:'1200', accountName:'Inventory',                  openingDebit:4100000,  openingCredit:0,        periodDebit:623000,   periodCredit:504500,  closingDebit:4218500,  closingCredit:0        },
  { accountNo:'1500', accountName:'Property & Equipment',       openingDebit:18400000, openingCredit:0,        periodDebit:0,        periodCredit:0,       closingDebit:18400000, closingCredit:0        },
  { accountNo:'1550', accountName:'Accumulated Depreciation',   openingDebit:0,        openingCredit:4631667,  periodDebit:0,        periodCredit:148333,  closingDebit:0,        closingCredit:4780000  },
  { accountNo:'2000', accountName:'Accounts Payable',           openingDebit:0,        openingCredit:2700000,  periodDebit:812400,   periodCredit:953600,  closingDebit:0,        closingCredit:2841200  },
  { accountNo:'2100', accountName:'Accrued Liabilities',        openingDebit:0,        openingCredit:1103200,  periodDebit:0,        periodCredit:100200,  closingDebit:0,        closingCredit:1203400  },
  { accountNo:'2500', accountName:'Long-Term Debt',             openingDebit:0,        openingCredit:8200000,  periodDebit:0,        periodCredit:0,       closingDebit:0,        closingCredit:8200000  },
  { accountNo:'3000', accountName:'Common Stock',               openingDebit:0,        openingCredit:5000000,  periodDebit:0,        periodCredit:0,       closingDebit:0,        closingCredit:5000000  },
  { accountNo:'3500', accountName:'Retained Earnings',          openingDebit:0,        openingCredit:14260000, periodDebit:0,        periodCredit:0,       closingDebit:0,        closingCredit:14260000 },
  { accountNo:'4000', accountName:'Sales Revenue',              openingDebit:0,        openingCredit:43200000, periodDebit:0,        periodCredit:4000000, closingDebit:0,        closingCredit:47200000 },
  { accountNo:'4100', accountName:'Service Revenue',            openingDebit:0,        openingCredit:3480000,  periodDebit:0,        periodCredit:320000,  closingDebit:0,        closingCredit:3800000  },
  { accountNo:'4900', accountName:'Other Revenue',              openingDebit:0,        openingCredit:380000,   periodDebit:0,        periodCredit:40000,   closingDebit:0,        closingCredit:420000   },
  { accountNo:'5000', accountName:'Cost of Goods Sold',         openingDebit:26720000, openingCredit:0,        periodDebit:2400000,  periodCredit:0,       closingDebit:29120000, closingCredit:0        },
  { accountNo:'6000', accountName:'Salaries & Wages',           openingDebit:7720000,  openingCredit:0,        periodDebit:700000,   periodCredit:0,       closingDebit:8420000,  closingCredit:0        },
  { accountNo:'6100', accountName:'Rent & Occupancy',           openingDebit:1690000,  openingCredit:0,        periodDebit:150000,   periodCredit:0,       closingDebit:1840000,  closingCredit:0        },
  { accountNo:'6200', accountName:'Depreciation',               openingDebit:1631667,  openingCredit:0,        periodDebit:148333,   periodCredit:0,       closingDebit:1780000,  closingCredit:0        },
  { accountNo:'6300', accountName:'Marketing & Advertising',    openingDebit:847000,   openingCredit:0,        periodDebit:77000,    periodCredit:0,       closingDebit:924000,   closingCredit:0        },
  { accountNo:'6900', accountName:'Other Operating Expenses',   openingDebit:1963333,  openingCredit:0,        periodDebit:176667,   periodCredit:0,       closingDebit:2140000,  closingCredit:0        },
  { accountNo:'8000', accountName:'Income Tax Expense',         openingDebit:1669333,  openingCredit:0,        periodDebit:150667,   periodCredit:0,       closingDebit:1820000,  closingCredit:0        },
]

function computeTotals(rows: TBRow[]): TBTotals {
  return rows.reduce((acc, r) => ({
    openingDebit:  acc.openingDebit  + r.openingDebit,
    openingCredit: acc.openingCredit + r.openingCredit,
    periodDebit:   acc.periodDebit   + r.periodDebit,
    periodCredit:  acc.periodCredit  + r.periodCredit,
    closingDebit:  acc.closingDebit  + r.closingDebit,
    closingCredit: acc.closingCredit + r.closingCredit,
  }), { openingDebit:0, openingCredit:0, periodDebit:0, periodCredit:0, closingDebit:0, closingCredit:0 })
}

// ── drawer entries seed ───────────────────────────────────────────────────────
const DRAWER_ENTRIES: DrawerEntry[] = [
  { date:'Apr 01, 2026', ref:'JE-2026-0401', description:'Opening balance carry-forward',   debit:null,   credit:null  },
  { date:'Apr 05, 2026', ref:'JE-2026-0405', description:'Sales revenue — batch posting',   debit:null,   credit:842000 },
  { date:'Apr 08, 2026', ref:'JE-2026-0408', description:'Vendor payment — AP clearing',    debit:210000, credit:null  },
  { date:'Apr 12, 2026', ref:'JE-2026-0412', description:'Payroll run — April first half',  debit:185000, credit:null  },
  { date:'Apr 15, 2026', ref:'JE-2026-0415', description:'Customer collection — AR',        debit:318000, credit:null  },
  { date:'Apr 19, 2026', ref:'JE-2026-0419', description:'Inventory purchase receipt',      debit:null,   credit:248000 },
  { date:'Apr 22, 2026', ref:'JE-2026-0422', description:'Accrued expense recognition',     debit:null,   credit:49400  },
  { date:'Apr 26, 2026', ref:'JE-2026-0426', description:'Depreciation — monthly close',    debit:null,   credit:148333 },
  { date:'Apr 30, 2026', ref:'JE-2026-0430', description:'Period close — income summary',   debit:null,   credit:320000 },
]

// ── helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number): string {
  if (n === 0) return '—'
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function showToast(msg: string) {
  const el = document.createElement('div')
  el.textContent = msg
  Object.assign(el.style, {
    position:'fixed', bottom:'28px', right:'28px', zIndex:9999,
    background:'#16213e', border:'1px solid rgba(99,102,241,0.4)', color:'#a5b4fc',
    padding:'10px 18px', borderRadius:'8px', fontSize:'12px', fontWeight:'600',
    boxShadow:'0 4px 24px rgba(0,0,0,0.4)',
  })
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 2600)
}

// ── GL Entries Drawer ─────────────────────────────────────────────────────────
function GLDrawer({ row, onClose }: { row: TBRow; onClose: () => void }) {
  return (
    <div style={{
      position:'fixed', top:0, right:0, bottom:0, width:480,
      background:'#16213e', borderLeft:'1px solid rgba(99,102,241,0.2)',
      zIndex:50, display:'flex', flexDirection:'column',
      boxShadow:'-8px 0 40px rgba(0,0,0,0.4)',
    }}>
      <div style={{ padding:'18px 20px', borderBottom:'1px solid rgba(99,102,241,0.15)', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ fontFamily:'monospace', fontSize:11, color:'#94a3b8', marginBottom:3 }}>{row.accountNo}</div>
          <div style={{ fontSize:14, fontWeight:600, color:'#e2e8f0' }}>{row.accountName}</div>
          <div style={{ fontSize:11, color:'#94a3b8', marginTop:3 }}>GL Entries — Apr 1–30, 2026</div>
        </div>
        <button onClick={onClose} style={{ background:'none', border:'none', color:'#94a3b8', cursor:'pointer', fontSize:20, lineHeight:1 }}>×</button>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'0 0 24px 0' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
          <thead>
            <tr style={{ borderBottom:'1px solid rgba(99,102,241,0.15)' }}>
              {['Date','Reference','Description','Debit','Credit'].map((h, i) => (
                <th key={h} style={{ padding:'10px 16px', textAlign: i >= 3 ? 'right' : 'left', fontSize:10, fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DRAWER_ENTRIES.map((e, i) => (
              <tr key={i} style={{ borderBottom:'1px solid rgba(99,102,241,0.06)' }}
                onMouseEnter={ev => (ev.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.025)'}
                onMouseLeave={ev => (ev.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>
                <td style={{ padding:'9px 16px', color:'#94a3b8', whiteSpace:'nowrap' }}>{e.date}</td>
                <td style={{ padding:'9px 16px', fontFamily:'monospace', fontSize:10, color:'#a5b4fc' }}>{e.ref}</td>
                <td style={{ padding:'9px 16px', color:'#e2e8f0' }}>{e.description}</td>
                <td style={{ padding:'9px 16px', textAlign:'right', fontVariantNumeric:'tabular-nums', color:'#60a5fa' }}>{e.debit ? fmt(e.debit) : '—'}</td>
                <td style={{ padding:'9px 16px', textAlign:'right', fontVariantNumeric:'tabular-nums', color:'#f87171' }}>{e.credit ? fmt(e.credit) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ padding:'14px 20px', borderTop:'1px solid rgba(99,102,241,0.15)', display:'flex', gap:8 }}>
        <button onClick={() => showToast('Export initiated')}
          style={{ flex:1, padding:'8px 0', borderRadius:6, fontSize:12, fontWeight:600, background:'rgba(99,102,241,0.2)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.3)', cursor:'pointer' }}>
          Export
        </button>
        <button onClick={onClose}
          style={{ flex:1, padding:'8px 0', borderRadius:6, fontSize:12, background:'transparent', color:'#94a3b8', border:'1px solid rgba(148,163,184,0.15)', cursor:'pointer' }}>
          Close
        </button>
      </div>
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function TrialBalancePage() {
  const [period, setPeriod]   = useState('April 2026')
  const [entity, setEntity]   = useState('USMF')
  const [fromAcc, setFromAcc] = useState('')
  const [toAcc, setToAcc]     = useState('')
  const [hideZero, setHideZero] = useState(false)
  const [rows, setRows]       = useState<TBRow[]>(SEED_ROWS)
  const [loading, setLoading] = useState(false)
  const [drawerRow, setDrawerRow] = useState<TBRow | null>(null)

  const runReport = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/finance/trial-balance?period=${encodeURIComponent(period)}&entity=${entity}`)
      if (!res.ok) throw new Error('API error')
      const d: TBData = await res.json()
      if (d.rows?.length) setRows(d.rows)
    } catch {
      setRows(SEED_ROWS)
    } finally {
      setLoading(false)
    }
  }, [period, entity])

  useEffect(() => { runReport() }, [runReport])

  const displayed = hideZero ? rows.filter(r =>
    r.openingDebit + r.openingCredit + r.periodDebit + r.periodCredit + r.closingDebit + r.closingCredit > 0
  ) : rows

  const totals   = computeTotals(rows)
  const balanced = Math.abs(totals.closingDebit - totals.closingCredit) < 1

  return (
    <div style={{ minHeight:'100dvh', background:'#0d0e24', color:'#e2e8f0', display:'flex', flexDirection:'column' }}>
      <TopBar
        title="Trial Balance"
        breadcrumb={[
          { label:'Finance', href:'/finance' },
          { label:'Trial Balance', href:'/finance/trial-balance' },
        ]}
        actions={
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => showToast('Export initiated')}
              style={{ padding:'6px 14px', borderRadius:6, fontSize:12, fontWeight:600, background:'rgba(99,102,241,0.85)', color:'#fff', border:'none', cursor:'pointer' }}>Export Excel</button>
            <button onClick={() => showToast('Print preview opened')}
              style={{ padding:'6px 14px', borderRadius:6, fontSize:12, background:'rgba(99,102,241,0.12)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.25)', cursor:'pointer' }}>Print</button>
            <button onClick={() => showToast('Audit trail loaded')}
              style={{ padding:'6px 14px', borderRadius:6, fontSize:12, background:'rgba(99,102,241,0.12)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.25)', cursor:'pointer' }}>Audit Trail</button>
          </div>
        }
      />

      {/* controls bar */}
      <div style={{ padding:'12px 24px', borderBottom:'1px solid rgba(99,102,241,0.1)', display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
        <select value={period} onChange={e => setPeriod(e.target.value)}
          style={{ padding:'6px 10px', borderRadius:6, background:'#16213e', border:'1px solid rgba(99,102,241,0.2)', color:'#e2e8f0', fontSize:12, outline:'none' }}>
          {['April 2026','March 2026','Q1 2026','YTD','Custom'].map(p => <option key={p}>{p}</option>)}
        </select>
        <select value={entity} onChange={e => setEntity(e.target.value)}
          style={{ padding:'6px 10px', borderRadius:6, background:'#16213e', border:'1px solid rgba(99,102,241,0.2)', color:'#e2e8f0', fontSize:12, outline:'none' }}>
          {['USMF','USRT','DEMF','GBSI','All Consolidated'].map(e => <option key={e}>{e}</option>)}
        </select>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:11, color:'#94a3b8' }}>Acct From:</span>
          <input value={fromAcc} onChange={e => setFromAcc(e.target.value)} placeholder="1000"
            style={{ width:70, padding:'6px 8px', borderRadius:6, background:'#16213e', border:'1px solid rgba(99,102,241,0.2)', color:'#e2e8f0', fontSize:12, outline:'none' }} />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ fontSize:11, color:'#94a3b8' }}>To:</span>
          <input value={toAcc} onChange={e => setToAcc(e.target.value)} placeholder="9999"
            style={{ width:70, padding:'6px 8px', borderRadius:6, background:'#16213e', border:'1px solid rgba(99,102,241,0.2)', color:'#e2e8f0', fontSize:12, outline:'none' }} />
        </div>
        <button onClick={runReport} disabled={loading}
          style={{ padding:'6px 16px', borderRadius:6, fontSize:12, fontWeight:600, background:'rgba(99,102,241,0.8)', color:'#fff', border:'none', cursor:'pointer', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Running…' : 'Run Report'}
        </button>
        <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#94a3b8', cursor:'pointer', marginLeft:8 }}>
          <input type="checkbox" checked={hideZero} onChange={e => setHideZero(e.target.checked)}
            style={{ accentColor:'#6366f1' }} />
          Hide Zero Balances
        </label>
      </div>

      {/* report header + balance indicator */}
      <div style={{ padding:'14px 24px', borderBottom:'1px solid rgba(99,102,241,0.08)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:'#e2e8f0' }}>NovaPOS Demo Co.</div>
          <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>Trial Balance — {period} &nbsp;|&nbsp; {entity} &nbsp;|&nbsp; Apr 1 – Apr 30, 2026</div>
        </div>
        <span style={{
          fontSize:12, fontWeight:700, padding:'6px 16px', borderRadius:20,
          background: balanced ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
          color: balanced ? '#34d399' : '#f87171',
          border: `1px solid ${balanced ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
        }}>
          {balanced
            ? `✓ Balanced — Total Debits = Total Credits: $${totals.closingDebit.toLocaleString('en-US')}`
            : `✗ Out of Balance: Difference $${Math.abs(totals.closingDebit - totals.closingCredit).toLocaleString('en-US')}`}
        </span>
      </div>

      {/* table */}
      <div style={{ flex:1, overflowY:'auto', padding:'0 0 60px 0' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
          <thead style={{ position:'sticky', top:0, zIndex:2, background:'#0d0e24' }}>
            <tr style={{ borderBottom:'1px solid rgba(99,102,241,0.15)' }}>
              <th style={{ padding:'10px 14px', textAlign:'left', fontSize:10, fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>Account No.</th>
              <th style={{ padding:'10px 14px', textAlign:'left', fontSize:10, fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em' }}>Account Name</th>
              {['Opening Debit','Opening Credit','Period Debit','Period Credit','Closing Debit','Closing Credit'].map(h => (
                <th key={h} style={{ padding:'10px 14px', textAlign:'right', fontSize:10, fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding:40, textAlign:'center', color:'#94a3b8' }}>Running report…</td></tr>
            ) : displayed.map(r => (
              <tr key={r.accountNo}
                onClick={() => setDrawerRow(r)}
                style={{ borderBottom:'1px solid rgba(99,102,241,0.06)', cursor:'pointer' }}
                onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.025)'}
                onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>
                <td style={{ padding:'9px 14px', fontFamily:'monospace', fontSize:11, color:'#94a3b8' }}>{r.accountNo}</td>
                <td style={{ padding:'9px 14px', color:'#e2e8f0', fontWeight:500 }}>{r.accountName}</td>
                <td style={{ padding:'9px 14px', textAlign:'right', fontVariantNumeric:'tabular-nums', color:'#60a5fa' }}>{fmt(r.openingDebit)}</td>
                <td style={{ padding:'9px 14px', textAlign:'right', fontVariantNumeric:'tabular-nums', color:'#f87171' }}>{fmt(r.openingCredit)}</td>
                <td style={{ padding:'9px 14px', textAlign:'right', fontVariantNumeric:'tabular-nums', color:'#60a5fa' }}>{fmt(r.periodDebit)}</td>
                <td style={{ padding:'9px 14px', textAlign:'right', fontVariantNumeric:'tabular-nums', color:'#f87171' }}>{fmt(r.periodCredit)}</td>
                <td style={{ padding:'9px 14px', textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight:600, color:'#60a5fa' }}>{fmt(r.closingDebit)}</td>
                <td style={{ padding:'9px 14px', textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight:600, color:'#f87171' }}>{fmt(r.closingCredit)}</td>
              </tr>
            ))}

            {/* totals */}
            {!loading && (
              <tr style={{ background:'rgba(99,102,241,0.08)', borderTop:'2px solid rgba(99,102,241,0.25)' }}>
                <td colSpan={2} style={{ padding:'11px 14px', fontSize:12, fontWeight:700, color:'#e2e8f0' }}>TOTALS</td>
                <td style={{ padding:'11px 14px', textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight:700, color:'#60a5fa', fontSize:13 }}>{fmt(totals.openingDebit)}</td>
                <td style={{ padding:'11px 14px', textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight:700, color:'#f87171', fontSize:13 }}>{fmt(totals.openingCredit)}</td>
                <td style={{ padding:'11px 14px', textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight:700, color:'#60a5fa', fontSize:13 }}>{fmt(totals.periodDebit)}</td>
                <td style={{ padding:'11px 14px', textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight:700, color:'#f87171', fontSize:13 }}>{fmt(totals.periodCredit)}</td>
                <td style={{ padding:'11px 14px', textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight:700, color:'#60a5fa', fontSize:13 }}>{fmt(totals.closingDebit)}</td>
                <td style={{ padding:'11px 14px', textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight:700, color: balanced ? '#34d399' : '#f87171', fontSize:13 }}>{fmt(totals.closingCredit)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {drawerRow && <GLDrawer row={drawerRow} onClose={() => setDrawerRow(null)} />}
    </div>
  )
}
