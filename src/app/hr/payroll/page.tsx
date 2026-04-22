'use client'

import { useState } from 'react'
import {
  DollarSign, Users, CalendarDays, ChevronRight, Plus,
  Calculator, CheckCircle, Send, Ban, Download, Printer, X,
} from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'

type RunStatus = 'In Progress' | 'Calculated' | 'Approved' | 'Posted'

type PayRun = {
  id: string
  runNum: string
  period: string
  status: RunStatus
  employees: number
  gross: number
  net: number
  taxes: number
  postedDate: string | null
}

type StubLine = { label: string; amount: number; type: 'earning' | 'deduction' | 'tax' | 'total' }

const SEED_RUNS: PayRun[] = [
  { id: 'r1', runNum: 'PR-2026-008', period: 'Apr 16–30, 2026', status: 'In Progress', employees: 52, gross: 186240, net: 142105, taxes: 44135,  postedDate: null },
  { id: 'r2', runNum: 'PR-2026-007', period: 'Apr 1–15, 2026',  status: 'Posted',      employees: 52, gross: 184800, net: 141360, taxes: 43440,  postedDate: '2026-04-17' },
  { id: 'r3', runNum: 'PR-2026-006', period: 'Mar 16–31, 2026', status: 'Posted',      employees: 51, gross: 181950, net: 139452, taxes: 42498,  postedDate: '2026-04-02' },
  { id: 'r4', runNum: 'PR-2026-005', period: 'Mar 1–15, 2026',  status: 'Posted',      employees: 51, gross: 180720, net: 138651, taxes: 42069,  postedDate: '2026-03-18' },
  { id: 'r5', runNum: 'PR-2026-004', period: 'Feb 16–28, 2026', status: 'Approved',    employees: 50, gross: 178500, net: 136950, taxes: 41550,  postedDate: null },
  { id: 'r6', runNum: 'PR-2026-003', period: 'Feb 1–15, 2026',  status: 'Calculated',  employees: 50, gross: 177000, net: 135705, taxes: 41295,  postedDate: null },
]

const STUB_LINES: StubLine[] = [
  { label: 'Regular Earnings',  amount: 3200.00,  type: 'earning' },
  { label: 'Overtime',          amount:  480.00,  type: 'earning' },
  { label: 'Commission',        amount:  320.00,  type: 'earning' },
  { label: 'Federal Income Tax',amount: -740.00,  type: 'tax' },
  { label: 'State Income Tax',  amount: -192.00,  type: 'tax' },
  { label: 'Social Security',   amount: -248.64,  type: 'tax' },
  { label: 'Medicare',          amount:  -58.16,  type: 'tax' },
  { label: 'Medical Premium',   amount: -220.00,  type: 'deduction' },
  { label: '401(k)',            amount: -160.00,  type: 'deduction' },
  { label: 'Net Pay',           amount: 2381.20,  type: 'total' },
]

const STATUS_STYLE: Record<RunStatus, { bg: string; text: string; dot: string }> = {
  'In Progress': { bg: 'bg-blue-500/15',    text: 'text-blue-300',    dot: 'bg-blue-400' },
  'Calculated':  { bg: 'bg-amber-500/15',   text: 'text-amber-300',   dot: 'bg-amber-400' },
  'Approved':    { bg: 'bg-teal-500/15',    text: 'text-teal-300',    dot: 'bg-teal-400' },
  'Posted':      { bg: 'bg-emerald-500/15', text: 'text-emerald-300', dot: 'bg-emerald-400' },
}

function fmt(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function KpiTile({ label, value, sub, color = 'text-zinc-100' }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-[#13142b] border border-indigo-900/30 rounded-xl p-4">
      <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function PayrollPage() {
  const [runs] = useState<PayRun[]>(SEED_RUNS)
  const [activeRun, setActiveRun] = useState<PayRun | null>(null)
  const [showStub, setShowStub] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const current = runs[0]

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  return (
    <>
      <TopBar
        title="Payroll Integration"
        breadcrumb={[{ label: 'HR', href: '/hr' }]}
      />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Human Resources</p>
              <h2 className="text-[18px] font-semibold text-zinc-100">Payroll Integration</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">Current period: <span className="text-zinc-300">{current.period}</span></p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-zinc-500">HR</span>
              <ChevronRight className="w-3 h-3 text-zinc-700" />
              <span className="text-zinc-300">Payroll</span>
            </div>
          </div>

          {/* KPI Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <KpiTile label="Pay Period" value={current.period} sub="Current run" />
            <KpiTile label="Employees in Run" value={current.employees.toString()} sub="Active headcount" />
            <KpiTile label="Gross Pay" value={fmt(current.gross)} sub="Before deductions" color="text-emerald-400" />
            <KpiTile label="Net Pay" value={fmt(current.net)} sub="To employees" color="text-cyan-400" />
            <KpiTile label="Taxes" value={fmt(current.taxes)} sub="Fed + State + FICA" color="text-amber-400" />
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-1.5 py-2 border-y border-zinc-800/60 flex-wrap">
            {[
              { label: '+ New Pay Run',      primary: true,  icon: <Plus className="w-3.5 h-3.5" /> },
              { label: 'Calculate',          primary: false, icon: <Calculator className="w-3.5 h-3.5" /> },
              { label: 'Approve',            primary: false, icon: <CheckCircle className="w-3.5 h-3.5" /> },
              { label: 'Post',               primary: false, icon: <Send className="w-3.5 h-3.5" /> },
              { label: 'Void',               primary: false, icon: <Ban className="w-3.5 h-3.5" /> },
              { label: 'Export',             primary: false, icon: <Download className="w-3.5 h-3.5" /> },
              { label: 'Print Checks',       primary: false, icon: <Printer className="w-3.5 h-3.5" /> },
              { label: 'Direct Deposit File',primary: false, icon: <Send className="w-3.5 h-3.5" /> },
            ].map(({ label, primary, icon }) => (
              <button
                key={label}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-md font-medium transition-colors ${
                  primary
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {/* Pay Runs Table */}
          <div className="bg-[#13142b] border border-indigo-900/30 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800/60">
              <p className="text-[12px] font-semibold text-zinc-300">Payroll Runs</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-zinc-800/60">
                    <th className="w-8 px-4 py-2.5 text-left">
                      <input type="checkbox" className="accent-indigo-500" />
                    </th>
                    {['Run #', 'Period', 'Status', 'Employees', 'Gross Pay', 'Net Pay', 'Taxes', 'Posted Date'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-zinc-500 font-medium whitespace-nowrap">{h}</th>
                    ))}
                    <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r, i) => {
                    const s = STATUS_STYLE[r.status]
                    return (
                      <tr
                        key={r.id}
                        onClick={() => setActiveRun(r)}
                        className={`border-b border-zinc-800/40 hover:bg-zinc-800/30 transition-colors cursor-pointer ${i % 2 === 0 ? '' : 'bg-white/[0.01]'} ${activeRun?.id === r.id ? 'bg-indigo-900/10' : ''}`}
                      >
                        <td className="px-4 py-2.5">
                          <input
                            type="checkbox"
                            checked={selected.has(r.id)}
                            onChange={() => toggleSelect(r.id)}
                            onClick={e => e.stopPropagation()}
                            className="accent-indigo-500"
                          />
                        </td>
                        <td className="px-3 py-2.5 font-mono text-indigo-300 font-medium">{r.runNum}</td>
                        <td className="px-3 py-2.5 text-zinc-300 whitespace-nowrap">{r.period}</td>
                        <td className="px-3 py-2.5">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${s.bg} ${s.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            {r.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="flex items-center gap-1.5 text-zinc-200">
                            <Users className="w-3 h-3 text-zinc-500" />
                            {r.employees}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-medium text-zinc-100">{fmt(r.gross)}</td>
                        <td className="px-3 py-2.5 font-medium text-cyan-300">{fmt(r.net)}</td>
                        <td className="px-3 py-2.5 text-amber-300">{fmt(r.taxes)}</td>
                        <td className="px-3 py-2.5 text-zinc-500">{r.postedDate ?? '—'}</td>
                        <td className="px-3 py-2.5">
                          <button
                            onClick={e => { e.stopPropagation(); setActiveRun(r); setShowStub(true) }}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                          >
                            Pay Stub →
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pay stub detail panel */}
          {activeRun && (
            <div className="bg-[#13142b] border border-indigo-900/30 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wider">Pay Stub Breakdown</p>
                  <p className="text-[14px] font-semibold text-zinc-100 mt-0.5">{activeRun.runNum} · {activeRun.period}</p>
                </div>
                <button
                  onClick={() => setActiveRun(null)}
                  className="text-zinc-600 hover:text-zinc-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Sample employee stub */}
                <div>
                  <p className="text-[11px] text-zinc-500 mb-2">Sample: Aisha Torres · Apr 16–30, 2026</p>
                  <div className="space-y-1.5">
                    {STUB_LINES.map(line => (
                      <div
                        key={line.label}
                        className={`flex items-center justify-between py-1.5 px-3 rounded-lg ${
                          line.type === 'total' ? 'bg-indigo-600/20 border border-indigo-600/30 mt-2' :
                          line.type === 'earning' ? 'bg-zinc-800/40' :
                          line.type === 'tax' ? 'bg-red-900/10' :
                          'bg-zinc-800/20'
                        }`}
                      >
                        <span className={`text-[11px] ${line.type === 'total' ? 'font-semibold text-zinc-100' : 'text-zinc-400'}`}>
                          {line.label}
                        </span>
                        <span className={`text-[12px] font-medium ${
                          line.type === 'total' ? 'text-emerald-300' :
                          line.amount < 0 ? 'text-red-300' : 'text-zinc-200'
                        }`}>
                          {line.amount < 0 ? `-$${Math.abs(line.amount).toFixed(2)}` : `$${line.amount.toFixed(2)}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Run summary */}
                <div>
                  <p className="text-[11px] text-zinc-500 mb-2">Run Summary</p>
                  <div className="space-y-2">
                    {[
                      { label: 'Total Gross',    value: fmt(activeRun.gross),   color: 'text-zinc-200' },
                      { label: 'Total Taxes',    value: fmt(activeRun.taxes),   color: 'text-amber-300' },
                      { label: 'Deductions',     value: fmt(activeRun.gross - activeRun.net - activeRun.taxes), color: 'text-red-300' },
                      { label: 'Total Net Pay',  value: fmt(activeRun.net),     color: 'text-cyan-300' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex items-center justify-between py-2 px-3 bg-zinc-800/40 rounded-lg">
                        <span className="text-[11px] text-zinc-400">{label}</span>
                        <span className={`text-[13px] font-bold ${color}`}>{value}</span>
                      </div>
                    ))}
                    <div className="mt-2 flex items-center justify-between py-2 px-3 bg-zinc-800/40 rounded-lg">
                      <span className="text-[11px] text-zinc-400">Employees</span>
                      <span className="text-[13px] font-bold text-zinc-200">{activeRun.employees}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 px-3 bg-zinc-800/40 rounded-lg">
                      <span className="text-[11px] text-zinc-400">Status</span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLE[activeRun.status].bg} ${STATUS_STYLE[activeRun.status].text}`}>
                        {activeRun.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
