import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Receipt, List, DollarSign } from 'lucide-react'
import { ExpenseActions } from './ExpenseActions'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  draft:     'secondary',
  submitted: 'default',
  approved:  'success',
  rejected:  'destructive',
  posted:    'default',
}

export default async function ExpenseReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const report = await prisma.expenseReport.findUnique({
    where: { id },
    include: {
      category: true,
      lines: { orderBy: { expenseDate: 'asc' } },
    },
  })
  if (!report) notFound()

  // Fetch project budget for budget-vs-actual card (if linked to project)
  let budgetTotal = 0
  if (report.projectId) {
    const budgetLines = await prisma.projectBudgetLine.findMany({
      where: { projectId: report.projectId },
    })
    budgetTotal = budgetLines.reduce((s, l) => s + Number(l.budgetAmount), 0)
  }

  const billableTotal    = report.lines.filter(l => l.isBillable).reduce((s, l) => s + Number(l.amount), 0)
  const nonBillableTotal = report.lines.filter(l => !l.isBillable).reduce((s, l) => s + Number(l.amount), 0)

  return (
    <>
      <TopBar title={report.reportNo} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <Link href="/expenses" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Expense Reports
        </Link>

        {/* Header Card */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xl font-bold font-mono text-zinc-100">{report.reportNo}</span>
                  <Badge variant={STATUS_VARIANT[report.status] ?? 'secondary'} className="capitalize">{report.status}</Badge>
                </div>
                <p className="text-sm text-zinc-300">{report.title}</p>
                <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                  {report.employeeId && <span>Employee: <span className="text-zinc-300">{report.employeeId}</span></span>}
                  {report.category && <span>Category: <span className="text-zinc-300">{report.category.name}</span></span>}
                  {report.projectId && (
                    <span>Project: <Link href={`/projects/${report.projectId}`} className="text-blue-400 hover:underline">{report.projectId.slice(0, 8)}</Link></span>
                  )}
                  {report.submittedAt && <span>Submitted: <span className="text-zinc-300">{formatDate(report.submittedAt)}</span></span>}
                  {report.approvedAt  && <span>Approved: <span className="text-zinc-300">{formatDate(report.approvedAt)}</span></span>}
                </div>
                {report.notes && (
                  <p className="text-xs text-zinc-500 italic max-w-md">{report.notes}</p>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4 shrink-0 text-center">
                {[
                  { label: 'Total',        value: formatCurrency(Number(report.totalAmount)) },
                  { label: 'Billable',     value: formatCurrency(billableTotal) },
                  { label: 'Non-Billable', value: formatCurrency(nonBillableTotal) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{label}</p>
                    <p className="text-lg font-bold text-zinc-200">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center gap-3">
              <ExpenseActions reportId={report.id} status={report.status} />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Lines table — main column */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <List className="w-4 h-4 text-zinc-400" />
                  Expense Lines ({report.lines.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {report.lines.length === 0 ? (
                  <p className="px-5 pb-5 text-xs text-zinc-600">No expense lines yet.</p>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        {['Date', 'Description', 'Category', 'Amount', 'Billable', 'Receipt'].map(h => (
                          <th
                            key={h}
                            className={`px-4 pb-2 pt-3 text-[10px] font-medium text-zinc-500 uppercase tracking-wide whitespace-nowrap ${
                              h === 'Description' ? 'text-left' : 'text-right'
                            }`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {report.lines.map(line => (
                        <tr key={line.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20 transition-colors">
                          <td className="px-4 py-2.5 text-right text-xs text-zinc-500 whitespace-nowrap">
                            {formatDate(line.expenseDate)}
                          </td>
                          <td className="px-4 py-2.5 text-[13px] text-zinc-200 max-w-[180px] truncate">{line.description}</td>
                          <td className="px-4 py-2.5 text-right text-xs text-zinc-400">
                            {line.categoryName ?? <span className="text-zinc-700">—</span>}
                          </td>
                          <td className="px-4 py-2.5 text-right text-[12px] text-emerald-400 font-semibold tabular-nums">
                            {formatCurrency(Number(line.amount))}
                          </td>
                          <td className="px-4 py-2.5 text-right text-xs">
                            {line.isBillable
                              ? <span className="text-emerald-400">Yes</span>
                              : <span className="text-zinc-600">No</span>
                            }
                          </td>
                          <td className="px-4 py-2.5 text-right text-xs text-zinc-500">
                            {line.receiptRef ?? <span className="text-zinc-700">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-zinc-800">
                        <td colSpan={3} className="px-4 py-2.5 text-xs text-zinc-500 font-medium uppercase tracking-wide text-right">Total</td>
                        <td className="px-4 py-2.5 text-right text-sm font-bold text-emerald-400 tabular-nums">
                          {formatCurrency(Number(report.totalAmount))}
                        </td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">

            {/* Report Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Receipt className="w-3.5 h-3.5 text-zinc-400" />
                  Report Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {[
                  ['Report No',  report.reportNo],
                  ['Status',     report.status],
                  ['Employee',   report.employeeId ?? '—'],
                  ['Category',   report.category?.name ?? '—'],
                  ['Created',    formatDate(report.createdAt)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-zinc-500 uppercase tracking-wide mb-0.5">{label}</p>
                    <p className="text-zinc-300 capitalize">{value || '—'}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Budget vs Actual */}
            {report.projectId && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
                    Budget vs Actual
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  {[
                    { label: 'Project Budget',  value: budgetTotal,                               color: 'text-zinc-300' },
                    { label: 'This Report',     value: Number(report.totalAmount),                 color: 'text-amber-400' },
                    { label: 'Variance',        value: budgetTotal - Number(report.totalAmount),   color: (budgetTotal - Number(report.totalAmount)) >= 0 ? 'text-emerald-400' : 'text-red-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-zinc-500 uppercase tracking-wide">{label}</span>
                      <span className={`font-semibold ${color}`}>{formatCurrency(value)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

          </div>
        </div>

      </main>
    </>
  )
}
