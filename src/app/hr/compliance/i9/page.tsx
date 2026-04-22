import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Shield, CheckCircle, Clock, AlertTriangle, XCircle, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function I9CompliancePage() {
  const now = new Date()
  const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

  const [allRecords, complete, pending, expiringSoon, expired] = await Promise.all([
    prisma.i9Verification.findMany({
      orderBy: { createdAt: 'desc' },
      include: { employee: true },
    }),
    prisma.i9Verification.count({ where: { status: 'complete' } }),
    prisma.i9Verification.count({ where: { status: 'pending' } }),
    prisma.i9Verification.count({
      where: {
        expirationDate: { lte: in90Days, gte: now },
        status: { not: 'expired' },
      },
    }),
    prisma.i9Verification.count({ where: { status: 'expired' } }),
  ])

  const kpis = [
    { label: 'Complete', value: complete, icon: CheckCircle, color: 'text-green-400' },
    { label: 'Pending', value: pending, icon: Clock, color: 'text-yellow-400' },
    { label: 'Expiring (90 days)', value: expiringSoon, icon: AlertTriangle, color: 'text-orange-400' },
    { label: 'Expired', value: expired, icon: XCircle, color: 'text-red-400' },
  ]

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white">
      <TopBar title="I-9 Compliance" />
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
            <h2 className="font-semibold text-zinc-200">I-9 Verification Records</h2>
            <Link href="/hr/compliance/i9/new"
              className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-3 h-3" /> New I-9
            </Link>
          </div>
          {allRecords.length === 0 ? (
            <p className="text-zinc-500 text-sm">No I-9 records on file.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-500 border-b border-zinc-800">
                    <th className="pb-2 font-medium">Employee</th>
                    <th className="pb-2 font-medium">Hire Date</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Expiration</th>
                    <th className="pb-2 font-medium">Days Until Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {allRecords.map((rec) => {
                    const daysUntilExpiry = rec.expirationDate
                      ? Math.floor((new Date(rec.expirationDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                      : null
                    const isUrgent = daysUntilExpiry !== null && daysUntilExpiry <= 90
                    const isExpired = daysUntilExpiry !== null && daysUntilExpiry < 0

                    return (
                      <tr key={rec.id} className={`border-b border-zinc-800/50 hover:bg-zinc-800/20 ${isExpired ? 'bg-red-900/10' : isUrgent ? 'bg-orange-900/10' : ''}`}>
                        <td className="py-3 text-zinc-200">
                          {rec.employee.firstName} {rec.employee.lastName}
                        </td>
                        <td className="py-3 text-zinc-400">{new Date(rec.hireDate).toLocaleDateString()}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            rec.status === 'complete' ? 'bg-green-500/20 text-green-400' :
                            rec.status === 'reverify_needed' ? 'bg-orange-500/20 text-orange-400' :
                            rec.status === 'expired' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>{rec.status.replace(/_/g, ' ')}</span>
                        </td>
                        <td className="py-3 text-zinc-400">
                          {rec.expirationDate ? new Date(rec.expirationDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3">
                          {daysUntilExpiry !== null ? (
                            <span className={isExpired ? 'text-red-400 font-medium' : isUrgent ? 'text-orange-400 font-medium' : 'text-zinc-400'}>
                              {isExpired ? `${Math.abs(daysUntilExpiry)}d ago` : `${daysUntilExpiry}d`}
                            </span>
                          ) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
