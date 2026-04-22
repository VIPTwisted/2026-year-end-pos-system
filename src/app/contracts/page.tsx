export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Plus, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

function statusBadge(status: string) {
  const map: Record<string, string> = {
    draft: 'bg-zinc-700/60 text-zinc-400',
    active: 'bg-emerald-500/10 text-emerald-400',
    expired: 'bg-amber-500/10 text-amber-400',
    terminated: 'bg-red-500/10 text-red-400',
    renewed: 'bg-blue-500/10 text-blue-400',
  }
  return map[status] ?? 'bg-zinc-700/60 text-zinc-400'
}

function typeBadge(type: string) {
  const map: Record<string, string> = {
    customer: 'bg-blue-500/10 text-blue-400',
    vendor: 'bg-violet-500/10 text-violet-400',
    service: 'bg-cyan-500/10 text-cyan-400',
    lease: 'bg-orange-500/10 text-orange-400',
  }
  return map[type] ?? 'bg-zinc-700/60 text-zinc-400'
}

function isExpiringSoon(endDate: Date | null, renewDays: number): boolean {
  if (!endDate) return false
  const now = new Date()
  const diff = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diff >= 0 && diff <= renewDays
}

function isExpired(endDate: Date | null, status: string): boolean {
  if (!endDate) return false
  return status === 'active' && endDate < new Date()
}

function partyName(c: {
  customer: { firstName: string; lastName: string } | null
  supplier: { name: string } | null
}): string {
  if (c.customer) return `${c.customer.firstName} ${c.customer.lastName}`
  if (c.supplier) return c.supplier.name
  return '—'
}

export default async function ContractsPage() {
  const contracts = await prisma.contract.findMany({
    include: {
      customer: { select: { id: true, firstName: true, lastName: true } },
      supplier: { select: { id: true, name: true } },
      _count: { select: { lines: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const now = new Date()
  const active = contracts.filter(c => c.status === 'active').length
  const expired = contracts.filter(c => c.status === 'expired' || (c.status === 'active' && c.endDate && c.endDate < now)).length
  const expiringSoon = contracts.filter(c =>
    c.status === 'active' &&
    c.endDate &&
    isExpiringSoon(c.endDate, c.renewDays),
  ).length
  const totalValue = contracts
    .filter(c => c.status === 'active')
    .reduce((s, c) => s + Number(c.value), 0)

  const stats = [
    {
      label: 'Active Contracts',
      value: active,
      icon: CheckCircle,
      accent: 'text-emerald-400',
      sub: 'currently active',
    },
    {
      label: 'Expiring Soon',
      value: expiringSoon,
      icon: AlertTriangle,
      accent: 'text-amber-400',
      sub: 'within renewal window',
    },
    {
      label: 'Total Contract Value',
      value: formatCurrency(totalValue),
      icon: FileText,
      accent: 'text-blue-400',
      sub: 'active contracts',
    },
    {
      label: 'Expired',
      value: expired,
      icon: Clock,
      accent: 'text-red-400',
      sub: 'needs attention',
    },
  ]

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] flex flex-col">
      <TopBar
        title="Contract Management"
        breadcrumb={[{ label: 'Admin', href: '/' }]}
        actions={
          <Link
            href="/contracts/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Contract
          </Link>
        }
      />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">{s.label}</span>
                <s.icon className={`w-4 h-4 ${s.accent}`} />
              </div>
              <div className={`text-2xl font-bold ${s.accent}`}>{s.value}</div>
              <div className="text-xs text-zinc-500 mt-1">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">All Contracts</h2>
            <span className="text-xs text-zinc-500">{contracts.length} total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  {['Contract #', 'Title', 'Type', 'Party', 'Value', 'Start', 'End', 'Status', 'Auto-Renew'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contracts.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-sm text-zinc-500">
                      No contracts yet.{' '}
                      <Link href="/contracts/new" className="text-blue-400 hover:text-blue-300 underline">
                        Create one
                      </Link>
                    </td>
                  </tr>
                )}
                {contracts.map(c => {
                  const expiring = isExpiringSoon(c.endDate, c.renewDays) && c.status === 'active'
                  const overdue = isExpired(c.endDate, c.status)
                  const endDateCls = overdue
                    ? 'text-red-400 font-semibold'
                    : expiring
                    ? 'text-amber-400 font-semibold'
                    : 'text-zinc-300'

                  return (
                    <tr
                      key={c.id}
                      className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/contracts/${c.id}`}
                          className="font-mono text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {c.contractNo}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-100 max-w-[200px] truncate">
                        {c.title}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${typeBadge(c.type)}`}>
                          {c.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-300 max-w-[160px] truncate">
                        {partyName(c)}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-100 tabular-nums font-semibold">
                        {formatCurrency(Number(c.value), c.currency)}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400 whitespace-nowrap">
                        {c.startDate.toLocaleDateString()}
                      </td>
                      <td className={`px-4 py-3 text-sm whitespace-nowrap ${endDateCls}`}>
                        {c.endDate
                          ? c.endDate.toLocaleDateString()
                          : <span className="text-zinc-600">Open</span>}
                        {expiring && (
                          <span className="ml-1.5 text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded">
                            expiring
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${statusBadge(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {c.autoRenew ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400">
                            Auto ({c.renewDays}d)
                          </span>
                        ) : (
                          <span className="text-zinc-600 text-[11px]">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
