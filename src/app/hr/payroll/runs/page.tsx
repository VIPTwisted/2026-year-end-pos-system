export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'

// ── Static mock data ──────────────────────────────────────────────────────────

type RunStatus = 'Open' | 'Calculated' | 'Posted' | 'Reversed'

interface PayrollRun {
  id: number
  runNo: string
  description: string
  periodStart: string
  periodEnd: string
  runDate: string
  status: RunStatus
  employees: number
  totalGross: number
  totalNet: number
  postedBy: string
}

const RUNS: PayrollRun[] = [
  { id: 1,  runNo: 'PR-2026-0015', description: 'Regular — Apr 16–30',     periodStart: 'Apr 16', periodEnd: 'Apr 30', runDate: 'Apr 30, 2026', status: 'Open',       employees: 47, totalGross: 284320, totalNet: 198650, postedBy: '—'           },
  { id: 2,  runNo: 'PR-2026-0014', description: 'Regular — Apr 1–15',      periodStart: 'Apr 1',  periodEnd: 'Apr 15', runDate: 'Apr 15, 2026', status: 'Posted',     employees: 47, totalGross: 281750, totalNet: 196980, postedBy: 'R. Castillo'  },
  { id: 3,  runNo: 'PR-2026-0013', description: 'Regular — Mar 16–31',     periodStart: 'Mar 16', periodEnd: 'Mar 31', runDate: 'Mar 31, 2026', status: 'Posted',     employees: 46, totalGross: 277400, totalNet: 193820, postedBy: 'R. Castillo'  },
  { id: 4,  runNo: 'PR-2026-0012', description: 'Regular — Mar 1–15',      periodStart: 'Mar 1',  periodEnd: 'Mar 15', runDate: 'Mar 15, 2026', status: 'Posted',     employees: 46, totalGross: 275900, totalNet: 192440, postedBy: 'J. Mendoza'   },
  { id: 5,  runNo: 'PR-2026-0011', description: 'Bonus — Q1 2026',         periodStart: 'Mar 1',  periodEnd: 'Mar 31', runDate: 'Mar 28, 2026', status: 'Posted',     employees: 44, totalGross: 62000,  totalNet: 41800,  postedBy: 'J. Mendoza'   },
  { id: 6,  runNo: 'PR-2026-0010', description: 'Regular — Feb 16–28',     periodStart: 'Feb 16', periodEnd: 'Feb 28', runDate: 'Feb 28, 2026', status: 'Posted',     employees: 45, totalGross: 270600, totalNet: 188920, postedBy: 'R. Castillo'  },
  { id: 7,  runNo: 'PR-2026-0009', description: 'Regular — Feb 1–15',      periodStart: 'Feb 1',  periodEnd: 'Feb 15', runDate: 'Feb 15, 2026', status: 'Posted',     employees: 45, totalGross: 268900, totalNet: 187640, postedBy: 'R. Castillo'  },
  { id: 8,  runNo: 'PR-2026-0008', description: 'Off-Cycle — Feb Adj',     periodStart: 'Feb 1',  periodEnd: 'Feb 15', runDate: 'Feb 12, 2026', status: 'Posted',     employees: 3,  totalGross: 4200,   totalNet: 3010,   postedBy: 'J. Mendoza'   },
  { id: 9,  runNo: 'PR-2026-0007', description: 'Regular — Jan 16–31',     periodStart: 'Jan 16', periodEnd: 'Jan 31', runDate: 'Jan 31, 2026', status: 'Posted',     employees: 44, totalGross: 265100, totalNet: 185070, postedBy: 'R. Castillo'  },
  { id: 10, runNo: 'PR-2026-0006', description: 'Regular — Jan 1–15',      periodStart: 'Jan 1',  periodEnd: 'Jan 15', runDate: 'Jan 15, 2026', status: 'Posted',     employees: 44, totalGross: 264800, totalNet: 184960, postedBy: 'J. Mendoza'   },
  { id: 11, runNo: 'PR-2026-0005', description: 'Supplemental — Dec Ovt',  periodStart: 'Dec 16', periodEnd: 'Dec 31', runDate: 'Jan 5, 2026',  status: 'Reversed',   employees: 12, totalGross: 18400,  totalNet: 12560,  postedBy: 'R. Castillo'  },
  { id: 12, runNo: 'PR-2026-0004', description: 'Regular — Dec 16–31',     periodStart: 'Dec 16', periodEnd: 'Dec 31', runDate: 'Dec 31, 2025', status: 'Posted',     employees: 43, totalGross: 261500, totalNet: 182880, postedBy: 'J. Mendoza'   },
  { id: 13, runNo: 'PR-2026-0003', description: 'Regular — Dec 1–15',      periodStart: 'Dec 1',  periodEnd: 'Dec 15', runDate: 'Dec 15, 2025', status: 'Posted',     employees: 43, totalGross: 259700, totalNet: 181620, postedBy: 'R. Castillo'  },
  { id: 14, runNo: 'PR-2026-0002', description: 'Regular — Nov 16–30',     periodStart: 'Nov 16', periodEnd: 'Nov 30', runDate: 'Nov 30, 2025', status: 'Posted',     employees: 42, totalGross: 255200, totalNet: 178420, postedBy: 'J. Mendoza'   },
  { id: 15, runNo: 'PR-2026-0001', description: 'Regular — Nov 1–15',      periodStart: 'Nov 1',  periodEnd: 'Nov 15', runDate: 'Nov 15, 2025', status: 'Calculated', employees: 42, totalGross: 253800, totalNet: 177540, postedBy: '—'            },
]

// Expanded detail for run 2 (PR-2026-0014) — shown when row is expanded
const DETAIL_EARNINGS = [
  { code: 'REG',  description: 'Regular Pay',        hours: 752,   rate: '$28.50', amount: 214320 },
  { code: 'OVT',  description: 'Overtime',           hours: 48,    rate: '$42.75', amount: 20520  },
  { code: 'VAC',  description: 'Vacation Payout',    hours: 16,    rate: '$28.50', amount: 10920  },
  { code: 'HOL',  description: 'Holiday Pay',        hours: 32,    rate: '$28.50', amount: 14720  },
  { code: 'COMM', description: 'Sales Commission',   hours: null,  rate: 'Var',    amount: 16800  },
  { code: 'BONUS',description: 'Spot Bonus',         hours: null,  rate: 'Flat',   amount: 4470   },
]

const DETAIL_DEDUCTIONS = [
  { code: 'FWT',   description: 'Federal Withholding',   employee: 38220, employer: 0     },
  { code: 'SWT',   description: 'State Withholding',     employee: 14088, employer: 0     },
  { code: 'SS',    description: 'Social Security',       employee: 17468, employer: 17468 },
  { code: 'MED',   description: 'Medicare',              employee: 4085,  employer: 4085  },
  { code: 'HLTH',  description: 'Health Insurance',      employee: 7210,  employer: 14420 },
  { code: '401K',  description: '401(k) Contribution',   employee: 8470,  employer: 4235  },
  { code: 'DENTAL',description: 'Dental / Vision',       employee: 1229,  employer: 614   },
]

// Prior period comparison data for SVG bar chart
const VARIANCE_DATA = [
  { label: 'REG',   current: 214320, prior: 211800 },
  { label: 'OVT',   current: 20520,  prior: 17200  },
  { label: 'VAC',   current: 10920,  prior: 9200   },
  { label: 'HOL',   current: 14720,  prior: 14720  },
  { label: 'COMM',  current: 16800,  prior: 21600  },
  { label: 'BONUS', current: 4470,   prior: 7230   },
]

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return '$' + n.toLocaleString('en-US')
}

const STATUS_CHIP: Record<RunStatus, string> = {
  Open:       'bg-zinc-700/40 text-zinc-400 border border-zinc-700/40',
  Calculated: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  Posted:     'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  Reversed:   'bg-red-500/20 text-red-400 border border-red-500/30',
}

// ── Variance bar chart (SVG) ──────────────────────────────────────────────────
function VarianceChart() {
  const maxVal = Math.max(...VARIANCE_DATA.flatMap(d => [d.current, d.prior]))
  const BAR_W = 18
  const GAP = 6
  const GROUP = BAR_W * 2 + GAP + 20
  const H = 80
  const LABEL_H = 14
  const PAD_T = 6
  const CHART_H = H - LABEL_H - PAD_T
  const W = VARIANCE_DATA.length * GROUP + 8

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      {VARIANCE_DATA.map((d, i) => {
        const x = 4 + i * GROUP
        const curH = (d.current / maxVal) * CHART_H
        const priH = (d.prior / maxVal) * CHART_H
        const diff = d.current - d.prior
        const up = diff >= 0
        return (
          <g key={d.label}>
            {/* Prior bar */}
            <rect
              x={x} y={PAD_T + CHART_H - priH}
              width={BAR_W} height={priH}
              rx={2} fill="rgba(113,113,122,0.35)"
            />
            {/* Current bar */}
            <rect
              x={x + BAR_W + 2} y={PAD_T + CHART_H - curH}
              width={BAR_W} height={curH}
              rx={2} fill={up ? 'rgba(99,102,241,0.7)' : 'rgba(239,68,68,0.6)'}
            />
            {/* Variance label */}
            <text
              x={x + BAR_W} y={PAD_T + CHART_H - Math.max(curH, priH) - 3}
              textAnchor="middle"
              fontSize={7}
              fill={up ? '#818cf8' : '#f87171'}
              fontFamily="ui-monospace,monospace"
            >
              {up ? '+' : ''}{((diff / (d.prior || 1)) * 100).toFixed(0)}%
            </text>
            {/* Group label */}
            <text
              x={x + BAR_W} y={H - 2}
              textAnchor="middle" fontSize={8}
              fill="#71717a" fontFamily="ui-monospace,monospace"
            >
              {d.label}
            </text>
          </g>
        )
      })}
      {/* Legend */}
      <g transform={`translate(${W - 80}, 0)`}>
        <rect x={0} y={2} width={8} height={8} rx={1} fill="rgba(113,113,122,0.35)" />
        <text x={11} y={10} fontSize={7.5} fill="#71717a" fontFamily="ui-sans-serif,sans-serif">Prior</text>
        <rect x={40} y={2} width={8} height={8} rx={1} fill="rgba(99,102,241,0.7)" />
        <text x={51} y={10} fontSize={7.5} fill="#71717a" fontFamily="ui-sans-serif,sans-serif">Curr</text>
      </g>
    </svg>
  )
}

// ── Expanded row detail ───────────────────────────────────────────────────────
function RunDetail() {
  return (
    <div className="bg-[#0f0f1a] border-t border-indigo-500/20 px-6 py-4 space-y-4">
      <div className="grid grid-cols-3 gap-4">

        {/* Earnings breakdown */}
        <div className="col-span-1 bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-zinc-800/50">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Earnings Detail</p>
          </div>
          <table className="w-full">
            <thead className="border-b border-zinc-800/40">
              <tr>
                {['Code', 'Hrs', 'Rate', 'Amount'].map(h => (
                  <th key={h} className={`px-2.5 py-2 text-[9px] uppercase tracking-widest text-zinc-600 font-medium ${h === 'Amount' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {DETAIL_EARNINGS.map(e => (
                <tr key={e.code} className="hover:bg-zinc-800/20">
                  <td className="px-2.5 py-1.5 font-mono text-[10px] text-indigo-400">{e.code}</td>
                  <td className="px-2.5 py-1.5 text-[10px] text-zinc-500 tabular-nums">{e.hours ?? '—'}</td>
                  <td className="px-2.5 py-1.5 text-[10px] text-zinc-400">{e.rate}</td>
                  <td className="px-2.5 py-1.5 text-[10px] text-zinc-200 tabular-nums text-right">{fmt(e.amount)}</td>
                </tr>
              ))}
              <tr className="border-t border-zinc-700/50">
                <td colSpan={3} className="px-2.5 py-1.5 text-[10px] font-semibold text-zinc-300">Total Gross</td>
                <td className="px-2.5 py-1.5 text-[11px] font-bold text-zinc-100 tabular-nums text-right">
                  {fmt(DETAIL_EARNINGS.reduce((s, e) => s + e.amount, 0))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Deduction breakdown */}
        <div className="col-span-1 bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-zinc-800/50">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Deductions</p>
          </div>
          <table className="w-full">
            <thead className="border-b border-zinc-800/40">
              <tr>
                {['Code', 'Description', 'EE', 'ER'].map(h => (
                  <th key={h} className={`px-2.5 py-2 text-[9px] uppercase tracking-widest text-zinc-600 font-medium ${['EE', 'ER'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {DETAIL_DEDUCTIONS.map(d => (
                <tr key={d.code} className="hover:bg-zinc-800/20">
                  <td className="px-2.5 py-1.5 font-mono text-[10px] text-amber-400">{d.code}</td>
                  <td className="px-2.5 py-1.5 text-[10px] text-zinc-400">{d.description}</td>
                  <td className="px-2.5 py-1.5 text-[10px] text-zinc-300 tabular-nums text-right">{fmt(d.employee)}</td>
                  <td className="px-2.5 py-1.5 text-[10px] text-zinc-500 tabular-nums text-right">{d.employer ? fmt(d.employer) : '—'}</td>
                </tr>
              ))}
              <tr className="border-t border-zinc-700/50">
                <td colSpan={2} className="px-2.5 py-1.5 text-[10px] font-semibold text-zinc-300">Total Deductions (EE)</td>
                <td className="px-2.5 py-1.5 text-[11px] font-bold text-rose-400 tabular-nums text-right">
                  {fmt(DETAIL_DEDUCTIONS.reduce((s, d) => s + d.employee, 0))}
                </td>
                <td className="px-2.5 py-1.5 text-[10px] text-zinc-500 tabular-nums text-right">
                  {fmt(DETAIL_DEDUCTIONS.reduce((s, d) => s + d.employer, 0))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Variance chart */}
        <div className="col-span-1 bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-zinc-800/50">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Variance vs Prior Period</p>
            <p className="text-[9px] text-zinc-600 mt-0.5">PR-2026-0014 vs PR-2026-0013</p>
          </div>
          <div className="p-3 overflow-x-auto">
            <VarianceChart />
          </div>
          <div className="px-3 pb-3 space-y-1">
            {VARIANCE_DATA.map(d => {
              const diff = d.current - d.prior
              const up = diff >= 0
              return (
                <div key={d.label} className="flex items-center justify-between text-[9.5px]">
                  <span className="text-zinc-500 font-mono w-12">{d.label}</span>
                  <span className={up ? 'text-indigo-400' : 'text-red-400'}>
                    {up ? '+' : ''}{fmt(diff)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PayrollRunsPage() {
  const lastRun  = RUNS.find(r => r.status === 'Posted')
  const totalEmp = lastRun?.employees ?? 0
  const totalGross = lastRun?.totalGross ?? 0
  const totalNet   = lastRun?.totalNet ?? 0

  // Row 2 (id=2) is pre-expanded to show the detail panel as static demo
  const expandedId = 2

  return (
    <>
      <TopBar
        title="Payroll Runs"
        breadcrumb={[
          { label: 'HR',      href: '/hr'         },
          { label: 'Payroll', href: '/hr/payroll'  },
        ]}
      />

      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-5 space-y-5">

          {/* ── Action ribbon ── */}
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800/60 flex-wrap">
            {[
              { label: 'New Run',     icon: 'M12 5v14M5 12h14',                                   cls: 'bg-indigo-600 hover:bg-indigo-500 text-white'   },
              { label: 'Process Run', icon: 'M5 3l14 9-14 9V3z',                                  cls: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'    },
              { label: 'Post Run',    icon: 'M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z', cls: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' },
              { label: 'Reverse Run', icon: 'M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15', cls: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' },
            ].map(({ label, icon, cls }) => (
              <button
                key={label}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-md transition-colors font-medium ${cls}`}
              >
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d={icon} />
                </svg>
                {label}
              </button>
            ))}
            <div className="ml-auto">
              <span className="text-[10px] text-zinc-600">{RUNS.length} runs total</span>
            </div>
          </div>

          {/* ── KPI tiles ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Last Run Date',       value: 'Apr 15, 2026',        accent: 'text-zinc-100'    },
              { label: 'Employees Processed', value: String(totalEmp),      accent: 'text-indigo-400'  },
              { label: 'Total Gross',         value: fmt(totalGross),        accent: 'text-zinc-100'    },
              { label: 'Net Pay',             value: fmt(totalNet),          accent: 'text-emerald-400' },
            ].map(({ label, value, accent }) => (
              <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-4 py-3.5">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
                <p className={`text-[20px] font-bold tabular-nums leading-none ${accent}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* ── Payroll runs table ── */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-zinc-800/60">
                  <tr>
                    {['Run No.', 'Description', 'Pay Period', 'Run Date', 'Status', 'Employees', 'Total Gross', 'Total Net', 'Posted By'].map(h => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-[9px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap
                          ${['Employees', 'Total Gross', 'Total Net'].includes(h) ? 'text-right' : 'text-left'}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {RUNS.map(run => (
                    <>
                      <tr
                        key={run.id}
                        className={`border-b border-zinc-800/40 hover:bg-zinc-800/25 transition-colors cursor-pointer
                          ${run.id === expandedId ? 'bg-zinc-800/20 border-b-0' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-[11px] text-indigo-400 hover:underline cursor-pointer">
                            {run.runNo}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-zinc-300 whitespace-nowrap">{run.description}</td>
                        <td className="px-4 py-3 text-[11px] text-zinc-400 whitespace-nowrap">
                          {run.periodStart} – {run.periodEnd}
                        </td>
                        <td className="px-4 py-3 text-[11px] text-zinc-400 whitespace-nowrap">{run.runDate}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_CHIP[run.status]}`}>
                            {run.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-[11px] text-zinc-300 tabular-nums">{run.employees}</td>
                        <td className="px-4 py-3 text-right text-[11px] text-zinc-100 tabular-nums font-medium">
                          {fmt(run.totalGross)}
                        </td>
                        <td className="px-4 py-3 text-right text-[11px] text-emerald-400 tabular-nums font-semibold">
                          {fmt(run.totalNet)}
                        </td>
                        <td className="px-4 py-3 text-[11px] text-zinc-400">{run.postedBy}</td>
                      </tr>

                      {/* Expanded detail panel for run id=2 */}
                      {run.id === expandedId && (
                        <tr key={`detail-${run.id}`}>
                          <td colSpan={9} className="p-0">
                            <RunDetail />
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── New Payroll Run modal (static, visible) ── */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800/50 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-zinc-100">New Payroll Run</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Configure pay period and run type before processing</p>
              </div>
              <span className="text-[9px] uppercase tracking-widest text-indigo-400 border border-indigo-500/30 px-2 py-1 rounded">
                Draft
              </span>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4 max-w-2xl">

              {/* Pay Period */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                  Pay Period Start
                </label>
                <div className="flex items-center bg-[#0f0f1a] border border-zinc-700/50 rounded-md px-3 py-2">
                  <span className="text-[12px] text-zinc-300 flex-1">Apr 16, 2026</span>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                  Pay Period End
                </label>
                <div className="flex items-center bg-[#0f0f1a] border border-zinc-700/50 rounded-md px-3 py-2">
                  <span className="text-[12px] text-zinc-300 flex-1">Apr 30, 2026</span>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
              </div>

              {/* Run Type */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                  Run Type
                </label>
                <div className="bg-[#0f0f1a] border border-zinc-700/50 rounded-md px-3 py-2 flex items-center justify-between">
                  <span className="text-[12px] text-zinc-300">Regular</span>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
                <div className="bg-[#0f0f1a] border border-zinc-800/40 rounded-md divide-y divide-zinc-800/40 mt-1 overflow-hidden">
                  {['Regular', 'Supplemental', 'Bonus', 'Off-Cycle'].map((opt, i) => (
                    <div key={opt} className={`px-3 py-1.5 text-[11px] cursor-pointer transition-colors ${i === 0 ? 'text-indigo-400 bg-indigo-500/10' : 'text-zinc-400 hover:bg-zinc-800/40'}`}>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                  Description
                </label>
                <div className="bg-[#0f0f1a] border border-zinc-700/50 rounded-md px-3 py-2">
                  <span className="text-[12px] text-zinc-400">Regular — Apr 16–30</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="px-4 py-2 text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors font-semibold">
                    Create Run
                  </button>
                  <button className="px-4 py-2 text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors">
                    Cancel
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </>
  )
}
