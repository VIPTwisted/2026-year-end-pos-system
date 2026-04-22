import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Receipt, Plus, ArrowRight, CheckCircle, Send } from 'lucide-react'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  open:      'bg-blue-500/20 text-blue-400',
  submitted: 'bg-amber-500/20 text-amber-400',
  approved:  'bg-emerald-500/20 text-emerald-400',
  rejected:  'bg-red-500/20 text-red-400',
  posted:    'bg-zinc-700/40 text-zinc-400',
}

export default async function ExpenseSheetsPage() {
  const sheets = await prisma.expenseSheet.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const stats = {
    total:     sheets.length,
    open:      sheets.filter(s => s.status === 'open').length,
    submitted: sheets.filter(s => s.status === 'submitted').length,
    approved:  sheets.filter(s => s.status === 'approved').length,
    totalAmt:  sheets.reduce((s, e) => s + e.totalAmount, 0),
  }

  return (
    <>
      <TopBar title="Expense Sheets" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Projects</p>
              <h2 className="text-[18px] font-semibold text-zinc-100">Expense Sheets</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">{sheets.length} records</p>
            </div>
            <Link href="/projects/expense-sheets/new">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium">
                <Plus className="w-3.5 h-3.5" /> New Expense Sheet
              </button>
            </Link>
          </div>

          {/* Action Ribbon */}
          <div className="flex items-center gap-2 pb-1 border-b border-zinc-800/60">
            {[
              { label: 'New', icon: Plus, href: '/projects/expense-sheets/new', cls: 'bg-blue-600 hover:bg-blue-500 text-white' },
              { label: 'Submit', icon: Send, href: '#', cls: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' },
              { label: 'Approve', icon: CheckCircle, href: '#', cls: 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200' },
            ].map(({ label, icon: Icon, href, cls }) => (
              <Link key={label} href={href}>
                <button className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-md transition-colors font-medium ${cls}`}>
                  <Icon className="w-3 h-3" /> {label}
                </button>
              </Link>
            ))}
          </div>

          {/* KPI */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Total',      value: String(stats.total),              color: 'text-zinc-100' },
              { label: 'Open',       value: String(stats.open),               color: 'text-blue-400' },
              { label: 'Submitted',  value: String(stats.submitted),          color: 'text-amber-400' },
              { label: 'Approved',   value: String(stats.approved),           color: 'text-emerald-400' },
              { label: 'Total Amt',  value: formatCurrency(stats.totalAmt),   color: 'text-amber-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-3.5">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
                <p className={`text-[20px] font-bold tabular-nums ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          {sheets.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-12">
              <Receipt className="w-10 h-10 mb-3 text-zinc-700 opacity-50" />
              <p className="text-[13px] text-zinc-500 mb-4">No expense sheets yet.</p>
              <Link href="/projects/expense-sheets/new">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-lg">
                  <Plus className="w-3.5 h-3.5" /> New Expense Sheet
                </button>
              </Link>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['Sheet No.', 'Employee', 'Period', 'Status', 'Total Amount', ''].map(h => (
                        <th key={h} className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${
                          h === 'Total Amount' ? 'text-right' :
                          h === 'Status' ? 'text-center' : 'text-left'
                        }`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {sheets.map(s => (
                      <tr key={s.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-[11px] text-blue-400">{s.sheetNo}</td>
                        <td className="px-4 py-3 text-[13px] text-zinc-100">{s.employeeName ?? '—'}</td>
                        <td className="px-4 py-3 text-[11px] text-zinc-400 whitespace-nowrap">
                          {formatDate(s.periodStart)} – {formatDate(s.periodEnd)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${STATUS_COLOR[s.status] ?? 'bg-zinc-800/60 text-zinc-400'}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-[12px] text-emerald-400 font-semibold tabular-nums">{formatCurrency(s.totalAmount)}</td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/projects/expense-sheets/${s.id}`} className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300">
                            View <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
