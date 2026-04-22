'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

/* ─── Types ─────────────────────────────────────────────── */
type Tier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum'

interface Member {
  id: string
  name: string
  tier: Tier
  points: number
  joined: string
  lastActivity: string
  status: 'Active' | 'Inactive'
}

/* ─── Static data ────────────────────────────────────────── */
const MEMBERS: Member[] = [
  { id:'LM-00001', name:'Sarah Martinez',   tier:'Gold',     points:8420,  joined:'Jan 2022', lastActivity:'Apr 22', status:'Active' },
  { id:'LM-00002', name:'James Chen',       tier:'Platinum', points:24100, joined:'Mar 2019', lastActivity:'Apr 21', status:'Active' },
  { id:'LM-00003', name:'Lisa Park',        tier:'Silver',   points:2840,  joined:'Aug 2023', lastActivity:'Apr 18', status:'Active' },
  { id:'LM-00004', name:'Robert Johnson',   tier:'Bronze',   points:320,   joined:'Feb 2024', lastActivity:'Mar 5',  status:'Inactive' },
  { id:'LM-00005', name:'Angela Torres',    tier:'Gold',     points:11200, joined:'Jun 2021', lastActivity:'Apr 20', status:'Active' },
  { id:'LM-00006', name:'David Kim',        tier:'Silver',   points:3100,  joined:'Sep 2022', lastActivity:'Apr 17', status:'Active' },
  { id:'LM-00007', name:'Maria Gonzalez',   tier:'Platinum', points:38400, joined:'Jan 2018', lastActivity:'Apr 22', status:'Active' },
  { id:'LM-00008', name:'Tyler Brooks',     tier:'Bronze',   points:150,   joined:'Mar 2024', lastActivity:'Apr 10', status:'Active' },
  { id:'LM-00009', name:'Jennifer Walsh',   tier:'Silver',   points:4200,  joined:'Nov 2022', lastActivity:'Apr 19', status:'Active' },
  { id:'LM-00010', name:'Carlos Reyes',     tier:'Gold',     points:7800,  joined:'Apr 2021', lastActivity:'Apr 16', status:'Active' },
  { id:'LM-00011', name:'Priya Nair',       tier:'Bronze',   points:480,   joined:'Jan 2024', lastActivity:'Apr 14', status:'Active' },
  { id:'LM-00012', name:'Kevin O\'Brien',   tier:'Silver',   points:1950,  joined:'Jul 2023', lastActivity:'Apr 21', status:'Active' },
  { id:'LM-00013', name:'Mia Thompson',     tier:'Platinum', points:22700, joined:'Feb 2020', lastActivity:'Apr 22', status:'Active' },
  { id:'LM-00014', name:'Ethan Clarke',     tier:'Bronze',   points:90,    joined:'Apr 2024', lastActivity:'Apr 8',  status:'Active' },
  { id:'LM-00015', name:'Olivia Scott',     tier:'Gold',     points:9100,  joined:'May 2021', lastActivity:'Apr 20', status:'Active' },
]

const TIER_CHIP: Record<Tier, string> = {
  Bronze:   'bg-amber-700/30 text-amber-400 border border-amber-600/30',
  Silver:   'bg-slate-500/30 text-slate-300 border border-slate-400/30',
  Gold:     'bg-yellow-500/25 text-yellow-300 border border-yellow-500/30',
  Platinum: 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/30',
}

const TIER_CONFIG = [
  { name:'Bronze' as Tier,   range:'0–999 pts',      multiplier:'1×',   birthday:'—',                  extra:'—' },
  { name:'Silver' as Tier,   range:'1,000–4,999 pts', multiplier:'1.5×', birthday:'500 pts',            extra:'—' },
  { name:'Gold' as Tier,     range:'5,000–19,999 pts',multiplier:'2×',   birthday:'1,000 pts',          extra:'5% discount' },
  { name:'Platinum' as Tier, range:'20,000+ pts',     multiplier:'3×',   birthday:'2,000 pts',          extra:'10% discount + free shipping' },
]

const TOP_REDEEMERS = [
  { name:'Maria Gonzalez', pts:4200, val:'$42.00' },
  { name:'James Chen',     pts:3100, val:'$31.00' },
  { name:'Mia Thompson',   pts:2800, val:'$28.00' },
  { name:'Angela Torres',  pts:2100, val:'$21.00' },
  { name:'Olivia Scott',   pts:1750, val:'$17.50' },
]

const KPIS = [
  { label:'Total Members',      value:'8,247',       accent:'text-[#e2e8f0]' },
  { label:'Active (30d)',        value:'2,841',       accent:'text-emerald-400' },
  { label:'Points Outstanding', value:'4,821,000 pts',accent:'text-[#e2e8f0]' },
  { label:'Liability',           value:'$48,210',     accent:'text-amber-400' },
  { label:'Redemptions YTD',    value:'$24,100',     accent:'text-[#e2e8f0]' },
]

const DONUT_DATA = [
  { label:'Bronze',   pct:52, color:'#d97706', count:'4,288' },
  { label:'Silver',   pct:31, color:'#94a3b8', count:'2,557' },
  { label:'Gold',     pct:13, color:'#f59e0b', count:'1,072' },
  { label:'Platinum', pct:4,  color:'#6366f1', count:'330' },
]

/* ─── SVG Charts ─────────────────────────────────────────── */
function AreaChart() {
  const days = 30
  const earnPts: number[] = []
  const redeemPts: number[] = []
  for (let i = 0; i < days; i++) {
    earnPts.push(28000 + Math.sin(i * 0.4) * 10000 + Math.random() * 6000)
    redeemPts.push(8000 + Math.sin(i * 0.3 + 1) * 4000 + Math.random() * 3000)
  }
  const W = 320, H = 100, pad = 8
  const maxV = 50000
  const toPath = (pts: number[]) => pts.map((v, i) => {
    const x = pad + (i / (pts.length - 1)) * (W - pad * 2)
    const y = H - pad - (v / maxV) * (H - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const earnCoords = toPath(earnPts)
  const redeemCoords = toPath(redeemPts)
  const mkFill = (coords: string[], color: string) => {
    const line = coords.map((c,i) => (i===0?`M ${c}`:`L ${c}`)).join(' ')
    return { fill: line + ` L ${(pad + W - pad*2).toFixed(1)},${H-pad} L ${pad},${H-pad} Z`, line }
  }
  const earn = mkFill(earnCoords, '#14b8a6')
  const redeem = mkFill(redeemCoords, '#f87171')
  return (
    <svg viewBox={`0 0 ${W} ${H+18}`} className="w-full h-32">
      <defs>
        <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(20,184,166,0.35)" />
          <stop offset="100%" stopColor="rgba(20,184,166,0)" />
        </linearGradient>
        <linearGradient id="redeemGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(248,113,113,0.35)" />
          <stop offset="100%" stopColor="rgba(248,113,113,0)" />
        </linearGradient>
      </defs>
      {[0,25000,50000].map((v,i) => {
        const y = H - pad - (v / maxV) * (H - pad*2)
        return <g key={i}><line x1={pad} y1={y} x2={W-pad} y2={y} stroke="rgba(255,255,255,0.05)" /><text x={pad} y={y-2} fontSize="7" fill="#475569">{v===0?'0':v/1000+'k'}</text></g>
      })}
      <path d={earn.fill} fill="url(#earnGrad)" />
      <path d={earn.line} fill="none" stroke="#14b8a6" strokeWidth="1.5" />
      <path d={redeem.fill} fill="url(#redeemGrad)" />
      <path d={redeem.line} fill="none" stroke="#f87171" strokeWidth="1.5" />
      <text x={pad} y={H+14} fontSize="8" fill="#475569">30 days ago</text>
      <text x={W-pad} y={H+14} fontSize="8" fill="#475569" textAnchor="end">Today</text>
    </svg>
  )
}

function DonutChart() {
  const R = 48, CX = 80, CY = 68, stroke = 22
  let cumulative = 0
  const segments = DONUT_DATA.map(d => {
    const start = cumulative
    cumulative += d.pct
    return { ...d, start, end: cumulative }
  })
  const arc = (s: number, e: number) => {
    const startAngle = (s / 100) * 2 * Math.PI - Math.PI / 2
    const endAngle = (e / 100) * 2 * Math.PI - Math.PI / 2
    const x1 = CX + R * Math.cos(startAngle)
    const y1 = CY + R * Math.sin(startAngle)
    const x2 = CX + R * Math.cos(endAngle)
    const y2 = CY + R * Math.sin(endAngle)
    const large = (e - s) > 50 ? 1 : 0
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`
  }
  return (
    <svg viewBox="0 0 220 140" className="w-full h-36">
      {segments.map(s => (
        <path key={s.label} d={arc(s.start, s.end)} fill="none" stroke={s.color} strokeWidth={stroke} strokeLinecap="butt" />
      ))}
      <text x={CX} y={CY-4} textAnchor="middle" fontSize="11" fill="#e2e8f0" fontWeight="bold">8,247</text>
      <text x={CX} y={CY+8} textAnchor="middle" fontSize="8" fill="#94a3b8">Members</text>
      {DONUT_DATA.map((d, i) => (
        <g key={d.label} transform={`translate(140, ${16 + i * 28})`}>
          <rect width="8" height="8" rx="1" fill={d.color} y="2" />
          <text x="12" y="11" fontSize="9" fill="#e2e8f0">{d.label}</text>
          <text x="70" y="11" fontSize="9" fill="#94a3b8" textAnchor="end">{d.pct}%</text>
          <text x="80" y="11" fontSize="8" fill="#475569">{d.count}</text>
        </g>
      ))}
    </svg>
  )
}

/* ─── Page ───────────────────────────────────────────────── */
export default function LoyaltyProgramPage() {
  const [tierFilter, setTierFilter] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [search, setSearch] = useState('')
  const [, setApiData] = useState<unknown>(null)

  useEffect(() => {
    fetch('/api/loyalty/program').then(r => r.json()).then(setApiData).catch(() => {})
  }, [])

  const filtered = MEMBERS.filter(m => {
    if (tierFilter !== 'All' && m.tier !== tierFilter) return false
    if (statusFilter !== 'All' && m.status !== statusFilter) return false
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.id.includes(search)) return false
    return true
  })

  const actions = (
    <div className="flex gap-2">
      <button className="h-8 px-4 rounded-lg text-xs font-medium text-white" style={{ background:'rgba(99,102,241,0.8)', border:'1px solid rgba(99,102,241,0.5)' }}>Enroll Member</button>
      <button className="h-8 px-3 rounded-lg text-xs text-[#94a3b8]" style={{ border:'1px solid rgba(99,102,241,0.2)' }}>Issue Points</button>
      <button className="h-8 px-3 rounded-lg text-xs text-[#94a3b8]" style={{ border:'1px solid rgba(99,102,241,0.2)' }}>Void Points</button>
    </div>
  )

  return (
    <>
      <TopBar
        title="Loyalty Program"
        breadcrumb={[{ label:'Loyalty', href:'/loyalty' }, { label:'Program', href:'/loyalty/program' }]}
        actions={actions}
      />
      <main className="flex-1 overflow-auto p-6" style={{ background:'#0d0e24', minHeight:'100dvh' }}>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {KPIS.map(k => (
            <div key={k.label} className="rounded-xl p-4" style={{ background:'#16213e', border:'1px solid rgba(99,102,241,0.15)' }}>
              <p className={`text-xl font-bold ${k.accent}`}>{k.value}</p>
              <p className="text-xs text-[#94a3b8] mt-1">{k.label}</p>
            </div>
          ))}
        </div>

        {/* 3-column layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[30%_40%_30%] gap-5">

          {/* LEFT — Config */}
          <div className="space-y-4">
            {/* Tier Config */}
            <details open className="rounded-xl overflow-hidden" style={{ background:'#16213e', border:'1px solid rgba(99,102,241,0.15)' }}>
              <summary className="px-5 py-3.5 cursor-pointer text-sm font-semibold text-[#e2e8f0] flex items-center justify-between select-none" style={{ borderBottom:'1px solid rgba(99,102,241,0.1)' }}>
                Tier Configuration
                <svg className="w-4 h-4 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <div className="p-4 space-y-3">
                {TIER_CONFIG.map(t => (
                  <div key={t.name} className="rounded-lg p-3" style={{ background:'rgba(99,102,241,0.06)', border:'1px solid rgba(99,102,241,0.1)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${TIER_CHIP[t.name]}`}>{t.name}</span>
                      <span className="text-xs text-[#94a3b8]">{t.multiplier} earn</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        defaultValue={t.range}
                        className="flex-1 h-7 px-2 text-xs text-[#e2e8f0] rounded bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none"
                      />
                      <input
                        type="text"
                        defaultValue={t.multiplier}
                        className="w-14 h-7 px-2 text-xs text-center text-[#e2e8f0] rounded bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-[#94a3b8] mt-1.5">Birthday: {t.birthday}{t.extra !== '—' ? ` · ${t.extra}` : ''}</p>
                  </div>
                ))}
                <button className="w-full h-8 rounded-lg text-xs font-medium text-white mt-1" style={{ background:'rgba(99,102,241,0.7)', border:'1px solid rgba(99,102,241,0.4)' }}>Save Tier Config</button>
              </div>
            </details>

            {/* Earn Rules */}
            <details className="rounded-xl overflow-hidden" style={{ background:'#16213e', border:'1px solid rgba(99,102,241,0.15)' }}>
              <summary className="px-5 py-3.5 cursor-pointer text-sm font-semibold text-[#e2e8f0] flex items-center justify-between select-none">
                Earn Rules
                <svg className="w-4 h-4 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <div className="px-5 pb-4 pt-2 space-y-2.5">
                {[
                  { label:'Base earn rate', val:'$1 = 1 point' },
                  { label:'Double points Tuesdays', val:'ON', green:true },
                  { label:'Electronics bonus', val:'2× pts' },
                  { label:'Food bonus', val:'0.5× pts' },
                  { label:'Excluded: Gift Cards, Services', val:'—' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between text-xs">
                    <span className="text-[#94a3b8]">{r.label}</span>
                    <span className={r.green ? 'text-emerald-400 font-medium' : 'text-[#e2e8f0]'}>{r.val}</span>
                  </div>
                ))}
              </div>
            </details>

            {/* Redemption Rules */}
            <details className="rounded-xl overflow-hidden" style={{ background:'#16213e', border:'1px solid rgba(99,102,241,0.15)' }}>
              <summary className="px-5 py-3.5 cursor-pointer text-sm font-semibold text-[#e2e8f0] flex items-center justify-between select-none">
                Redemption Rules
                <svg className="w-4 h-4 text-[#94a3b8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </summary>
              <div className="px-5 pb-4 pt-2 space-y-2.5">
                {[
                  { label:'Rate', val:'100 pts = $1.00' },
                  { label:'Min redemption', val:'500 pts' },
                  { label:'Max per transaction', val:'5,000 pts or 50%' },
                  { label:'Excluded', val:'Gift Cards, Services' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between text-xs">
                    <span className="text-[#94a3b8]">{r.label}</span>
                    <span className="text-[#e2e8f0]">{r.val}</span>
                  </div>
                ))}
              </div>
            </details>
          </div>

          {/* MIDDLE — Member table */}
          <div className="rounded-xl overflow-hidden flex flex-col" style={{ background:'#16213e', border:'1px solid rgba(99,102,241,0.15)' }}>
            {/* Filters */}
            <div className="px-4 py-3 flex flex-wrap gap-2" style={{ borderBottom:'1px solid rgba(99,102,241,0.1)' }}>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search member..."
                className="flex-1 min-w-[120px] h-7 px-3 text-xs text-[#e2e8f0] rounded-lg bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none"
              />
              <select value={tierFilter} onChange={e => setTierFilter(e.target.value)} className="h-7 px-2 text-xs text-[#94a3b8] rounded-lg bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none">
                <option>All</option>
                <option>Bronze</option>
                <option>Silver</option>
                <option>Gold</option>
                <option>Platinum</option>
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-7 px-2 text-xs text-[#94a3b8] rounded-lg bg-[#0d0e24] border border-[rgba(99,102,241,0.2)] outline-none">
                <option>All</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom:'1px solid rgba(99,102,241,0.1)' }}>
                    {['Member #','Name','Tier','Points','Joined','Last Activity','Status'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10px] font-medium text-[#94a3b8] uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m, i) => (
                    <tr key={m.id} className="hover:bg-indigo-500/5 transition-colors" style={{ borderBottom: i < filtered.length-1 ? '1px solid rgba(99,102,241,0.07)' : undefined, opacity: m.status === 'Inactive' ? 0.55 : 1 }}>
                      <td className="px-3 py-2.5 font-mono text-xs text-[#94a3b8]">{m.id}</td>
                      <td className="px-3 py-2.5 text-[#e2e8f0] text-xs whitespace-nowrap">{m.name}</td>
                      <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${TIER_CHIP[m.tier]}`}>{m.tier}</span></td>
                      <td className="px-3 py-2.5 text-[#e2e8f0] text-xs whitespace-nowrap">{m.points.toLocaleString()} pts</td>
                      <td className="px-3 py-2.5 text-[#94a3b8] text-xs whitespace-nowrap">{m.joined}</td>
                      <td className="px-3 py-2.5 text-[#94a3b8] text-xs whitespace-nowrap">{m.lastActivity}</td>
                      <td className="px-3 py-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${m.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-zinc-500/15 text-zinc-500 border border-zinc-500/20'}`}>{m.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT — Charts */}
          <div className="space-y-4">
            {/* Area chart */}
            <div className="rounded-xl p-4" style={{ background:'#16213e', border:'1px solid rgba(99,102,241,0.15)' }}>
              <p className="text-xs font-semibold text-[#e2e8f0] mb-1">Points Activity — 30 Days</p>
              <div className="flex gap-4 mb-2">
                <span className="flex items-center gap-1 text-[10px] text-[#94a3b8]"><span className="w-2 h-2 rounded-full bg-teal-400 inline-block" />Earn</span>
                <span className="flex items-center gap-1 text-[10px] text-[#94a3b8]"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Redeem</span>
              </div>
              <AreaChart />
            </div>

            {/* Donut chart */}
            <div className="rounded-xl p-4" style={{ background:'#16213e', border:'1px solid rgba(99,102,241,0.15)' }}>
              <p className="text-xs font-semibold text-[#e2e8f0] mb-2">Tier Distribution</p>
              <DonutChart />
            </div>

            {/* Top redeemers */}
            <div className="rounded-xl p-4" style={{ background:'#16213e', border:'1px solid rgba(99,102,241,0.15)' }}>
              <p className="text-xs font-semibold text-[#e2e8f0] mb-3">Top Redeemers This Month</p>
              <div className="space-y-2">
                {TOP_REDEEMERS.map((r, i) => (
                  <div key={r.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#94a3b8] w-4">{i+1}.</span>
                      <span className="text-xs text-[#e2e8f0]">{r.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#94a3b8]">{r.pts.toLocaleString()} pts</span>
                      <span className="text-xs font-medium text-indigo-300">{r.val}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
