export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Plus, Tag, CheckCircle2, Users, User } from 'lucide-react'

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
      active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700/50 text-zinc-400'
    }`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-zinc-100">{value}</div>
      {sub && <div className="text-xs text-zinc-500 mt-1">{sub}</div>}
    </div>
  )
}

export default async function PriceListsPage() {
  const [lists, stats] = await Promise.all([
    prisma.priceList.findMany({
      include: {
        customerGroup: { select: { id: true, name: true } },
        customer: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { lines: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    Promise.all([
      prisma.priceList.count(),
      prisma.priceList.count({ where: { isActive: true } }),
      prisma.priceList.count({ where: { customerGroupId: { not: null } } }),
      prisma.priceList.count({ where: { customerId: { not: null } } }),
    ]),
  ])

  const [total, active, groupAssigned, customerAssigned] = stats

  const now = new Date()

  function dateRangeLabel(startDate: Date | null, endDate: Date | null): string {
    if (!startDate && !endDate) return 'Always active'
    if (startDate && !endDate) return `From ${startDate.toLocaleDateString()}`
    if (!startDate && endDate) return `Until ${endDate.toLocaleDateString()}`
    return `${startDate!.toLocaleDateString()} – ${endDate!.toLocaleDateString()}`
  }

  function isExpired(endDate: Date | null): boolean {
    return endDate !== null && endDate < now
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Price Lists"
        breadcrumb={[{ label: 'Pricing', href: '/pricing/price-lists' }]}
        actions={
          <Link
            href="/pricing/price-lists/new"
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Price List
          </Link>
        }
      />

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Lists" value={total} sub="all price lists" />
          <StatCard label="Active" value={active} sub="currently active" />
          <StatCard label="Group Lists" value={groupAssigned} sub="assigned to groups" />
          <StatCard label="Customer Lists" value={customerAssigned} sub="individual customers" />
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-3.5 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">
              All Price Lists
              <span className="ml-2 text-xs text-zinc-500 font-normal">({lists.length})</span>
            </h2>
          </div>

          {lists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Tag className="w-8 h-8 text-zinc-700" />
              <p className="text-sm text-zinc-500">No price lists yet</p>
              <Link
                href="/pricing/price-lists/new"
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Create your first price list
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-5 py-3">Code</th>
                    <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-4 py-3">Name</th>
                    <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-4 py-3">Assigned To</th>
                    <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-4 py-3">Products</th>
                    <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-4 py-3">Date Range</th>
                    <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-4 py-3">Currency</th>
                    <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lists.map((list) => (
                    <tr key={list.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/pricing/price-lists/${list.id}`}
                          className="font-mono text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors"
                        >
                          {list.code}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/pricing/price-lists/${list.id}`}
                          className="text-zinc-200 hover:text-zinc-100 text-sm transition-colors"
                        >
                          {list.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5">
                        {list.customer ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-300">
                            <User className="w-3 h-3 text-blue-400 shrink-0" />
                            {list.customer.firstName} {list.customer.lastName}
                          </span>
                        ) : list.customerGroup ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-300">
                            <Users className="w-3 h-3 text-emerald-400 shrink-0" />
                            {list.customerGroup.name}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-zinc-300 text-sm">{list._count.lines}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs ${isExpired(list.endDate) ? 'text-red-400' : 'text-zinc-400'}`}>
                          {dateRangeLabel(list.startDate, list.endDate)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-mono text-zinc-400">{list.currency}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge active={list.isActive && !isExpired(list.endDate)} />
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
