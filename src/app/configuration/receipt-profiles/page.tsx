import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Pencil, Receipt, Check, X } from 'lucide-react'

export const dynamic = 'force-dynamic'

function Tick({ v }: { v: boolean }) {
  return v
    ? <Check className="w-3.5 h-3.5 text-green-400" />
    : <X className="w-3.5 h-3.5 text-zinc-600" />
}

export default async function ReceiptProfilesPage() {
  const profiles = await prisma.receiptProfile.findMany({
    include: { registers: { select: { id: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Receipt Profiles" />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <p className="text-zinc-500 text-sm">
            Configure receipt headers, footers, and display options per register.
          </p>
          <Link
            href="/configuration/receipt-profiles/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold px-4 py-2 rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Profile
          </Link>
        </div>

        {profiles.length === 0 ? (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-12 text-center">
            <Receipt className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">No receipt profiles configured yet.</p>
          </div>
        ) : (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Name</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Header</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Footer</th>
                  <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Logo</th>
                  <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Barcode</th>
                  <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">QR</th>
                  <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Loyalty Bal</th>
                  <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Width</th>
                  <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Registers</th>
                  <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Default</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-[13px] font-semibold text-zinc-100">{p.name}</div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 max-w-[140px]">
                      <div className="truncate">{p.headerLine1 ?? <span className="text-zinc-600 italic">none</span>}</div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 max-w-[160px]">
                      <div className="truncate">{p.footerLine1 ?? <span className="text-zinc-600 italic">none</span>}</div>
                    </td>
                    <td className="px-3 py-3 text-center"><Tick v={p.showLogo} /></td>
                    <td className="px-3 py-3 text-center"><Tick v={p.showBarcode} /></td>
                    <td className="px-3 py-3 text-center"><Tick v={p.showQrCode} /></td>
                    <td className="px-3 py-3 text-center"><Tick v={p.showLoyaltyBalance} /></td>
                    <td className="px-3 py-3 text-zinc-300">{p.paperWidth}mm</td>
                    <td className="px-3 py-3">
                      <span className="text-[12px] bg-zinc-800 text-zinc-400 rounded-full px-2 py-0.5">
                        {p.registers.length}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {p.isDefault && (
                        <span className="text-[11px] font-semibold bg-blue-500/15 text-blue-400 rounded-full px-2 py-0.5">
                          Default
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/configuration/receipt-profiles/${p.id}`}
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
