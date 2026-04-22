'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Plus, Trash2, Check, AlertCircle, CheckCircle } from 'lucide-react'

interface Account { id: string; accountCode: string; accountName: string; accountType: string }
interface EntryRow { accountCode: string; description: string; debit: string; credit: string }

function currentPeriod() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function NewJournalPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [description, setDescription] = useState('')
  const [period, setPeriod] = useState(currentPeriod())
  const [postingDate, setPostingDate] = useState(new Date().toISOString().slice(0, 10))
  const [entries, setEntries] = useState<EntryRow[]>([
    { accountCode: '', description: '', debit: '', credit: '' },
    { accountCode: '', description: '', debit: '', credit: '' },
  ])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetch('/api/finance/coa').then(r => r.json()).then(setAccounts) }, [])

  function addRow() { setEntries(e => [...e, { accountCode: '', description: '', debit: '', credit: '' }]) }
  function removeRow(i: number) { setEntries(e => e.filter((_, idx) => idx !== i)) }
  function updateRow(i: number, field: keyof EntryRow, value: string) {
    setEntries(e => e.map((row, idx) => idx === i ? { ...row, [field]: value } : row))
  }

  const totalDr = entries.reduce((s, e) => s + parseFloat(e.debit || '0'), 0)
  const totalCr = entries.reduce((s, e) => s + parseFloat(e.credit || '0'), 0)
  const balanced = Math.abs(totalDr - totalCr) < 0.001

  async function submit() {
    setError('')
    const validEntries = entries.filter(e => e.accountCode && (parseFloat(e.debit || '0') > 0 || parseFloat(e.credit || '0') > 0))
    if (validEntries.length < 2) { setError('At least 2 entries with amounts required'); return }
    if (!balanced) { setError(`Journal is not balanced. Out by $${Math.abs(totalDr - totalCr).toFixed(2)}`); return }
    setSaving(true)
    const res = await fetch('/api/finance/journals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: description || null, postingDate, period,
        entries: validEntries.map(e => ({ accountCode: e.accountCode, description: e.description || null, debit: parseFloat(e.debit || '0'), credit: parseFloat(e.credit || '0') })),
      }),
    })
    if (res.ok) {
      const journal = await res.json()
      router.push(`/finance/gl/journals/${journal.id}`)
    } else {
      const d = await res.json(); setError(d.error || 'Failed to create journal')
    }
    setSaving(false)
  }

  return (
    <>
      <TopBar title="New Journal Entry" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <Card>
          <CardContent className="pt-6 pb-6 space-y-4">
            <h3 className="font-medium text-zinc-200">Journal Header</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-zinc-400 mb-1 block">Description</label>
                <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                  value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Monthly accrual" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Period</label>
                <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 font-mono"
                  value={period} onChange={e => setPeriod(e.target.value)} placeholder="YYYY-MM" />
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Posting Date</label>
              <input type="date" className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                value={postingDate} onChange={e => setPostingDate(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-zinc-200">Entries</h3>
              <div className={cn('flex items-center gap-1.5 text-sm', balanced && totalDr > 0 ? 'text-emerald-400' : totalDr > 0 ? 'text-amber-400' : 'text-zinc-600')}>
                {balanced && totalDr > 0 ? <><CheckCircle className="w-4 h-4" />Balanced</> : totalDr > 0 ? <><AlertCircle className="w-4 h-4" />Out by ${Math.abs(totalDr - totalCr).toFixed(2)}</> : null}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-2 font-medium w-1/3">Account</th>
                    <th className="text-left pb-2 font-medium">Description</th>
                    <th className="text-right pb-2 font-medium w-28">Debit</th>
                    <th className="text-right pb-2 font-medium w-28">Credit</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {entries.map((row, i) => (
                    <tr key={i}>
                      <td className="py-2 pr-2">
                        <select className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none"
                          value={row.accountCode} onChange={e => updateRow(i, 'accountCode', e.target.value)}>
                          <option value="">Select account…</option>
                          {accounts.map(a => <option key={a.id} value={a.accountCode}>{a.accountCode} — {a.accountName}</option>)}
                        </select>
                      </td>
                      <td className="py-2 pr-2">
                        <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none"
                          value={row.description} onChange={e => updateRow(i, 'description', e.target.value)} placeholder="Optional" />
                      </td>
                      <td className="py-2 pr-2">
                        <input type="number" min="0" step="0.01"
                          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none text-right"
                          value={row.debit} onChange={e => updateRow(i, 'debit', e.target.value)} placeholder="0.00" />
                      </td>
                      <td className="py-2 pr-2">
                        <input type="number" min="0" step="0.01"
                          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none text-right"
                          value={row.credit} onChange={e => updateRow(i, 'credit', e.target.value)} placeholder="0.00" />
                      </td>
                      <td className="py-2">
                        {entries.length > 2 && (
                          <button onClick={() => removeRow(i)} className="text-zinc-600 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-zinc-700">
                    <td className="py-2 pr-2 text-xs text-zinc-500" colSpan={2}>Totals</td>
                    <td className="py-2 pr-2 text-right font-mono font-semibold text-zinc-200">${totalDr.toFixed(2)}</td>
                    <td className={cn('py-2 pr-2 text-right font-mono font-semibold', balanced && totalDr > 0 ? 'text-emerald-400' : 'text-amber-400')}>${totalCr.toFixed(2)}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
            <Button size="sm" variant="outline" onClick={addRow}><Plus className="w-3 h-3 mr-1" />Add Row</Button>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-4 py-2">{error}</p>}
        <div className="flex gap-2">
          <Button onClick={submit} disabled={saving}><Check className="w-4 h-4 mr-1" />{saving ? 'Creating…' : 'Create Journal (Draft)'}</Button>
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </main>
    </>
  )
}
