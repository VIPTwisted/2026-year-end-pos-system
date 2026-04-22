export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Filter, Plus, Edit } from 'lucide-react'
import { cn } from '@/lib/utils'

const OPT_COLORS: Record<string, string> = {
  cost: 'bg-emerald-900/50 text-emerald-300',
  speed: 'bg-blue-900/50 text-blue-300',
  stock: 'bg-purple-900/50 text-purple-300',
  balanced: 'bg-amber-900/50 text-amber-300',
}

export default async function PoliciesPage() {
  const policies = await prisma.fulfillmentPolicy.findMany({
    orderBy: [{ priority: 'desc' }, { name: 'asc' }],
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
          <Filter className="w-5 h-5 text-amber-400" /> Fulfillment Policies
        </h1>
        <Link href="/iom/policies/new" className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Policy
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800">
            <tr>
              <th className="text-left p-4 text-zinc-500 font-medium">Name</th>
              <th className="text-left p-4 text-zinc-500 font-medium">Optimize For</th>
              <th className="text-center p-4 text-zinc-500 font-medium">Max Splits</th>
              <th className="text-center p-4 text-zinc-500 font-medium">Priority</th>
              <th className="text-left p-4 text-zinc-500 font-medium">Status</th>
              <th className="text-left p-4 text-zinc-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p) => (
              <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-zinc-200">{p.name}</div>
                  {p.description && <div className="text-xs text-zinc-500 mt-0.5">{p.description}</div>}
                </td>
                <td className="p-4">
                  <span className={cn('px-2 py-0.5 rounded text-xs font-medium capitalize', OPT_COLORS[p.optimizeFor] ?? 'bg-zinc-700 text-zinc-400')}>
                    {p.optimizeFor}
                  </span>
                </td>
                <td className="p-4 text-center text-zinc-400 text-xs">{p.maxSplitLines}</td>
                <td className="p-4 text-center text-zinc-400 text-xs">{p.priority}</td>
                <td className="p-4">
                  <span className={cn('px-2 py-0.5 rounded text-xs', p.isActive ? 'bg-emerald-900/50 text-emerald-400' : 'bg-zinc-700 text-zinc-500')}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4">
                  <Link href={`/iom/policies/${p.id}`} className="text-zinc-400 hover:text-zinc-200 transition-colors">
                    <Edit className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
            {policies.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-zinc-600">No policies. <Link href="/iom/policies/new" className="text-blue-400">Create one</Link></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
