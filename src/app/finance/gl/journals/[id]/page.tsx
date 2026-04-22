'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { CheckCircle, AlertCircle, ChevronLeft, RotateCcw, Plus } from 'lucide-react'

interface Account { id: string; accountCode: string; accountName: string; accountType: string }
interface Entry {
  id: string; accountCode: string; account: Account; description: string | null
  debit: number; credit: number
}
interface Journal {
  id: string; journalNumber: string; description: string | null
  period: string; postingDate: string; status: string
  postedAt: string | null; reversedBy: string | null
  entries: Entry[]
}

export default function JournalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [journal, setJournal] = useState<Journal | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [reversing, setReversing] = useState(false)
  const [newEntry, setNewEntry] = useState({ accountCode: '', description: '', debit: '', credit: '' })
  const [addingEntry, setAddingEntry] = useState(false)
  const [showAddRow, setShowAddRow] = useState(false)

  async function load() {
    const [jRes, aRes] = await Promise.all([fetch(`/api/finance/journals/${id}`), fetch('/api/finance/coa')])
    if (jRes.ok) setJournal(await jRes.json())
    if (aRes.ok) setAccounts(await aRes.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [id])

  async function post() {
    setPosting(true)
    const res = await fetch(`/api/finance/journals/${id}/post`, { method: 'POST' })
    if (!res.ok) { const d = await res.json(); alert(d.error || 'Failed to post') }
    setPosting(false); load()
  }

  async function reverse() {
    if (!confirm('Create a reversal journal?')) return
    setReversing(true)
    const res = await fetch(`/api/finance/journals/${id}/reverse`, { method: 'POST' })
    if (res.ok) { const rev = await res.json(); router.push(`/finance/gl/journals/${rev.id}`) }
    else { const d = await res.json(); alert(d.error || 'Failed to reverse') }
    setReversing(false)
  }

  async function addEntry() {
    if (!newEntry.accountCode) return
    setAddingEntry(true)
    const res = await fetch('/api/finance/gl/v2-entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        journalId: id,
        accountCode: newEntry.accountCode,
        description: newEntry.description || null,
        debit: parseFloat(newEntry.debit || '0'),
        credit: parseFloat(newEntry.credit || '0'),
      }),
    })
    if (!res.ok) { const d = await res.json(); alert(d.error || 'Failed to add entry') }
    setNewEntry({ accountCode: '', description: '', debit: '', credit: '' })
    setShowAddRow(false); setAddingEntry(false); load()
  }

  if (loading) {
    return (<><TopBar title="Journal" /><main className="flex-1 p-6"><div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-zinc-800 animate-pulse rounded-xl" />)}</div></main></>)
  }
  if (!journal) {
    return (<><TopBar title="Journal" /><main className="flex-1 p-6 flex items-center justify-center text-zinc-500">Journal not found</main></>)
  }

  const totalDr = journal.entries.reduce((s, e) => s + e.debit, 0)
  const totalCr = journal.entries.reduce((s, e) => s + e.credit, 0)
  const balanced = Math.abs(totalDr - totalCr) < 0.001
  const diff = Math.abs(totalDr - totalCr)

  function statusVariant(s: string): 'success' | 'warning' | 'secondary' | 'default' {
    switch (s) {
      case 'posted': return 'success'; case 'draft': return 'warning'; case 'reversed': return 'secondary'; default: return 'default'
    }
  }

  return (
    <>
      <TopBar title="Journal Detail" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300">
          <ChevronLeft className="w-4 h-4" />Back
        </button>

        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-500 font-mono mb-1">{journal.journalNumber}</p>
                <p className="text-lg font-semibold text-zinc-100">{journal.description || 'Journal Entry'}</p>
                <p className="text-xs text-zinc-500 mt-1">Period: {journal.period} · Date: {new Date(journal.postingDate).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className={cn('flex items-center gap-1.5 text-sm', balanced ? 'text-emerald-400' : 'text-amber-400')}>
                  {balanced ? <><CheckCircle className="w-4 h-4" />Balanced</> : <><AlertCircle className="w-4 h-4" />Out by ${diff.toFixed(2)}</>}
                </div>
                <Badge variant={statusVariant(journal.status)}>{journal.status}</Badge>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {journal.status === 'draft' && (
                <>
                  {balanced && <Button size="sm" onClick={post} disabled={posting}><CheckCircle className="w-4 h-4 mr-1" />{posting ? 'Posting…' : 'Post Journal'}</Button>}
                  <Button size="sm" variant="outline" onClick={() => setShowAddRow(v => !v)}><Plus className="w-4 h-4 mr-1" />Add Entry</Button>
                </>
              )}
              {journal.status === 'posted' && (
                <Button size="sm" variant="outline" onClick={reverse} disabled={reversing}>
                  <RotateCcw className="w-4 h-4 mr-1" />{reversing ? 'Reversing…' : 'Reverse'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-3">Journal Entries</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Account</th>
                  <th className="text-left pb-3 font-medium">Description</th>
                  <th className="text-right pb-3 font-medium">Debit</th>
                  <th className="text-right pb-3 font-medium">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {journal.entries.map(e => (
                  <tr key={e.id} className="hover:bg-zinc-900/50">
                    <td className="py-3 pr-4"><span className="font-mono text-xs text-zinc-300">{e.accountCode}</span><span className="text-zinc-500 ml-2 text-xs">{e.account?.accountName}</span></td>
                    <td className="py-3 pr-4 text-zinc-400 text-xs">{e.description || '—'}</td>
                    <td className="py-3 pr-4 text-right font-mono text-zinc-200">{e.debit > 0 ? `$${e.debit.toFixed(2)}` : '—'}</td>
                    <td className="py-3 text-right font-mono text-zinc-200">{e.credit > 0 ? `$${e.credit.toFixed(2)}` : '—'}</td>
                  </tr>
                ))}
                {showAddRow && journal.status === 'draft' && (
                  <tr className="bg-zinc-900">
                    <td className="py-2 pr-2">
                      <select className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none"
                        value={newEntry.accountCode} onChange={e => setNewEntry(f => ({ ...f, accountCode: e.target.value }))}>
                        <option value="">Select account…</option>
                        {accounts.map(a => <option key={a.id} value={a.accountCode}>{a.accountCode} — {a.accountName}</option>)}
                      </select>
                    </td>
                    <td className="py-2 pr-2">
                      <input className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none"
                        placeholder="Description" value={newEntry.description} onChange={e => setNewEntry(f => ({ ...f, description: e.target.value }))} />
                    </td>
                    <td className="py-2 pr-2">
                      <input type="number" min="0" step="0.01"
                        className="w-full bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none text-right"
                        placeholder="0.00" value={newEntry.debit} onChange={e => setNewEntry(f => ({ ...f, debit: e.target.value }))} />
                    </td>
                    <td className="py-2">
                      <div className="flex gap-1">
                        <input type="number" min="0" step="0.01"
                          className="flex-1 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none text-right"
                          placeholder="0.00" value={newEntry.credit} onChange={e => setNewEntry(f => ({ ...f, credit: e.target.value }))} />
                        <button onClick={addEntry} disabled={addingEntry || !newEntry.accountCode} className="text-emerald-400 hover:text-emerald-300 px-1">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
                <tr className="border-t-2 border-zinc-700 bg-zinc-900/50">
                  <td className="py-3 pr-4 text-xs text-zinc-500 font-medium" colSpan={2}>Totals</td>
                  <td className="py-3 pr-4 text-right font-mono font-semibold text-zinc-200">${totalDr.toFixed(2)}</td>
                  <td className={cn('py-3 text-right font-mono font-semibold', balanced ? 'text-emerald-400' : 'text-amber-400')}>${totalCr.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  )
}
