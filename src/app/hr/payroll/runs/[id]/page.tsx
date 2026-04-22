import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowLeft, Calculator, CheckCircle, BookOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  draft:      'bg-zinc-700/40 text-zinc-400',
  calculated: 'bg-blue-500/20 text-blue-400',
  approved:   'bg-amber-500/20 text-amber-400',
  posted:     'bg-emerald-500/20 text-emerald-400',
}

export default async function PayrollRunDetailPage({ params }: { params: { id: string } }) {
  const run = await prisma.payrollRun.findUnique({
    where: { id: params.id },
    include: { lines: { orderBy: { employeeName: 'asc' } } },
  })

  if (!run) notFound()

  return (
    <>
      <TopBar title={`Payroll Run ${run.runNo}`} />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          <Link href="/hr/payroll/runs" className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300">
            <ArrowLeft className="w-3 h-3" /> Back to Payroll Runs
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">HR / Payroll / Runs</p>
              <h2 className="text-[18px] font-semibold text-zinc-100">{run.runNo}</h2>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize mt-1 ${STATUS_COLOR[run.status] ?? 'bg-zinc-800/60 text-zinc-400'}`}>
                {run.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {run.status === 'draft' && (
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-blue-600 hover:bg-blue-500 text-white rounded-md font-medium">
                  <Calculator className="w-3 h-3" /> Calculate
                </button>
              )}
              {run.status === 'calculated' && (
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-amber-600 hover:bg-amber-500 text-white rounded-md font-medium">
                  <CheckCircle className="w-3 h-3" /> Approve
                </button>
              )}
              {run.status === 'approved' && (
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white rounded-md font-medium">
                  <BookOpen className="w-3 h-3" /> Post
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* General FastTab */}
            <div className="lg:col-span-2 bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-zinc-800/40 border-b border-zinc-800/60">
                <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-widest">General</span>
              </div>
              <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Run No.',         value: run.runNo },
                  { label: 'Status',          value: run.status },
                  { label: 'Payment Method',  value: run.paymentMethod },
                  { label: 'Period Start',    value: formatDate(run.periodStart) },
                  { label: 'Period End',      value: formatDate(run.periodEnd) },
                  { label: 'Pay Date',        value: formatDate(run.payDate) },
                  { label: 'Employee Count',  value: String(run.employeeCount) },
                  { label: 'Selection',       value: run.selectionMode.replace('_', ' ') },
                  { label: 'Description',     value: run.description ?? '—' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-0.5">{label}</p>
                    <p className="text-[13px] text-zinc-100 font-medium capitalize">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FactBox: Run Totals */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-zinc-800/40 border-b border-zinc-800/60">
                <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-widest">Run Totals</span>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { label: 'Total Gross',         value: formatCurrency(run.totalGross),         color: 'text-zinc-100' },
                  { label: 'Income Tax',           value: formatCurrency(run.totalTax),           color: 'text-red-400' },
                  { label: 'NI',                   value: formatCurrency(run.totalNI),            color: 'text-red-400' },
                  { label: 'Total Net',            value: formatCurrency(run.totalNet),           color: 'text-emerald-400' },
                  { label: 'Employer Costs',       value: formatCurrency(run.totalEmployerCosts), color: 'text-amber-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-[11px] text-zinc-500">{label}</span>
                    <span className={`text-[13px] font-semibold tabular-nums ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pay Lines FastTab */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-zinc-800/40 border-b border-zinc-800/60">
              <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-widest">Pay Lines ({run.lines.length})</span>
            </div>
            {run.lines.length === 0 ? (
              <div className="px-4 py-8 text-center text-[13px] text-zinc-600">No pay lines. Run Calculate to generate lines.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['Employee No.', 'Employee Name', 'Department', 'Gross Pay', 'Income Tax', 'NI', 'Net Pay', 'Bank Account'].map(h => (
                        <th key={h} className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${
                          ['Gross Pay','Income Tax','NI','Net Pay'].includes(h) ? 'text-right' : 'text-left'
                        }`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {run.lines.map(line => (
                      <tr key={line.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-[11px] text-zinc-400">{line.employeeNo ?? '—'}</td>
                        <td className="px-4 py-3 text-[13px] text-zinc-100">{line.employeeName ?? '—'}</td>
                        <td className="px-4 py-3 text-[12px] text-zinc-400">{line.department ?? '—'}</td>
                        <td className="px-4 py-3 text-right text-[12px] text-zinc-100 tabular-nums">{formatCurrency(line.grossPay)}</td>
                        <td className="px-4 py-3 text-right text-[12px] text-red-400 tabular-nums">{formatCurrency(line.incomeTax)}</td>
                        <td className="px-4 py-3 text-right text-[12px] text-red-400 tabular-nums">{formatCurrency(line.ni)}</td>
                        <td className="px-4 py-3 text-right text-[12px] text-emerald-400 font-semibold tabular-nums">{formatCurrency(line.netPay)}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-zinc-400">{line.bankAccount ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-zinc-800/60 bg-zinc-800/20">
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">Totals</td>
                      <td className="px-4 py-2 text-right text-[12px] font-bold text-zinc-100 tabular-nums">{formatCurrency(run.totalGross)}</td>
                      <td className="px-4 py-2 text-right text-[12px] font-bold text-red-400 tabular-nums">{formatCurrency(run.totalTax)}</td>
                      <td className="px-4 py-2 text-right text-[12px] font-bold text-red-400 tabular-nums">{formatCurrency(run.totalNI)}</td>
                      <td className="px-4 py-2 text-right text-[12px] font-bold text-emerald-400 tabular-nums">{formatCurrency(run.totalNet)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
    </>
  )
}
