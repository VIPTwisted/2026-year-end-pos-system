import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Settings2, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
    review: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
    implemented: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  }
  const cls = map[status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'
  const labels: Record<string, string> = {
    draft: 'Draft', review: 'In Review', approved: 'Approved',
    rejected: 'Rejected', implemented: 'Implemented',
  }
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium border ${cls}`}>
      {labels[status] ?? status}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    low: 'text-zinc-500',
    normal: 'text-zinc-300',
    high: 'text-amber-400',
    critical: 'text-red-400',
  }
  return <span className={`text-[12px] font-medium ${map[priority] ?? 'text-zinc-400'}`}>{priority}</span>
}

const CHANGE_TYPE_LABELS: Record<string, string> = {
  design: 'Design', process: 'Process', material: 'Material',
  software: 'Software', documentation: 'Documentation',
}

export default async function EngineeringChangePage() {
  const ecos = await prisma.engineeringChangeOrder.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const open = ecos.filter(e => e.status === 'draft' || e.status === 'review').length
  const pendingReview = ecos.filter(e => e.status === 'review').length
  const now = new Date()
  const approvedThisMonth = ecos.filter(e => {
    if (e.status !== 'approved' && e.status !== 'implemented') return false
    if (!e.approvedAt) return false
    const d = new Date(e.approvedAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length
  const implemented = ecos.filter(e => e.status === 'implemented').length

  const kpis = [
    { label: 'Open ECOs', value: open, color: 'text-zinc-300' },
    { label: 'Pending Review', value: pendingReview, color: 'text-amber-400' },
    { label: 'Approved This Month', value: approvedThisMonth, color: 'text-emerald-400' },
    { label: 'Implemented', value: implemented, color: 'text-blue-400' },
  ]

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Engineering Change Management" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-zinc-400" />
            <h1 className="text-sm font-semibold text-zinc-200">Engineering Change Orders</h1>
            <span className="text-[11px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-full px-2 py-0.5">
              {ecos.length}
            </span>
          </div>
          <Link href="/engineering-change/new">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors">
              <Plus className="w-3.5 h-3.5" /> New ECO
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map(({ label, value, color }) => (
            <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wide mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {ecos.length === 0 ? (
            <p className="px-5 py-5 text-[13px] text-zinc-600">No engineering change orders yet.</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                  {['ECO #', 'Title', 'Type', 'Status', 'Priority', 'Affected Items', 'Effective Date', ''].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ecos.map(eco => (
                  <tr key={eco.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2">
                      <Link href={`/engineering-change/${eco.id}`} className="font-mono text-blue-400 hover:text-blue-300 hover:underline">
                        {eco.ecoNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-zinc-300 max-w-[200px] truncate">{eco.title}</td>
                    <td className="px-4 py-2 text-zinc-500">{CHANGE_TYPE_LABELS[eco.changeType] ?? eco.changeType}</td>
                    <td className="px-4 py-2"><StatusBadge status={eco.status} /></td>
                    <td className="px-4 py-2"><PriorityBadge priority={eco.priority} /></td>
                    <td className="px-4 py-2 text-zinc-400 text-center">{eco.affectedItems}</td>
                    <td className="px-4 py-2 text-zinc-500">
                      {eco.effectiveDate ? new Date(eco.effectiveDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-2">
                      <Link href={`/engineering-change/${eco.id}`} className="text-xs text-zinc-500 hover:text-zinc-300">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
