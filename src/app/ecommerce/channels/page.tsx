export const dynamic = 'force-dynamic'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Wifi, Plus, Globe } from 'lucide-react'

export default async function ChannelsPage() {
  const channels = await prisma.eCommerceChannel.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { onlineOrders: true } },
    },
  })

  return (
    <>
      <TopBar title="E-Commerce Channels" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">E-Commerce</p>
              <h2 className="text-[18px] font-semibold text-zinc-100 leading-tight">Channels</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">{channels.length} configured channels</p>
            </div>
            <Link href="/ecommerce/channels/new">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 gap-1.5">
                <Plus className="w-3.5 h-3.5" />New Channel
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Wifi className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 shrink-0">All Channels</span>
            <div className="flex-1 h-px bg-zinc-800/60" />
          </div>

          {channels.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-20 text-zinc-600">
              <Wifi className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-[14px] font-medium text-zinc-400 mb-2">No channels configured</p>
              <Link href="/ecommerce/channels/new" className="text-[13px] text-blue-400 hover:text-blue-300 transition-colors">
                Create your first channel →
              </Link>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['Name', 'Domain', 'Currency', 'Language', 'Guest Checkout', 'Orders', 'Status'].map(h => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${
                            h === 'Orders' ? 'text-right' : h === 'Guest Checkout' || h === 'Status' ? 'text-center' : 'text-left'
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {channels.map(ch => (
                      <tr key={ch.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span className="text-[13px] font-medium text-zinc-100">{ch.name}</span>
                          </div>
                          {ch.description && (
                            <p className="text-[11px] text-zinc-500 mt-0.5 ml-5">{ch.description}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-zinc-400 text-[11px] font-mono">{ch.domain || '—'}</td>
                        <td className="px-4 py-3 text-[13px] text-zinc-400">{ch.currency}</td>
                        <td className="px-4 py-3 text-[13px] text-zinc-400">{ch.language}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={ch.allowGuestCheckout ? 'success' : 'secondary'} className="text-[11px]">
                            {ch.allowGuestCheckout ? 'Yes' : 'No'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-[13px] font-semibold text-zinc-300 tabular-nums">
                          {ch._count.onlineOrders}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={ch.isActive ? 'success' : 'secondary'} className="text-[11px]">
                            {ch.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
