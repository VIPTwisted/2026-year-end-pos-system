'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, PhoneCall } from 'lucide-react'

interface Agent { id: string; name: string; extension: string | null }
interface Customer { id: string; firstName: string; lastName: string; email: string | null }

export default function NewCallPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agents, setAgents] = useState<Agent[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])

  const [form, setForm] = useState({
    agentId: '',
    customerId: '',
    direction: 'inbound',
    outcome: '',
    durationMin: '',
    durationSec: '',
    notes: '',
    orderId: '',
  })

  useEffect(() => {
    fetch('/api/call-center/agents').then(r => r.json()).then(setAgents)
    fetch('/api/customers').then(r => r.json()).then(setCustomers)
  }, [])

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.agentId) { setError('Agent is required'); return }
    setLoading(true)
    setError('')
    try {
      const mins = parseInt(form.durationMin || '0')
      const secs = parseInt(form.durationSec || '0')
      const duration = mins * 60 + secs
      const res = await fetch('/api/call-center/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: form.agentId,
          customerId: form.customerId || undefined,
          direction: form.direction,
          outcome: form.outcome || undefined,
          duration: duration > 0 ? duration : undefined,
          notes: form.notes.trim() || undefined,
          orderId: form.orderId.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push('/call-center')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
  const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'

  return (
    <>
      <TopBar title="Log Call" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <Link href="/call-center" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Call Center
          </Link>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-zinc-400" />
                Log Call
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                  <label className={labelCls}>Agent <span className="text-red-400">*</span></label>
                  <select value={form.agentId} onChange={set('agentId')} className={inputCls} required>
                    <option value="">Select agent…</option>
                    {agents.map(a => (
                      <option key={a.id} value={a.id}>{a.name}{a.extension ? ` (ext. ${a.extension})` : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Customer (optional)</label>
                  <select value={form.customerId} onChange={set('customerId')} className={inputCls}>
                    <option value="">Anonymous / unknown</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.firstName} {c.lastName}{c.email ? ` — ${c.email}` : ''}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Direction</label>
                    <select value={form.direction} onChange={set('direction')} className={inputCls}>
                      <option value="inbound">Inbound</option>
                      <option value="outbound">Outbound</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Outcome</label>
                    <select value={form.outcome} onChange={set('outcome')} className={inputCls}>
                      <option value="">— Select outcome —</option>
                      <option value="sale">Sale</option>
                      <option value="inquiry">Inquiry</option>
                      <option value="complaint">Complaint</option>
                      <option value="callback">Callback Scheduled</option>
                      <option value="no_answer">No Answer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Duration</label>
                  <div className="flex items-center gap-2">
                    <input type="number" min="0" value={form.durationMin} onChange={set('durationMin')} placeholder="0" className={inputCls + ' w-24'} />
                    <span className="text-zinc-500 text-xs">min</span>
                    <input type="number" min="0" max="59" value={form.durationSec} onChange={set('durationSec')} placeholder="0" className={inputCls + ' w-24'} />
                    <span className="text-zinc-500 text-xs">sec</span>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Linked Order ID (optional)</label>
                  <input type="text" value={form.orderId} onChange={set('orderId')} placeholder="Order ID if call resulted in/about an order" className={inputCls} />
                </div>

                <div>
                  <label className={labelCls}>Notes</label>
                  <textarea value={form.notes} onChange={set('notes')} placeholder="Call notes, customer requests, follow-ups…" rows={3} className={inputCls + ' resize-none'} />
                </div>

                {error && (
                  <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
                )}

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Link href="/call-center">
                    <Button type="button" variant="outline" size="sm">Cancel</Button>
                  </Link>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? 'Logging…' : 'Log Call'}
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
