import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Pencil, Settings2, Check, X } from 'lucide-react'

export const dynamic = 'force-dynamic'

function Tick({ v }: { v: boolean }) {
  return v
    ? <Check className="w-3.5 h-3.5 text-green-400" />
    : <X className="w-3.5 h-3.5 text-zinc-600" />
}

export default async function FunctionalityProfilesPage() {
  const profiles = await prisma.functionalityProfile.findMany({
    include: { registers: { select: { id: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Functionality Profiles" />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <p className="text-zinc-500 text-sm">
            Control POS behavior rules — discounts, voids, returns, loyalty, and offline mode.
          </p>
          <Link
            href="/configuration/functionality-profiles/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold px-4 py-2 rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Profile
          </Link>
        </div>

        {profiles.length === 0 ? (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-12 text-center">
            <Settings2 className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No functionality profiles configured yet.</p>
          </div>
        ) : (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Name</th>
                  <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Void Mgr</th>
                  <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Discount</th>
                  <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Split Tender</th>
                  <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Loyalty</th>
                  <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Gift Card</th>
                  <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Offline</th>
                  <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Refunds</th>
                  <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Registers</th>
                  <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-[13px] font-semibold text-zinc-100">{p.name}</div>
                      <div className="text-[11px] text-zinc-500">{p.country} · {p.currency}</div>
                    </td>
                    <td className="px-3 py-3 text-center"><Tick v={p.voidRequiresManager} /></td>
                    <td className="px-3 py-3 text-center"><Tick v={p.manualDiscountAllowed} /></td>
                    <td className="px-3 py-3 text-center"><Tick v={p.splitTenderAllowed} /></td>
                    <td className="px-3 py-3 text-center"><Tick v={p.loyaltyAllowed} /></td>
                    <td className="px-3 py-3 text-center"><Tick v={p.giftCardAllowed} /></td>
                    <td className="px-3 py-3 text-center"><Tick v={p.offlineModeAllowed} /></td>
                    <td className="px-3 py-3 text-center"><Tick v={p.refundAllowed} /></td>
                    <td className="px-3 py-3">
                      <span className="text-[12px] bg-zinc-800 text-zinc-400 rounded-full px-2 py-0.5">
                        {p.registers.length}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        p.isActive ? 'bg-green-500/15 text-green-400' : 'bg-zinc-700/50 text-zinc-500'
                      }`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/configuration/functionality-profiles/${p.id}`}
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
