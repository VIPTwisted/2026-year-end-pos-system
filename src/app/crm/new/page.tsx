'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Customer { id: string; firstName: string; lastName: string }
interface Contact { id: string; firstName: string; lastName: string; company?: string | null }
interface SalesCycle { id: string; name: string }

export default function NewOpportunityPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [cycles, setCycles] = useState<SalesCycle[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    contactId: '',
    customerId: '',
    salesCycleId: '',
    estimatedValue: '',
    probability: '50',
    expectedCloseDate: '',
    assignedTo: '',
    notes: '',
    status: 'open',
  })

  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(setCustomers).catch(() => setCustomers([]))
    fetch('/api/crm/contacts').then(r => r.json()).then(setContacts).catch(() => setContacts([]))
    // Sales cycles - gracefully handle if none exist
    fetch('/api/crm/opportunities').then(r => r.json()).catch(() => [])
  }, [])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/crm/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          contactId: form.contactId || undefined,
          customerId: form.customerId || undefined,
          salesCycleId: form.salesCycleId || undefined,
          estimatedValue: form.estimatedValue ? parseFloat(form.estimatedValue) : 0,
          probability: parseFloat(form.probability),
          expectedCloseDate: form.expectedCloseDate || undefined,
          assignedTo: form.assignedTo.trim() || undefined,
          notes: form.notes.trim() || undefined,
          status: form.status,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push(`/crm/${data.id}`)
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
      <TopBar title="New Opportunity" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/crm"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to CRM Pipeline
          </Link>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Create Sales Opportunity</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Title */}
                <div>
                  <label className={labelCls}>Title <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={set('title')}
                    placeholder="e.g. Enterprise Software Deal — Acme Corp"
                    className={inputCls}
                    required
                  />
                </div>

                {/* Contact + Customer */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Contact</label>
                    <select value={form.contactId} onChange={set('contactId')} className={inputCls}>
                      <option value="">— Select contact —</option>
                      {contacts.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.firstName} {c.lastName}{c.company ? ` (${c.company})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Customer (optional)</label>
                    <select value={form.customerId} onChange={set('customerId')} className={inputCls}>
                      <option value="">— Select customer —</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Value + Probability */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Estimated Value ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.estimatedValue}
                      onChange={set('estimatedValue')}
                      placeholder="0.00"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Probability (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="5"
                      value={form.probability}
                      onChange={set('probability')}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Assigned + Close Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Assigned To</label>
                    <input
                      type="text"
                      value={form.assignedTo}
                      onChange={set('assignedTo')}
                      placeholder="Sales rep name"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Expected Close Date</label>
                    <input
                      type="date"
                      value={form.expectedCloseDate}
                      onChange={set('expectedCloseDate')}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className={labelCls}>Status</label>
                  <select value={form.status} onChange={set('status')} className={inputCls}>
                    <option value="open">Open</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className={labelCls}>Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={set('notes')}
                    placeholder="Additional notes or context…"
                    rows={3}
                    className={inputCls + ' resize-none'}
                  />
                </div>

                {error && (
                  <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Link href="/crm">
                    <Button type="button" variant="outline" size="sm">Cancel</Button>
                  </Link>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? 'Creating…' : 'Create Opportunity'}
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
