'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'

// ─── Types ────────────────────────────────────────────────────────────────────

interface QualityOrder {
  orderNo: string
  type: 'Inspection' | 'Re-inspection' | 'Receiving' | 'Outgoing'
  item: string
  productionOrder: string
  qty: number
  inspector: string
  status: 'Open' | 'In Progress' | 'Passed' | 'Failed'
  result: 'pass' | 'fail' | 'pending'
}

interface NCR {
  ncrNo: string
  item: string
  defectType: string
  qty: number
  severity: 'Major' | 'Minor'
  status: 'Open' | 'Closed'
  disposition: string
}

interface TestResult {
  test: string
  spec: string
  min: string
  max: string
  actual: string
  result: 'pass' | 'fail'
}

// ─── Static data ─────────────────────────────────────────────────────────────

const QUALITY_ORDERS: QualityOrder[] = [
  { orderNo: 'QO-2026-0841', type: 'Inspection',    item: 'Widget A100',       productionOrder: 'P-2026-0441', qty: 50,  inspector: 'Tom J.',   status: 'In Progress', result: 'pending' },
  { orderNo: 'QO-2026-0840', type: 'Inspection',    item: 'Motor B200',        productionOrder: 'P-2026-0442', qty: 20,  inspector: 'Tom J.',   status: 'Passed',      result: 'pass'    },
  { orderNo: 'QO-2026-0839', type: 'Re-inspection', item: 'Control Panel C300',productionOrder: 'P-2026-0443', qty: 10,  inspector: 'Sarah K.', status: 'Failed',      result: 'fail'    },
  { orderNo: 'QO-2026-0838', type: 'Receiving',     item: 'Bolt M8 (PO-1205)', productionOrder: '—',           qty: 500, inspector: 'Tom J.',   status: 'Passed',      result: 'pass'    },
  { orderNo: 'QO-2026-0837', type: 'Outgoing',      item: 'Widget A100',       productionOrder: 'P-2026-0440', qty: 100, inspector: 'Sarah K.', status: 'Passed',      result: 'pass'    },
  { orderNo: 'QO-2026-0836', type: 'Inspection',    item: 'Circuit Board X400',productionOrder: 'P-2026-0439', qty: 30,  inspector: 'Tom J.',   status: 'Open',        result: 'pending' },
  { orderNo: 'QO-2026-0835', type: 'Inspection',    item: 'Motor B200',        productionOrder: 'P-2026-0438', qty: 15,  inspector: 'Sarah K.', status: 'Passed',      result: 'pass'    },
  { orderNo: 'QO-2026-0834', type: 'Re-inspection', item: 'Widget A100',       productionOrder: 'P-2026-0437', qty: 5,   inspector: 'Tom J.',   status: 'Passed',      result: 'pass'    },
  { orderNo: 'QO-2026-0833', type: 'Receiving',     item: 'Steel Frame Insert', productionOrder: '—',          qty: 200, inspector: 'Tom J.',   status: 'Passed',      result: 'pass'    },
  { orderNo: 'QO-2026-0832', type: 'Inspection',    item: 'Control Panel C300',productionOrder: 'P-2026-0436', qty: 25,  inspector: 'Sarah K.', status: 'Failed',      result: 'fail'    },
  { orderNo: 'QO-2026-0831', type: 'Outgoing',      item: 'Motor B200',        productionOrder: 'P-2026-0435', qty: 40,  inspector: 'Tom J.',   status: 'Passed',      result: 'pass'    },
  { orderNo: 'QO-2026-0830', type: 'Inspection',    item: 'Widget A100',       productionOrder: 'P-2026-0434', qty: 60,  inspector: 'Sarah K.', status: 'Open',        result: 'pending' },
]

const NCRS: NCR[] = [
  { ncrNo: 'NCR-2026-041', item: 'Control Panel C300', defectType: 'Assembly Defect', qty: 10, severity: 'Major', status: 'Open',   disposition: 'Pending Review'    },
  { ncrNo: 'NCR-2026-040', item: 'Motor Housing B200', defectType: 'Dimensional',     qty: 2,  severity: 'Minor', status: 'Closed', disposition: 'Rework Completed'  },
  { ncrNo: 'NCR-2026-039', item: 'Widget A100',        defectType: 'Surface Finish',  qty: 5,  severity: 'Minor', status: 'Open',   disposition: 'Return to Vendor'  },
  { ncrNo: 'NCR-2026-038', item: 'Circuit Board X400', defectType: 'Functional',      qty: 3,  severity: 'Major', status: 'Open',   disposition: 'Engineering Review' },
  { ncrNo: 'NCR-2026-037', item: 'Bolt M8',            defectType: 'Dimensional',     qty: 25, severity: 'Minor', status: 'Closed', disposition: 'Scrap'             },
]

const TEST_RESULTS: TestResult[] = [
  { test: 'Dimensional Check', spec: 'Width',       min: '49.5mm', max: '50.5mm', actual: '50.1mm',       result: 'pass' },
  { test: 'Weight',            spec: 'Mass',        min: '420g',   max: '440g',   actual: '432g',         result: 'pass' },
  { test: 'Electrical',        spec: 'Resistance',  min: '9.8\u03a9',   max: '10.2\u03a9',  actual: '10.0\u03a9',        result: 'pass' },
  { test: 'Visual',            spec: 'No defects',  min: '\u2014',       max: '\u2014',      actual: 'Scratch found',     result: 'fail' },
  { test: 'Functional',        spec: 'Operation',   min: 'Pass',   max: 'Pass',   actual: 'Pass',         result: 'pass' },
]

const TREND_MONTHS = ['May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr']
const TREND_DATA   = [92.1, 93.5, 94.0, 95.2, 96.1, 94.8, 95.5, 96.3, 97.1, 96.5, 96.8, 96.8]

const DONUT_DATA = [
  { label: 'Assembly',   value: 40, color: '#6366f1' },
  { label: 'Dimensional',value: 25, color: '#3b82f6' },
  { label: 'Surface',    value: 20, color: '#10b981' },
  { label: 'Functional', value: 10, color: '#f59e0b' },
  { label: 'Other',      value:  5, color: '#94a3b8' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusChip(s: string) {
  if (s === 'Passed' || s === 'Closed') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
  if (s === 'Failed' || s === 'Open')   return 'bg-red-500/10 text-red-400 border border-red-500/30'
  if (s === 'In Progress')              return 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
  return 'bg-zinc-700/40 text-zinc-400 border border-zinc-600/40'
}

function severityChip(s: string) {
  if (s === 'Major') return 'bg-red-500/10 text-red-400 border border-red-500/30'
  return 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
}

function typeChip(t: string) {
  const map: Record<string, string> = {
    Inspection:    'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25',
    'Re-inspection':'bg-orange-500/10 text-orange-400 border border-orange-500/25',
    Receiving:     'bg-blue-500/10 text-blue-400 border border-blue-500/25',
    Outgoing:      'bg-teal-500/10 text-teal-400 border border-teal-500/25',
  }
  return map[t] ?? 'bg-zinc-700/40 text-zinc-400 border border-zinc-600/40'
}

// ─── Quality Trend SVG ────────────────────────────────────────────────────────

function QualityTrend() {
  const W = 280, H = 130, PAD_L = 36, PAD_R = 8, PAD_T = 10, PAD_B = 28
  const innerW = W - PAD_L - PAD_R
  const innerH = H - PAD_T - PAD_B
  const MIN_Y = 85, MAX_Y = 100
  const TARGET = 90

  function px(i: number) { return PAD_L + (i / (TREND_MONTHS.length - 1)) * innerW }
  function py(v: number) { return PAD_T + ((MAX_Y - v) / (MAX_Y - MIN_Y)) * innerH }

  const points = TREND_DATA.map((v, i) => `${px(i)},${py(v)}`).join(' ')
  const targetY = py(TARGET)

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {/* Grid lines */}
      {[85, 90, 95, 100].map(v => (
        <g key={v}>
          <line x1={PAD_L} y1={py(v)} x2={W - PAD_R} y2={py(v)} stroke="rgba(99,102,241,0.1)" strokeWidth={1} />
          <text x={PAD_L - 4} y={py(v) + 3.5} textAnchor="end" fontSize={8} fill="#94a3b8">{v}%</text>
        </g>
      ))}
      {/* Target dashed line */}
      <line x1={PAD_L} y1={targetY} x2={W - PAD_R} y2={targetY} stroke="#ef4444" strokeWidth={1} strokeDasharray="4 3" />
      <text x={W - PAD_R} y={targetY - 3} textAnchor="end" fontSize={7} fill="#ef4444">Target 90%</text>
      {/* Area fill */}
      <polyline
        points={`${px(0)},${PAD_T + innerH} ${points} ${px(TREND_MONTHS.length - 1)},${PAD_T + innerH}`}
        fill="rgba(16,185,129,0.08)"
        stroke="none"
      />
      {/* Green line */}
      <polyline points={points} fill="none" stroke="#10b981" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots */}
      {TREND_DATA.map((v, i) => (
        <circle key={i} cx={px(i)} cy={py(v)} r={2.5} fill="#10b981" />
      ))}
      {/* X-axis labels */}
      {TREND_MONTHS.map((m, i) => (
        i % 2 === 0 && (
          <text key={i} x={px(i)} y={H - 8} textAnchor="middle" fontSize={8} fill="#94a3b8">{m}</text>
        )
      ))}
    </svg>
  )
}

// ─── Defect Donut SVG ─────────────────────────────────────────────────────────

function DefectDonut() {
  const total = DONUT_DATA.reduce((s, d) => s + d.value, 0)
  const R = 44, cx = 55, cy = 55
  const circ = 2 * Math.PI * R
  let offset = 0

  const slices = DONUT_DATA.map(d => {
    const pct = d.value / total
    const da = `${pct * circ} ${circ}`
    const doN = -offset * circ
    offset += pct
    return { ...d, da, doN }
  })

  return (
    <div className="flex items-center gap-4">
      <svg width={110} height={110} viewBox="0 0 110 110">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#1e293b" strokeWidth={14} />
        {slices.map((s, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={R}
            fill="none" stroke={s.color} strokeWidth={14}
            strokeDasharray={s.da} strokeDashoffset={s.doN}
            style={{ transformOrigin: `${cx}px ${cy}px`, transform: 'rotate(-90deg)' }}
          />
        ))}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#e2e8f0" fontSize={10} fontWeight={600}>Defects</text>
        <text x={cx} y={cy + 9} textAnchor="middle" fill="#94a3b8" fontSize={9}>by type</text>
      </svg>
      <div className="space-y-1.5">
        {DONUT_DATA.map(d => (
          <div key={d.label} className="flex items-center gap-2 text-[11px]">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.color }} />
            <span style={{ color: '#94a3b8' }}>{d.label}</span>
            <span className="font-semibold ml-auto" style={{ color: '#e2e8f0' }}>{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QualityPage() {
  const [ncrOpen, setNcrOpen] = useState(false)
  const [selectedOrder] = useState('QO-2026-0841')

  useEffect(() => {
    document.title = 'Quality Management \u2014 NovaPOS'
  }, [])

  const topBarActions = (
    <>
      <button
        className="px-3 py-1.5 rounded text-xs font-semibold"
        style={{ background: '#6366f1', color: '#fff' }}
      >
        New Quality Order
      </button>
      {['Record Results', 'Non-Conformance'].map(lbl => (
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
        title="Quality Management"
        breadcrumb={[{ label: 'Manufacturing', href: '/manufacturing' }, { label: 'Quality', href: '/manufacturing/quality' }]}
        actions={topBarActions}
      />

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-3 px-5 py-3 border-b" style={{ borderColor: 'rgba(99,102,241,0.15)' }}>
        {[
          { label: 'Open Quality Orders',  value: '12',     color: '#e2e8f0', sub: 'total open' },
          { label: 'Pass Rate (30d)',       value: '96.8%',  color: '#10b981', sub: 'last 30 days' },
          { label: 'Failed Inspections',   value: '4',      color: '#f87171', sub: 'last 30 days' },
          { label: 'Avg Inspection Time',  value: '0.4 hrs',color: '#e2e8f0', sub: 'per order' },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-xl p-3 border" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
            <div className="text-[10px] uppercase tracking-wide mb-1" style={{ color: '#94a3b8' }}>{kpi.label}</div>
            <div className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="text-[10px] mt-0.5" style={{ color: '#94a3b8' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Main two-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left 60% */}
        <div className="overflow-y-auto p-5 space-y-4" style={{ flex: '0 0 60%', borderRight: '1px solid rgba(99,102,241,0.15)' }}>
          {/* Quality Orders table */}
          <div className="rounded-xl border overflow-hidden" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
            <div className="px-4 py-3 border-b text-[11px] uppercase tracking-widest font-semibold" style={{ borderColor: 'rgba(99,102,241,0.12)', color: '#94a3b8' }}>
              Quality Orders
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
                    {['Order #', 'Type', 'Item', 'Prod. Order', 'Qty', 'Inspector', 'Status', 'Result'].map(h => (
                      <th key={h} className="text-left px-3 py-2 text-[10px] uppercase font-medium tracking-wide whitespace-nowrap" style={{ color: '#94a3b8' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {QUALITY_ORDERS.map((qo, i) => (
                    <tr
                      key={i}
                      className="border-b hover:brightness-110 transition-all"
                      style={{ borderColor: 'rgba(99,102,241,0.07)', background: qo.orderNo === selectedOrder ? 'rgba(99,102,241,0.06)' : 'transparent' }}
                    >
                      <td className="px-3 py-2.5 font-mono text-[11px]" style={{ color: '#6366f1' }}>{qo.orderNo}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ${typeChip(qo.type)}`}>
                          {qo.type}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: '#e2e8f0' }}>{qo.item}</td>
                      <td className="px-3 py-2.5 font-mono text-[11px]" style={{ color: '#94a3b8' }}>{qo.productionOrder}</td>
                      <td className="px-3 py-2.5 font-mono" style={{ color: '#94a3b8' }}>{qo.qty}</td>
                      <td className="px-3 py-2.5" style={{ color: '#94a3b8' }}>{qo.inspector}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusChip(qo.status)}`}>
                          {qo.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-[15px]">
                        {qo.result === 'pass'    && <span style={{ color: '#10b981' }}>&#10003;</span>}
                        {qo.result === 'fail'    && <span style={{ color: '#f87171' }}>&#10007;</span>}
                        {qo.result === 'pending' && <span style={{ color: '#94a3b8' }}>&#8212;</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Non-Conformance Reports FastTab */}
          <div className="rounded-xl border overflow-hidden" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
            <details open={ncrOpen} onToggle={e => setNcrOpen((e.target as HTMLDetailsElement).open)}>
              <summary
                className="flex items-center justify-between px-4 py-3 cursor-pointer border-b list-none"
                style={{ borderColor: 'rgba(99,102,241,0.12)' }}
              >
                <span className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: '#94a3b8' }}>
                  Non-Conformance Reports
                </span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d={ncrOpen ? 'M3 5L7 9L11 5' : 'M5 3L9 7L5 11'} stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </summary>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
                      {['NCR #', 'Item', 'Defect Type', 'Qty', 'Severity', 'Status', 'Disposition'].map(h => (
                        <th key={h} className="text-left px-3 py-2 text-[10px] uppercase font-medium tracking-wide whitespace-nowrap" style={{ color: '#94a3b8' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {NCRS.map((ncr, i) => (
                      <tr key={i} className="border-b hover:brightness-110 transition-all" style={{ borderColor: 'rgba(99,102,241,0.07)' }}>
                        <td className="px-3 py-2.5 font-mono text-[11px]" style={{ color: '#6366f1' }}>{ncr.ncrNo}</td>
                        <td className="px-3 py-2.5" style={{ color: '#e2e8f0' }}>{ncr.item}</td>
                        <td className="px-3 py-2.5" style={{ color: '#94a3b8' }}>{ncr.defectType}</td>
                        <td className="px-3 py-2.5 font-mono" style={{ color: '#94a3b8' }}>{ncr.qty}</td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium ${severityChip(ncr.severity)}`}>
                            {ncr.severity}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusChip(ncr.status)}`}>
                            {ncr.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5" style={{ color: '#94a3b8' }}>{ncr.disposition}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        </div>

        {/* Right 40% */}
        <div className="overflow-y-auto p-5 space-y-4" style={{ flex: '0 0 40%' }}>
          {/* Test/Measurement Results */}
          <div className="rounded-xl border overflow-hidden" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(99,102,241,0.12)' }}>
              <div className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: '#94a3b8' }}>
                Test Results
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: '#6366f1' }}>
                {selectedOrder}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
                    {['Test', 'Specification', 'Min', 'Max', 'Actual', 'Result'].map(h => (
                      <th key={h} className="text-left px-3 py-2 text-[10px] uppercase font-medium tracking-wide whitespace-nowrap" style={{ color: '#94a3b8' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TEST_RESULTS.map((t, i) => (
                    <tr key={i} className="border-b hover:brightness-110 transition-all" style={{ borderColor: 'rgba(99,102,241,0.07)' }}>
                      <td className="px-3 py-2.5 font-medium" style={{ color: '#e2e8f0' }}>{t.test}</td>
                      <td className="px-3 py-2.5" style={{ color: '#94a3b8' }}>{t.spec}</td>
                      <td className="px-3 py-2.5 font-mono text-[11px]" style={{ color: '#94a3b8' }}>{t.min}</td>
                      <td className="px-3 py-2.5 font-mono text-[11px]" style={{ color: '#94a3b8' }}>{t.max}</td>
                      <td className="px-3 py-2.5 font-mono text-[11px]" style={{ color: t.result === 'fail' ? '#fca5a5' : '#e2e8f0' }}>{t.actual}</td>
                      <td className="px-3 py-2.5">
                        {t.result === 'pass'
                          ? <span style={{ color: '#10b981', fontSize: 13 }}>&#10003; Pass</span>
                          : <span style={{ color: '#f87171', fontSize: 13 }}>&#10007; Fail</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 flex justify-end border-t" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
              <button
                className="px-3 py-1.5 rounded text-xs font-semibold"
                style={{ background: '#6366f1', color: '#fff' }}
              >
                Record Results
              </button>
            </div>
          </div>

          {/* Quality Trend */}
          <div className="rounded-xl border p-4" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
            <div className="text-[11px] uppercase tracking-widest font-semibold mb-3" style={{ color: '#94a3b8' }}>
              Pass Rate Trend (12 months)
            </div>
            <QualityTrend />
            <div className="flex items-center gap-4 mt-2 text-[11px]">
              <div className="flex items-center gap-1.5"><div className="w-3 h-0.5" style={{ background: '#10b981' }} /><span style={{ color: '#94a3b8' }}>Pass Rate</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-0.5" style={{ background: '#ef4444', borderTop: '1px dashed #ef4444' }} /><span style={{ color: '#94a3b8' }}>Target 90%</span></div>
            </div>
          </div>

          {/* Defect Donut */}
          <div className="rounded-xl border p-4" style={{ background: '#16213e', borderColor: 'rgba(99,102,241,0.15)' }}>
            <div className="text-[11px] uppercase tracking-widest font-semibold mb-3" style={{ color: '#94a3b8' }}>
              Defect Categories
            </div>
            <DefectDonut />
          </div>
        </div>
      </div>
    </div>
  )
}
