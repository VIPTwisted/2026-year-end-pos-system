export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, ArrowRight, Phone, Mail, Users, MessageSquare } from 'lucide-react'

const TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  'Phone Call': Phone,
  'Email': Mail,
  'Meeting': Users,
  'Other': MessageSquare,
}

const MOCK_INTERACTIONS = [
  { id: 'INT-001', contactNo: 'C-001', contactName: 'John Smith (Acme Corp)', date: '2026-04-21', type: 'Phone Call', description: 'Discussed Q2 renewal options and pricing tiers', initiatedBy: 'JD', hasAttachment: false },
  { id: 'INT-002', contactNo: 'C-002', contactName: 'Globex Industries', date: '2026-04-20', type: 'Email', description: 'Sent product catalog and updated pricing sheet', initiatedBy: 'BK', hasAttachment: true },
  { id: 'INT-003', contactNo: 'C-003', contactName: 'Mary Johnson (Initech)', date: '2026-04-19', type: 'Meeting', description: 'Demo presentation — 45 min. Decision maker present', initiatedBy: 'JD', hasAttachment: true },
  { id: 'INT-004', contactNo: 'C-004', contactName: 'Umbrella Ltd', date: '2026-04-18', type: 'Phone Call', description: 'Follow-up on outstanding quote', initiatedBy: 'TR', hasAttachment: false },
  { id: 'INT-005', contactNo: 'C-005', contactName: 'Michael Scott (Dunder Mifflin)', date: '2026-04-15', type: 'Email', description: 'Welcome email and onboarding instructions', initiatedBy: 'JD', hasAttachment: false },
]

export default function InteractionsPage() {
  return (
    <>
      <TopBar title="Interaction Log" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Interactions</p>
            <p className="text-2xl font-bold text-zinc-100">{MOCK_INTERACTIONS.length}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Phone Calls</p>
            <p className="text-2xl font-bold text-blue-400">{MOCK_INTERACTIONS.filter(i => i.type === 'Phone Call').length}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Emails</p>
            <p className="text-2xl font-bold text-purple-400">{MOCK_INTERACTIONS.filter(i => i.type === 'Email').length}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Meetings</p>
            <p className="text-2xl font-bold text-emerald-400">{MOCK_INTERACTIONS.filter(i => i.type === 'Meeting').length}</p>
          </CardContent></Card>
        </div>

        {/* Action Ribbon */}
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-500">
            <Plus className="w-4 h-4" />
            New Interaction
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <ArrowRight className="w-4 h-4" />
            Create Follow-Up
          </Button>
        </div>

        {/* Filter pane */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-500 font-medium">Type:</span>
          {['All', 'Phone Call', 'Email', 'Meeting', 'Other'].map(t => (
            <Link
              key={t}
              href={t === 'All' ? '/relationships/interactions' : `/relationships/interactions?type=${encodeURIComponent(t)}`}
              className="px-2.5 py-1 rounded text-xs font-medium border bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500 transition-colors"
            >
              {t}
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
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Contact No.</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Contact Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Description</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Initiated By</th>
                    <th className="text-center px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Attachment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {MOCK_INTERACTIONS.map(i => {
                    const TypeIcon = TYPE_ICON[i.type] ?? MessageSquare
                    return (
                      <tr key={i.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-blue-400">{i.contactNo}</td>
                        <td className="px-4 py-3 text-sm text-zinc-300">{i.contactName}</td>
                        <td className="px-4 py-3 text-xs text-zinc-400">{i.date}</td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                            <TypeIcon className="w-3.5 h-3.5 text-zinc-500" />
                            {i.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-400 max-w-[280px] truncate">{i.description}</td>
                        <td className="px-4 py-3 text-xs text-zinc-500">{i.initiatedBy}</td>
                        <td className="px-4 py-3 text-center">
                          {i.hasAttachment ? (
                            <span className="text-xs text-indigo-400">Yes</span>
                          ) : (
                            <span className="text-xs text-zinc-700">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
