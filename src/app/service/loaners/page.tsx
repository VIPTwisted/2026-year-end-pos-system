export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, ChevronRight } from 'lucide-react'

function fmtDate(d: Date | string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function LoanersListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const status = sp.status ?? ''

  const loaners = await prisma.serviceLoaner.findMany({
    where: { ...(status ? { status } : {}) },
    orderBy: { createdAt: 'desc' },
  })

  // Lookup customer names for lent items
  const customerIds = loaners
    .map(l => l.lentToCustomerId)
    .filter((id): id is string => !!id)

  const customers = customerIds.length > 0
    ? await prisma.customer.findMany({
        where: { id: { in: customerIds } },
        select: { id: true, firstName: true, lastName: true },
      })
    : []
  const customerMap = Object.fromEntries(customers.map(c => [c.id, `${c.firstName} ${c.lastName}`]))

  const available = loaners.filter(l => l.status === 'Available').length
  const loaned    = loaners.filter(l => l.status === 'Loaned').length

  return (
    <>
      <TopBar title="Service Loaners" />
      <main className="flex-1 overflow-auto">

        {/* Ribbon */}
        <div className="border-b border-zinc-800 bg-zinc-950 px-4 py-2 flex items-center gap-1">
          <Button asChild size="sm" className="h-7 px-2.5 text-xs gap-1">
            <Link href="/service/loaners/new"><Plus className="w-3.5 h-3.5" />New</Link>
          </Button>
        </div>

        <div className="p-5 space-y-5">
          {/* KPIs */}
          <div className="flex gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex-1">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Available</p>
              <p className="text-2xl font-bold text-emerald-400">{available}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex-1">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Loaned Out</p>
              <p className={`text-2xl font-bold ${loaned > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>{loaned}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex-1">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total</p>
              <p className="text-2xl font-bold text-zinc-100">{loaners.length}</p>
            </div>
          </div>

          {/* Filter strip */}
          <div className="flex items-center gap-2">
            {['', 'Available', 'Loaned'].map(s => (
              <Link key={s} href={s ? `/service/loaners?status=${s}` : '/service/loaners'}
                className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                  status === s
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500'
                }`}>
                {s || 'All'}
              </Link>
            ))}
          </div>

          {/* Table */}
          {loaners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
              <p className="text-sm">No loaners found.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/service/loaners/new"><Plus className="w-4 h-4 mr-1" />New Loaner</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wide">
                    <th className="text-left pb-2.5 font-medium pr-4">No.</th>
                    <th className="text-left pb-2.5 font-medium pr-4">Description</th>
                    <th className="text-left pb-2.5 font-medium pr-4">Item No.</th>
                    <th className="text-left pb-2.5 font-medium pr-4">Serial No.</th>
                    <th className="text-left pb-2.5 font-medium pr-4">Status</th>
                    <th className="text-left pb-2.5 font-medium pr-4">Lent to Customer</th>
                    <th className="text-left pb-2.5 font-medium pr-4">Date Lent</th>
                    <th className="text-left pb-2.5 font-medium pr-4">Date Returned</th>
                    <th className="pb-2.5 w-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {loaners.map(l => (
                    <tr key={l.id} className="hover:bg-zinc-900/40 transition-colors group">
                      <td className="py-2.5 pr-4 font-mono text-indigo-400">{l.loanerNo}</td>
                      <td className="py-2.5 pr-4 text-zinc-300 max-w-[140px] truncate">{l.description}</td>
                      <td className="py-2.5 pr-4 font-mono text-zinc-500">{l.itemNo ?? '—'}</td>
                      <td className="py-2.5 pr-4 font-mono text-zinc-500">{l.serialNo ?? '—'}</td>
                      <td className="py-2.5 pr-4">
                        <Badge variant={l.status === 'Available' ? 'success' : 'warning'} className="text-[10px]">{l.status}</Badge>
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-300">
                        {l.lentToCustomerId ? customerMap[l.lentToCustomerId] ?? l.lentToCustomerId : <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="py-2.5 pr-4 text-zinc-400">{fmtDate(l.dateLent)}</td>
                      <td className="py-2.5 pr-4 text-zinc-400">{fmtDate(l.dateReturned)}</td>
                      <td className="py-2.5">
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
