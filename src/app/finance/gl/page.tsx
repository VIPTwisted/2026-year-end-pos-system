export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Plus, FileText, BarChart3, Calendar } from 'lucide-react'

function statusVariant(s: string): 'success' | 'warning' | 'secondary' | 'default' {
  switch (s) {
    case 'posted': return 'success'
    case 'draft': return 'warning'
    case 'reversed': return 'secondary'
    default: return 'default'
  }
}

export default async function GLPage() {
  const [journals, periods, coaCount] = await Promise.all([
    prisma.gLJournal.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { _count: { select: { entries: true } } },
    }),
    prisma.fiscalPeriod.findMany({
      orderBy: { period: 'desc' },
      take: 6,
    }),
    prisma.chartOfAccount.count(),
  ])

  const postedCount  = journals.filter(j => j.status === 'posted').length
  const draftCount   = journals.filter(j => j.status === 'draft').length
  const openPeriods  = periods.filter(p => p.status === 'open').length

  return (
    <>
      <TopBar title="General Ledger" />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">General Ledger</h2>
            <p className="text-sm text-zinc-500">{journals.length} recent journals · {coaCount} accounts</p>
          </div>
          <div className="flex gap-2">
            <Link href="/finance/gl/accounts"><Button variant="outline" size="sm"><BookOpen className="w-4 h-4 mr-1" />COA</Button></Link>
            <Link href="/finance/gl/trial-balance"><Button variant="outline" size="sm"><BarChart3 className="w-4 h-4 mr-1" />Trial Balance</Button></Link>
            <Link href="/finance/gl/periods"><Button variant="outline" size="sm"><Calendar className="w-4 h-4 mr-1" />Periods</Button></Link>
            <Link href="/finance/gl/journals/new"><Button><Plus className="w-4 h-4 mr-1" />New Journal</Button></Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: FileText, color: 'text-blue-400', label: 'Total Journals', value: journals.length, sub: 'recent 20' },
            { icon: FileText, color: 'text-emerald-400', label: 'Posted', value: postedCount, sub: 'finalized' },
            { icon: FileText, color: 'text-amber-400', label: 'Drafts', value: draftCount, sub: 'pending review' },
            { icon: Calendar, color: 'text-purple-400', label: 'Open Periods', value: openPeriods, sub: `of ${periods.length} tracked` },
          ].map(k => (
            <Card key={k.label}>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-2 mb-2">
                  <k.icon className={`w-4 h-4 ${k.color}`} />
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">{k.label}</p>
                </div>
                <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
                <p className="text-xs text-zinc-600 mt-1">{k.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Period status bar */}
        {periods.length > 0 && (
          <Card>
            <CardContent className="pt-5 pb-5">
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Period Status (Last 6)</h3>
              <div className="flex gap-2 flex-wrap">
                {[...periods].reverse().map(p => (
                  <div key={p.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
                    style={{ borderColor: p.status === 'open' ? '#22c55e40' : '#3f3f4640', backgroundColor: p.status === 'open' ? '#22c55e10' : '#27272a40' }}>
                    <span className={`w-2 h-2 rounded-full ${p.status === 'open' ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                    <span className="font-mono text-xs text-zinc-300">{p.period}</span>
                    <span className={`text-xs ${p.status === 'open' ? 'text-emerald-400' : 'text-zinc-600'}`}>{p.status}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent journals */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-zinc-400">Recent Journals</h3>
            <Link href="/finance/gl/journals" className="text-xs text-blue-400 hover:text-blue-300">View all →</Link>
          </div>
          {journals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <FileText className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-sm">No journals yet</p>
                <Link href="/finance/gl/journals/new" className="mt-3">
                  <Button size="sm"><Plus className="w-3 h-3 mr-1" />Create First Journal</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Journal #</th>
                    <th className="text-left pb-3 font-medium">Description</th>
                    <th className="text-left pb-3 font-medium">Period</th>
                    <th className="text-left pb-3 font-medium">Date</th>
                    <th className="text-center pb-3 font-medium">Entries</th>
                    <th className="text-center pb-3 font-medium">Status</th>
                    <th className="text-center pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {journals.map(j => (
                    <tr key={j.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 font-mono text-xs text-zinc-300">{j.journalNumber}</td>
                      <td className="py-3 pr-4 text-zinc-200 max-w-xs truncate">{j.description || <span className="text-zinc-600">—</span>}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-zinc-400">{j.period}</td>
                      <td className="py-3 pr-4 text-xs text-zinc-400">{new Date(j.postingDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}</td>
                      <td className="py-3 pr-4 text-center text-zinc-400 text-xs">{j._count.entries}</td>
                      <td className="py-3 pr-4 text-center"><Badge variant={statusVariant(j.status)}>{j.status}</Badge></td>
                      <td className="py-3 text-center">
                        <Link href={`/finance/gl/journals/${j.id}`} className="text-xs text-blue-400 hover:text-blue-300">View</Link>
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
