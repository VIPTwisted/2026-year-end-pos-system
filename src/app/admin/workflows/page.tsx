import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { GitBranch, Plus, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function WorkflowsPage() {
  const workflows = await prisma.adminWorkflow.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto min-h-[100dvh]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
            <GitBranch className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-100">Approval Workflows</h1>
            <p className="text-[11px] text-zinc-500">{workflows.length} workflow{workflows.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <Link href="/admin/workflows/new"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors">
          <Plus className="w-3.5 h-3.5" /> New
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500">
              {['Code','Description','Category','Status',''].map((h, i) => (
                <th key={i} className={`pb-2 font-medium uppercase tracking-widest ${i === 4 ? 'text-right' : 'text-left'} pr-6`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {workflows.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-zinc-600">No workflows configured.</td></tr>
            )}
            {workflows.map(wf => (
              <tr key={wf.id} className="hover:bg-zinc-800/20 transition-colors group">
                <td className="py-2.5 pr-6 font-mono text-zinc-300">{wf.code}</td>
                <td className="py-2.5 pr-6 text-zinc-200">{wf.description}</td>
                <td className="py-2.5 pr-6 text-zinc-400">{wf.category ?? '—'}</td>
                <td className="py-2.5 pr-6">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                    wf.enabled
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-zinc-700/30 text-zinc-500 border-zinc-700/40'
                  }`}>
                    {wf.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
                <td className="py-2.5 text-right">
                  <Link href={`/admin/workflows/${wf.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-zinc-300 inline-flex items-center gap-1">
                    <span>Edit</span><ChevronRight className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
