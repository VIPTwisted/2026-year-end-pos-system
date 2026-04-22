import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import SubcontractActions from './SubcontractActions'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  draft:     'bg-zinc-700/40 text-zinc-400',
  active:    'bg-emerald-500/20 text-emerald-400',
  completed: 'bg-blue-500/20 text-blue-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

export default async function SubcontractDetailPage({ params }: { params: { id: string } }) {
  const sub = await prisma.projectSubcontract.findUnique({
    where: { id: params.id },
    include: {
      project: { select: { projectNo: true, description: true } },
      vendor:  { select: { vendorCode: true, name: true } },
    },
  })

  if (!sub) notFound()

  let vendorInvoices: string[] = []
  try { vendorInvoices = JSON.parse(sub.invoicesJson ?? '[]') } catch {}

  return (
    <>
      <TopBar title={`Subcontract — ${sub.subcontractNo}`} />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5 max-w-4xl">

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                <Link href="/projects/subcontracts" className="hover:text-zinc-300">Subcontracts</Link> / {sub.subcontractNo}
              </p>
              <h2 className="text-[18px] font-semibold text-zinc-100">{sub.subcontractNo}</h2>
            </div>
            <div className="flex items-center gap-2">
              {sub.paymentBlock && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-900/40 text-red-400">Payment Blocked</span>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[sub.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                {sub.status}
              </span>
            </div>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Project</p>
              <p className="text-zinc-200">{sub.project.projectNo} — {sub.project.description}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Vendor</p>
              <p className="text-zinc-200">{sub.vendor ? `${sub.vendor.vendorCode} — ${sub.vendor.name}` : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Contract Value</p>
              <p className="text-zinc-200 font-mono font-semibold">
                ${sub.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Retention %</p>
              <p className="text-zinc-200">{sub.retentionPct}%</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Start Date</p>
              <p className="text-zinc-400">{sub.startDate ? new Date(sub.startDate).toLocaleDateString() : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">End Date</p>
              <p className="text-zinc-400">{sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">PM Verified</p>
              <p className={sub.pmVerified ? 'text-emerald-400' : 'text-yellow-400'}>{sub.pmVerified ? 'Yes' : 'Pending'}</p>
            </div>
            {sub.description && (
              <div className="col-span-3">
                <p className="text-xs text-zinc-500 mb-1">Description</p>
                <p className="text-zinc-400">{sub.description}</p>
              </div>
            )}
          </div>

          {vendorInvoices.length > 0 && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-zinc-300 mb-3">Pending Vendor Invoices</h3>
              <div className="space-y-1">
                {vendorInvoices.map((inv, i) => (
                  <div key={i} className="text-sm text-zinc-400 font-mono px-3 py-2 bg-zinc-900/50 rounded-lg">{inv}</div>
                ))}
              </div>
            </div>
          )}

          <SubcontractActions id={sub.id} status={sub.status} pmVerified={sub.pmVerified} paymentBlock={sub.paymentBlock} />
        </div>
      </main>
    </>
  )
}
