import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Globe, Plus, ChevronDown, Radio } from 'lucide-react'

export default async function ChannelsPage() {
  const channels = await prisma.retailChannel.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main className="flex-1 p-6 overflow-auto bg-zinc-950">
      {/* D365-style toolbar */}
      <div className="flex items-center gap-2 mb-6 pb-3 border-b border-zinc-800">
        <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded transition-colors">
          Channel <ChevronDown className="w-3 h-3" />
        </button>
        <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded transition-colors">
          Setup <ChevronDown className="w-3 h-3" />
        </button>
        <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded transition-colors">
          Options <ChevronDown className="w-3 h-3" />
        </button>
        <div className="flex-1" />
        <Link
          href="/channels/new"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
        >
          <Plus className="w-3 h-3" /> New Channel
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Filter by name..."
          className="px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-700 rounded text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 w-52"
        />
        <select className="px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-700 rounded text-zinc-300 focus:outline-none focus:border-zinc-500">
          <option value="">All types</option>
          <option value="online_store">Online Store</option>
          <option value="retail_store">Retail Store</option>
          <option value="call_center">Call Center</option>
        </select>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Retail Channels</h2>
          <p className="text-xs text-zinc-500">{channels.length} channels</p>
        </div>
      </div>

      {channels.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
          <Globe className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-sm">No channels configured</p>
          <Link href="/channels/new" className="mt-3 text-xs text-blue-400 hover:text-blue-300">
            Create your first channel
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="text-left pb-2 font-medium uppercase tracking-widest pr-6">Retail Channel Id</th>
                <th className="text-left pb-2 font-medium uppercase tracking-widest pr-6">Name</th>
                <th className="text-left pb-2 font-medium uppercase tracking-widest pr-6">Channel type</th>
                <th className="text-left pb-2 font-medium uppercase tracking-widest pr-6">Operating unit number</th>
                <th className="text-left pb-2 font-medium uppercase tracking-widest pr-6">Legal entity</th>
                <th className="text-left pb-2 font-medium uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {channels.map(ch => (
                <tr key={ch.id} className="hover:bg-zinc-900/60 group">
                  <td className="py-2.5 pr-6">
                    <Link href={`/channels/${ch.id}`} className="text-blue-400 hover:text-blue-300 font-mono">
                      {ch.retailChannelId}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-6 text-zinc-200 font-medium">{ch.name}</td>
                  <td className="py-2.5 pr-6 text-zinc-400 capitalize">{ch.channelType.replace('_', ' ')}</td>
                  <td className="py-2.5 pr-6 text-zinc-400">{ch.operatingUnitNumber ?? '—'}</td>
                  <td className="py-2.5 pr-6 text-zinc-400">{ch.legalEntity ?? '—'}</td>
                  <td className="py-2.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                      ch.publishingStatus === 'published'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : ch.publishingStatus === 'draft'
                        ? 'bg-zinc-700/50 text-zinc-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {ch.publishingStatus === 'published' && <Radio className="w-2.5 h-2.5" />}
                      {ch.publishingStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sub-nav links */}
      <div className="mt-8 pt-6 border-t border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: '/channels/functionality-profiles', label: 'Functionality Profiles' },
          { href: '/channels/csu', label: 'Commerce Scale Units' },
          { href: '/channels/bopis', label: 'BOPIS / Delivery Modes' },
          { href: '/channels/hardware-profiles', label: 'Hardware Profiles' },
          { href: '/channels/registers', label: 'Registers' },
          { href: '/channels/receipt-profiles', label: 'Receipt Profiles' },
          { href: '/channels/payment-connectors', label: 'Payment Connectors' },
          { href: '/channels/fulfillment-groups', label: 'Fulfillment Groups' },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 rounded border border-zinc-800 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </main>
  )
}
