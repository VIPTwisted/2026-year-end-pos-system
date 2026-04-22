import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function FMLADetailPage({ params }: { params: { id: string } }) {
  const req = await prisma.fMLARequest.findUnique({
    where: { id: params.id },
    include: { employee: true },
  })
  if (!req) notFound()

  const hoursApproved = req.hoursApproved ?? 0
  const hoursUsed = req.hoursUsed ?? 0
  const hoursRemaining = Math.max(0, hoursApproved - hoursUsed)
  const progressPct = hoursApproved > 0 ? Math.min(100, Math.round((hoursUsed / hoursApproved) * 100)) : 0

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white">
      <TopBar title="FMLA Request Detail" />
      <div className="p-6 max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-semibold text-zinc-100 text-lg">
                {req.employee.firstName} {req.employee.lastName}
              </h2>
              <p className="text-sm text-zinc-400 capitalize mt-0.5">
                {req.requestType.replace(/_/g, ' ')} — {req.fmlaReason.replace(/_/g, ' ')}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              req.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
              req.status === 'approved' ? 'bg-green-500/20 text-green-400' :
              req.status === 'denied' ? 'bg-red-500/20 text-red-400' :
              req.status === 'exhausted' ? 'bg-orange-500/20 text-orange-400' :
              req.status === 'closed' ? 'bg-zinc-500/20 text-zinc-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>{req.status}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-zinc-500 text-xs">Start Date</p>
              <p className="text-zinc-200">{new Date(req.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs">End Date</p>
              <p className="text-zinc-200">{req.endDate ? new Date(req.endDate).toLocaleDateString() : '—'}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs">Cert Due</p>
              <p className={req.certificationDue && !req.certReceived ? 'text-red-400' : 'text-zinc-200'}>
                {req.certificationDue ? new Date(req.certificationDue).toLocaleDateString() : '—'}
              </p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs">Cert Received</p>
              <p className={req.certReceived ? 'text-green-400' : 'text-yellow-400'}>
                {req.certReceived ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
          {req.notes && (
            <div className="mt-4 text-sm text-zinc-400 bg-zinc-800/40 rounded-lg p-3">{req.notes}</div>
          )}
        </div>

        {/* Hours Tracker */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
          <h3 className="font-semibold text-zinc-200 mb-4">Hours Tracker</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-zinc-100">{hoursApproved}h</p>
              <p className="text-xs text-zinc-500 mt-1">Approved</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">{hoursUsed}h</p>
              <p className="text-xs text-zinc-500 mt-1">Used</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{hoursRemaining}h</p>
              <p className="text-xs text-zinc-500 mt-1">Remaining</p>
            </div>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${progressPct >= 90 ? 'bg-red-500' : progressPct >= 70 ? 'bg-yellow-500' : 'bg-blue-500'}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-zinc-500 mt-2">{progressPct}% of approved FMLA hours used</p>
        </div>

        {/* Actions */}
        {(req.status === 'pending' || req.status === 'active') && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
            <h3 className="font-semibold text-zinc-200 mb-3">Actions</h3>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg cursor-pointer transition-colors">Approve</span>
              <span className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg cursor-pointer transition-colors">Deny</span>
              <span className="bg-zinc-600 hover:bg-zinc-500 px-4 py-2 rounded-lg cursor-pointer transition-colors">Close</span>
            </div>
          </div>
        )}

        <Link href="/hr/leave-absence/fmla"
          className="inline-block bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-lg text-sm transition-colors">
          Back to FMLA
        </Link>
      </div>
    </div>
  )
}
