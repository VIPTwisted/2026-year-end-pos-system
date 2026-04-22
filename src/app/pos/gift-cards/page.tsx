'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

/* ─── Types ─────────────────────────────────────────────── */
type CardStatus = 'Active' | 'Depleted' | 'Frozen'

interface GiftCard {
  id: number
  cardNumber: string
  balance: number
  originalValue: number
  issuedDate: string
  issuedByStore: string
  status: CardStatus
  lastUsed: string
}

interface CardTxn {
  date: string
  type: string
  store: string
  amount: number
  txnType: 'Issue' | 'Purchase'
  balanceAfter: number
}

/* ─── Static data ────────────────────────────────────────── */
const CARDS: GiftCard[] = [
  { id:1,  cardNumber:'GC-0000-1234-5678', balance:47.50,  originalValue:100.00, issuedDate:'Apr 1, 2026',  issuedByStore:'Chicago Store', status:'Active',   lastUsed:'Apr 18' },
  { id:2,  cardNumber:'GC-0000-2345-6789', balance:0.00,   originalValue:50.00,  issuedDate:'Mar 15, 2026', issuedByStore:'Online',        status:'Depleted', lastUsed:'Apr 5' },
  { id:3,  cardNumber:'GC-0000-3456-7890', balance:100.00, originalValue:100.00, issuedDate:'Apr 20, 2026', issuedByStore:'NY Store',       status:'Active',   lastUsed:'—' },
  { id:4,  cardNumber:'GC-0000-4567-8901', balance:25.00,  originalValue:25.00,  issuedDate:'Feb 28, 2026', issuedByStore:'Chicago Store', status:'Active',   lastUsed:'Mar 10' },
  { id:5,  cardNumber:'GC-0000-5678-9012', balance:75.00,  originalValue:150.00, issuedDate:'Mar 5, 2026',  issuedByStore:'LA Store',       status:'Active',   lastUsed:'Apr 12' },
  { id:6,  cardNumber:'GC-0000-6789-0123', balance:0.00,   originalValue:100.00, issuedDate:'Jan 20, 2026', issuedByStore:'Online',        status:'Depleted', lastUsed:'Mar 28' },
  { id:7,  cardNumber:'GC-0000-7890-1234', balance:200.00, originalValue:200.00, issuedDate:'Apr 18, 2026', issuedByStore:'NY Store',       status:'Active',   lastUsed:'—' },
  { id:8,  cardNumber:'GC-0000-8901-2345', balance:12.50,  originalValue:50.00,  issuedDate:'Feb 14, 2026', issuedByStore:'Chicago Store', status:'Active',   lastUsed:'Apr 20' },
  { id:9,  cardNumber:'GC-0000-9012-3456', balance:50.00,  originalValue:50.00,  issuedDate:'Apr 10, 2026', issuedByStore:'Online',        status:'Frozen',   lastUsed:'—' },
  { id:10, cardNumber:'GC-0001-0123-4567', balance:125.00, originalValue:150.00, issuedDate:'Mar 22, 2026', issuedByStore:'LA Store',       status:'Active',   lastUsed:'Apr 15' },
  { id:11, cardNumber:'GC-0001-1234-5678', balance:0.00,   originalValue:25.00,  issuedDate:'Feb 1, 2026',  issuedByStore:'Chicago Store', status:'Depleted', lastUsed:'Mar 5' },
  { id:12, cardNumber:'GC-0001-2345-6789', balance:88.00,  originalValue:100.00, issuedDate:'Apr 5, 2026',  issuedByStore:'NY Store',       status:'Active',   lastUsed:'Apr 19' },
  { id:13, cardNumber:'GC-0001-3456-7890', balance:50.00,  originalValue:50.00,  issuedDate:'Jan 10, 2026', issuedByStore:'Online',        status:'Frozen',   lastUsed:'Jan 11' },
  { id:14, cardNumber:'GC-0001-4567-8901', balance:36.75,  originalValue:100.00, issuedDate:'Mar 1, 2026',  issuedByStore:'Chicago Store', status:'Active',   lastUsed:'Apr 16' },
  { id:15, cardNumber:'GC-0001-5678-9012', balance:150.00, originalValue:150.00, issuedDate:'Apr 21, 2026', issuedByStore:'LA Store',       status:'Active',   lastUsed:'—' },
  { id:16, cardNumber:'GC-0001-6789-0123', balance:0.00,   originalValue:50.00,  issuedDate:'Jan 30, 2026', issuedByStore:'Online',        status:'Depleted', lastUsed:'Feb 20' },
  { id:17, cardNumber:'GC-0001-7890-1234', balance:200.00, originalValue:200.00, issuedDate:'Apr 19, 2026', issuedByStore:'NY Store',       status:'Active',   lastUsed:'—' },
  { id:18, cardNumber:'GC-0001-8901-2345', balance:62.50,  originalValue:100.00, issuedDate:'Feb 22, 2026', issuedByStore:'Chicago Store', status:'Active',   lastUsed:'Apr 17' },
  { id:19, cardNumber:'GC-0001-9012-3456', balance:25.00,  originalValue:25.00,  issuedDate:'Mar 12, 2026', issuedByStore:'LA Store',       status:'Active',   lastUsed:'Apr 3' },
  { id:20, cardNumber:'GC-0002-0123-4567', balance:0.00,   originalValue:100.00, issuedDate:'Feb 10, 2026', issuedByStore:'Online',        status:'Depleted', lastUsed:'Apr 1' },
]

const CARD_TXNS: CardTxn[] = [
  { date:'Apr 1, 2026',  type:'Issue',    store:'Chicago Store', amount:100.00,  txnType:'Issue',    balanceAfter:100.00 },
  { date:'Apr 10, 2026', type:'Purchase', store:'Chicago Store', amount:-25.00,  txnType:'Purchase', balanceAfter:75.00 },
  { date:'Apr 15, 2026', type:'Purchase', store:'Chicago Store', amount:-27.50,  txnType:'Purchase', balanceAfter:47.50 },
  { date:'Apr 18, 2026', type:'Purchase', store:'Online',        amount:0.00,    txnType:'Purchase', balanceAfter:47.50 },
  { date:'—',            type:'—',        store:'—',             amount:0,       txnType:'Purchase', balanceAfter:47.50 },
]

const STATUS_CHIP: Record<CardStatus, string> = {
  Active:   'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  Depleted: 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/20',
  Frozen:   'bg-amber-500/20 text-amber-400 border border-amber-500/25',
}

const KPIS = [
  { label:'Cards Issued',          value:'1,247' },
  { label:'Total Outstanding Bal', value:'$28,420' },
  { label:'Cards Redeemed (YTD)',   value:'892' },
  { label:'Breakage Rate',          value:'12.4%', accent:'text-amber-400' },
]

/* ─── SVG Liability Trend ────────────────────────────────── */
function LiabilityTrend() {
  const months = ['Jan','Feb','Mar','Apr']
  const values = [18200, 22400, 25800, 28420]
  const W = 300, H = 90, pad = { l:30, r:10, t:10, b:24 }
  const minV = 15000, maxV = 32000
  const coords = values.map((v, i) => {
    const x = pad.l + (i / (values.length - 1)) * (W - pad.l - pad.r)
    const y = H - pad.b - ((v - minV) / (maxV - minV)) * (H - pad.t - pad.b)
    return { x: x.toFixed(1), y: y.toFixed(1), v }
  })
  const fill = coords.map((c, i) => (i===0?`M ${c.x} ${c.y}`:`L ${c.x} ${c.y}`)).join(' ')
    + ` L ${coords[coords.length-1].x} ${H-pad.b} L ${pad.l} ${H-pad.b} Z`
  const line = coords.map((c, i) => (i===0?`M ${c.x} ${c.y}`:`L ${c.x} ${c.y}`)).join(' ')
  const yTicks = [18000,22000,26000,30000]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24">
      <defs>
        <linearGradient id="liabGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(99,102,241,0.4)" />
          <stop offset="100%" stopColor="rgba(99,102,241,0)" />
        </linearGradient>
      </defs>
      {yTicks.map(t => {
        const y = H - pad.b - ((t - minV) / (maxV - minV)) * (H - pad.t - pad.b)
        return <g key={t}><line x1={pad.l} y1={y.toFixed(1)} x2={W-pad.r} y2={y.toFixed(1)} stroke="rgba(255,255,255,0.05)" /><text x={pad.l-4} y={y+3} fontSize="7" fill="#475569" textAnchor="end">${(t/1000).toFixed(0)}k</text></g>
      })}
      <path d={fill} fill="url(#liabGrad)" />
      <path d={line} fill="none" stroke="rgba(99,102,241,0.9)" strokeWidth="2" />
      {coords.map((c, i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r="3" fill="#6366f1" />
          <text x={c.x} y={parseFloat(c.y)-6} fontSize="8" fill="#a5b4fc" textAnchor="middle">${(c.v/1000).toFixed(1)}k</text>
          <text x={c.x} y={H-6} fontSize="8" fill="#475569" textAnchor="middle">{months[i]}</text>
        </g>
      ))}
    </svg>
  )
}

/* ─── Page ───────────────────────────────────────────────── */
export default function GiftCardsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [storeFilter, setStoreFilter] = useState<string>('All')
  const [cardSearch, setCardSearch] = useState('')
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(CARDS[0])
  const [balanceInput, setBalanceInput] = useState('')
  const [balanceResult, setBalanceResult] = useState<string | null>(null)
  const [reloadCard, setReloadCard] = useState('')
  const [reloadAmount, setReloadAmount] = useState('')
  const [issueOpen, setIssueOpen] = useState(false)
  const [issueValue, setIssueValue] = useState('$100')
  const [issuedCardNum, setIssuedCardNum] = useState<string | null>(null)
  const [, setApiData] = useState<unknown>(null)

  useEffect(() => {
    fetch('/api/pos/gift-cards').then(r => r.json()).then(setApiData).catch(() => {})
  }, [])

  const stores = ['All', ...Array.from(new Set(CARDS.map(c => c.issuedByStore)))]

  const filtered = CARDS.filter(c => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false
    if (storeFilter !== 'All' && c.issuedByStore !== storeFilter) return false
    if (cardSearch && !c.cardNumber.includes(cardSearch)) return false
    return true
  })

  const handleCheckBalance = () => {
    const found = CARDS.find(c => c.cardNumber === balanceInput.trim() || c.cardNumber.includes(balanceInput.trim()))
    if (found) {
      setSelectedCard(found)
      setBalanceResult(`Balance: $${found.balance.toFixed(2)}`)
    } else {
      setBalanceResult('Card not found.')
    }
  }

  const handleIssue = () => {
    const num = `GC-${Math.floor(Math.random()*9999).toString().padStart(4,'0')}-${Math.floor(Math.random()*9999).toString().padStart(4,'0')}-${Math.floor(Math.random()*9999).toString().padStart(4,'0')}`
    setIssuedCardNum(num)
  }

  const actions = (
    <div className="flex gap-2">
      <button onClick={() => setIssueOpen(o => !o)} className="h-8 px-4 rounded-lg text-xs font-medium text-white" style={{ background:'rgba(99,102,241,0.8)', border:'1px solid rgba(99,102,241,0.5)' }}>Issue New Gift Card</button>
      <button onClick={() => { setBalanceInput(''); setBalanceResult(null); document.getElementById('balance-input')?.focus() }} className="h-8 px-3 rounded-lg text-xs text-[#94a3b8]" style={{ border:'1px solid rgba(99,102,241,0.2)' }}>Check Balance</button>
      <button className="h-8 px-3 rounded-lg text-xs text-[#94a3b8]" style={{ border:'1px solid rgba(99,102,241,0.2)' }}>Reload Card</button>
    </div>
  )

  return (
    <>
      <TopBar
        title="Gift Cards"
        breadcrumb={[{ label:'POS', href:'/pos' }, { label:'Gift Cards', href:'/pos/gift-cards' }]}
        actions={actions}
      />
      <main className="flex-1 overflow-auto p-6" style={{ background:'#0d0e24', minHeight:'100dvh' }}>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {KPIS.map(k => (
            <div key={k.label} className="rounded-xl p-4" style={{ background:'#16213e', border:'1px solid rgba(99,102,241,0.15)' }}>
              <p className={`text-2xl font-bold ${k.accent ?? 'text-[#e2e8f0]'}`}>{k.value}</p>
              <p className="text-xs text-[#94a3b8] mt-1">{k.label}</p>
            </div>
          ))}
        </div>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[60%_40%] gap-5">

          {/* LEFT */}
          <div className="space-y-4">
            {/* Issue FastTab */}
            <details open={issueOpen} onToggle={e => setIssueOpen((e.target as HTMLDetailsElement).open)} className="rounded-xl overflow-hidden" style={{ background:'#16213e', border:'1px solid rgba(99,102,241,0.15)' }}>
              <summary className="px-5 py-3.5 cursor-pointer text-sm font-semibold text-[#e2e8f0] flex items-center justify-between select-none" style={{ borderBottom:'1px solid rgba(99,102,241,0.1)' }}>
                Issue New Gift Card
                <svg className="w-4 h-4 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <div className="px-5 py-4">
                {issuedCardNum ? (
                  <div className="text-center py-4">
                    <p className="text-xs text-[#94a3b8] mb-2">Gift Card Issued — Print or send to customer</p>
                    <p className="text-2xl font-mono font-bold text-indigo-300 tracking-widest mb-4">{issuedCardNum}</p>
                    <p className="text-sm text-emerald-400 mb-4">Value: {issueValue}</p>
                    <button onClick={() => setIssuedCardNum(null)} className="h-8 px-5 rounded-lg text-xs font-medium text-white" style={{ background:'rgba(99,102,241,0.7)', border:'1px solid rgba(99,102,241,0.4)' }}>Issue Another</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs text-[#94a3b8]">Card Value</label>
                      <select value={issueValue} onChange={e => setIssueValue(e.target.value)} className="w-full h-9 rounded-lg px-3 text-sm text-[#e2e8f0] bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none">
                        {['$25','$50','$100','$150','$200','Custom'].map(v => <option key={v}>{v}</option>)}
                      </select>
                    </div>
                    {issueValue === 'Custom' && (
                      <div className="space-y-1.5">
                        <label className="text-xs text-[#94a3b8]">Custom Amount ($)</label>
                        <input type="number" min={1} className="w-full h-9 rounded-lg px-3 text-sm text-[#e2e8f0] bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none" placeholder="0.00" />
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <label className="text-xs text-[#94a3b8]">Customer Name (optional)</label>
                      <input type="text" className="w-full h-9 rounded-lg px-3 text-sm text-[#e2e8f0] bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none" placeholder="Full name..." />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-[#94a3b8]">Email (optional)</label>
                      <input type="email" className="w-full h-9 rounded-lg px-3 text-sm text-[#e2e8f0] bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none" placeholder="For digital delivery..." />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-xs text-[#94a3b8]">Delivery Type</label>
                      <div className="flex gap-3">
                        {['Physical','Digital'].map(d => (
                          <label key={d} className="flex items-center gap-1.5 text-sm text-[#94a3b8] cursor-pointer">
                            <input type="radio" name="deliveryType" value={d} defaultChecked={d==='Physical'} className="accent-indigo-500" />{d}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <button onClick={handleIssue} className="w-full h-9 rounded-lg text-sm font-medium text-white" style={{ background:'rgba(99,102,241,0.8)', border:'1px solid rgba(99,102,241,0.5)' }}>Issue Card</button>
                    </div>
                  </div>
                )}
              </div>
            </details>

            {/* Gift cards table */}
            <div className="rounded-xl overflow-hidden" style={{ background:'#16213e', border:'1px solid rgba(99,102,241,0.15)' }}>
              {/* Filter bar */}
              <div className="px-4 py-3 flex flex-wrap gap-2" style={{ borderBottom:'1px solid rgba(99,102,241,0.1)' }}>
                <input
                  type="text"
                  value={cardSearch}
                  onChange={e => setCardSearch(e.target.value)}
                  placeholder="Card number..."
                  className="flex-1 min-w-[130px] h-7 px-3 text-xs text-[#e2e8f0] rounded-lg bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none"
                />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-7 px-2 text-xs text-[#94a3b8] rounded-lg bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none">
                  <option>All</option>
                  <option>Active</option>
                  <option>Depleted</option>
                  <option>Frozen</option>
                </select>
                <select value={storeFilter} onChange={e => setStoreFilter(e.target.value)} className="h-7 px-2 text-xs text-[#94a3b8] rounded-lg bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none">
                  {stores.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom:'1px solid rgba(99,102,241,0.1)' }}>
                      {['Card Number','Balance','Orig. Value','Issued Date','Store','Status','Last Used'].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left text-[10px] font-medium text-[#94a3b8] uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c, i) => (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedCard(c)}
                        className={`cursor-pointer transition-colors hover:bg-indigo-500/5 ${selectedCard?.id === c.id ? 'bg-indigo-500/8' : ''}`}
                        style={{ borderBottom: i < filtered.length-1 ? '1px solid rgba(99,102,241,0.07)' : undefined }}
                      >
                        <td className="px-3 py-2.5 font-mono text-xs text-indigo-300 whitespace-nowrap">{c.cardNumber}</td>
                        <td className="px-3 py-2.5 text-[#e2e8f0] text-xs font-medium">${c.balance.toFixed(2)}</td>
                        <td className="px-3 py-2.5 text-[#94a3b8] text-xs">${c.originalValue.toFixed(2)}</td>
                        <td className="px-3 py-2.5 text-[#94a3b8] text-xs whitespace-nowrap">{c.issuedDate}</td>
                        <td className="px-3 py-2.5 text-[#94a3b8] text-xs whitespace-nowrap">{c.issuedByStore}</td>
                        <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${STATUS_CHIP[c.status]}`}>{c.status}</span></td>
                        <td className="px-3 py-2.5 text-[#94a3b8] text-xs">{c.lastUsed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-4">
            {/* Balance Check */}
            <div className="rounded-xl p-5" style={{ background:'#16213e', border:'1px solid rgba(99,102,241,0.15)' }}>
              <p className="text-sm font-semibold text-[#e2e8f0] mb-3">Balance Check</p>
              <div className="flex gap-2 mb-3">
                <input
                  id="balance-input"
                  type="text"
                  value={balanceInput}
                  onChange={e => setBalanceInput(e.target.value)}
                  placeholder="Enter card number..."
                  className="flex-1 h-9 px-3 text-sm text-[#e2e8f0] rounded-lg bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none focus:border-indigo-500/60"
                />
                <button onClick={handleCheckBalance} className="h-9 px-4 rounded-lg text-xs font-medium text-white whitespace-nowrap" style={{ background:'rgba(99,102,241,0.7)', border:'1px solid rgba(99,102,241,0.4)' }}>Check Balance</button>
              </div>
              {balanceResult && (
                <div className="rounded-lg px-4 py-3" style={{ background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)' }}>
                  <p className="text-sm font-bold text-emerald-400">{balanceResult}</p>
                  {selectedCard && (
                    <p className="text-xs text-[#94a3b8] mt-1">{selectedCard.cardNumber} · {selectedCard.status} · Issued {selectedCard.issuedDate}</p>
                  )}
                </div>
              )}
            </div>

            {/* Card transactions */}
            {selectedCard && (
              <div className="rounded-xl overflow-hidden" style={{ background:'#16213e', border:'1px solid rgba(99,102,241,0.15)' }}>
                <div className="px-4 py-3" style={{ borderBottom:'1px solid rgba(99,102,241,0.1)' }}>
                  <p className="text-xs font-semibold text-[#e2e8f0]">Card Transactions</p>
                  <p className="text-[10px] text-[#94a3b8] mt-0.5">{selectedCard.cardNumber}</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ borderBottom:'1px solid rgba(99,102,241,0.08)' }}>
                        {['Date','Type','Store','Amount','Balance After'].map(h => (
                          <th key={h} className="px-3 py-2 text-left text-[10px] font-medium text-[#94a3b8] uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {CARD_TXNS.map((t, i) => (
                        <tr key={i} style={{ borderBottom: i < CARD_TXNS.length-1 ? '1px solid rgba(99,102,241,0.07)' : undefined }}>
                          <td className="px-3 py-2 text-[#94a3b8] whitespace-nowrap">{t.date}</td>
                          <td className="px-3 py-2 text-[#e2e8f0]">{t.type}</td>
                          <td className="px-3 py-2 text-[#94a3b8] whitespace-nowrap">{t.store}</td>
                          <td className={`px-3 py-2 font-medium ${t.amount > 0 ? 'text-emerald-400' : t.amount < 0 ? 'text-red-400' : 'text-[#94a3b8]'}`}>{t.amount !== 0 ? (t.amount > 0 ? '+' : '') + '$' + Math.abs(t.amount).toFixed(2) : '—'}</td>
                          <td className="px-3 py-2 text-[#e2e8f0] font-medium">${t.balanceAfter.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Liability Trend */}
            <div className="rounded-xl p-5" style={{ background:'#16213e', border:'1px solid rgba(99,102,241,0.15)' }}>
              <p className="text-sm font-semibold text-[#e2e8f0] mb-3">Gift Card Liability Trend</p>
              <LiabilityTrend />
            </div>

            {/* Reload Card */}
            <div className="rounded-xl p-5" style={{ background:'#16213e', border:'1px solid rgba(99,102,241,0.15)' }}>
              <p className="text-sm font-semibold text-[#e2e8f0] mb-3">Reload Card</p>
              <div className="space-y-2.5">
                <input
                  type="text"
                  value={reloadCard}
                  onChange={e => setReloadCard(e.target.value)}
                  placeholder="Card number..."
                  className="w-full h-9 px-3 text-sm text-[#e2e8f0] rounded-lg bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none focus:border-indigo-500/60"
                />
                <input
                  type="number"
                  min={5}
                  value={reloadAmount}
                  onChange={e => setReloadAmount(e.target.value)}
                  placeholder="Reload amount ($)..."
                  className="w-full h-9 px-3 text-sm text-[#e2e8f0] rounded-lg bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none focus:border-indigo-500/60"
                />
                <button className="w-full h-9 rounded-lg text-sm font-medium text-white" style={{ background:'rgba(99,102,241,0.7)', border:'1px solid rgba(99,102,241,0.4)' }}>Reload</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
