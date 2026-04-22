'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ── types ────────────────────────────────────────────────────────────────────
interface GLAccount {
  no: string
  name: string
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense'
  category: string
  normalBalance: 'Debit' | 'Credit'
  debitBalance: number | null
  creditBalance: number | null
  netBalance: number
  blocked: boolean
}

interface COAData {
  accounts: GLAccount[]
  totalDebits: number
  totalCredits: number
  netDifference: number
}

// ── static seed ──────────────────────────────────────────────────────────────
const SEED: GLAccount[] = [
  // ASSETS
  { no:'1000', name:'Cash and Cash Equivalents',  type:'Asset',    category:'Current Assets',       normalBalance:'Debit',  debitBalance:5234100,  creditBalance:null,     netBalance:5234100,   blocked:false },
  { no:'1100', name:'Accounts Receivable',         type:'Asset',    category:'Current Assets',       normalBalance:'Debit',  debitBalance:8432100,  creditBalance:null,     netBalance:8432100,   blocked:false },
  { no:'1200', name:'Inventory',                   type:'Asset',    category:'Current Assets',       normalBalance:'Debit',  debitBalance:4218500,  creditBalance:null,     netBalance:4218500,   blocked:false },
  { no:'1500', name:'Property & Equipment',        type:'Asset',    category:'Fixed Assets',         normalBalance:'Debit',  debitBalance:18400000, creditBalance:null,     netBalance:18400000,  blocked:false },
  { no:'1550', name:'Accumulated Depreciation',    type:'Asset',    category:'Fixed Assets',         normalBalance:'Credit', debitBalance:null,      creditBalance:4780000,  netBalance:-4780000,  blocked:false },
  // LIABILITIES
  { no:'2000', name:'Accounts Payable',            type:'Liability',category:'Current Liabilities',  normalBalance:'Credit', debitBalance:null,      creditBalance:2841200,  netBalance:2841200,   blocked:false },
  { no:'2100', name:'Accrued Liabilities',         type:'Liability',category:'Current Liabilities',  normalBalance:'Credit', debitBalance:null,      creditBalance:1203400,  netBalance:1203400,   blocked:false },
  { no:'2500', name:'Long-Term Debt',              type:'Liability',category:'Long-Term',             normalBalance:'Credit', debitBalance:null,      creditBalance:8200000,  netBalance:8200000,   blocked:false },
  // EQUITY
  { no:'3000', name:'Common Stock',                type:'Equity',   category:'Equity',               normalBalance:'Credit', debitBalance:null,      creditBalance:5000000,  netBalance:5000000,   blocked:false },
  { no:'3500', name:'Retained Earnings',           type:'Equity',   category:'Equity',               normalBalance:'Credit', debitBalance:null,      creditBalance:14260000, netBalance:14260000,  blocked:false },
  // REVENUE
  { no:'4000', name:'Sales Revenue',               type:'Revenue',  category:'Operating',            normalBalance:'Credit', debitBalance:null,      creditBalance:47200000, netBalance:47200000,  blocked:false },
  { no:'4100', name:'Service Revenue',             type:'Revenue',  category:'Operating',            normalBalance:'Credit', debitBalance:null,      creditBalance:3800000,  netBalance:3800000,   blocked:false },
  { no:'4900', name:'Other Revenue',               type:'Revenue',  category:'Non-Operating',        normalBalance:'Credit', debitBalance:null,      creditBalance:420000,   netBalance:420000,    blocked:false },
  // EXPENSES
  { no:'5000', name:'Cost of Goods Sold',          type:'Expense',  category:'COGS',                 normalBalance:'Debit',  debitBalance:29120000, creditBalance:null,     netBalance:29120000,  blocked:false },
  { no:'6000', name:'Salaries & Wages',            type:'Expense',  category:'Operating',            normalBalance:'Debit',  debitBalance:8420000,  creditBalance:null,     netBalance:8420000,   blocked:false },
  { no:'6100', name:'Rent & Occupancy',            type:'Expense',  category:'Operating',            normalBalance:'Debit',  debitBalance:1840000,  creditBalance:null,     netBalance:1840000,   blocked:false },
  { no:'6200', name:'Depreciation',                type:'Expense',  category:'Operating',            normalBalance:'Debit',  debitBalance:1780000,  creditBalance:null,     netBalance:1780000,   blocked:false },
  { no:'6300', name:'Marketing & Advertising',     type:'Expense',  category:'Operating',            normalBalance:'Debit',  debitBalance:924000,   creditBalance:null,     netBalance:924000,    blocked:false },
  { no:'6900', name:'Other Operating Expenses',    type:'Expense',  category:'Operating',            normalBalance:'Debit',  debitBalance:2140000,  creditBalance:null,     netBalance:2140000,   blocked:false },
  { no:'8000', name:'Income Tax Expense',          type:'Expense',  category:'Tax',                  normalBalance:'Debit',  debitBalance:1820000,  creditBalance:null,     netBalance:1820000,   blocked:false },
]

const TYPE_ORDER: GLAccount['type'][] = ['Asset','Liability','Equity','Revenue','Expense']

const TYPE_META: Record<GLAccount['type'], { label: string; color: string; bg: string }> = {
  Asset:     { label:'Assets',      color:'#60a5fa', bg:'rgba(96,165,250,0.06)'  },
  Liability: { label:'Liabilities', color:'#f87171', bg:'rgba(248,113,113,0.06)' },
  Equity:    { label:'Equity',      color:'#a78bfa', bg:'rgba(167,139,250,0.06)' },
  Revenue:   { label:'Revenue',     color:'#34d399', bg:'rgba(52,211,153,0.06)'  },
  Expense:   { label:'Expenses',    color:'#fb923c', bg:'rgba(251,146,60,0.06)'  },
}

// ── helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number | null, neg = false): string {
  if (n === null || n === 0) return '—'
  const abs = Math.abs(n)
  const s = '$' + abs.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  return neg && n < 0 ? `-${s}` : s
}

// ── mini bar chart ────────────────────────────────────────────────────────────
function MiniBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, marginBottom:3, color:'#94a3b8' }}>
        <span>{label}</span><span>{Math.round(pct * 100)}%</span>
      </div>
      <div style={{ height:5, background:'rgba(255,255,255,0.07)', borderRadius:3 }}>
        <div style={{ height:5, width:`${Math.round(pct * 100)}%`, background:color, borderRadius:3, transition:'width 0.4s' }} />
      </div>
    </div>
  )
}

// ── right detail panel ────────────────────────────────────────────────────────
function DetailPanel({ account, onClose }: { account: GLAccount; onClose: () => void }) {
  const meta = TYPE_META[account.type]
  return (
    <div style={{
      width:300, minWidth:300, background:'#16213e',
      borderLeft:'1px solid rgba(99,102,241,0.15)',
      padding:'20px 18px', display:'flex', flexDirection:'column', gap:14, overflowY:'auto'
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ fontFamily:'monospace', fontSize:11, color:'#94a3b8', marginBottom:3 }}>{account.no}</div>
          <div style={{ fontSize:14, fontWeight:600, color:'#e2e8f0', lineHeight:1.3 }}>{account.name}</div>
        </div>
        <button onClick={onClose}
          style={{ color:'#94a3b8', background:'none', border:'none', cursor:'pointer', fontSize:20, lineHeight:1, padding:'0 2px' }}>×</button>
      </div>

      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
        <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:`${meta.color}22`, color:meta.color, fontWeight:600 }}>{account.type}</span>
        <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:'rgba(99,102,241,0.15)', color:'#a5b4fc' }}>{account.category}</span>
        <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:'rgba(148,163,184,0.1)', color:'#94a3b8' }}>Normal: {account.normalBalance}</span>
      </div>

      <div style={{ fontSize:11, color:'#94a3b8', lineHeight:1.6, borderTop:'1px solid rgba(99,102,241,0.1)', paddingTop:12 }}>
        General ledger account for recording {account.name.toLowerCase()} transactions within the NovaPOS chart of accounts.
        <br /><br />
        <span style={{ color:'#a5b4fc', cursor:'pointer', textDecoration:'underline' }}>Account Transactions</span>
      </div>

      <div style={{ borderTop:'1px solid rgba(99,102,241,0.1)', paddingTop:12 }}>
        <div style={{ fontSize:10, fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Budget vs Actual — Apr 2026</div>
        <MiniBar label="Q1" pct={0.78} color={meta.color} />
        <MiniBar label="MTD" pct={0.62} color={meta.color} />
        <MiniBar label="YTD" pct={0.54} color={meta.color} />
      </div>

      <div style={{ background:'rgba(99,102,241,0.08)', borderRadius:8, padding:'10px 12px', border:'1px solid rgba(99,102,241,0.15)' }}>
        <div style={{ fontSize:10, color:'#94a3b8', marginBottom:4 }}>Net Balance</div>
        <div style={{ fontSize:20, fontWeight:700, color: account.netBalance < 0 ? '#f87171' : '#e2e8f0', fontVariantNumeric:'tabular-nums' }}>
          {fmt(account.netBalance, true)}
        </div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:'auto' }}>
        <button style={{
          padding:'8px 0', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer',
          background:'rgba(99,102,241,0.2)', color:'#a5b4fc',
          border:'1px solid rgba(99,102,241,0.3)'
        }}>Edit Account</button>
        <button style={{
          padding:'8px 0', borderRadius:6, fontSize:12, fontWeight:500, cursor:'pointer',
          background:'transparent', color:'#94a3b8',
          border:'1px solid rgba(148,163,184,0.15)'
        }}>View Journal Entries</button>
      </div>
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function ChartOfAccountsPage() {
  const [accounts, setAccounts] = useState<GLAccount[]>(SEED)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [typeFilter, setTypeFilter]         = useState('All')
  const [balanceTypeFilter, setBalanceTypeFilter] = useState('All')
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [selected, setSelected]   = useState<GLAccount | null>(null)

  useEffect(() => {
    fetch('/api/finance/chart-of-accounts')
      .then(r => r.json())
      .then((d: COAData | GLAccount[]) => {
        const list = Array.isArray(d) ? d : d.accounts
        if (list && list.length > 0) setAccounts(list)
      })
      .catch(() => {/* keep SEED */})
      .finally(() => setLoading(false))
  }, [])

  const filtered = accounts.filter(a => {
    const q = search.toLowerCase()
    const matchSearch    = !q || a.no.includes(q) || a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
    const matchType      = typeFilter === 'All' || a.type === typeFilter
    const matchBalance   = balanceTypeFilter === 'All' || a.normalBalance === balanceTypeFilter
    return matchSearch && matchType && matchBalance
  })

  const toggleCollapse = (type: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(type) ? next.delete(type) : next.add(type)
      return next
    })
  }

  const totalDebits  = accounts.reduce((s, a) => s + (a.debitBalance  ?? 0), 0)
  const totalCredits = accounts.reduce((s, a) => s + (a.creditBalance ?? 0), 0)
  const balanced     = Math.abs(totalDebits - totalCredits) < 1

  return (
    <div style={{ minHeight:'100dvh', background:'#0d0e24', color:'#e2e8f0', display:'flex', flexDirection:'column' }}>
      <TopBar
        title="Chart of Accounts"
        breadcrumb={[
          { label:'Finance', href:'/finance' },
          { label:'Chart of Accounts', href:'/finance/chart-of-accounts' },
        ]}
        actions={
          <div style={{ display:'flex', gap:8 }}>
            <button style={{ padding:'6px 14px', borderRadius:6, fontSize:12, fontWeight:600, background:'rgba(99,102,241,0.85)', color:'#fff', border:'none', cursor:'pointer' }}>New Account</button>
            <button style={{ padding:'6px 14px', borderRadius:6, fontSize:12, background:'rgba(99,102,241,0.12)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.25)', cursor:'pointer' }}>Import</button>
            <button style={{ padding:'6px 14px', borderRadius:6, fontSize:12, background:'rgba(99,102,241,0.12)', color:'#a5b4fc', border:'1px solid rgba(99,102,241,0.25)', cursor:'pointer' }}>Export</button>
          </div>
        }
      />

      {/* filter bar */}
      <div style={{ padding:'10px 24px', borderBottom:'1px solid rgba(99,102,241,0.1)', display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Account No. or Name..."
          style={{ padding:'6px 12px', borderRadius:6, background:'#16213e', border:'1px solid rgba(99,102,241,0.2)', color:'#e2e8f0', fontSize:12, width:200, outline:'none' }}
        />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{ padding:'6px 10px', borderRadius:6, background:'#16213e', border:'1px solid rgba(99,102,241,0.2)', color:'#e2e8f0', fontSize:12, outline:'none' }}>
          {['All','Asset','Liability','Equity','Revenue','Expense'].map(t => <option key={t}>{t === 'All' ? 'All Types' : t + 's'}</option>)}
        </select>
        <select value={balanceTypeFilter} onChange={e => setBalanceTypeFilter(e.target.value)}
          style={{ padding:'6px 10px', borderRadius:6, background:'#16213e', border:'1px solid rgba(99,102,241,0.2)', color:'#e2e8f0', fontSize:12, outline:'none' }}>
          <option value="All">All Balance Types</option>
          <option value="Debit">Debit</option>
          <option value="Credit">Credit</option>
        </select>
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10 }}>
          <span style={{
            fontSize:11, padding:'4px 12px', borderRadius:20, fontWeight:600,
            background: balanced ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
            color: balanced ? '#34d399' : '#f87171',
            border: `1px solid ${balanced ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)'}`,
          }}>
            {balanced ? '✓ Balanced' : '✗ Out of Balance'}
          </span>
          <span style={{ fontSize:11, color:'#94a3b8' }}>{filtered.length} accounts</span>
        </div>
      </div>

      {/* body */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        <div style={{ flex:1, overflowY:'auto', padding:'0 0 60px 0' }}>
          {loading ? (
            <div style={{ padding:40, textAlign:'center', color:'#94a3b8' }}>Loading chart of accounts…</div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead style={{ position:'sticky', top:0, zIndex:2, background:'#0d0e24' }}>
                <tr style={{ borderBottom:'1px solid rgba(99,102,241,0.15)' }}>
                  {['Account No.','Account Name','Account Type','Account Category','Normal Balance','Debit Balance','Credit Balance','Net Balance','Blocked'].map((h, i) => (
                    <th key={h} style={{
                      padding:'10px 14px',
                      textAlign: i >= 5 && i <= 7 ? 'right' : 'left',
                      fontSize:10, fontWeight:600, color:'#94a3b8',
                      textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TYPE_ORDER.map(type => {
                  const meta = TYPE_META[type]
                  const rows = filtered.filter(a => a.type === type)
                  if (rows.length === 0) return null
                  const isCollapsed = collapsed.has(type)
                  return [
                    <tr key={`hdr-${type}`} onClick={() => toggleCollapse(type)}
                      style={{ background:meta.bg, borderTop:'1px solid rgba(99,102,241,0.08)', cursor:'pointer' }}>
                      <td colSpan={9} style={{ padding:'9px 14px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <svg width="12" height="12" viewBox="0 0 12 12"
                            style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition:'transform 0.2s' }}>
                            <path d="M2 4 L6 8 L10 4" stroke={meta.color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span style={{ fontSize:11, fontWeight:700, color:meta.color, textTransform:'uppercase', letterSpacing:'0.1em' }}>{meta.label}</span>
                          <span style={{ fontSize:10, color:'#94a3b8' }}>({rows.length})</span>
                        </div>
                      </td>
                    </tr>,
                    ...(!isCollapsed ? rows.map(a => (
                      <tr key={a.no}
                        onClick={() => setSelected(prev => prev?.no === a.no ? null : a)}
                        style={{
                          borderBottom:'1px solid rgba(99,102,241,0.06)',
                          background: selected?.no === a.no ? 'rgba(99,102,241,0.12)' : 'transparent',
                          cursor:'pointer',
                        }}
                        onMouseEnter={e => { if (selected?.no !== a.no) (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.025)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = selected?.no === a.no ? 'rgba(99,102,241,0.12)' : 'transparent' }}
                      >
                        <td style={{ padding:'9px 14px', fontFamily:'monospace', fontSize:11, color:'#94a3b8' }}>{a.no}</td>
                        <td style={{ padding:'9px 14px', color:'#e2e8f0', fontWeight:500 }}>{a.name}</td>
                        <td style={{ padding:'9px 14px' }}>
                          <span style={{ fontSize:10, padding:'2px 7px', borderRadius:20, background:`${meta.color}1a`, color:meta.color, fontWeight:600 }}>{a.type}</span>
                        </td>
                        <td style={{ padding:'9px 14px', color:'#94a3b8', fontSize:11 }}>{a.category}</td>
                        <td style={{ padding:'9px 14px' }}>
                          <span style={{ fontSize:10, padding:'2px 7px', borderRadius:20,
                            background: a.normalBalance === 'Debit' ? 'rgba(96,165,250,0.12)' : 'rgba(52,211,153,0.12)',
                            color: a.normalBalance === 'Debit' ? '#60a5fa' : '#34d399' }}>
                            {a.normalBalance}
                          </span>
                        </td>
                        <td style={{ padding:'9px 14px', textAlign:'right', fontVariantNumeric:'tabular-nums', color:'#60a5fa' }}>{fmt(a.debitBalance)}</td>
                        <td style={{ padding:'9px 14px', textAlign:'right', fontVariantNumeric:'tabular-nums', color:'#f87171' }}>{fmt(a.creditBalance)}</td>
                        <td style={{ padding:'9px 14px', textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight:600,
                          color: a.netBalance < 0 ? '#f87171' : '#e2e8f0' }}>{fmt(a.netBalance, true)}</td>
                        <td style={{ padding:'9px 14px', textAlign:'center' }}>
                          <span style={{ fontSize:10, color: a.blocked ? '#f87171' : '#34d399' }}>{a.blocked ? 'Yes' : 'No'}</span>
                        </td>
                      </tr>
                    )) : [])
                  ]
                })}

                {/* totals row */}
                <tr style={{ background:'rgba(99,102,241,0.08)', borderTop:'2px solid rgba(99,102,241,0.25)' }}>
                  <td colSpan={5} style={{ padding:'11px 14px', fontSize:12, fontWeight:700, color:'#e2e8f0' }}>TOTALS</td>
                  <td style={{ padding:'11px 14px', textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight:700, color:'#60a5fa', fontSize:13 }}>
                    ${totalDebits.toLocaleString('en-US')}
                  </td>
                  <td style={{ padding:'11px 14px', textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight:700, color:'#f87171', fontSize:13 }}>
                    ${totalCredits.toLocaleString('en-US')}
                  </td>
                  <td style={{ padding:'11px 14px', textAlign:'right', fontVariantNumeric:'tabular-nums', fontWeight:700, fontSize:13,
                    color: balanced ? '#34d399' : '#f87171' }}>
                    {balanced ? 'Balanced ✓' : `Diff: $${Math.abs(totalDebits - totalCredits).toLocaleString('en-US')}`}
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {selected && <DetailPanel account={selected} onClose={() => setSelected(null)} />}
      </div>
    </div>
  )
}
