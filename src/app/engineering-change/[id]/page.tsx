import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Settings2, ChevronRight, CheckCircle, Clock, ArrowRight } from 'lucide-react'
import { ECOActions } from './ECOActions'

export const dynamic = 'force-dynamic'

const STATUS_ORDER = ['draft', 'review', 'approved', 'implemented']
const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft', review: 'In Review', approved: 'Approved',
  rejected: 'Rejected', implemented: 'Implemented',
}
const TYPE_LABELS: Record<string, string> = {
  design: 'Design', process: 'Process', material: 'Material',
  software: 'Software', documentation: 'Documentation',
}
const LINE_TYPE_LABELS: Record<string, string> = {
  product: 'Product', bom: 'BOM', routing: 'Routing', document: 'Document',
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
    review: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/30',
    implemented: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  }
  const cls = map[status] ?? 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40'
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${cls}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

export default async function ECODetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const eco = await prisma.engineeringChangeOrder.findUnique({
    where: { id },
    include: {
      lines: {
        include: { product: { select: { name: true, sku: true } } },
      },
    },
  })
  if (!eco) notFound()

  const currentStepIdx = eco.status === 'rejected' ? -1 : STATUS_ORDER.indexOf(eco.status)

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title={`ECO: ${eco.ecoNumber}`} />
      <main className="flex-1 p-6 overflow-auto space-y-6 max-w-6xl mx-auto w-full">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] text-zinc-500">
          <Link href="/engineering-change" className="hover:text-zinc-300">Engineering Changes</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-zinc-300">{eco.ecoNumber}</span>
        </div>

        {/* Header */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Settings2 className="w-4 h-4 text-zinc-400" />
                <h1 className="text-base font-semibold text-zinc-100">{eco.title}</h1>
              </div>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <StatusBadge status={eco.status} />
                <span className="text-[11px] text-zinc-500">Type: <span className="text-zinc-300">{TYPE_LABELS[eco.changeType] ?? eco.changeType}</span></span>
                <span className="text-[11px] text-zinc-500">Priority: <span className="text-zinc-300 capitalize">{eco.priority}</span></span>
                {eco.requestedBy && <span className="text-[11px] text-zinc-500">Requested by: <span className="text-zinc-300">{eco.requestedBy}</span></span>}
              </div>
              {eco.description && <p className="mt-3 text-[13px] text-zinc-400">{eco.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-zinc-900/50 rounded-lg px-4 py-3">
                <p className="text-xl font-bold text-zinc-200">{eco.affectedItems}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wide mt-0.5">Affected Items</p>
              </div>
              <div className="bg-zinc-900/50 rounded-lg px-4 py-3">
                <p className="text-xl font-bold text-zinc-200">{eco.lines.length}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wide mt-0.5">Change Lines</p>
              </div>
            </div>
          </div>
        </div>

        {/* Approval Timeline Stepper */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
          <h2 className="text-[11px] uppercase tracking-wide text-zinc-500 font-medium mb-4">Approval Timeline</h2>
          {eco.status === 'rejected' ? (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              This ECO was rejected.
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {STATUS_ORDER.map((step, idx) => {
                const done = idx <= currentStepIdx
                const active = idx === currentStepIdx
                return (
                  <div key={step} className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-colors ${
                      done
                        ? active
                          ? 'bg-blue-600/20 border-blue-500/40 text-blue-300'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-zinc-800/40 border-zinc-700/40 text-zinc-600'
                    }`}>
                      {done && !active ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {STATUS_LABELS[step]}
                    </div>
                    {idx < STATUS_ORDER.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-zinc-700" />
                    )}
                  </div>
                )
              })}
            </div>
          )}
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
            <div><span className="text-zinc-600">Created:</span> <span className="text-zinc-400">{new Date(eco.createdAt).toLocaleDateString()}</span></div>
            {eco.approvedAt && <div><span className="text-zinc-600">Approved:</span> <span className="text-zinc-400">{new Date(eco.approvedAt).toLocaleDateString()}</span></div>}
            {eco.approvedBy && <div><span className="text-zinc-600">Approved by:</span> <span className="text-zinc-400">{eco.approvedBy}</span></div>}
            {eco.effectiveDate && <div><span className="text-zinc-600">Effective:</span> <span className="text-zinc-400">{new Date(eco.effectiveDate).toLocaleDateString()}</span></div>}
          </div>
        </div>

        {/* Change Lines */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/30">
            <h2 className="text-sm font-semibold text-zinc-200">Change Lines</h2>
          </div>
          {eco.lines.length === 0 ? (
            <p className="px-5 py-4 text-[13px] text-zinc-600">No change lines defined.</p>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-zinc-800/30 bg-zinc-900/30">
                  {['Type', 'Product', 'Change Description', 'From Value', 'To Value'].map(h => (
                    <th key={h} className="text-left px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {eco.lines.map(line => (
                  <tr key={line.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-2 text-zinc-500">{LINE_TYPE_LABELS[line.lineType] ?? line.lineType}</td>
                    <td className="px-4 py-2 text-zinc-300">
                      {line.product ? <span>{line.product.name} <span className="text-zinc-600 font-mono text-[11px]">{line.product.sku}</span></span> : line.productId || '—'}
                    </td>
                    <td className="px-4 py-2 text-zinc-300">{line.changeDesc}</td>
                    <td className="px-4 py-2 text-zinc-500 font-mono text-[12px]">{line.fromValue || '—'}</td>
                    <td className="px-4 py-2 text-emerald-400 font-mono text-[12px]">{line.toValue || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Action Buttons */}
        <ECOActions ecoId={eco.id} status={eco.status} />
      </main>
    </div>
  )
}
