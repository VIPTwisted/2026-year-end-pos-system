import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Briefcase, Plus, ArrowRight } from 'lucide-react'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  open:      'success',
  planning:  'default',
  completed: 'secondary',
  cancelled: 'destructive',
}

const STATUS_COLOR: Record<string, string> = {
  open:      'bg-emerald-500/20 text-emerald-400',
  planning:  'bg-blue-500/20 text-blue-400',
  completed: 'bg-zinc-700/40 text-zinc-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: {
      customer: { select: { id: true, firstName: true, lastName: true } },
      _count:   { select: { tasks: true, ledgerEntries: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const stats = {
    total:         projects.length,
    open:          projects.filter(p => p.status === 'open').length,
    planning:      projects.filter(p => p.status === 'planning').length,
    completed:     projects.filter(p => p.status === 'completed').length,
    totalContract: projects.reduce((s, p) => s + Number(p.contractAmount), 0),
  }

  return (
    <>
      <TopBar title="Projects" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          {/* Page header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Operations</p>
              <h2 className="text-[18px] font-semibold text-zinc-100 leading-tight">Projects</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">{projects.length} projects total</p>
            </div>
            <Link href="/projects/new">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                New Project
              </Button>
            </Link>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Total Projects', value: stats.total.toString(),               color: 'text-zinc-100' },
              { label: 'Open',           value: stats.open.toString(),                color: 'text-emerald-400' },
              { label: 'Planning',       value: stats.planning.toString(),            color: 'text-blue-400' },
              { label: 'Completed',      value: stats.completed.toString(),           color: 'text-zinc-400' },
              { label: 'Total Contract', value: formatCurrency(stats.totalContract),  color: 'text-amber-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-3.5">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
                <p className={`text-[22px] font-bold tabular-nums ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Section divider */}
          <div className="flex items-center gap-3">
            <Briefcase className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 shrink-0">All Projects</span>
            <span className="text-[10px] text-zinc-600">({projects.length})</span>
            <div className="flex-1 h-px bg-zinc-800/60" />
          </div>

          {/* Projects table */}
          {projects.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-12 text-zinc-600">
              <Briefcase className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-[13px] text-zinc-500 mb-4">No projects yet.</p>
              <Link href="/projects/new">
                <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-500">
                  <Plus className="w-3.5 h-3.5" /> New Project
                </Button>
              </Link>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['Project No', 'Description', 'Customer', 'Status', 'Progress', 'Contract', 'Budget', 'Tasks', 'Due', ''].map(h => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${
                            h === 'Project No' || h === 'Description' || h === 'Customer' ? 'text-left' :
                            h === 'Status' || h === 'Progress' ? 'text-center' : 'text-right'
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {projects.map(project => {
                      const pct = project.budgetAmount > 0
                        ? Math.min(100, Math.round((Number(project.contractAmount) / Number(project.budgetAmount)) * 100))
                        : 0
                      return (
                        <tr key={project.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="px-4 py-3">
                            <Link href={`/projects/${project.id}`} className="font-mono text-[11px] text-blue-400 hover:underline">
                              {project.projectNo}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-[13px] text-zinc-100 max-w-[200px] truncate">{project.description}</td>
                          <td className="px-4 py-3 text-[12px] text-zinc-400">
                            {project.customer
                              ? <Link href={`/customers/${project.customer.id}`} className="hover:text-zinc-200 transition-colors">
                                  {project.customer.firstName} {project.customer.lastName}
                                </Link>
                              : <span className="text-zinc-700">—</span>
                            }
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${STATUS_COLOR[project.status] ?? 'bg-zinc-800/60 text-zinc-400'}`}>
                              {project.status}
                            </span>
                          </td>
                          {/* Progress % */}
                          <td className="px-4 py-3 text-center min-w-[80px]">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[10px] text-zinc-500 tabular-nums">{pct}%</span>
                              <div className="w-14 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-blue-500'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-[12px] text-emerald-400 font-semibold tabular-nums">
                            {formatCurrency(Number(project.contractAmount))}
                          </td>
                          <td className="px-4 py-3 text-right text-[12px] text-zinc-400 tabular-nums">
                            {formatCurrency(Number(project.budgetAmount))}
                          </td>
                          <td className="px-4 py-3 text-right text-[12px] text-zinc-400">{project._count.tasks}</td>
                          <td className="px-4 py-3 text-right text-[11px] text-zinc-500 whitespace-nowrap">
                            {project.dueDate ? formatDate(project.dueDate) : '—'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link href={`/projects/${project.id}`} className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 transition-colors">
                              View <ArrowRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
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
