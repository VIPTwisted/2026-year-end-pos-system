import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Pencil, Cpu } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function HardwareProfilesPage() {
  const profiles = await prisma.hardwareProfile.findMany({
    include: { registers: { select: { id: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Hardware Profiles" />
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-zinc-500 text-sm mt-1">
              Configure printers, cash drawers, payment terminals, and peripherals.
            </p>
          </div>
          <Link
            href="/configuration/hardware-profiles/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold px-4 py-2 rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Profile
          </Link>
        </div>

        {profiles.length === 0 ? (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-12 text-center">
            <Cpu className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No hardware profiles configured yet.</p>
            <Link href="/configuration/hardware-profiles/new" className="text-blue-500 text-sm hover:text-blue-400 mt-2 inline-block">
              Create your first profile
            </Link>
          </div>
        ) : (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Name</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Printer</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Cash Drawer</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Payment Terminal</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Scanner</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Registers</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-[13px] font-semibold text-zinc-100">{p.name}</div>
                      {p.description && (
                        <div className="text-[11px] text-zinc-500 mt-0.5">{p.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-zinc-300 capitalize">{p.printerType}</td>
                    <td className="px-4 py-3 text-[13px] text-zinc-300 capitalize">{p.cashDrawerPort}</td>
                    <td className="px-4 py-3 text-[13px] text-zinc-300 capitalize">{p.paymentTerminalType}</td>
                    <td className="px-4 py-3 text-[13px] text-zinc-300 capitalize">{p.barcodeScanner}</td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] bg-zinc-800 text-zinc-400 rounded-full px-2 py-0.5">
                        {p.registers.length}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        p.isActive ? 'bg-green-500/15 text-green-400' : 'bg-zinc-700/50 text-zinc-500'
                      }`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/configuration/hardware-profiles/${p.id}`}
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
