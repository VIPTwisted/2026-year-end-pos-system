import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Plus, User, FileText, Clock, CheckCircle, XCircle, Inbox } from 'lucide-react'

export const dynamic = 'force-dynamic'

const TYPE_LABELS: Record<string, string> = {
  time_off: 'Time Off',
  address_change: 'Address Change',
  benefit_change: 'Benefit Change',
  document: 'Document Request',
  expense: 'Expense',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  approved: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  rejected: 'bg-red-500/20 text-red-400 border border-red-500/30',
}

export default async function SelfServicePage() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [allRequests] = await Promise.all([
    prisma.selfServiceRequest.findMany({ orderBy: { createdAt: 'desc' } }),
  ])

  const pending = allRequests.filter(r => r.status === 'pending').length
  const approvedThisMonth = allRequests.filter(
    r => r.status === 'approved' && new Date(r.createdAt) >= monthStart
  ).length

  const quickActions = [
    { label: 'Request Time Off', href: '/hr/self-service/new?type=time_off', icon: Clock, color: 'text-blue-400' },
    { label: 'Update Address', href: '/hr/self-service/new?type=address_change', icon: User, color: 'text-purple-400' },
    { label: 'View Paystubs', href: '/hr/payroll', icon: FileText, color: 'text-emerald-400' },
    { label: 'View Benefits', href: '/hr/benefits', icon: CheckCircle, color: 'text-amber-400' },
    { label: 'Download Documents', href: '/hr/self-service/new?type=document', icon: FileText, color: 'text-sky-400' },
    { label: 'Benefit Change', href: '/hr/self-service/new?type=benefit_change', icon: CheckCircle, color: 'text-pink-400' },
  ]

  return (
    <>
      <TopBar title="Employee Self Service" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[18px] font-semibold text-zinc-100">Employee Self Service</h1>
            <p className="text-[13px] text-zinc-500">Manage requests, documents, and personal information</p>
          </div>
          <Link
            href="/hr/self-service/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Request
          </Link>
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Pending Requests', value: pending, color: pending > 0 ? 'text-amber-400' : 'text-zinc-100' },
            { label: 'Approved This Month', value: approvedThisMonth, color: 'text-emerald-400' },
            { label: 'Paystubs Available', value: 12, color: 'text-blue-400' },
            { label: 'Open Benefits Enrollment', value: 1, color: 'text-purple-400' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{k.label}</p>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-zinc-800/50 pb-1 mb-4">Quick Actions</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map(a => (
              <Link
                key={a.label}
                href={a.href}
                className="flex flex-col items-center gap-2 p-4 rounded-lg bg-zinc-900/60 border border-zinc-800/40 hover:bg-zinc-800/60 hover:border-zinc-700/60 transition-colors text-center"
              >
                <a.icon className={`w-6 h-6 ${a.color}`} />
                <span className="text-[12px] text-zinc-300 leading-tight">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* My Requests table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold text-zinc-100">My Requests</h2>
            <span className="text-[12px] text-zinc-500">{allRequests.length} total</span>
          </div>

          {allRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-zinc-500">
              <Inbox className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-[13px]">No requests yet — submit your first request above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Type</th>
                    <th className="text-left px-3 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Details</th>
                    <th className="text-center px-3 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Status</th>
                    <th className="text-left px-3 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Reviewed By</th>
                    <th className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {allRequests.slice(0, 25).map(r => (
                    <tr key={r.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-2.5 font-medium text-zinc-200">
                        {TYPE_LABELS[r.requestType] ?? r.requestType}
                      </td>
                      <td className="px-3 py-2.5 text-zinc-400 max-w-xs truncate">
                        {r.details ?? <span className="text-zinc-600 italic">—</span>}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${STATUS_COLORS[r.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-zinc-400">
                        {r.reviewedBy ?? <span className="text-zinc-600 italic">Pending</span>}
                      </td>
                      <td className="px-5 py-2.5 text-zinc-500">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </>
  )
}
