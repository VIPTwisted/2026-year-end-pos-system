export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Cpu, Plus } from 'lucide-react'

export default async function HardwareProfilesPage() {
  const profiles = await prisma.hardwareProfile.findMany({
    include: { registers: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Hardware Profiles</h2>
          <p className="text-xs text-zinc-500 mt-0.5">{profiles.length} profiles</p>
        </div>
        <Link href="#" className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
          <Plus className="w-3 h-3" /> New Profile
        </Link>
      </div>

      <div className="space-y-3">
        {profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <Cpu className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">No hardware profiles</p>
          </div>
        ) : profiles.map(p => (
          <Link key={p.id} href={`/channels/hardware-profiles/${p.id}`} className="block bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-zinc-500" />
                  <span className="text-sm font-semibold text-zinc-100">{p.profileName}</span>
                  <span className="text-xs text-zinc-600 font-mono">#{p.profileNumber}</span>
                </div>
                <div className="text-xs text-zinc-500 mt-0.5 capitalize">{p.hardwareStationType} station</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${p.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                {p.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-zinc-600">Cash Drawer</span>
                <div className="text-zinc-400 mt-0.5">{p.cashDrawerDevice ?? '—'}</div>
              </div>
              <div>
                <span className="text-zinc-600">Barcode Scanner</span>
                <div className="text-zinc-400 mt-0.5">{p.barcodeDevice ?? '—'}</div>
              </div>
              <div>
                <span className="text-zinc-600">Receipt Printer</span>
                <div className="text-zinc-400 mt-0.5">{p.printerDevice ?? '—'}</div>
              </div>
              <div>
                <span className="text-zinc-600">Registers</span>
                <div className="text-zinc-400 mt-0.5">{p.registers.length}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
