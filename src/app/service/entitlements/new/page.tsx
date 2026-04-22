'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'

type Customer = { id: string; firstName: string; lastName: string }
type SLAPolicy = { id: string; name: string }

export default function NewEntitlementPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [slaPolicies, setSlaPolicies] = useState<SLAPolicy[]>([])

  const [name, setName] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [type, setType] = useState('cases')
  const [totalTerms, setTotalTerms] = useState('10')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState('')
  const [restrictToChannel, setRestrictToChannel] = useState('')
  const [slaId, setSlaId] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/service/sla/policies').then(r => r.json()),
    ]).then(([c, s]) => {
      setCustomers(Array.isArray(c) ? c : (c.customers ?? []))
      setSlaPolicies(Array.isArray(s) ? s : [])
    })
  }, [])

  async function handleSubmit() {
    if (!name.trim() || !customerId || !startDate) return
    setSaving(true)
    const res = await fetch('/api/service/entitlements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, customerId, type,
        totalTerms: type !== 'unlimited' ? totalTerms : null,
        startDate, endDate: endDate || null,
        restrictToChannel: restrictToChannel || null,
        slaId: slaId || null,
      }),
    })
    if (res.ok) {
      router.push('/service/entitlements')
    } else {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Entitlement" />
      <main className="flex-1 p-6 max-w-2xl space-y-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/service/entitlements"><ArrowLeft className="w-4 h-4 mr-1" />Back</Link>
        </Button>

        <Card>
          <CardContent className="pt-6 pb-6 space-y-5">
            <h2 className="text-lg font-semibold text-zinc-100">Entitlement Details</h2>

            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Acme Premium Support Pack" />
            </div>

            <div className="space-y-1.5">
              <Label>Customer *</Label>
              <select value={customerId} onChange={e => setCustomerId(e.target.value)} className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100">
                <option value="">Select customer…</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Type</Label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100">
                <option value="cases">Cases (limited)</option>
                <option value="hours">Hours (limited)</option>
                <option value="unlimited">Unlimited</option>
              </select>
            </div>

            {type !== 'unlimited' && (
              <div className="space-y-1.5">
                <Label>{type === 'hours' ? 'Total Hours' : 'Total Cases'}</Label>
                <Input type="number" min={1} value={totalTerms} onChange={e => setTotalTerms(e.target.value)} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Start Date *</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>End Date</Label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Restrict to Channel</Label>
              <select value={restrictToChannel} onChange={e => setRestrictToChannel(e.target.value)} className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100">
                <option value="">All Channels</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="chat">Chat</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>SLA Policy</Label>
              <select value={slaId} onChange={e => setSlaId(e.target.value)} className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100">
                <option value="">No SLA override</option>
                {slaPolicies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSubmit} disabled={saving || !name.trim() || !customerId || !startDate}>
                {saving ? 'Creating…' : 'Create Entitlement'}
              </Button>
              <Button asChild variant="ghost">
                <Link href="/service/entitlements">Cancel</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
