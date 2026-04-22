export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Package, PackageCheck, ArrowLeftRight, Send, RefreshCw, AlertTriangle } from 'lucide-react'

export default async function InventoryOpsPage() {
  const [inbound, transfers, pushes, rules] = await Promise.all([
    prisma.inboundShipment.findMany(),
    prisma.outboundTransfer.findMany(),
    prisma.buyersPush.findMany(),
    prisma.replenishmentRule.findMany({ where: { isActive: true } }),
  ])
  const expected = inbound.filter(s => s.status === 'expected').length
  const inTransit = transfers.filter(t => t.status === 'shipped').length
  const openPush = pushes.filter(p => p.status === 'draft' || p.status === 'approved').length
  const discrepancies = inbound.filter(s => s.status === 'discrepancy').length

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Inventory Operations</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Expected Shipments', value: expected, icon: PackageCheck, color: 'text-blue-400' },
          { label: 'In-Transit Transfers', value: inTransit, icon: ArrowLeftRight, color: 'text-purple-400' },
          { label: 'Open Push Plans', value: openPush, icon: Send, color: 'text-green-400' },
          { label: 'Discrepancy Alerts', value: discrepancies, icon: AlertTriangle, color: 'text-red-400' },
        ].map(k => (
          <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <k.icon className={`w-5 h-5 mb-2 ${k.color}`} />
            <div className="text-2xl font-bold text-zinc-100">{k.value}</div>
            <div className="text-sm text-zinc-400">{k.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Inbound Shipments', href: '/inventory-ops/inbound', icon: PackageCheck },
          { label: 'Transfers', href: '/inventory-ops/transfers', icon: ArrowLeftRight },
          { label: "Buyer's Push", href: '/inventory-ops/buyers-push', icon: Send },
          { label: 'Replenishment', href: '/inventory-ops/replenishment', icon: RefreshCw },
        ].map(l => (
          <Link key={l.href} href={l.href} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3 hover:border-zinc-600 transition-colors">
            <l.icon className="w-5 h-5 text-zinc-400" />
            <span className="text-zinc-200 font-medium">{l.label}</span>
          </Link>
        ))}
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="text-sm text-zinc-400">Active Replenishment Rules: <span className="text-zinc-100 font-medium">{rules.length}</span></div>
      </div>
    </div>
  )
}
