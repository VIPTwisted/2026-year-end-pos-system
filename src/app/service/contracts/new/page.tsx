'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Customer = { id: string; firstName: string; lastName: string; email: string }

const BILLING_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annual' },
  { value: 'one_time', label: 'One-time' },
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
]

export default function NewServiceContractPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [customerId, setCustomerId] = useState('')
  const [status, setStatus] = useState('active')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState('')
  const [value, setValue] = useState('')
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [description, setDescription] = useState('')
  const [terms, setTerms] = useState('')

  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(d => setCustomers(d.customers ?? d))
  }, [])

  async function handleSave() {
    if (!customerId || !startDate || !value) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/service/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId, status, startDate,
          endDate: endDate || null,
          value: parseFloat(value),
          billingCycle, description, terms,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); return }
      router.push(`/service/contracts/${data.id}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Service Contract" />
      <main className="flex-1 p-6 overflow-auto max-w-2xl space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <Label>Customer *</Label>
                <select
                  value={customerId}
                  onChange={e => setCustomerId(e.target.value)}
                  className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
                >
                  <option value="">Select customer…</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName} — {c.email}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
                >
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Billing Cycle</Label>
                <select
                  value={billingCycle}
                  onChange={e => setBillingCycle(e.target.value)}
                  className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
                >
                  {BILLING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Start Date *</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>End Date (optional)</Label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Contract Value *</Label>
                <Input type="number" step="0.01" value={value} onChange={e => setValue(e.target.value)} placeholder="0.00" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Contract scope / summary" />
            </div>
            <div className="space-y-1.5">
              <Label>Terms & Conditions</Label>
              <textarea
                value={terms}
                onChange={e => setTerms(e.target.value)}
                rows={4}
                placeholder="Contract terms…"
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 resize-none"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push('/service/contracts')}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !customerId || !startDate || !value}>
            {saving ? 'Creating…' : 'Create Contract'}
          </Button>
        </div>
      </main>
    </>
  )
}
