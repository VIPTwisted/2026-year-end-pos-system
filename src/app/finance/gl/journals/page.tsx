'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, CheckCircle } from 'lucide-react'

interface Journal {
  id: string; journalNumber: string; description: string | null
  period: string; postingDate: string; status: string
  entries: { debit: number; credit: number }[]
}

function statusVariant(s: string): 'success' | 'warning' | 'secondary' | 'default' {
  switch (s) {
    case 'posted': return 'success'
    case 'draft': return 'warning'
    case 'reversed': return 'secondary'
    default: return 'default'
  }
}

export default function JournalsListPage() {
  const [journals, setJournals] = useState<Journal[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPeriod, setFilterPeriod] = useState('')
  const [posting, setPosting] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterStatus) params.set('status', filterStatus)
    if (filterPeriod) params.set('period', filterPeriod)
    const res = await fetch(`/api/finance/journals?${params}`)
    if (res.ok) setJournals(await res.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [filterStatus, filterPeriod])

  async function postJournal(id: string) {
    setPosting(id)
    const res = await fetch(`/api/finance/journals/${id}/post`, { method: 'POST' })
    if (!res.ok) { const d = await res.json(); alert(d.error || 'Failed to post') }
    setPosting(null); load()
  }

  return (
    <>
      <TopBar title="Journal Entries" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">All Journals</h2>
            <p className="text-sm text-zinc-500">{journals.length} entries</p>
          </div>
          <div className="flex gap-2 items-center">
            <select className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 focus:outline-none"
              value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="posted">Posted</option>
              <option value="reversed">Reversed</option>
            </select>
            <input className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 focus:outline-none w-28"
              placeholder="Period (YYYY-MM)" value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)} />
            <Link href="/finance/gl/journals/new"><Button><Plus className="w-4 h-4 mr-1" />New Journal</Button></Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-zinc-800 animate-pulse rounded" />)}</div>
        ) : journals.length === 0 ? (
          <Card><CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
            <FileText className="w-12 h-12 mb-4 opacity-30" /><p className="text-sm">No journals found</p>
          </CardContent></Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Journal #</th>
                  <th className="text-left pb-3 font-medium">Description</th>
                  <th className="text-left pb-3 font-medium">Period</th>
                  <th className="text-right pb-3 font-medium">Debits</th>
                  <th className="text-right pb-3 font-medium">Credits</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                  <th className="text-left pb-3 font-medium">Date</th>
                  <th className="text-center pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {journals.map(j => {
                  const totalDr = j.entries.reduce((s, e) => s + e.debit, 0)
                  const totalCr = j.entries.reduce((s, e) => s + e.credit, 0)
                  const balanced = Math.abs(totalDr - totalCr) < 0.001
                  return (
                    <tr key={j.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 font-mono text-xs text-zinc-300">{j.journalNumber.slice(0, 8)}…</td>
                      <td className="py-3 pr-4 text-zinc-400 max-w-xs truncate">{j.description || '—'}</td>
                      <td className="py-3 pr-4 font-mono text-xs text-zinc-400">{j.period}</td>
                      <td className="py-3 pr-4 text-right font-mono text-zinc-200">${totalDr.toFixed(2)}</td>
                      <td className="py-3 pr-4 text-right font-mono text-zinc-200">${totalCr.toFixed(2)}</td>
                      <td className="py-3 pr-4 text-center"><Badge variant={statusVariant(j.status)}>{j.status}</Badge></td>
                      <td className="py-3 pr-4 text-xs text-zinc-500">{new Date(j.postingDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}</td>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/finance/gl/journals/${j.id}`} className="text-xs text-blue-400 hover:text-blue-300">View</Link>
                          {j.status === 'draft' && balanced && (
                            <button onClick={() => postJournal(j.id)} disabled={posting === j.id}
                              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />{posting === j.id ? '…' : 'Post'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
