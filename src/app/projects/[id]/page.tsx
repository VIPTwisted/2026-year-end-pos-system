import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, Briefcase, ClipboardList, BarChart3,
  BookOpen, FileText, DollarSign,
} from 'lucide-react'
import { ProjectActions } from './ProjectActions'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  open: 'success', planning: 'default', completed: 'secondary', cancelled: 'destructive',
}

function wipLabel(m: string) {
  return {
    completed_contract: 'Completed Contract',
    cost_of_sales: 'Cost of Sales',
    percentage_of_completion: '% of Completion',
    sales_value: 'Sales Value',
  }[m] ?? m
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      customer: true,
      tasks: { orderBy: { sortOrder: 'asc' } },
      planningLines: {
        include: { product: { select: { id: true, name: true, sku: true } } },
        orderBy: { plannedDate: 'asc' },
      },
      ledgerEntries: { orderBy: { postingDate: 'desc' } },
      invoices: { orderBy: { invoiceDate: 'desc' } },
    },
  })
  if (!project) notFound()

  const totalLedger = project.ledgerEntries.reduce((s, e) => s + Number(e.totalPrice), 0)
  const uninvoiced = project.ledgerEntries.filter(e => e.isBillable && !e.isInvoiced).reduce((s, e) => s + Number(e.totalPrice), 0)
  const unpostedLines = project.planningLines.filter(l => !l.isTransferred).length
  const completion = Number(project.contractAmount) > 0
    ? Math.min(100, Math.round((totalLedger / Number(project.contractAmount)) * 100))
    : 0

  return (
    <>
      <TopBar title={project.projectNo} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <Link href="/projects" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Projects
        </Link>

        {/* Header Card */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xl font-bold font-mono text-zinc-100">{project.projectNo}</span>
                  <Badge variant={STATUS_VARIANT[project.status] ?? 'secondary'} className="capitalize">{project.status}</Badge>
                </div>
                <p className="text-sm text-zinc-300">{project.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                  {project.customer && (
                    <span>Customer: <Link href={`/customers/${project.customer.id}`} className="text-blue-400 hover:underline">{project.customer.firstName} {project.customer.lastName}</Link></span>
                  )}
                  {project.startDate && <span>Start: <span className="text-zinc-300">{formatDate(project.startDate!)}</span></span>}
                  {project.dueDate && <span>Due: <span className="text-zinc-300">{formatDate(project.dueDate!)}</span></span>}
                  <span>WIP: <span className="text-zinc-300">{wipLabel(project.wipMethod)}</span></span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0 text-center">
                {[
                  { label: 'Contract', value: formatCurrency(Number(project.contractAmount)) },
                  { label: 'Budget', value: formatCurrency(Number(project.budgetAmount)) },
                  { label: 'Invoiced', value: formatCurrency(totalLedger - uninvoiced) },
                  { label: 'Uninvoiced', value: formatCurrency(uninvoiced), highlight: uninvoiced > 0 },
                ].map(({ label, value, highlight }) => (
                  <div key={label}>
                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{label}</p>
                    <p className={`text-lg font-bold ${highlight ? 'text-amber-400' : 'text-zinc-200'}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress */}
            <div className="mt-5 pt-4 border-t border-zinc-800">
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                <span>Completion ({completion}%)</span>
                <span>{formatCurrency(totalLedger)} of {formatCurrency(Number(project.contractAmount))}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center gap-3">
              <ProjectActions
                projectId={project.id}
                status={project.status}
                unpostedLines={unpostedLines}
                uninvoiced={uninvoiced}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Tasks */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-zinc-400" />
                  Tasks ({project.tasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {project.tasks.length === 0 ? (
                  <p className="px-5 pb-5 text-xs text-zinc-600">No tasks yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        {['Task No', 'Description', 'Type', 'Budget', 'Billing'].map(h => (
                          <th key={h} className={`px-4 pb-2 pt-3 text-xs font-medium text-zinc-500 uppercase tracking-wide ${h === 'Task No' || h === 'Description' ? 'text-left' : 'text-right'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {project.tasks.map(task => (
                        <tr key={task.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20">
                          <td className="px-4 py-2.5 font-mono text-xs text-zinc-300"
                            style={{ paddingLeft: `${16 + task.indentation * 16}px` }}>
                            {task.taskNo}
                          </td>
                          <td className="px-4 py-2.5 text-zinc-200">{task.description}</td>
                          <td className="px-4 py-2.5 text-right">
                            <Badge variant="secondary" className="text-xs capitalize">{task.taskType}</Badge>
                          </td>
                          <td className="px-4 py-2.5 text-right text-xs text-zinc-400">{formatCurrency(Number(task.budgetHours))}</td>
                          <td className="px-4 py-2.5 text-right text-xs text-emerald-400">{formatCurrency(Number(task.actualHours))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>

            {/* Planning Lines */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-zinc-400" />
                  Planning Lines ({project.planningLines.length})
                  {unpostedLines > 0 && (
                    <Badge variant="warning" className="text-xs ml-auto">{unpostedLines} unposted</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {project.planningLines.length === 0 ? (
                  <p className="px-5 pb-5 text-xs text-zinc-600">No planning lines.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        {['Description', 'Type', 'Qty', 'Unit Price', 'Amount', 'Billable', 'Posted', 'Date'].map(h => (
                          <th key={h} className={`px-4 pb-2 pt-3 text-xs font-medium text-zinc-500 uppercase tracking-wide ${h === 'Description' ? 'text-left' : 'text-right'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {project.planningLines.map(line => (
                        <tr key={line.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20">
                          <td className="px-4 py-2.5 text-zinc-200 max-w-[160px] truncate">{line.description}</td>
                          <td className="px-4 py-2.5 text-right">
                            <Badge variant="secondary" className="text-xs capitalize">{line.lineType}</Badge>
                          </td>
                          <td className="px-4 py-2.5 text-right text-xs text-zinc-300">{Number(line.quantity)}</td>
                          <td className="px-4 py-2.5 text-right text-xs text-zinc-400">{formatCurrency(Number(line.unitPrice))}</td>
                          <td className="px-4 py-2.5 text-right text-xs text-emerald-400 font-semibold">{formatCurrency(Number(line.lineAmount))}</td>
                          <td className="px-4 py-2.5 text-right text-xs"><span className="text-zinc-600">—</span></td>
                          <td className="px-4 py-2.5 text-right text-xs">{line.isTransferred ? <span className="text-zinc-400">Yes</span> : <span className="text-amber-400">No</span>}</td>
                          <td className="px-4 py-2.5 text-right text-xs text-zinc-500">{line.plannedDate ? formatDate(line.plannedDate) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>

            {/* Ledger */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-zinc-400" />
                  Project Ledger ({project.ledgerEntries.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {project.ledgerEntries.length === 0 ? (
                  <p className="px-5 pb-5 text-xs text-zinc-600">No ledger entries.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        {['Date', 'Type', 'Description', 'Qty', 'Total Cost', 'Total Price', 'Invoiced'].map(h => (
                          <th key={h} className={`px-4 pb-2 pt-3 text-xs font-medium text-zinc-500 uppercase tracking-wide ${h === 'Description' ? 'text-left' : 'text-right'}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {project.ledgerEntries.map(entry => (
                        <tr key={entry.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20">
                          <td className="px-4 py-2.5 text-right text-xs text-zinc-500">{entry.postingDate ? formatDate(entry.postingDate) : '—'}</td>
                          <td className="px-4 py-2.5 text-right">
                            <Badge variant="secondary" className="text-xs capitalize">{entry.entryType}</Badge>
                          </td>
                          <td className="px-4 py-2.5 text-zinc-200 max-w-[160px] truncate">{entry.description}</td>
                          <td className="px-4 py-2.5 text-right text-xs text-zinc-300">{Number(entry.quantity)}</td>
                          <td className="px-4 py-2.5 text-right text-xs text-zinc-400">{formatCurrency(Number(entry.totalCost))}</td>
                          <td className="px-4 py-2.5 text-right text-xs text-emerald-400 font-semibold">{formatCurrency(Number(entry.totalPrice))}</td>
                          <td className="px-4 py-2.5 text-right text-xs">{entry.isInvoiced ? <span className="text-zinc-400">Yes</span> : <span className="text-amber-400">No</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar: info + invoices */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Project Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {[
                  ['Project No', project.projectNo],
                  ['WIP Method', wipLabel(project.wipMethod)],
                  ['Start Date', project.startDate ? formatDate(project.startDate) : '—'],
                  ['End Date', project.endDate ? formatDate(project.endDate) : '—'],
                  ['Due Date', project.dueDate ? formatDate(project.dueDate) : '—'],
                  ['Notes', project.notes ?? '—'],
                  ['Created', formatDate(project.createdAt)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-zinc-500 uppercase tracking-wide mb-0.5">{label}</p>
                    <p className="text-zinc-300">{value || '—'}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Invoices */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  Invoices ({project.invoices.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {project.invoices.length === 0 ? (
                  <p className="px-4 pb-4 text-xs text-zinc-600">No invoices yet.</p>
                ) : (
                  project.invoices.map(inv => (
                    <Link key={inv.id} href={`/projects/${project.id}/invoice/${inv.id}`}>
                      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors">
                        <div>
                          <p className="text-xs font-mono text-zinc-300">{inv.invoiceNo}</p>
                          <p className="text-xs text-zinc-600">{inv.invoiceDate ? formatDate(inv.invoiceDate) : '—'}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={inv.status === 'posted' ? 'success' : 'secondary'} className="text-xs capitalize mb-0.5">{inv.status}</Badge>
                          <p className="text-xs text-emerald-400 font-semibold">{formatCurrency(Number(inv.amount))}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
                {uninvoiced > 0 && (
                  <div className="px-4 py-3 border-t border-zinc-800 flex items-center justify-between">
                    <span className="text-xs text-amber-400">Uninvoiced</span>
                    <span className="text-xs font-bold text-amber-400">{formatCurrency(uninvoiced)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Budget vs Actual */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
                  Budget vs Actual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {[
                  { label: 'Contract', value: Number(project.contractAmount), color: 'text-zinc-300' },
                  { label: 'Budget', value: Number(project.budgetAmount), color: 'text-zinc-300' },
                  { label: 'Actual (Ledger)', value: totalLedger, color: 'text-emerald-400' },
                  { label: 'Variance', value: Number(project.budgetAmount) - totalLedger, color: (Number(project.budgetAmount) - totalLedger) >= 0 ? 'text-emerald-400' : 'text-red-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-zinc-500 uppercase tracking-wide">{label}</span>
                    <span className={`font-semibold ${color}`}>{formatCurrency(value)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

      </main>
    </>
  )
}
