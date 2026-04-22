import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Pencil, Monitor } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function RegistersPage() {
  const registers = await prisma.posRegister.findMany({
    include: {
      store: { select: { id: true, name: true } },
      hardwareProfile: { select: { id: true, name: true } },
      functionalityProfile: { select: { id: true, name: true } },
      receiptProfile: { select: { id: true, name: true } },
    },
    orderBy: { registerId: 'asc' },
  })

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="POS Registers" />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <p className="text-zinc-500 text-sm">
            Physical POS terminals with assigned hardware, functionality, and receipt profiles.
          </p>
          <Link
            href="/configuration/registers/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold px-4 py-2 rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Register
          </Link>
        </div>

        {registers.length === 0 ? (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-12 text-center">
            <Monitor className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No registers configured yet.</p>
          </div>
        ) : (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Register ID</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Name</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Store</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Hardware Profile</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Functionality Profile</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Receipt Profile</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {registers.map((r) => (
                  <tr key={r.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-[13px] font-semibold text-zinc-100 bg-zinc-800 px-2 py-0.5 rounded">
                        {r.registerId}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-zinc-200">{r.name}</td>
                    <td className="px-4 py-3 text-[13px] text-zinc-400">{r.store.name}</td>
                    <td className="px-4 py-3 text-[13px] text-zinc-400">
                      {r.hardwareProfile?.name ?? <span className="text-zinc-600 italic">None</span>}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-zinc-400">
                      {r.functionalityProfile?.name ?? <span className="text-zinc-600 italic">None</span>}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-zinc-400">
                      {r.receiptProfile?.name ?? <span className="text-zinc-600 italic">None</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          r.isActive ? 'bg-green-500/15 text-green-400' : 'bg-zinc-700/50 text-zinc-500'
                        }`}>
                          {r.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          r.isOnline ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-700/50 text-zinc-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${r.isOnline ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                          {r.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/configuration/registers/${r.id}`}
                        className="inline-flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-blue-400 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
