export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail, Target, Phone, Activity } from 'lucide-react'

const MOCK_CONTACT = {
  id: 'C-001',
  no: 'C-001',
  companyName: 'Acme Corp',
  firstName: 'John',
  lastName: 'Smith',
  type: 'Person',
  phone: '555-0101',
  mobile: '555-0110',
  email: 'john.smith@acme.com',
  address: '100 Broadway',
  city: 'New York',
  state: 'NY',
  postCode: '10001',
  salesperson: 'JD',
  territory: 'NORTHEAST',
  industryGroup: 'Manufacturing',
  jobTitle: 'Procurement Director',
  notes: 'Key decision maker for Q2 contracts.',
  interactions: [
    { id: '1', date: '2026-04-21', type: 'Phone Call', description: 'Discussed Q2 renewal', salesperson: 'JD' },
    { id: '2', date: '2026-03-15', type: 'Email', description: 'Sent updated pricing', salesperson: 'JD' },
    { id: '3', date: '2026-02-10', type: 'Meeting', description: 'Initial discovery call', salesperson: 'BK' },
  ],
  opportunities: [
    { id: 'OPP-001', description: 'Q2 Enterprise License', status: 'Open', value: 12000, closeDate: '2026-06-30' },
    { id: 'OPP-002', description: 'Support Contract Renewal', status: 'Won', value: 4800, closeDate: '2026-01-31' },
  ],
}

export default function ContactDetailPage({ params }: { params: { id: string } }) {
  const c = MOCK_CONTACT

  return (
    <>
      <TopBar title={`Contact ${c.no}`} />
      <main className="flex-1 p-6 overflow-auto space-y-5 max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/relationships/contacts" className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Contacts
          </Link>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-2">
              <Target className="w-4 h-4" />
              Create Opportunity
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <Activity className="w-4 h-4" />
              Log Interaction
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <Mail className="w-4 h-4" />
              Send Email
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg">
            {c.firstName ? c.firstName[0] : c.companyName[0]}
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">
              {c.type === 'Person' ? `${c.firstName} ${c.lastName}` : c.companyName}
            </h1>
            <p className="text-sm text-zinc-500">{c.companyName} · {c.jobTitle}</p>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
            {c.type}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 space-y-5">
            {/* FastTab: General */}
            <Card>
              <div className="px-5 py-3 border-b border-zinc-800">
                <span className="text-sm font-semibold text-zinc-200">General</span>
              </div>
              <CardContent className="p-5 grid grid-cols-2 gap-4">
                <div><p className="text-xs text-zinc-500 mb-1">No.</p><p className="text-sm font-mono text-zinc-300">{c.no}</p></div>
                <div><p className="text-xs text-zinc-500 mb-1">Type</p><p className="text-sm text-zinc-300">{c.type}</p></div>
                <div><p className="text-xs text-zinc-500 mb-1">Company Name</p><p className="text-sm text-zinc-300">{c.companyName}</p></div>
                <div><p className="text-xs text-zinc-500 mb-1">Salesperson Code</p><p className="text-sm text-zinc-300">{c.salesperson}</p></div>
                <div><p className="text-xs text-zinc-500 mb-1">Job Title</p><p className="text-sm text-zinc-300">{c.jobTitle}</p></div>
                <div><p className="text-xs text-zinc-500 mb-1">Territory</p><p className="text-sm text-zinc-300">{c.territory}</p></div>
              </CardContent>
            </Card>

            {/* FastTab: Communication */}
            <Card>
              <div className="px-5 py-3 border-b border-zinc-800">
                <span className="text-sm font-semibold text-zinc-200">Communication</span>
              </div>
              <CardContent className="p-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Phone</p>
                  <a href={`tel:${c.phone}`} className="text-sm text-blue-400 flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</a>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Mobile</p>
                  <a href={`tel:${c.mobile}`} className="text-sm text-blue-400 flex items-center gap-1"><Phone className="w-3 h-3" />{c.mobile}</a>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-zinc-500 mb-1">Email</p>
                  <a href={`mailto:${c.email}`} className="text-sm text-blue-400 flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</a>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-zinc-500 mb-1">Address</p>
                  <p className="text-sm text-zinc-300">{c.address}, {c.city}, {c.state} {c.postCode}</p>
                </div>
              </CardContent>
            </Card>

            {/* FastTab: Segmentation */}
            <Card>
              <div className="px-5 py-3 border-b border-zinc-800">
                <span className="text-sm font-semibold text-zinc-200">Segmentation</span>
              </div>
              <CardContent className="p-5 grid grid-cols-2 gap-4">
                <div><p className="text-xs text-zinc-500 mb-1">Industry Group</p><p className="text-sm text-zinc-300">{c.industryGroup}</p></div>
                <div><p className="text-xs text-zinc-500 mb-1">Territory Code</p><p className="text-sm text-zinc-300">{c.territory}</p></div>
                <div className="col-span-2"><p className="text-xs text-zinc-500 mb-1">Notes</p><p className="text-sm text-zinc-400">{c.notes}</p></div>
              </CardContent>
            </Card>
          </div>

          {/* FactBox panel */}
          <div className="space-y-4">
            {/* Interaction Log */}
            <Card>
              <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Interactions</span>
                <Link href={`/relationships/interactions?contactId=${c.id}`} className="text-xs text-indigo-400">View All</Link>
              </div>
              <CardContent className="p-0">
                {c.interactions.map(i => (
                  <div key={i.id} className="px-4 py-3 border-b border-zinc-800/50 last:border-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium text-zinc-300">{i.type}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{i.description}</p>
                      </div>
                      <span className="text-[10px] text-zinc-600 shrink-0">{i.date}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Opportunities */}
            <Card>
              <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Opportunities</span>
                <Link href={`/relationships/opportunities?contactId=${c.id}`} className="text-xs text-indigo-400">View All</Link>
              </div>
              <CardContent className="p-0">
                {c.opportunities.map(o => (
                  <div key={o.id} className="px-4 py-3 border-b border-zinc-800/50 last:border-0">
                    <p className="text-xs font-medium text-zinc-300">{o.description}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-[10px] font-medium ${o.status === 'Open' ? 'text-amber-400' : 'text-emerald-400'}`}>{o.status}</span>
                      <span className="text-xs text-zinc-400">${o.value.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
