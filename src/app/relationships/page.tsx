export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, MessageSquare, Megaphone, Activity, ChevronRight, User, Target } from 'lucide-react'

const HUBS = [
  { label: 'Contacts', href: '/relationships/contacts', icon: User, count: 248, sub: 'People & companies', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { label: 'Interactions', href: '/relationships/interactions', icon: Activity, count: 1204, sub: 'Log entries', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { label: 'Opportunities', href: '/relationships/opportunities', icon: Target, count: 34, sub: 'Open deals', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { label: 'Campaigns', href: '/crm/campaigns', icon: Megaphone, count: 8, sub: 'Active campaigns', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
]

const RECENT_INTERACTIONS = [
  { id: '1', contact: 'John Smith', type: 'Phone Call', description: 'Discussed Q2 renewal options', date: '2026-04-21', salesperson: 'Jane D.' },
  { id: '2', contact: 'Acme Corp', type: 'Email', description: 'Sent product catalog', date: '2026-04-20', salesperson: 'Bob K.' },
  { id: '3', contact: 'Mary Johnson', type: 'Meeting', description: 'Demo presentation', date: '2026-04-19', salesperson: 'Jane D.' },
  { id: '4', contact: 'Globex Inc', type: 'Phone Call', description: 'Follow-up on quote', date: '2026-04-18', salesperson: 'Tom R.' },
]

export default function RelationshipsPage() {
  return (
    <>
      <TopBar title="Relationship Management" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">Relationship Management</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Contacts, interactions, campaigns, and opportunities</p>
          </div>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 gap-2" asChild>
            <Link href="/relationships/contacts/new">
              <Users className="w-4 h-4" />
              New Contact
            </Link>
          </Button>
        </div>

        {/* Hub Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {HUBS.map(h => (
            <Link key={h.href} href={h.href}>
              <Card className={`cursor-pointer hover:border-zinc-600 transition-colors border ${h.bg}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h.icon className={`w-5 h-5 ${h.color}`} />
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                  </div>
                  <div className={`text-2xl font-bold mb-0.5 ${h.color}`}>{h.count.toLocaleString()}</div>
                  <div className="text-sm font-medium text-zinc-300">{h.label}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{h.sub}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Interactions */}
        <Card>
          <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-200">Recent Interactions</span>
            <Link href="/relationships/interactions" className="text-xs text-indigo-400 hover:text-indigo-300">View All</Link>
          </div>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-5 py-2.5 text-xs text-zinc-500 uppercase">Contact</th>
                  <th className="text-left px-5 py-2.5 text-xs text-zinc-500 uppercase">Type</th>
                  <th className="text-left px-5 py-2.5 text-xs text-zinc-500 uppercase">Description</th>
                  <th className="text-left px-5 py-2.5 text-xs text-zinc-500 uppercase">Salesperson</th>
                  <th className="text-left px-5 py-2.5 text-xs text-zinc-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {RECENT_INTERACTIONS.map(i => (
                  <tr key={i.id} className="hover:bg-zinc-900/30">
                    <td className="px-5 py-3 text-zinc-300 font-medium">{i.contact}</td>
                    <td className="px-5 py-3"><span className="text-xs text-blue-400">{i.type}</span></td>
                    <td className="px-5 py-3 text-zinc-400 text-xs">{i.description}</td>
                    <td className="px-5 py-3 text-zinc-500 text-xs">{i.salesperson}</td>
                    <td className="px-5 py-3 text-zinc-500 text-xs">{i.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
