import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, CheckCircle, Clock, AlertCircle, Plus, FileText } from 'lucide-react'

function journalStatusVariant(status: string): 'success' | 'warning' | 'secondary' | 'destructive' | 'default' {
  switch (status) {
    case 'posted': return 'success'
    case 'draft': return 'warning'
    case 'reversed': return 'secondary'
    default: return 'default'
  }
}

function currentPeriod() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default async function GLDashboardPage() {
  const [journals, periods] = await Promise.all([
    prisma.gLJournal.findMany({
      orderBy: { createdAt: 'desc' }, take: 20,
      include: { entries: { select: { debit: true, credit: true } } },
    }),
    prisma.fiscalPeriod.findMany({ orderBy: { period: 'desc' }, take: 6 }),
  ])

  const totalJournals = journals.length
  const postedJournals = journals.filter(j => j.status === 'posted').length
  const draftJournals = journals.filter(j => j.status === 'draft').length
  const reversedJournals = journals.filter(j => j.status === 'reversed').length
  const openPeriods = periods.filter(p => p.status === 'open').length
  const cp = currentPeriod()

  return (
    <>
      <TopBar title="General Ledger" />
      <main className="flex-1 p-6 overflow-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">GL Dashboard</h2>
            <p className="text-sm text-zinc-500">Period: {cp}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/finance/gl/accounts"><Button variant="outline" size="sm">Chart of Accounts</Button></Link>
            <Link href="/finance/gl/trial-balance"><Button variant="outline" size="sm">Trial Balance</Button></Link>
            <Link href="/finance/gl/periods"><Button variant="outline" size="sm">Periods</Button></Link>
            <Link href="/finance/gl/journals/new"><Button size="sm"><Plus className="w-4 h-4 mr-1" />New Journal</Button></Link>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-2 mb-2"><BookOpen className="w-4 h-4 text-blue-400" /><p className="text-xs text-zinc-500 uppercase tracking-wide">Total Journals</p></div>
            <p className="text-2xl font-bold text-blue-400">{totalJournals}</p>
            <p className="text-xs text-zinc-600 mt-1">last 20 shown</p>
          </CardContent></Card>
          <Card><CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-2 mb-2"><CheckCircle className="w-4 h-4 text-emerald-400" /><p className="text-xs text-zinc-500 uppercase tracking-wide">Posted</p></div>
            <p className="text-2xl font-bold text-emerald-400">{postedJournals}</p>
            <p className="text-xs text-zinc-600 mt-1">locked entries</p>
          </CardContent></Card>
          <Card><CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-amber-400" /><p className="text-xs text-zinc-500 uppercase tracking-wide">Draft</p></div>
            <p className="text-2xl font-bold text-amber-400">{draftJournals}</p>
            <p className="text-xs text-zinc-600 mt-1">pending review</p>
          </CardContent></Card>
          <Card><CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-2 mb-2"><AlertCircle className="w-4 h-4 text-zinc-400" /><p className="text-xs text-zinc-500 uppercase tracking-wide">Open Periods</p></div>
            <p className="text-2xl font-bold text-zinc-300">{openPeriods}</p>
            <p className="text-xs text-zinc-600 mt-1">{reversedJournals} reversed</p>
          </CardContent></Card>
        </div>

        {periods.length > 0 && (
          <Card>
            <CardContent className="pt-5 pb-5">
              <h3 className="text-sm font-medium text-zinc-300 mb-4">Fiscal Period Status</h3>
              <div className="flex gap-2 flex-wrap">
                {periods.map(p => (
                  <div key={p.id} className={`px-3 py-1.5 rounded text-xs font-mono border ${p.status === 'closed' ? 'bg-zinc-800 border-zinc-700 text-zinc-500' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
                    <span>{p.period}</span><span className="ml-2 opacity-60">{p.status}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-zinc-400">Recent Journals</h3>
            <Link href="/finance/gl/journals" className="text-xs text-blue-400 hover:text-blue-300">View all</Link>
          </div>
          {journals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <FileText className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-sm">No journal entries yet</p>
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
                    <th className="text-right pb-3 font-medium">Total Dr</th>
                    <th className="text-center pb-3 font-medium">Status</th>
                    <th className="text-left pb-3 font-medium">Date</th>
                    <th className="text-center pb-3 font-medium">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {journals.map(j => {
                    const totalDr = j.entries.reduce((s, e) => s + e.debit, 0)
                    return (
                      <tr key={j.id} className="hover:bg-zinc-900/50">
                        <td className="py-3 pr-4 font-mono text-xs text-zinc-300">{j.journalNumber.slice(0, 8)}…</td>
                        <td className="py-3 pr-4 text-zinc-400 max-w-xs truncate">{j.description || '—'}</td>
                        <td className="py-3 pr-4 font-mono text-xs text-zinc-400">{j.period}</td>
                        <td className="py-3 pr-4 text-right font-mono text-sm text-zinc-200">${totalDr.toFixed(2)}</td>
                        <td className="py-3 pr-4 text-center"><Badge variant={journalStatusVariant(j.status)}>{j.status}</Badge></td>
                        <td className="py-3 pr-4 text-xs text-zinc-500">{new Date(j.postingDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}</td>
                        <td className="py-3 text-center"><Link href={`/finance/gl/journals/${j.id}`} className="text-xs text-blue-400 hover:text-blue-300">View</Link></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
