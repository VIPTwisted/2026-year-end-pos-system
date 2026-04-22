export const dynamic = 'force-dynamic'

import { TopBar } from '@/components/layout/TopBar'

// ─── Static mock data ──────────────────────────────────────────────────────────

const KPIS = [
  { label: 'Budget Plans',        value: '8',        color: 'text-zinc-100' },
  { label: 'Active Budgets',      value: '3',        color: 'text-emerald-400' },
  { label: 'YTD Variance',        value: '−$124k',   color: 'text-red-400' },
  { label: 'Budget Accuracy',     value: '91.3%',    color: 'text-sky-400' },
  { label: 'Uncommitted Balance', value: '$842k',    color: 'text-amber-400' },
]

const PLANS = [
  {
    no: 'BP-2026-001', name: 'FY2026 Operating Budget',      year: 'FY2026', status: 'Active',   total: 8420000,  allocated: 72, approvedBy: 'Sarah Chen',    modified: 'Apr 20, 2026',
    overview: { description: 'Annual operating budget covering all cost centers and departments for fiscal year 2026.', startDate: 'Jan 1, 2026', endDate: 'Dec 31, 2026', currency: 'USD' },
    dimensions: [{ name: 'Business Unit', value: 'Corporate' }, { name: 'Department', value: 'All' }, { name: 'Cost Center', value: 'Multiple' }],
    accounts: [{ account: '4000 – Revenue', budget: 5200000, actual: 3842000 }, { account: '5000 – COGS', budget: 2100000, actual: 1580000 }, { account: '6000 – OpEx', budget: 1120000, actual: 820000 }],
    workflow: [{ step: 'Draft Submitted', by: 'M. Torres', date: 'Jan 5, 2026', status: 'Complete' }, { step: 'CFO Review', by: 'Sarah Chen', date: 'Jan 12, 2026', status: 'Complete' }, { step: 'Board Approval', by: 'Board', date: 'Jan 20, 2026', status: 'Complete' }],
  },
  {
    no: 'BP-2026-002', name: 'Q2 Revised Operating Budget',  year: 'FY2026', status: 'Active',   total: 4180000,  allocated: 88, approvedBy: 'Sarah Chen',    modified: 'Apr 1, 2026',
    overview: { description: 'Q2 revised budget reflecting updated revenue projections and cost realignments.', startDate: 'Apr 1, 2026', endDate: 'Jun 30, 2026', currency: 'USD' },
    dimensions: [{ name: 'Business Unit', value: 'Operations' }, { name: 'Department', value: 'Finance' }],
    accounts: [{ account: '4000 – Revenue', budget: 2600000, actual: 1920000 }, { account: '6100 – Marketing', budget: 480000, actual: 360000 }],
    workflow: [{ step: 'Draft Submitted', by: 'J. Park', date: 'Mar 22, 2026', status: 'Complete' }, { step: 'CFO Approval', by: 'Sarah Chen', date: 'Apr 1, 2026', status: 'Complete' }],
  },
  {
    no: 'BP-2026-003', name: 'Capital Expenditure FY2026',   year: 'FY2026', status: 'Active',   total: 2150000,  allocated: 45, approvedBy: 'T. Wallace',    modified: 'Mar 15, 2026',
    overview: { description: 'Capital budget for equipment, infrastructure, and technology investments.', startDate: 'Jan 1, 2026', endDate: 'Dec 31, 2026', currency: 'USD' },
    dimensions: [{ name: 'Business Unit', value: 'IT & Facilities' }],
    accounts: [{ account: '1800 – Equipment', budget: 1200000, actual: 540000 }, { account: '1810 – Software', budget: 650000, actual: 290000 }],
    workflow: [{ step: 'Submitted', by: 'R. Okafor', date: 'Feb 10, 2026', status: 'Complete' }, { step: 'Approved', by: 'T. Wallace', date: 'Mar 15, 2026', status: 'Complete' }],
  },
  {
    no: 'BP-2026-004', name: 'R&D Investment Plan',          year: 'FY2026', status: 'Draft',    total: 980000,   allocated: 12, approvedBy: '—',             modified: 'Apr 18, 2026',
    overview: { description: 'Research and development budget for new product lines and technology.', startDate: 'May 1, 2026', endDate: 'Dec 31, 2026', currency: 'USD' },
    dimensions: [{ name: 'Business Unit', value: 'R&D' }],
    accounts: [{ account: '7000 – R&D Labor', budget: 580000, actual: 0 }, { account: '7100 – R&D Materials', budget: 400000, actual: 0 }],
    workflow: [{ step: 'Draft Created', by: 'L. Kim', date: 'Apr 18, 2026', status: 'In Progress' }],
  },
  {
    no: 'BP-2026-005', name: 'Marketing Campaign Budget',    year: 'FY2026', status: 'Draft',    total: 620000,   allocated: 0,  approvedBy: '—',             modified: 'Apr 19, 2026',
    overview: { description: 'Full-year marketing and advertising campaign budget across all channels.', startDate: 'May 1, 2026', endDate: 'Dec 31, 2026', currency: 'USD' },
    dimensions: [{ name: 'Business Unit', value: 'Marketing' }],
    accounts: [{ account: '6100 – Advertising', budget: 380000, actual: 0 }, { account: '6110 – Events', budget: 240000, actual: 0 }],
    workflow: [{ step: 'Draft Created', by: 'P. Nguyen', date: 'Apr 19, 2026', status: 'In Progress' }],
  },
  {
    no: 'BP-2025-009', name: 'FY2025 Operating Budget',      year: 'FY2025', status: 'Closed',   total: 7980000,  allocated: 100, approvedBy: 'M. Brooks',    modified: 'Dec 31, 2025',
    overview: { description: 'Closed FY2025 operating budget – archived for reporting purposes.', startDate: 'Jan 1, 2025', endDate: 'Dec 31, 2025', currency: 'USD' },
    dimensions: [{ name: 'Business Unit', value: 'Corporate' }, { name: 'Department', value: 'All' }],
    accounts: [{ account: '4000 – Revenue', budget: 5000000, actual: 4980000 }, { account: '5000 – COGS', budget: 2000000, actual: 1960000 }],
    workflow: [{ step: 'Year-End Closed', by: 'M. Brooks', date: 'Jan 5, 2026', status: 'Complete' }],
  },
  {
    no: 'BP-2025-010', name: 'FY2025 CapEx Budget',          year: 'FY2025', status: 'Closed',   total: 1840000,  allocated: 100, approvedBy: 'T. Wallace',   modified: 'Dec 31, 2025',
    overview: { description: 'Closed FY2025 capital expenditure budget.', startDate: 'Jan 1, 2025', endDate: 'Dec 31, 2025', currency: 'USD' },
    dimensions: [{ name: 'Business Unit', value: 'IT & Facilities' }],
    accounts: [{ account: '1800 – Equipment', budget: 1100000, actual: 1080000 }, { account: '1810 – Software', budget: 740000, actual: 725000 }],
    workflow: [{ step: 'Year-End Closed', by: 'T. Wallace', date: 'Jan 5, 2026', status: 'Complete' }],
  },
  {
    no: 'BP-2026-006', name: 'Contingency Reserve FY2026',   year: 'FY2026', status: 'On Hold',  total: 500000,   allocated: 0,  approvedBy: '—',             modified: 'Mar 1, 2026',
    overview: { description: 'Contingency reserve held pending board-level risk assessment completion.', startDate: 'Jan 1, 2026', endDate: 'Dec 31, 2026', currency: 'USD' },
    dimensions: [{ name: 'Business Unit', value: 'Corporate' }],
    accounts: [{ account: '9000 – Contingency', budget: 500000, actual: 0 }],
    workflow: [{ step: 'Pending Review', by: 'Board', date: '—', status: 'Pending' }],
  },
]

type Plan = typeof PLANS[0]

const BVA_MONTHS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr']

const BVA_DATA: {
  costCenter: string
  budget: number[]
  actual: number[]
  revised: number[]
}[] = [
  {
    costCenter: 'Corporate HQ',
    budget:  [420000, 435000, 460000, 448000, 455000, 462000],
    actual:  [418000, 441000, 472000, 430000, 488000, 478000],
    revised: [420000, 440000, 465000, 448000, 460000, 462000],
  },
  {
    costCenter: 'Operations',
    budget:  [310000, 318000, 325000, 320000, 328000, 335000],
    actual:  [305000, 312000, 340000, 315000, 322000, 351000],
    revised: [310000, 318000, 332000, 320000, 330000, 340000],
  },
  {
    costCenter: 'Sales & Marketing',
    budget:  [195000, 202000, 210000, 208000, 215000, 222000],
    actual:  [188000, 198000, 224000, 200000, 218000, 235000],
    revised: [195000, 202000, 216000, 208000, 218000, 228000],
  },
]

const BVA_SUMMARY = [
  { group: 'Revenue',          budget: 4200000, actual: 3842000, variance: -358000, pct: -8.5 },
  { group: 'COGS',             budget: 2100000, actual: 1580000, variance:  520000, pct:  24.8 },
  { group: 'Operating Expenses', budget: 1120000, actual:  940000, variance:  180000, pct:  16.1 },
  { group: 'R&D',              budget:  480000,  actual:  298000, variance:  182000, pct:  37.9 },
  { group: 'Sales & Marketing', budget:  620000,  actual:  590000, variance:  -30000, pct:  -4.8 },
  { group: 'G&A',              budget:  380000,  actual:  402000, variance:  -22000, pct:  -5.8 },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function fmtCompact(n: number) {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${n < 0 ? '−' : ''}$${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000)     return `${n < 0 ? '−' : ''}$${(abs / 1_000).toFixed(0)}k`
  return fmt(n)
}

function statusBadge(s: string) {
  if (s === 'Active')   return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
  if (s === 'Draft')    return 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
  if (s === 'Closed')   return 'bg-zinc-700/60 text-zinc-400 border border-zinc-600/30'
  if (s === 'On Hold')  return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
  return 'bg-zinc-700/50 text-zinc-400 border border-zinc-600/20'
}

function workflowBadge(s: string) {
  if (s === 'Complete')    return 'text-emerald-400'
  if (s === 'In Progress') return 'text-sky-400'
  if (s === 'Pending')     return 'text-amber-400'
  return 'text-zinc-500'
}

// ─── SVG BvA grouped bar chart ─────────────────────────────────────────────────

const BAR_W = 900
const BAR_H = 260
const BAR_PAD_L = 60
const BAR_PAD_R = 20
const BAR_PAD_T = 20
const BAR_PAD_B = 36
const BAR_INNER_W = BAR_W - BAR_PAD_L - BAR_PAD_R
const BAR_INNER_H = BAR_H - BAR_PAD_T - BAR_PAD_B
const NUM_MONTHS = 6
const GROUP_W = BAR_INNER_W / NUM_MONTHS
const BAR_SLOT = 10
const BAR_GAP  = 2

function bvaYMax() {
  let max = 0
  BVA_DATA.forEach(d => {
    d.budget.forEach(v => { if (v > max) max = v })
    d.actual.forEach(v => { if (v > max) max = v })
    d.revised.forEach(v => { if (v > max) max = v })
  })
  return Math.ceil(max * 1.1)
}

const Y_MAX = bvaYMax()

function barY(v: number) {
  return BAR_PAD_T + BAR_INNER_H - (v / Y_MAX) * BAR_INNER_H
}

function barH(v: number) {
  return (v / Y_MAX) * BAR_INNER_H
}

type FastTab = 'overview' | 'dimensions' | 'accounts' | 'workflow'
type TabId = 'plans' | 'entries' | 'bva'

// ─── Page component (server) — detail panel via searchParams ──────────────────

export default async function BudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; plan?: string; fasttab?: string }>
}) {
  const sp       = await searchParams
  const activeTab: TabId  = (sp.tab as TabId) ?? 'plans'
  const selectedPlan = sp.plan ?? null
  const fastTab: FastTab  = (sp.fasttab as FastTab) ?? 'overview'

  const detailPlan: Plan | null = selectedPlan
    ? (PLANS.find(p => p.no === selectedPlan) ?? null)
    : null

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Budgeting"
        breadcrumb={[{ label: 'Finance', href: '/finance' }]}
        actions={
          <>
            <a
              href="/finance/budget?tab=plans"
              className="h-8 px-3 rounded-md text-[12px] font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors inline-flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              New Budget Plan
            </a>
            <button className="h-8 px-3 rounded-md text-[12px] font-medium bg-[#16213e] border border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-colors">
              Import
            </button>
            <button className="h-8 px-3 rounded-md text-[12px] font-medium bg-[#16213e] border border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition-colors">
              Export
            </button>
          </>
        }
      />

      <main className="flex-1 p-6 space-y-6 overflow-auto">

        {/* ── KPIs ── */}
        <div className="grid grid-cols-5 gap-3">
          {KPIS.map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">{k.label}</p>
              <p className={`text-[22px] font-bold tabular-nums leading-none ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* ── Tab strip ── */}
        <div className="flex items-center gap-1 border-b border-zinc-800/50">
          {([['plans', 'Budget Plans'], ['entries', 'Budget Entries'], ['bva', 'Budget vs Actual']] as [TabId, string][]).map(([id, label]) => (
            <a
              key={id}
              href={`/finance/budget?tab=${id}`}
              className={`px-4 py-2.5 text-[12px] font-medium border-b-2 transition-colors -mb-px ${
                activeTab === id
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        {/* ── Budget Plans tab ── */}
        {activeTab === 'plans' && (
          <div className="flex gap-5">
            {/* Table */}
            <div className={`bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden ${detailPlan ? 'flex-1' : 'w-full'}`}>
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                    <th className="px-4 py-3 text-left text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Plan No.</th>
                    <th className="px-4 py-3 text-left text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Name</th>
                    <th className="px-4 py-3 text-left text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Fiscal Year</th>
                    <th className="px-4 py-3 text-left text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Status</th>
                    <th className="px-4 py-3 text-right text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Total Budget</th>
                    <th className="px-4 py-3 text-left text-[10px] text-zinc-500 uppercase tracking-wider font-medium w-28">Allocated %</th>
                    <th className="px-4 py-3 text-left text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Approved By</th>
                    <th className="px-4 py-3 text-left text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Last Modified</th>
                  </tr>
                </thead>
                <tbody>
                  {PLANS.map(p => (
                    <tr
                      key={p.no}
                      className={`border-b border-zinc-800/30 transition-colors ${
                        detailPlan?.no === p.no
                          ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500'
                          : 'hover:bg-zinc-800/20 cursor-pointer'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <a
                          href={`/finance/budget?tab=plans&plan=${encodeURIComponent(p.no)}`}
                          className="text-indigo-400 hover:text-indigo-300 font-mono tabular-nums text-[11px]"
                        >
                          {p.no}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-zinc-200 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-zinc-400">{p.year}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${statusBadge(p.status)}`}>{p.status}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-200 tabular-nums font-semibold">{fmtCompact(p.total)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${p.allocated >= 80 ? 'bg-emerald-500/70' : p.allocated >= 40 ? 'bg-amber-500/70' : 'bg-sky-500/70'}`}
                              style={{ width: `${p.allocated}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-zinc-500 w-8 text-right">{p.allocated}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{p.approvedBy}</td>
                      <td className="px-4 py-3 text-zinc-500 text-[11px]">{p.modified}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Detail panel */}
            {detailPlan && (
              <div className="w-[480px] shrink-0 bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col">
                {/* Panel header */}
                <div className="px-5 py-4 border-b border-zinc-800/50 flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-mono text-indigo-400">{detailPlan.no}</p>
                    <p className="text-[14px] font-semibold text-zinc-100 mt-0.5">{detailPlan.name}</p>
                  </div>
                  <a
                    href="/finance/budget?tab=plans"
                    className="text-zinc-500 hover:text-zinc-300 transition-colors text-[18px] leading-none mt-1"
                  >
                    ×
                  </a>
                </div>

                {/* FastTabs */}
                <div className="flex items-center gap-0.5 border-b border-zinc-800/50 px-4 pt-2">
                  {(['overview', 'dimensions', 'accounts', 'workflow'] as FastTab[]).map(ft => (
                    <a
                      key={ft}
                      href={`/finance/budget?tab=plans&plan=${encodeURIComponent(detailPlan.no)}&fasttab=${ft}`}
                      className={`px-3 py-2 text-[11px] font-medium capitalize border-b-2 -mb-px transition-colors ${
                        fastTab === ft
                          ? 'border-indigo-500 text-indigo-400'
                          : 'border-transparent text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {ft === 'bva' ? 'Budget vs Actual' : ft.charAt(0).toUpperCase() + ft.slice(1)}
                    </a>
                  ))}
                </div>

                {/* FastTab content */}
                <div className="flex-1 overflow-auto p-5 space-y-4">
                  {fastTab === 'overview' && (
                    <>
                      <p className="text-[12px] text-zinc-400 leading-relaxed">{detailPlan.overview.description}</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          ['Fiscal Year', detailPlan.year],
                          ['Status', detailPlan.status],
                          ['Start Date', detailPlan.overview.startDate],
                          ['End Date', detailPlan.overview.endDate],
                          ['Currency', detailPlan.overview.currency],
                          ['Total Budget', fmtCompact(detailPlan.total)],
                          ['Allocated', `${detailPlan.allocated}%`],
                          ['Approved By', detailPlan.approvedBy],
                        ].map(([k, v]) => (
                          <div key={k} className="bg-zinc-900/50 rounded-md p-3">
                            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">{k}</p>
                            <p className="text-[12px] text-zinc-200 font-medium">{v}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {fastTab === 'dimensions' && (
                    <div className="space-y-2">
                      {detailPlan.dimensions.map((d, i) => (
                        <div key={i} className="flex items-center justify-between bg-zinc-900/50 rounded-md px-4 py-3">
                          <span className="text-[11px] text-zinc-500">{d.name}</span>
                          <span className="text-[12px] text-zinc-200 font-medium">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {fastTab === 'accounts' && (
                    <div className="bg-zinc-900/50 rounded-md overflow-hidden">
                      <table className="w-full text-[11px]">
                        <thead>
                          <tr className="border-b border-zinc-800">
                            <th className="px-3 py-2 text-left text-[10px] text-zinc-600 uppercase font-medium">Account</th>
                            <th className="px-3 py-2 text-right text-[10px] text-zinc-600 uppercase font-medium">Budget</th>
                            <th className="px-3 py-2 text-right text-[10px] text-zinc-600 uppercase font-medium">Actual</th>
                            <th className="px-3 py-2 text-right text-[10px] text-zinc-600 uppercase font-medium">Variance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailPlan.accounts.map((a, i) => {
                            const variance = a.budget - a.actual
                            return (
                              <tr key={i} className="border-b border-zinc-800/30">
                                <td className="px-3 py-2.5 text-zinc-300">{a.account}</td>
                                <td className="px-3 py-2.5 text-right text-zinc-400 tabular-nums">{fmtCompact(a.budget)}</td>
                                <td className="px-3 py-2.5 text-right text-zinc-300 tabular-nums">{fmtCompact(a.actual)}</td>
                                <td className={`px-3 py-2.5 text-right tabular-nums font-semibold ${variance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {variance >= 0 ? '+' : '−'}{fmtCompact(Math.abs(variance))}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {fastTab === 'workflow' && (
                    <div className="space-y-3">
                      {detailPlan.workflow.map((w, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-[12px] text-zinc-200 font-medium">{w.step}</p>
                              <span className={`text-[10px] font-medium ${workflowBadge(w.status)}`}>{w.status}</span>
                            </div>
                            <p className="text-[11px] text-zinc-500">{w.by} · {w.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Budget Entries tab (placeholder) ── */}
        {activeTab === 'entries' && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-8 text-center">
            <p className="text-[13px] text-zinc-500">Select a budget plan to view and edit line-level budget entries.</p>
            <p className="text-[11px] text-zinc-700 mt-1">Navigate to Budget Plans tab → click a plan → select Accounts FastTab</p>
          </div>
        )}

        {/* ── Budget vs Actual tab ── */}
        {activeTab === 'bva' && (
          <div className="space-y-5">

            {/* Grouped bar chart */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[13px] font-semibold text-zinc-100">Budget vs Actual vs Revised</p>
                  <p className="text-[11px] text-zinc-500">Nov 2025 – Apr 2026 · 3 cost centers</p>
                </div>
                <div className="flex items-center gap-5 text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-3 rounded-sm bg-indigo-500/60 inline-block border border-indigo-500/80" />
                    Budget
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-3 rounded-sm bg-emerald-500/60 inline-block border border-emerald-500/80" />
                    Actual
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-3 rounded-sm bg-amber-500/40 inline-block border border-amber-500/60 border-dashed" />
                    Revised Budget
                  </span>
                </div>
              </div>

              <svg viewBox={`0 0 ${BAR_W} ${BAR_H}`} className="w-full" style={{ height: 280 }}>
                {/* Y grid + labels */}
                {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
                  const v = Y_MAX * t
                  const y = BAR_PAD_T + BAR_INNER_H - t * BAR_INNER_H
                  return (
                    <g key={i}>
                      <line x1={BAR_PAD_L} y1={y.toFixed(1)} x2={BAR_W - BAR_PAD_R} y2={y.toFixed(1)} stroke="#27272a" strokeWidth="1" />
                      <text x={(BAR_PAD_L - 8).toString()} y={(y + 3.5).toFixed(1)} textAnchor="end" fontSize="9" fill="#71717a">
                        {v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`}
                      </text>
                    </g>
                  )
                })}

                {/* Bars */}
                {BVA_MONTHS.map((month, mi) => {
                  const cx = BAR_PAD_L + mi * GROUP_W + GROUP_W / 2
                  const numCenters = BVA_DATA.length
                  // Each center has 3 bars: budget, actual, revised
                  const totalBars = numCenters * 3
                  const groupBlock = GROUP_W - 16
                  const singleBar = Math.floor(groupBlock / totalBars)
                  const gap = 1

                  return (
                    <g key={month}>
                      {BVA_DATA.map((d, ci) => {
                        const colors = ['#6366f1', '#10b981', '#f59e0b']
                        const fills  = ['rgba(99,102,241,0.55)', 'rgba(16,185,129,0.55)', 'rgba(245,158,11,0.35)']
                        const vals   = [d.budget[mi], d.actual[mi], d.revised[mi]]
                        const xBase  = cx - groupBlock / 2 + ci * (singleBar * 3 + gap * 3) + 2

                        return vals.map((v, vi) => {
                          const bx = xBase + vi * (singleBar + gap)
                          const bh = barH(v)
                          const by = barY(v)
                          return (
                            <rect
                              key={`${ci}-${vi}`}
                              x={bx.toFixed(1)}
                              y={by.toFixed(1)}
                              width={Math.max(singleBar, 6).toString()}
                              height={bh.toFixed(1)}
                              fill={fills[vi]}
                              stroke={colors[vi]}
                              strokeWidth="0.8"
                              rx="1"
                            />
                          )
                        })
                      })}

                      {/* Month label */}
                      <text x={cx.toFixed(1)} y={(BAR_H - 6).toString()} textAnchor="middle" fontSize="10" fill="#71717a">{month}</text>
                    </g>
                  )
                })}

                {/* Center name labels */}
                {BVA_DATA.map((d, ci) => {
                  const totalBars = BVA_DATA.length * 3
                  const groupBlock = GROUP_W - 16
                  const singleBar = Math.floor(groupBlock / totalBars)
                  const gap = 1
                  // position relative to first month group
                  const firstCX = BAR_PAD_L + 0 * GROUP_W + GROUP_W / 2
                  const xBase = firstCX - groupBlock / 2 + ci * (singleBar * 3 + gap * 3) + 2 + singleBar

                  return (
                    <text key={ci} x={xBase.toFixed(1)} y={(BAR_PAD_T - 6).toString()} textAnchor="middle" fontSize="8" fill="#52525b">
                      {d.costCenter.split(' ')[0]}
                    </text>
                  )
                })}

                {/* Axes */}
                <line x1={BAR_PAD_L.toString()} y1={BAR_PAD_T.toString()} x2={BAR_PAD_L.toString()} y2={(BAR_PAD_T + BAR_INNER_H).toString()} stroke="#3f3f46" strokeWidth="1" />
                <line x1={BAR_PAD_L.toString()} y1={(BAR_PAD_T + BAR_INNER_H).toString()} x2={(BAR_W - BAR_PAD_R).toString()} y2={(BAR_PAD_T + BAR_INNER_H).toString()} stroke="#3f3f46" strokeWidth="1" />
              </svg>
            </div>

            {/* BvA summary table */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800/50">
                <p className="text-[13px] font-semibold text-zinc-100">Budget vs Actual Summary</p>
              </div>
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-zinc-800/50 bg-zinc-900/20">
                    <th className="px-5 py-2.5 text-left text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Account Group</th>
                    <th className="px-5 py-2.5 text-right text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Budget</th>
                    <th className="px-5 py-2.5 text-right text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Actual</th>
                    <th className="px-5 py-2.5 text-right text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Variance $</th>
                    <th className="px-5 py-2.5 text-right text-[10px] text-zinc-500 uppercase tracking-wider font-medium">Variance %</th>
                  </tr>
                </thead>
                <tbody>
                  {BVA_SUMMARY.map((r, i) => (
                    <tr key={i} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-3 text-zinc-200 font-medium">{r.group}</td>
                      <td className="px-5 py-3 text-right text-zinc-300 tabular-nums">{fmtCompact(r.budget)}</td>
                      <td className="px-5 py-3 text-right text-zinc-200 tabular-nums font-semibold">{fmtCompact(r.actual)}</td>
                      <td className={`px-5 py-3 text-right tabular-nums font-semibold ${r.variance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {r.variance >= 0 ? '+' : '−'}{fmtCompact(Math.abs(r.variance))}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold tabular-nums ${
                          r.pct >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {r.pct >= 0 ? '+' : ''}{r.pct.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr className="bg-zinc-900/30 border-t-2 border-zinc-700/50">
                    <td className="px-5 py-3 text-zinc-100 font-bold text-[12px]">Total</td>
                    <td className="px-5 py-3 text-right text-zinc-100 tabular-nums font-bold">{fmtCompact(BVA_SUMMARY.reduce((s, r) => s + r.budget, 0))}</td>
                    <td className="px-5 py-3 text-right text-zinc-100 tabular-nums font-bold">{fmtCompact(BVA_SUMMARY.reduce((s, r) => s + r.actual, 0))}</td>
                    <td className="px-5 py-3 text-right tabular-nums font-bold text-zinc-400">
                      {(() => {
                        const v = BVA_SUMMARY.reduce((s, r) => s + r.variance, 0)
                        return `${v >= 0 ? '+' : '−'}${fmtCompact(Math.abs(v))}`
                      })()}
                    </td>
                    <td className="px-5 py-3 text-right" />
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        )}

      </main>
    </div>
  )
}
