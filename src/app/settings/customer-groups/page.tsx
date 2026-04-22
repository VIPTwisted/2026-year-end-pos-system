import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Plus, Users, Tag, Percent } from 'lucide-react'

export default async function CustomerGroupsPage() {
  const groups = await prisma.customerGroup.findMany({
    include: {
      _count: { select: { customers: true, pricingRules: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const totalCustomersInGroup = await prisma.customer.count({
    where: { customerGroupId: { not: null } },
  })

  const avgDiscount =
    groups.length > 0
      ? groups.reduce((sum, g) => sum + Number(g.discountPct), 0) / groups.length
      : 0

  return (
    <>
      <TopBar title="Customer Groups" />

      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="px-6 py-4 space-y-6 max-w-7xl">

          {/* Page header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/settings"
                className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Settings
              </Link>
              <span className="text-zinc-700">/</span>
              <h2 className="text-base font-semibold text-zinc-100">Customer Groups</h2>
            </div>
            <Link
              href="/settings/customer-groups/new"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Group
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                <Tag className="w-3 h-3 inline mr-1" />
                Total Groups
              </div>
              <div className="text-2xl font-bold text-zinc-100">{groups.length}</div>
              <div className="text-xs text-zinc-500 mt-1">
                {groups.filter((g) => g.isActive).length} active
              </div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                <Users className="w-3 h-3 inline mr-1" />
                Assigned Customers
              </div>
              <div className="text-2xl font-bold text-zinc-100">{totalCustomersInGroup}</div>
              <div className="text-xs text-zinc-500 mt-1">with a price group</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                <Percent className="w-3 h-3 inline mr-1" />
                Avg Group Discount
              </div>
              <div className="text-2xl font-bold text-zinc-100">
                {avgDiscount.toFixed(1)}%
              </div>
              <div className="text-xs text-zinc-500 mt-1">across all groups</div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-zinc-800/50">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Group Name', 'Description', 'Discount %', 'Members', 'Rules', 'Status', ''].map((h) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 ${
                        h === '' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groups.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-zinc-500">
                      No groups yet.{' '}
                      <Link href="/settings/customer-groups/new" className="text-blue-400 hover:underline">
                        Create one
                      </Link>.
                    </td>
                  </tr>
                ) : (
                  groups.map((group, idx) => (
                    <tr
                      key={group.id}
                      className={`border-b border-zinc-800 hover:bg-zinc-800/20 transition-colors ${
                        idx % 2 === 0 ? '' : 'bg-zinc-800/10'
                      }`}
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-zinc-200">{group.name}</td>
                      <td className="px-4 py-3 text-sm text-zinc-500 max-w-xs truncate">
                        {group.description ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold tabular-nums text-amber-400">
                          <Percent className="w-3 h-3" />
                          {Number(group.discountPct).toFixed(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-300 tabular-nums">
                        {group._count.customers}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-300 tabular-nums">
                        {group._count.pricingRules}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                            group.isActive
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-zinc-700 text-zinc-400'
                          }`}
                        >
                          {group.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/settings/customer-groups/${group.id}`}
                          className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </>
  )
}
