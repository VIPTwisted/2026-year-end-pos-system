'use client'

import { useEffect, useState } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ActiveCase {
  id: string
  priority: 'High' | 'Normal' | 'Low'
  channel: string
  owner: string
  title: string
  status: string
  initials: string
  color: string
}

interface PriorityBucket {
  value: number
  total: number
}

interface ProductItem {
  name: string
  count: number
}

interface IncidentType {
  label: string
  count: number
}

interface QueueTile {
  label: string
  count: number
  sublabel: string
  variant: 'blue' | 'dark'
}

interface DashboardData {
  activeCases: ActiveCase[]
  casesByPriority: { high: PriorityBucket; low: PriorityBucket; normal: PriorityBucket }
  casesByProduct: ProductItem[]
  casesByIncidentType: IncidentType[]
  queueTiles: QueueTile[]
}

// ─── SVG Components ───────────────────────────────────────────────────────────

function DonutChart({ value, total, label }: { value: number; total: number; label: string }) {
  const r = 45, cx = 60, cy = 60, sw = 14
  const circ = 2 * Math.PI * r
  const pct = value / Math.max(total, 1)
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={120} height={120}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={sw} />
        <circle
          cx={cx} cy={cy} r={r} fill="none" stroke="#3b82f6" strokeWidth={sw}
          strokeDasharray={`${pct * circ} ${(1 - pct) * circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        <text x={cx} y={cy} textAnchor="middle" dy="0.35em" fontSize="22" fontWeight="700" fill="white">{value}</text>
      </svg>
      <span className="text-xs" style={{ color: '#94a3b8' }}>{label}</span>
    </div>
  )
}

function BarChart({ data }: { data: IncidentType[] }) {
  const max = Math.max(...data.map(d => d.count), 1)
  const h = 140, barW = 32, gap = 8
  const totalW = data.length * (barW + gap)
  const yTicks = [0, 2, 4, 6, 8, 10]
  return (
    <svg width={totalW + 50} height={h + 50} style={{ overflow: 'visible' }}>
      {yTicks.map(v => (
        <g key={v}>
          <line x1={38} y1={h - (v / 10) * h} x2={totalW + 38} y2={h - (v / 10) * h} stroke="rgba(255,255,255,0.06)" />
          <text x={34} y={h - (v / 10) * h + 4} textAnchor="end" fontSize="10" fill="#64748b">{v}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const bh = Math.max((d.count / max) * h, 2)
        const x = i * (barW + gap) + 40
        return (
          <g key={i}>
            <rect x={x} y={h - bh} width={barW} height={bh} fill="#3b82f6" rx={2} opacity={0.85} />
            <text x={x + barW / 2} y={h + 16} textAnchor="middle" fontSize="9" fill="#94a3b8">{d.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const PRIORITY_COLORS: Record<string, string> = {
  High: '#ef4444',
  Normal: '#22c55e',
  Low: '#3b82f6',
}

const CHANNEL_ICONS: Record<string, string> = {
  Phone: '📞',
  Twitter: '🐦',
  Email: '✉',
  Web: '🌐',
  Chat: '💬',
}

function PriorityBadge({ priority }: { priority: string }) {
  const color = PRIORITY_COLORS[priority] ?? '#64748b'
  return (
    <span
      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
      style={{ background: color + '22', color, border: `1px solid ${color}44` }}
    >
      {priority}
    </span>
  )
}

function ChannelBadge({ channel }: { channel: string }) {
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>
      {channel}
    </span>
  )
}

function CaseCard({ c }: { c: ActiveCase }) {
  return (
    <div
      className="mb-2 p-2.5 rounded-lg cursor-pointer transition-all"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,0.35)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)' }}
    >
      {/* Top badges row */}
      <div className="flex items-center gap-1 flex-wrap mb-1.5">
        <PriorityBadge priority={c.priority} />
        <ChannelBadge channel={c.channel} />
        <span className="text-[10px]" style={{ color: '#64748b' }}>{c.owner}</span>
        <span className="ml-auto text-[10px]" style={{ color: '#475569' }}>···</span>
      </div>
      {/* Avatar + title */}
      <div className="flex items-start gap-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5"
          style={{ background: c.color, color: '#fff' }}
        >
          {c.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium leading-tight truncate" style={{ color: '#e2e8f0' }}>{c.title}</p>
        </div>
      </div>
      {/* Status row */}
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[11px]" style={{ color: '#94a3b8' }}>{c.status}</span>
        <button className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc' }}>
          ▼
        </button>
      </div>
    </div>
  )
}

function QueueTileCard({ tile }: { tile: QueueTile }) {
  const isBlue = tile.variant === 'blue'
  return (
    <div
      className="p-3 rounded-lg cursor-pointer transition-all flex flex-col gap-1"
      style={{
        background: isBlue ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isBlue ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.08)'}`,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = isBlue ? 'rgba(59,130,246,0.5)' : 'rgba(99,102,241,0.35)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = isBlue ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.08)' }}
    >
      <div className="text-2xl font-bold" style={{ color: isBlue ? '#60a5fa' : '#e2e8f0' }}>
        {tile.count}
      </div>
      <div className="text-[11px] leading-snug" style={{ color: isBlue ? '#93c5fd' : '#94a3b8' }}>{tile.label}</div>
      <div className="text-[10px]" style={{ color: isBlue ? '#3b82f6' : '#475569' }}>{tile.sublabel}</div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CustomerServiceDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/customer-service')
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
  }, [])

  if (!data) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center" style={{ background: '#0d0e24' }}>
        <div className="text-sm" style={{ color: '#64748b' }}>Loading dashboard...</div>
      </div>
    )
  }

  const { activeCases, casesByPriority, casesByProduct, casesByIncidentType, queueTiles } = data

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: '#0d0e24', color: '#e2e8f0' }}>

      {/* ── Action Ribbon ─────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-2 px-4 py-2 shrink-0"
        style={{ background: 'rgba(13,14,36,0.95)', borderBottom: '1px solid rgba(99,102,241,0.12)' }}
      >
        <button className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded transition-all" style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>
          <span className="text-[13px]">⊞</span> Show Global Filter
        </button>
        <button className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded transition-all" style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
          Set As Default
        </button>
        <button className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded transition-all" style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span className="text-[14px]">↺</span> Refresh All
        </button>
      </div>

      {/* ── Dashboard Header ──────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-5 py-3 shrink-0"
        style={{ background: 'rgba(15,18,48,0.7)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}
      >
        <h1 className="flex items-center gap-2 text-xl font-bold" style={{ color: '#e2e8f0' }}>
          Tier 2 Dashboard
          <button className="text-base" style={{ color: '#64748b' }}>▼</button>
        </h1>
        <button
          className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded"
          style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          Last Quarter 10/1/2017 – 12/31/2018 <span className="ml-1">▼</span>
        </button>
      </div>

      {/* ── 3-Column Body ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT COLUMN */}
        <aside
          className="flex flex-col shrink-0 overflow-hidden"
          style={{ width: '288px', borderRight: '1px solid rgba(99,102,241,0.1)' }}
        >
          {/* Active Cases header */}
          <div
            className="flex items-center justify-between px-3 py-2.5 shrink-0"
            style={{ borderBottom: '1px solid rgba(99,102,241,0.1)', background: 'rgba(255,255,255,0.02)' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold" style={{ color: '#e2e8f0' }}>Active Cases</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>Filtered</span>
            </div>
          </div>

          {/* Sort bar */}
          <div
            className="flex items-center gap-2 px-3 py-2 shrink-0"
            style={{ borderBottom: '1px solid rgba(99,102,241,0.08)', background: 'rgba(255,255,255,0.01)' }}
          >
            <button className="text-[12px]" style={{ color: '#64748b' }}>✏</button>
            <span className="text-[12px] font-semibold" style={{ color: '#94a3b8' }}>{activeCases.length} ↓</span>
            <button className="flex items-center gap-1 text-[11px]" style={{ color: '#64748b' }}>
              Modified On <span>▼</span>
            </button>
            <button className="ml-auto text-[12px]" style={{ color: '#64748b' }}>⊞</button>
          </div>

          {/* Cards list */}
          <div className="flex-1 overflow-y-auto p-3">
            {activeCases.map(c => <CaseCard key={c.id} c={c} />)}
          </div>
        </aside>

        {/* CENTER COLUMN */}
        <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

          {/* Cases By Priority */}
          <section
            className="rounded-xl p-4"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(99,102,241,0.12)' }}
          >
            <h2 className="text-[13px] font-semibold mb-4" style={{ color: '#94a3b8' }}>Cases By Priority</h2>
            <div className="flex items-center justify-around">
              <DonutChart value={casesByPriority.high.value} total={casesByPriority.high.total} label="High" />
              <DonutChart value={casesByPriority.low.value} total={casesByPriority.low.total} label="Low" />
              <DonutChart value={casesByPriority.normal.value} total={casesByPriority.normal.total} label="Normal" />
            </div>
          </section>

          {/* Cases By Product */}
          <section
            className="rounded-xl p-4"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(99,102,241,0.12)' }}
          >
            <h2 className="text-[13px] font-semibold mb-3" style={{ color: '#94a3b8' }}>Cases By Product</h2>
            <div className="flex flex-wrap gap-2">
              {casesByProduct.map(p => (
                <button
                  key={p.name}
                  className="flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-full transition-all"
                  style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}
                >
                  {p.name}
                  <span
                    className="text-[11px] px-1.5 py-0.5 rounded-full font-semibold"
                    style={{ background: 'rgba(99,102,241,0.25)', color: '#c7d2fe' }}
                  >
                    {p.count}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Case Mix by Incident Type */}
          <section
            className="rounded-xl p-4"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(99,102,241,0.12)' }}
          >
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-[13px] font-semibold" style={{ color: '#94a3b8' }}>Case Mix by Incident Type</h2>
              <span className="text-[11px]" style={{ color: '#475569' }}>Count:All (Case)</span>
            </div>
            {/* Y-axis label */}
            <div className="flex items-start gap-2">
              <div
                className="text-[10px] writing-mode-vertical shrink-0 mt-4"
                style={{ color: '#475569', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '60px', display: 'flex', alignItems: 'center' }}
              >
                Count
              </div>
              <div className="overflow-x-auto flex-1">
                <BarChart data={casesByIncidentType} />
              </div>
            </div>
          </section>

          {/* Case Resolution Trend */}
          <section
            className="rounded-xl p-4"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(99,102,241,0.12)' }}
          >
            <h2 className="text-[13px] font-semibold mb-4" style={{ color: '#94a3b8' }}>Case Resolution Trend</h2>
            <div className="flex items-center justify-center" style={{ height: '80px', color: '#475569', fontSize: '13px' }}>
              No data available.
            </div>
          </section>

        </main>

        {/* RIGHT COLUMN */}
        <aside
          className="flex flex-col shrink-0 overflow-hidden"
          style={{ width: '288px', borderLeft: '1px solid rgba(99,102,241,0.1)' }}
        >
          <div
            className="px-4 py-3 shrink-0"
            style={{ borderBottom: '1px solid rgba(99,102,241,0.1)', background: 'rgba(255,255,255,0.02)' }}
          >
            <h2 className="text-[13px] font-semibold" style={{ color: '#e2e8f0' }}>Other Queues and Views</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <div className="grid grid-cols-2 gap-2">
              {queueTiles.map((tile, i) => (
                <QueueTileCard key={i} tile={tile} />
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  )
}
