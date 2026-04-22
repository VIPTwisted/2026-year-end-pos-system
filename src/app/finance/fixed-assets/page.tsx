'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

const THEME = {
  bg: '#0d0e24',
  card: '#16213e',
  border: 'rgba(99,102,241,0.15)',
  accent: 'rgba(99,102,241,0.3)',
  text: '#e2e8f0',
  muted: '#94a3b8',
}

const SIDEBAR_TILES = [
  { label: 'All fixed assets', count: 247, active: true },
  { label: 'Acquired this year', count: 12 },
  { label: 'Fully depreciated', count: 38 },
  { label: 'Pending disposal', count: 4, amber: true },
  { label: 'Under maintenance', count: 7 },
]

const KPIS = [
  { label: 'Total Book Value', value: '$18.4M', sub: 'Net of depreciation' },
  { label: 'Acquisitions YTD', value: '$2.1M', sub: '12 assets' },
  { label: 'Depreciation YTD', value: '$1.8M', sub: 'Straight-line' },
  { label: 'Disposals YTD', value: '$0.4M', sub: '3 assets' },
]

const GROUPS = [
  { name: 'Buildings', pct: 45, color: '#6366f1' },
  { name: 'Machinery', pct: 28, color: '#22d3ee' },
  { name: 'Vehicles', pct: 12, color: '#34d399' },
  { name: 'IT Equipment', pct: 10, color: '#f59e0b' },
  { name: 'Furniture', pct: 5, color: '#ec4899' },
]

const ASSETS = [
  { no: 'FA-00001', desc: 'Corporate HQ Building', group: 'Buildings', date: 'Jan 2010', cost: '$8,500,000', accDepr: '$2,550,000', nbv: '$5,950,000', status: 'Active' },
  { no: 'FA-00002', desc: 'Assembly Line A', group: 'Machinery', date: 'Mar 2019', cost: '$1,200,000', accDepr: '$480,000', nbv: '$720,000', status: 'Active' },
  { no: 'FA-00003', desc: 'Company Van #1', group: 'Vehicles', date: 'Jun 2022', cost: '$42,000', accDepr: '$16,800', nbv: '$25,200', status: 'Active' },
  { no: 'FA-00004', desc: 'Server Farm', group: 'IT Equipment', date: 'Jan 2021', cost: '$380,000', accDepr: '$228,000', nbv: '$152,000', status: 'Active' },
  { no: 'FA-00005', desc: 'Warehouse Equipment', group: 'Machinery', date: 'May 2018', cost: '$560,000', accDepr: '$560,000', nbv: '$0', status: 'Fully Depreciated' },
  { no: 'FA-00006', desc: 'Office Furniture Set A', group: 'Furniture', date: 'Feb 2020', cost: '$28,000', accDepr: '$14,000', nbv: '$14,000', status: 'Active' },
  { no: 'FA-00007', desc: 'Forklift #1', group: 'Machinery', date: 'Aug 2021', cost: '$95,000', accDepr: '$28,500', nbv: '$66,500', status: 'Active' },
  { no: 'FA-00008', desc: 'Company Van #2', group: 'Vehicles', date: 'Sep 2023', cost: '$44,000', accDepr: '$8,800', nbv: '$35,200', status: 'Active' },
  { no: 'FA-00009', desc: 'Printer Fleet', group: 'IT Equipment', date: 'Mar 2020', cost: '$18,500', accDepr: '$18,500', nbv: '$0', status: 'Fully Depreciated' },
  { no: 'FA-00010', desc: 'Production Robot B', group: 'Machinery', date: 'Nov 2022', cost: '$420,000', accDepr: '$84,000', nbv: '$336,000', status: 'Active' },
  { no: 'FA-00011', desc: 'Annex Building', group: 'Buildings', date: 'Jul 2015', cost: '$2,100,000', accDepr: '$630,000', nbv: '$1,470,000', status: 'Active' },
  { no: 'FA-00012', desc: 'Network Switch Stack', group: 'IT Equipment', date: 'Jan 2024', cost: '$32,000', accDepr: '$3,200', nbv: '$28,800', status: 'Active' },
  { no: 'FA-00013', desc: 'Conveyor Belt System', group: 'Machinery', date: 'Apr 2017', cost: '$175,000', accDepr: '$175,000', nbv: '$0', status: 'Fully Depreciated' },
  { no: 'FA-00014', desc: 'Company Truck #1', group: 'Vehicles', date: 'Oct 2021', cost: '$68,000', accDepr: '$20,400', nbv: '$47,600', status: 'Under Maintenance' },
  { no: 'FA-00015', desc: 'Reception Furniture', group: 'Furniture', date: 'Jun 2023', cost: '$12,000', accDepr: '$1,200', nbv: '$10,800', status: 'Pending Disposal' },
]

const ASSET_TRANSACTIONS = [
  { date: 'Jan 15, 2010', type: 'Acquisition', amount: '$8,500,000' },
  { date: 'Dec 31, 2022', type: 'Depreciation', amount: '-$255,000' },
  { date: 'Dec 31, 2023', type: 'Depreciation', amount: '-$255,000' },
  { date: 'Mar 10, 2024', type: 'Revaluation', amount: '+$120,000' },
  { date: 'Dec 31, 2024', type: 'Depreciation', amount: '-$255,000' },
]

function statusChip(s: string) {
  const map: Record<string, { bg: string; color: string }> = {
    'Active': { bg: 'rgba(52,211,153,0.15)', color: '#34d399' },
    'Fully Depreciated': { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
    'Disposed': { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
    'Under Maintenance': { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    'Pending Disposal': { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  }
  const c = map[s] ?? { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' }
  return (
    <span style={{ background: c.bg, color: c.color, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500 }}>
      {s}
    </span>
  )
}

function DonutChart() {
  const cx = 80, cy = 80, r = 60, strokeW = 22
  const circ = 2 * Math.PI * r
  let offset = 0
  const slices = GROUPS.map(g => {
    const dash = (g.pct / 100) * circ
    const gap = circ - dash
    const slice = { ...g, dash, gap, offset }
    offset += dash
    return slice
  })
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width={160} height={160} viewBox="0 0 160 160">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth={strokeW} />
        {slices.map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={strokeW}
            strokeDasharray={`${s.dash} ${s.gap}`} strokeDashoffset={-s.offset + circ * 0.25}
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }} />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fill={THEME.text} fontSize={13} fontWeight={600}>247</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill={THEME.muted} fontSize={9}>Assets</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {GROUPS.map(g => (
          <div key={g.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: g.color, flexShrink: 0 }} />
            <span style={{ color: THEME.muted, fontSize: 12 }}>{g.name}</span>
            <span style={{ color: THEME.text, fontSize: 12, fontWeight: 600, marginLeft: 'auto', paddingLeft: 12 }}>{g.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DepreciationChart() {
  const W = 220, H = 110
  const pad = { t: 10, r: 10, b: 24, l: 10 }
  const iW = W - pad.l - pad.r
  const iH = H - pad.t - pad.b
  const pts = Array.from({ length: 21 }, (_, i) => i / 20)
  const cost = pts.map(t => ({ x: pad.l + t * iW, y: pad.t + 8 }))
  const depr = pts.map(t => ({ x: pad.l + t * iW, y: pad.t + t * (iH - 8) }))
  const nbv = pts.map(t => ({ x: pad.l + t * iW, y: pad.t + (1 - t) * (iH - 8) + 8 }))
  const toPath = (p: { x: number; y: number }[]) => p.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ')
  return (
    <svg width={W} height={H} style={{ width: '100%', height: 'auto' }}>
      <path d={toPath(cost)} fill="none" stroke="#6366f1" strokeWidth={1.5} strokeDasharray="4,3" />
      <path d={toPath(depr)} fill="none" stroke="#f59e0b" strokeWidth={1.5} />
      <path d={toPath(nbv)} fill="none" stroke="#34d399" strokeWidth={1.5} />
      <text x={pad.l} y={H - 8} fill={THEME.muted} fontSize={8}>Year 0</text>
      <text x={pad.l + iW / 2} y={H - 8} textAnchor="middle" fill={THEME.muted} fontSize={8}>Year 10</text>
      <text x={pad.l + iW} y={H - 8} textAnchor="end" fill={THEME.muted} fontSize={8}>Year 20</text>
      <text x={W - pad.r} y={18} textAnchor="end" fill="#6366f1" fontSize={8}>Cost</text>
      <text x={W - pad.r} y={30} textAnchor="end" fill="#f59e0b" fontSize={8}>Acc Depr</text>
      <text x={W - pad.r} y={42} textAnchor="end" fill="#34d399" fontSize={8}>NBV</text>
    </svg>
  )
}

export default function FixedAssetsPage() {
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0])
  const [, setData] = useState<unknown>(null)

  useEffect(() => {
    fetch('/api/finance/fixed-assets').then(r => r.json()).then(setData).catch(() => {})
  }, [])

  return (
    <div style={{ minHeight: '100dvh', background: THEME.bg, color: THEME.text, fontFamily: 'var(--font-geist-sans, system-ui)' }}>
      <TopBar
        title="Fixed Assets"
        breadcrumb={[{ label: 'Finance', href: '/finance' }, { label: 'Fixed Assets', href: '/finance/fixed-assets' }]}
        actions={
          <>
            <button style={{ background: 'rgba(99,102,241,0.9)', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>New</button>
            <button style={{ background: THEME.card, color: THEME.text, border: `1px solid ${THEME.border}`, borderRadius: 6, padding: '5px 14px', fontSize: 13, cursor: 'pointer' }}>Depreciation Proposals</button>
            <button style={{ background: THEME.card, color: THEME.text, border: `1px solid ${THEME.border}`, borderRadius: 6, padding: '5px 14px', fontSize: 13, cursor: 'pointer' }}>Disposal</button>
          </>
        }
      />
      <div style={{ display: 'flex', height: 'calc(100dvh - 80px)' }}>

        {/* Left Sidebar */}
        <aside style={{ width: 220, flexShrink: 0, background: THEME.card, borderRight: `1px solid ${THEME.border}`, padding: '16px 0', overflowY: 'auto' }}>
          <div style={{ padding: '0 12px 12px', fontSize: 11, fontWeight: 600, color: THEME.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Workspace</div>
          {SIDEBAR_TILES.map(t => (
            <div key={t.label} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 16px', cursor: 'pointer', fontSize: 13,
              background: t.active ? THEME.accent : 'transparent',
              borderLeft: t.active ? '2px solid #6366f1' : '2px solid transparent',
              color: t.active ? THEME.text : THEME.muted,
            }}>
              <span>{t.label}</span>
              <span style={{
                fontSize: 11, fontWeight: 600, borderRadius: 10, padding: '1px 7px',
                background: t.amber ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.1)',
                color: t.amber ? '#f59e0b' : '#818cf8',
              }}>{t.count}</span>
            </div>
          ))}
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

          {/* KPI Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {KPIS.map(k => (
              <div key={k.label} style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: '14px 18px' }}>
                <div style={{ fontSize: 11, color: THEME.muted, marginBottom: 6 }}>{k.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: THEME.text }}>{k.value}</div>
                <div style={{ fontSize: 11, color: THEME.muted, marginTop: 4 }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Asset Groups Donut */}
          <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 8, padding: 20, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: THEME.text, marginBottom: 12 }}>Asset Groups</div>
              <DonutChart />
            </div>
            <div style={{ color: THEME.muted, fontSize: 12, textAlign: 'right', paddingRight: 8 }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: THEME.text }}>247</div>
              <div>Total Assets</div>
              <div style={{ marginTop: 10, fontSize: 20, fontWeight: 700, color: '#34d399' }}>$18.4M</div>
              <div>Total Book Value</div>
            </div>
          </div>

          {/* Fixed Assets Table */}
          <div style={{ background: THEME.card, border: `1px solid ${THEME.border}`, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${THEME.border}`, fontSize: 13, fontWeight: 600 }}>Fixed Assets</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'rgba(99,102,241,0.05)' }}>
                    {['Asset #', 'Description', 'Group', 'Acquisition Date', 'Acquisition Cost', 'Accumulated Depr.', 'Net Book Value', 'Status'].map((h, i) => (
                      <th key={h} style={{
                        padding: '10px 14px',
                        textAlign: (i >= 4 && i <= 6) ? 'right' : 'left',
                        color: THEME.muted, fontWeight: 600, whiteSpace: 'nowrap',
                        borderBottom: `1px solid ${THEME.border}`,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ASSETS.map((a, i) => (
                    <tr key={a.no} onClick={() => setSelectedAsset(a)} style={{
                      cursor: 'pointer',
                      background: selectedAsset.no === a.no ? 'rgba(99,102,241,0.08)' : i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                      borderBottom: `1px solid ${THEME.border}`,
                    }}>
                      <td style={{ padding: '10px 14px', color: '#818cf8', fontWeight: 600, fontFamily: 'monospace' }}>{a.no}</td>
                      <td style={{ padding: '10px 14px', color: THEME.text }}>{a.desc}</td>
                      <td style={{ padding: '10px 14px', color: THEME.muted }}>{a.group}</td>
                      <td style={{ padding: '10px 14px', color: THEME.muted }}>{a.date}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: THEME.text, fontFamily: 'monospace' }}>{a.cost}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: '#f59e0b', fontFamily: 'monospace' }}>{a.accDepr}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: '#34d399', fontFamily: 'monospace', fontWeight: 600 }}>{a.nbv}</td>
                      <td style={{ padding: '10px 14px' }}>{statusChip(a.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Right Panel */}
        <aside style={{ width: 280, flexShrink: 0, background: THEME.card, borderLeft: `1px solid ${THEME.border}`, padding: 16, overflowY: 'auto' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: THEME.text, marginBottom: 4 }}>Depreciation Schedule</div>
          <div style={{ fontSize: 11, color: THEME.muted, marginBottom: 12 }}>{selectedAsset.no} — {selectedAsset.desc}</div>
          <div style={{ background: THEME.bg, borderRadius: 6, padding: 12, marginBottom: 16 }}>
            <DepreciationChart />
            <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 10 }}>
              <span style={{ color: '#6366f1' }}>-- Cost Basis</span>
              <span style={{ color: '#f59e0b' }}>— Acc. Depr</span>
              <span style={{ color: '#34d399' }}>— NBV</span>
            </div>
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: THEME.text, marginBottom: 10 }}>Asset Transactions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {ASSET_TRANSACTIONS.map((tx, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: THEME.bg, borderRadius: 5 }}>
                <div>
                  <div style={{ fontSize: 12, color: THEME.text, fontWeight: 500 }}>{tx.type}</div>
                  <div style={{ fontSize: 10, color: THEME.muted }}>{tx.date}</div>
                </div>
                <div style={{
                  fontSize: 12, fontFamily: 'monospace', fontWeight: 600,
                  color: tx.amount.startsWith('-') ? '#f59e0b' : tx.amount.startsWith('+') ? '#34d399' : '#6366f1',
                }}>{tx.amount}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, padding: 12, background: THEME.bg, borderRadius: 6 }}>
            <div style={{ fontSize: 11, color: THEME.muted, marginBottom: 8 }}>Selected Asset Summary</div>
            <div style={{ fontSize: 12, color: THEME.text, marginBottom: 5 }}><span style={{ color: THEME.muted }}>Acquisition Cost: </span>{selectedAsset.cost}</div>
            <div style={{ fontSize: 12, color: THEME.text, marginBottom: 5 }}><span style={{ color: THEME.muted }}>Acc. Depreciation: </span><span style={{ color: '#f59e0b' }}>{selectedAsset.accDepr}</span></div>
            <div style={{ fontSize: 12, color: THEME.text }}><span style={{ color: THEME.muted }}>Net Book Value: </span><span style={{ color: '#34d399', fontWeight: 700 }}>{selectedAsset.nbv}</span></div>
          </div>
        </aside>
      </div>
    </div>
  )
}
