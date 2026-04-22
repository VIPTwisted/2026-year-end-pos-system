'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Gift, Check } from 'lucide-react'

interface Program { id: string; name: string; prefix: string; initialValue: number | null; isActive: boolean }

export default function IssueGiftCardPage() {
  const router = useRouter()
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ programId: '', amount: '', customerName: '', customerId: '', expiresAt: '' })

  useEffect(() => {
    fetch('/api/gift-cards/programs')
      .then(r => r.json())
      .then((data: Program[]) => { setPrograms(data.filter(p => p.isActive)); setLoading(false) })
  }, [])

  function handleProgramChange(id: string) {
    const prog = programs.find(p => p.id === id)
    setForm(f => ({ ...f, programId: id, amount: prog?.initialValue ? prog.initialValue.toString() : f.amount }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Amount must be greater than 0'); return }
    setSaving(true)
    const res = await fetch('/api/gift-cards/v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        programId: form.programId || null,
        amount: parseFloat(form.amount),
        customerName: form.customerName || null,
        customerId: form.customerId || null,
        expiresAt: form.expiresAt || null,
      }),
    })
    if (res.ok) {
      const card = await res.json()
      router.push(`/gift-cards/${card.id}`)
    } else {
      const data = await res.json(); setError(data.error || 'Failed to issue card')
    }
    setSaving(false)
  }

  return (
    <>
      <TopBar title="Issue Gift Card" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Gift className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Issue New Gift Card</h2>
              <p className="text-sm text-zinc-500">Generate a card with a loaded balance</p>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6 pb-6">
              <form onSubmit={submit} className="space-y-4">
                {loading ? <div className="h-10 bg-zinc-800 animate-pulse rounded" /> : (
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Program (optional)</label>
                    <select className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none"
                      value={form.programId} onChange={e => handleProgramChange(e.target.value)}>
                      <option value="">No program (standalone)</option>
                      {programs.map(p => <option key={p.id} value={p.id}>{p.name} ({p.prefix})</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Load Amount ($) *</label>
                  <input type="number" min="0.01" step="0.01" required
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                    value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Customer Name</label>
                    <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                      value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} placeholder="Optional" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Customer ID</label>
                    <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                      value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))} placeholder="Optional" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Expiry Date (optional)</label>
                  <input type="date"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-500"
                    value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
                </div>
                {error && <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-3 py-2">{error}</p>}
                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1" disabled={saving}>
                    <Check className="w-4 h-4 mr-1" />{saving ? 'Issuing…' : 'Issue Gift Card'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
