import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { FileCheck, Clock, CheckCircle, AlertTriangle, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function FMLAPage() {
  const now = new Date()
  const yearStart = new Date(now.getFullYear(), 0, 1)
  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

  const [requests, activeFmla, pendingFmla, certsDue] = await Promise.all([
    prisma.fMLARequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: { employee: true },
    }),
    prisma.fMLARequest.count({ where: { status: 'active' } }),
    prisma.fMLARequest.count({ where: { status: 'pending' } }),
    prisma.fMLARequest.count({
      where: {
        certReceived: false,
        certificationDue: { lte: in14Days, gte: now },
        status: { in: ['pending', 'active', 'approved'] },
      },
    }),
  ])

  const hoursUsedYTD = requests
    .filter(r => new Date(r.startDate) >= yearStart)
    .reduce((sum, r) => sum + (r.hoursUsed ?? 0), 0)

  const kpis = [
    { label: 'Active FMLA', value: activeFmla, icon: FileCheck, color: 'text-blue-400' },
    { label: 'Pending', value: pendingFmla, icon: Clock, color: 'text-yellow-400' },
    { label: 'Hours Used YTD', value: Math.round(hoursUsedYTD), icon: CheckCircle, color: 'text-green-400' },
    { label: 'Certifications Due', value: certsDue, icon: AlertTriangle, color: 'text-red-400' },
  ]

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white">
      <TopBar title="FMLA Management" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <k.icon className={`w-4 h-4 ${k.color}`} />
                <span className="text-xs text-zinc-400">{k.label}</span>
              </div>
              <p className="text-2xl font-bold">{k.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-200">FMLA Requests</h2>
            <Link href="/hr/leave-absence/fmla/new"
              className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-3 h-3" /> New Request
            </Link>
          </div>
          {requests.length === 0 ? (
            <p className="text-zinc-500 text-sm">No FMLA requests on file.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-500 border-b border-zinc-800">
                    <th className="pb-2 font-medium">Employee</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Reason</th>
                    <th className="pb-2 font-medium">Start</th>
                    <th className="pb-2 font-medium">End</th>
                    <th className="pb-2 font-medium">Hours Used</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                      <td className="py-3">
                        <Link href={`/hr/leave-absence/fmla/${r.id}`} className="text-blue-400 hover:underline">
                          {r.employee.firstName} {r.employee.lastName}
                        </Link>
                      </td>
                      <td className="py-3 capitalize text-zinc-300">{r.requestType.replace(/_/g, ' ')}</td>
                      <td className="py-3 capitalize text-zinc-400">{r.fmlaReason.replace(/_/g, ' ')}</td>
                      <td className="py-3 text-zinc-400">{new Date(r.startDate).toLocaleDateString()}</td>
                      <td className="py-3 text-zinc-400">{r.endDate ? new Date(r.endDate).toLocaleDateString() : '—'}</td>
                      <td className="py-3 text-zinc-300">{r.hoursUsed}h</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                          r.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                          r.status === 'denied' ? 'bg-red-500/20 text-red-400' :
                          r.status === 'exhausted' ? 'bg-orange-500/20 text-orange-400' :
                          r.status === 'closed' ? 'bg-zinc-500/20 text-zinc-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
