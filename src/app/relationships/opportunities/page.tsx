export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, ChevronRight, TrendingUp, DollarSign } from 'lucide-react'

const STATUS_BADGE: Record<string, string> = {
  Open: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Won: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Lost: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const MOCK_OPPS = [
  { id: 'OPP-001', no: 'OPP-001', contact: 'John Smith', contactId: 'C-001', salesperson: 'JD', status: 'Open', stage: 'Proposal', closeDate: '2026-06-30', estimatedValue: 12000, probability: 70 },
  { id: 'OPP-002', no: 'OPP-002', contact: 'Globex Industries', contactId: 'C-002', salesperson: 'BK', status: 'Open', stage: 'Negotiation', closeDate: '2026-05-15', estimatedValue: 45000, probability: 85 },
  { id: 'OPP-003', no: 'OPP-003', contact: 'Mary Johnson', contactId: 'C-003', salesperson: 'JD', status: 'Won', stage: 'Closed', closeDate: '2026-04-01', estimatedValue: 8500, probability: 100 },
  { id: 'OPP-004', no: 'OPP-004', contact: 'Umbrella Ltd', contactId: 'C-004', salesperson: 'TR', status: 'Lost', stage: 'Closed', closeDate: '2026-03-20', estimatedValue: 22000, probability: 0 },
  { id: 'OPP-005', no: 'OPP-005', contact: 'Michael Scott', contactId: 'C-005', salesperson: 'TR', status: 'Open', stage: 'Discovery', closeDate: '2026-07-31', estimatedValue: 6000, probability: 30 },
]

export default function OpportunitiesPage() {
  const openValue = MOCK_OPPS.filter(o => o.status === 'Open').reduce((s, o) => s + o.estimatedValue, 0)
  const wonValue = MOCK_OPPS.filter(o => o.status === 'Won').reduce((s, o) => s + o.estimatedValue, 0)
  const openCount = MOCK_OPPS.filter(o => o.status === 'Open').length

  return (
    <>
      <TopBar title="Opportunities" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Open</p>
            <p className="text-2xl font-bold text-amber-400">{openCount}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Open Value</p>
            <p className="text-2xl font-bold text-blue-400">${openValue.toLocaleString()}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Won This Month</p>
            <p className="text-2xl font-bold text-emerald-400">${wonValue.toLocaleString()}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Opps</p>
            <p className="text-2xl font-bold text-zinc-100">{MOCK_OPPS.length}</p>
          </CardContent></Card>
        </div>

        {/* Action Ribbon */}
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-500" asChild>
            <Link href="/relationships/opportunities/new">
              <Plus className="w-4 h-4" />
              New Opportunity
            </Link>
          </Button>
        </div>

        {/* Filter pane */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 font-medium">Status:</span>
          {['All', 'Open', 'Won', 'Lost'].map(s => (
            <Link
              key={s}
              href={s === 'All' ? '/relationships/opportunities' : `/relationships/opportunities?status=${s}`}
              className="px-2.5 py-1 rounded text-xs font-medium border bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500 transition-colors"
            >
              {s}
            </Link>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">No.</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Contact</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Salesperson</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Stage</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Close Date</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Est. Value</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Prob. %</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {MOCK_OPPS.map(o => (
                    <tr key={o.id} className="hover:bg-zinc-900/40 transition-colors group">
                      <td className="px-4 py-3 font-mono text-xs">
                        <Link href={`/relationships/opportunities/${o.id}`} className="text-blue-400 hover:text-blue-300">
                          {o.no}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-300">{o.contact}</td>
                      <td className="px-4 py-3 text-xs text-zinc-500">{o.salesperson}</td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{o.stage}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${STATUS_BADGE[o.status] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{o.closeDate}</td>
                      <td className="px-4 py-3 text-right font-medium text-zinc-200">${o.estimatedValue.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-xs font-medium ${o.probability >= 75 ? 'text-emerald-400' : o.probability >= 50 ? 'text-amber-400' : 'text-zinc-500'}`}>
                          {o.probability}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/relationships/opportunities/${o.id}`}>
                          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 inline" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
