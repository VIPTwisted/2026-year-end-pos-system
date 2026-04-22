'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Customer = { id: string; firstName: string; lastName: string; email: string }
type Contract = { id: string; contractNumber: string; customerId: string }
type ServiceItem = { id: string; description: string; customerId: string }

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

function NewCaseForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [customerId, setCustomerId] = useState(searchParams.get('customerId') ?? '')
  const [contractId, setContractId] = useState('')
  const [serviceItemId, setServiceItemId] = useState(searchParams.get('serviceItemId') ?? '')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('normal')
  const [assignedTo, setAssignedTo] = useState('')

  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(d => setCustomers(d.customers ?? d))
    fetch('/api/service/contracts').then(r => r.json()).then(d => setContracts(d))
    fetch('/api/service/items').then(r => r.json()).then(d => setServiceItems(d))
  }, [])

  const filteredContracts = customerId ? contracts.filter(c => c.customerId === customerId) : contracts
  const filteredItems = customerId ? serviceItems.filter(i => i.customerId === customerId) : serviceItems

  async function handleSave() {
    if (!customerId || !title) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/service/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          contractId: contractId || null,
          serviceItemId: serviceItemId || null,
          title,
          description: description || null,
          priority,
          assignedTo: assignedTo || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); return }
      router.push(`/service/cases/${data.id}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Service Case" />
      <main className="flex-1 p-6 overflow-auto max-w-2xl space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-1.5">
              <Label>Customer *</Label>
              <select
                value={customerId}
                onChange={e => { setCustomerId(e.target.value); setContractId(''); setServiceItemId('') }}
                className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
              >
                <option value="">Select customer…</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName} — {c.email}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Contract (optional)</Label>
                <select
                  value={contractId}
                  onChange={e => setContractId(e.target.value)}
                  className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
                >
                  <option value="">No contract</option>
                  {filteredContracts.map(c => (
                    <option key={c.id} value={c.id}>{c.contractNumber}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Service Item (optional)</Label>
                <select
                  value={serviceItemId}
                  onChange={e => setServiceItemId(e.target.value)}
                  className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
                >
                  <option value="">No item</option>
                  {filteredItems.map(i => (
                    <option key={i.id} value={i.id}>{i.description}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Title / Subject *</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Brief description of the issue" />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                placeholder="Detailed description, steps to reproduce, etc."
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
                >
                  {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Assigned To</Label>
                <Input value={assignedTo} onChange={e => setAssignedTo(e.target.value)} placeholder="e.g. john@company.com" />
              </div>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push('/service/cases')}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !customerId || !title}>
            {saving ? 'Creating…' : 'Create Case'}
          </Button>
        </div>
      </main>
    </>
  )
}

export default function NewServiceCasePage() {
  return (
    <Suspense>
      <NewCaseForm />
    </Suspense>
  )
}
