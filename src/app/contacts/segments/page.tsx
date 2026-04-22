import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Users2, Plus, Zap, List, BarChart2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ContactSegmentsPage() {
  const segments = await prisma.contactSegment.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { memberships: true } } },
  })

  const total = segments.length
  const dynamic = segments.filter(s => s.segmentType === 'dynamic').length
  const totalMembers = segments.reduce((s, seg) => s + seg.memberCount, 0)

  return (
    <>
      <TopBar
        title="Contact Segments"
        breadcrumb={[{ label: 'Contacts', href: '/crm/contacts' }]}
        actions={
          <Link href="/contacts/segments/new">
            <Button size="sm" className="h-8 text-xs gap-1.5">
              <Plus className="w-3.5 h-3.5" /> New Segment
            </Button>
          </Link>
        }
      />
      <main className="flex-1 p-6 bg-[#0f0f1a] min-h-screen space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Segments', value: total, icon: List, color: 'text-blue-400' },
            { label: 'Dynamic', value: dynamic, icon: Zap, color: 'text-violet-400' },
            { label: 'Total Members', value: totalMembers.toLocaleString(), icon: Users2, color: 'text-emerald-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-zinc-500">{label}</p>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {segments.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-xs text-zinc-600 mb-3">No segments created yet.</p>
              <Link href="/contacts/segments/new">
                <Button size="sm" variant="outline" className="text-xs gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Create First Segment
                </Button>
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Name', 'Type', 'Members', 'Last Refreshed', 'Status', 'Actions'].map(h => (
                    <th key={h} className={`px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide ${h === 'Name' ? 'text-left' : 'text-right'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {segments.map(seg => (
                  <tr key={seg.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/contacts/segments/${seg.id}`} className="text-blue-400 hover:text-blue-300 font-medium">
                        {seg.name}
                      </Link>
                      {seg.description && (
                        <p className="text-xs text-zinc-600 mt-0.5 line-clamp-1">{seg.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        seg.segmentType === 'dynamic'
                          ? 'bg-violet-500/10 text-violet-300'
                          : 'bg-zinc-700 text-zinc-300'
                      }`}>
                        {seg.segmentType === 'dynamic' && <Zap className="w-3 h-3" />}
                        {seg.segmentType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-zinc-300 font-semibold">
                      {seg.memberCount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-zinc-500">
                      {seg.lastRefreshed ? new Date(seg.lastRefreshed).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        seg.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-500'
                      }`}>
                        {seg.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/crm/campaigns?segmentId=${seg.id}`}>
                        <button className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                          Use in Campaign
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </main>
    </>
  )
}
