'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RouteListItem {
  id: string
  routeNo: string
  description: string
  status: 'Active' | 'Draft'
}

interface RouteOperation {
  opNo: number
  operation: string
  workCenter: string
  setupTime: number
  runTime: number
  queueTime: number
  moveTime: number
  costCategory: string
  workers: number
  status: 'Active' | 'Conditional'
}

// ─── Static data ─────────────────────────────────────────────────────────────

const ROUTE_LIST: RouteListItem[] = [
  { id: 'rtg001', routeNo: 'RTG-001', description: 'Assembly Standard',   status: 'Active' },
  { id: 'rtg002', routeNo: 'RTG-002', description: 'Machining Process',   status: 'Active' },
  { id: 'rtg003', routeNo: 'RTG-003', description: 'Quality Check Route', status: 'Active' },
  { id: 'rtg004', routeNo: 'RTG-004', description: 'Packaging Line',      status: 'Draft'  },
]

const OPERATIONS: RouteOperation[] = [
  { opNo: 10, operation: 'Receive Components', workCenter: 'RECV-WC',  setupTime: 0.25, runTime: 0.5,  queueTime: 0.5,  moveTime: 0.25, costCategory: 'Receiving', workers: 1, status: 'Active' },
  { opNo: 20, operation: 'Sub-Assembly Prep',  workCenter: 'ASSEM-B', setupTime: 0.5,  runTime: 0.75, queueTime: 0.25, moveTime: 0.25, costCategory: 'Assembly',  workers: 2, status: 'Active' },
  { opNo: 30, operation: 'Main Assembly',       workCenter: 'ASSEM-A', setupTime: 0.5,  runTime: 1.0,  queueTime: 0.5,  moveTime: 0.5,  costCategory: 'Assembly',  workers: 3, status: 'Active' },
  { opNo: 40, operation: 'Quality Inspection',  workCenter: 'QC-WC',   setupTime: 0.25, runTime: 0.25, queueTime: 0.25, moveTime: 0.25, costCategory: 'Quality',   workers: 1, status: 'Active' },
  { opNo: 50, operation: 'Rework (if needed)',  workCenter: 'ASSEM-B', setupTime: 0.5,  runTime: 0.5,  queueTime: 0,    moveTime: 0,    costCategory: 'Rework',    workers: 1, status: 'Conditional' },
  { opNo: 60, operation: 'Final Test',          workCenter: 'QC-WC',   setupTime: 0.1,  runTime: 0.25, queueTime: 0.25, moveTime: 0.25, costCategory: 'Quality',   workers: 1, status: 'Active' },
  { opNo: 70, operation: 'Packaging',           workCenter: 'PACK-WC', setupTime: 0.25, runTime: 0.5,  queueTime: 0.25, moveTime: 0.25, costCategory: 'Packaging', workers: 1, status: 'Active' },
  { opNo: 80, operation: 'Ship Staging',        workCenter: 'SHIP-WC', setupTime: 0.1,  runTime: 0.1,  queueTime: 0.5,  moveTime: 0,    costCategory: 'Shipping',  workers: 1, status: 'Active' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusChip(s: string) {
  if (s === 'Active')      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
  if (s === 'Draft')       return 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
  if (s === 'Conditional') return 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
  return 'bg-zinc-700/40 text-zinc-400 border border-zinc-600/40'
}

function wcColor(category: string): { fill: string; stroke: string; text: string } {
  const map: Record<string, { fill: string; stroke: string; text: string }> = {
    Receiving: { fill: 'rgba(59,130,246,0.15)',  stroke: 'rgba(59,130,246,0.5)',  text: '#93c5fd' },
    Assembly:  { fill: 'rgba(20,184,166,0.15)',  stroke: 'rgba(20,184,166,0.5)',  text: '#5eead4' },
    Rework:    { fill: 'rgba(20,184,166,0.1)',   stroke: 'rgba(20,184,166,0.3)',  text: '#5eead4' },
    Quality:   { fill: 'rgba(245,158,11,0.15)',  stroke: 'rgba(245,158,11,0.5)',  text: '#fcd34d' },
    Packaging: { fill: 'rgba(99,102,241,0.15)',  stroke: 'rgba(99,102,241,0.5)',  text: '#a5b4fc' },
    Shipping:  { fill: 'rgba(16,185,129,0.15)',  stroke: 'rgba(16,185,129,0.5)',  text: '#6ee7b7' },
  }
  return map[category] ?? { fill: 'rgba(148,163,184,0.1)', stroke: 'rgba(148,163,184,0.3)', text: '#94a3b8' }
}

// ─── Route Flow SVG ───────────────────────────────────────────────────────────

function RouteFlow({ operations }: { operations: RouteOperation[] }) {
  const BOX_W = 90, BOX_H = 52, GAP = 28
  const totalW = operations.length * BOX_W + (operations.length - 1) * GAP + 20
  const totalH = BOX_H + 60

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={totalW} height={totalH} viewBox={`0 0 ${totalW} ${totalH}`}>
        <defs>
          <marker id="flow-arr" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <polygon points="0 0, 7 3.5, 0 7" fill="rgba(99,102,241,0.5)" />
          </marker>
        </defs>
        {operations.map((op, i) => {
          const x = 10 + i * (BOX_W + GAP)
          const y = 10
          const col = wcColor(op.costCategory)
          const nextOp = operations[i + 1]
          return (
            <g key={op.opNo}>
              {nextOp && (
                <g>
                  <line
                    x1={x + BOX_W} y1={y + BOX_H / 2}
                    x2={x + BOX_W + GAP - 2} y2={y + BOX_H / 2}
                    stroke="rgba(99,102,241,0.4)" strokeWidth="1.5"
                    markerEnd="url(#flow-arr)"
                  />
                  <text
                    x={x + BOX_W + GAP / 2} y={y + BOX_H / 2 - 5}
                    textAnchor="middle" fontSize={8} fill="#94a3b8"
                  >
                    {nextOp.queueTime > 0 ? `${nextOp.queueTime}h` : ''}
                  </text>
                </g>
              )}
              <rect
                x={x} y={y} width={BOX_W} height={BOX_H} rx={6}
                fill={col.fill} stroke={col.stroke} strokeWidth={1}
              />
              <text x={x + BOX_W / 2} y={y + 14} textAnchor="middle" fontSize={10} fontWeight={700} fill={col.text}>
                {String(op.opNo).padStart(3, '0')}
              </text>
              <text x={x + BOX_W / 2} y={y + 26} textAnchor="middle" fontSize={8} fill="#e2e8f0">
                {op.workCenter}
              </text>
              <text x={x + BOX_W / 2} y={y + 39} textAnchor="middle" fontSize={8} fill="#94a3b8">
                {op.runTime}h run
              </text>
              {op.status === 'Conditional' && (
                <text x={x + BOX_W / 2} y={y + BOX_H - 4} textAnchor="middle" fontSize={7} fill="#93c5fd">
                  conditional
                </text>
              )}
              <text x={x + BOX_W / 2} y={y + BOX_H + 14} textAnchor="middle" fontSize={8} fill="#94a3b8">
                {op.operation.length > 14 ? op.operation.slice(0, 14) + '\u2026' : op.operation}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RoutesPage() {
  const [selectedId, setSelectedId] = useState('rtg001')
  const [opsOpen, setOpsOpen] = useState(true)

  useEffect(() => {
    document.title = 'Production Routes \u2014 NovaPOS'
  }, [])

  const selected = ROUTE_LIST.find(r => r.id === selectedId) ?? ROUTE_LIST[0]

  const sumSetup  = OPERATIONS.reduce((s, o) => s + o.setupTime,  0)
  const sumRun    = OPERATIONS.reduce((s, o) => s + o.runTime,    0)
  const sumQueue  = OPERATIONS.reduce((s, o) => s + o.queueTime,  0)
  const sumMove   = OPERATIONS.reduce((s, o) => s + o.moveTime,   0)

  const topBarActions = (
    <>
      <button
        className="px-3 py-1.5 rounded text-xs font-semibold"
        style={{ background: '#6366f1', color: '#fff' }}
      >
        New Route
      </button>
      {['Copy Route', 'Approve'].map(lbl => (
        <button
          key={lbl}
          className="px-3 py-1.5 rounded text-xs font-medium"
          style={{ background: 'rgba(99,102,241,0.12)', color: '#e2e8f0', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          {lbl}
        </button>
      ))}
    </>
  )

  return (
    <div className="flex flex-col min-h-[100dvh]" style={{ background: '#0d0e24', color: '#e2e8f0' }}>
      <TopBar
        title="Production Routes"
        breadcrumb={[{ label: 'Manufacturing', href: '/manufacturing' }, { label: 'Routes', href: '/manufacturing/routes' }]}
        actions={topBarActions}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div
          className="flex-shrink-0 border-r overflow-y-auto"
          style={{ width: 220, borderColor: 'rgba(99,102,241,0.15)', background: '#0d0e24' }}
        >
          <div className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-widest font-semibold" style={{ color: '#94a3b8' }}>
            Routes
          </div>
          {ROUTE_LIST.map(r => {
            const sel = r.id === selectedId
            return (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className="w-full text-left px-3 py-2.5 transition-colors"
                style={{
                  background: sel ? 'rgba(99,102,241,0.1)' : 'transparent',
                  borderLeft: sel ? '3px solid #6366f1' : '3px solid transparent',
                }}
              >
                <div className="text-[12px] font-mono font-semibold" style={{ color: sel ? '#a5b4fc' : '#6366f1' }}>
                  {r.routeNo}
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: sel ? '#e2e8f0' : '#94a3b8' }}>
                  {r.description}
                </div>
                <div className="mt-1">
                  <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium ${statusChip(r.status)}`}>
                    {r.status}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Center scrollable */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Route Header */}
            <div className="rounded-xl p-4 border" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
              <div className="text-[11px] uppercase tracking-widest font-semibold mb-3" style={{ color: '#94a3b8' }}>
                Route Header
              </div>
              <div className="grid grid-cols-3 gap-x-8 gap-y-3 text-[13px]">
                {[
                  ['Route No.',    selected.routeNo],
                  ['Description',  selected.description],
                  ['Item',         'Widget Assembly A100'],
                  ['Status',       'Approved'],
                  ['Effective',    'Jan 1, 2026'],
                  ['Total Time',   '3.5 hours'],
                  ['Machine Time', '1.5 hours'],
                  ['Labor Time',   '2.0 hours'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: '#94a3b8' }}>{label}</div>
                    <div className="font-medium" style={{ color: '#e2e8f0' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Route Operations FastTab */}
            <div className="rounded-xl border overflow-hidden" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
              <details open={opsOpen} onToggle={e => setOpsOpen((e.target as HTMLDetailsElement).open)}>
                <summary
                  className="flex items-center justify-between px-4 py-3 cursor-pointer border-b list-none"
                  style={{ borderColor: 'rgba(99,102,241,0.12)' }}
                >
                  <span className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: '#94a3b8' }}>
                    Route Operations
                  </span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d={opsOpen ? 'M3 5L7 9L11 5' : 'M5 3L9 7L5 11'} stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
                        {['Op #', 'Operation', 'Work Center', 'Setup Time', 'Run Time', 'Queue Time', 'Move Time', 'Cost Category', 'Workers Req.', 'Status'].map(h => (
                          <th key={h} className="text-left px-3 py-2 text-[10px] uppercase font-medium tracking-wide whitespace-nowrap" style={{ color: '#94a3b8' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {OPERATIONS.map((op, i) => {
                        const col = wcColor(op.costCategory)
                        return (
                          <tr
                            key={i}
                            className="border-b hover:brightness-110 transition-all"
                            style={{ borderColor: 'rgba(99,102,241,0.07)' }}
                          >
                            <td className="px-3 py-2.5 font-mono font-semibold" style={{ color: '#6366f1' }}>{String(op.opNo).padStart(3, '0')}</td>
                            <td className="px-3 py-2.5" style={{ color: '#e2e8f0' }}>{op.operation}</td>
                            <td className="px-3 py-2.5 font-mono text-[11px]" style={{ color: '#a5b4fc' }}>{op.workCenter}</td>
                            <td className="px-3 py-2.5 font-mono" style={{ color: '#94a3b8' }}>{op.setupTime} hr</td>
                            <td className="px-3 py-2.5 font-mono" style={{ color: '#e2e8f0' }}>{op.runTime} hr</td>
                            <td className="px-3 py-2.5 font-mono" style={{ color: '#94a3b8' }}>{op.queueTime} hr</td>
                            <td className="px-3 py-2.5 font-mono" style={{ color: '#94a3b8' }}>{op.moveTime} hr</td>
                            <td className="px-3 py-2.5">
                              <span
                                className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium"
                                style={{ background: col.fill, color: col.text, border: `1px solid ${col.stroke}` }}
                              >
                                {op.costCategory}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 font-mono" style={{ color: '#94a3b8' }}>{op.workers}</td>
                            <td className="px-3 py-2.5">
                              <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusChip(op.status)}`}>
                                {op.status}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.06)' }}>
                        <td colSpan={3} className="px-3 py-3 text-right text-[12px] font-semibold" style={{ color: '#94a3b8' }}>
                          Totals
                        </td>
                        <td className="px-3 py-3 font-mono font-semibold" style={{ color: '#e2e8f0' }}>{sumSetup.toFixed(2)}hr</td>
                        <td className="px-3 py-3 font-mono font-semibold" style={{ color: '#e2e8f0' }}>{sumRun.toFixed(2)}hr</td>
                        <td className="px-3 py-3 font-mono font-semibold" style={{ color: '#e2e8f0' }}>{sumQueue.toFixed(2)}hr</td>
                        <td className="px-3 py-3 font-mono font-semibold" style={{ color: '#e2e8f0' }}>{sumMove.toFixed(2)}hr</td>
                        <td colSpan={3} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </details>
            </div>
          </div>

          {/* Right — Route Flow Diagram */}
          <div
            className="flex-shrink-0 border-l overflow-y-auto p-4"
            style={{ width: 300, borderColor: 'rgba(99,102,241,0.15)', background: '#0d0e24' }}
          >
            <div className="text-[10px] uppercase tracking-widest font-semibold mb-3" style={{ color: '#94a3b8' }}>
              Route Flow Diagram
            </div>
            <div className="text-[11px] mb-3" style={{ color: '#94a3b8' }}>Scroll horizontally to see full flow</div>
            <div className="space-y-1.5 mb-4">
              {[
                ['Receiving', wcColor('Receiving')],
                ['Assembly',  wcColor('Assembly')],
                ['Quality',   wcColor('Quality')],
                ['Packaging', wcColor('Packaging')],
                ['Shipping',  wcColor('Shipping')],
              ].map(([label, col]) => {
                const c = col as ReturnType<typeof wcColor>
                return (
                  <div key={label as string} className="flex items-center gap-2 text-[11px]">
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: c.fill, border: `1px solid ${c.stroke}` }} />
                    <span style={{ color: '#94a3b8' }}>{label as string}</span>
                  </div>
                )
              })}
            </div>
            <RouteFlow operations={OPERATIONS} />
          </div>
        </div>
      </div>
    </div>
  )
}
