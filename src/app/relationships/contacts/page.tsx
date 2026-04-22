export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Mail, Target, ChevronRight, User, Building } from 'lucide-react'

const TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  Person: User,
  Company: Building,
}

const MOCK_CONTACTS = [
  { id: 'C-001', no: 'C-001', companyName: 'Acme Corp', firstName: 'John', lastName: 'Smith', type: 'Person', phone: '555-0101', email: 'john.smith@acme.com', salesperson: 'JD', city: 'New York' },
  { id: 'C-002', no: 'C-002', companyName: 'Globex Industries', firstName: '', lastName: '', type: 'Company', phone: '555-0202', email: 'info@globex.com', salesperson: 'BK', city: 'Chicago' },
  { id: 'C-003', no: 'C-003', companyName: 'Initech', firstName: 'Mary', lastName: 'Johnson', type: 'Person', phone: '555-0303', email: 'm.johnson@initech.com', salesperson: 'JD', city: 'Dallas' },
  { id: 'C-004', no: 'C-004', companyName: 'Umbrella Ltd', firstName: '', lastName: '', type: 'Company', phone: '555-0404', email: 'contact@umbrella.com', salesperson: 'TR', city: 'Seattle' },
  { id: 'C-005', no: 'C-005', companyName: 'Dunder Mifflin', firstName: 'Michael', lastName: 'Scott', type: 'Person', phone: '555-0505', email: 'michael@dundermifflin.com', salesperson: 'TR', city: 'Scranton' },
]

export default function RelationshipsContactsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const persons = MOCK_CONTACTS.filter(c => c.type === 'Person').length
  const companies = MOCK_CONTACTS.filter(c => c.type === 'Company').length

  return (
    <>
      <TopBar title="Contacts" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Contacts</p>
            <p className="text-2xl font-bold text-zinc-100">{MOCK_CONTACTS.length}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Persons</p>
            <p className="text-2xl font-bold text-blue-400">{persons}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Companies</p>
            <p className="text-2xl font-bold text-purple-400">{companies}</p>
          </CardContent></Card>
        </div>

        {/* Action Ribbon */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-500" asChild>
            <Link href="/relationships/contacts/new">
              <Plus className="w-4 h-4" />
              New Contact
            </Link>
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <Target className="w-4 h-4" />
            Create Opportunity
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <Mail className="w-4 h-4" />
            Send Email
          </Button>
        </div>

        {/* Filter pane */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-500 font-medium">Type:</span>
          {['All', 'Person', 'Company'].map(t => (
            <Link
              key={t}
              href={t === 'All' ? '/relationships/contacts' : `/relationships/contacts?type=${t}`}
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
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">No.</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Company Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">First Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Last Name</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Phone</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Salesperson</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {MOCK_CONTACTS.map(c => {
                    const TypeIcon = TYPE_ICON[c.type] ?? User
                    return (
                      <tr key={c.id} className="hover:bg-zinc-900/40 transition-colors group">
                        <td className="px-4 py-3 font-mono text-xs">
                          <Link href={`/relationships/contacts/${c.id}`} className="text-blue-400 hover:text-blue-300">
                            {c.no}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-300">{c.companyName}</td>
                        <td className="px-4 py-3 text-sm text-zinc-400">{c.firstName || '—'}</td>
                        <td className="px-4 py-3 text-sm text-zinc-400">{c.lastName || '—'}</td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                            <TypeIcon className="w-3.5 h-3.5 text-zinc-500" />
                            {c.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-500">{c.phone}</td>
                        <td className="px-4 py-3 text-xs text-zinc-500">{c.email}</td>
                        <td className="px-4 py-3 text-xs text-zinc-500">{c.salesperson}</td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/relationships/contacts/${c.id}`}>
                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 inline" />
                          </Link>
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
