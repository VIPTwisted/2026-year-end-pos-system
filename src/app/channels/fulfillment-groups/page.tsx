export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { Package } from 'lucide-react'

export default async function FulfillmentGroupsPage() {
  const groups = await prisma.fulfillmentGroup.findMany({
    include: { stores: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Fulfillment Groups</h2>
          <p className="text-xs text-zinc-500 mt-0.5">{groups.length} groups</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500">
              <th className="text-left pb-2 font-medium uppercase tracking-widest pr-6">Name</th>
              <th className="text-left pb-2 font-medium uppercase tracking-widest pr-6">Fulfillment Type</th>
              <th className="text-left pb-2 font-medium uppercase tracking-widest pr-6">Stores</th>
              <th className="text-left pb-2 font-medium uppercase tracking-widest">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {groups.length === 0 ? (
              <tr><td colSpan={4} className="py-16 text-center text-zinc-600">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No fulfillment groups
              </td></tr>
            ) : groups.map(g => (
              <>
                <tr key={g.id} className="hover:bg-zinc-900/50">
                  <td className="py-2.5 pr-6 text-zinc-200 font-medium">{g.name}</td>
                  <td className="py-2.5 pr-6 text-zinc-400 capitalize">{g.fulfillmentType}</td>
                  <td className="py-2.5 pr-6 text-zinc-400">{g.stores.length} stores</td>
                  <td className="py-2.5"><span className={g.isActive ? 'text-emerald-400' : 'text-zinc-600'}>{g.isActive ? 'Yes' : 'No'}</span></td>
                </tr>
                {g.stores.map(s => (
                  <tr key={s.id} className="bg-zinc-900/20">
                    <td className="py-1.5 pl-6 pr-6 text-zinc-500" colSpan={2}>↳ {s.storeName ?? 'Store'}</td>
                    <td className="py-1.5 text-zinc-600">Priority: {s.priority}</td>
                    <td />
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
