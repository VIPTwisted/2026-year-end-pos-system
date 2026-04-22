'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Customer = { id: string; firstName: string; lastName: string; email: string }
type ServiceItem = { id: string; description: string; serialNumber: string | null; customerId: string | null }
type ServiceContract = { id: string; contractNumber: string; customerId: string | null }

const TECHS = ['Alex Torres', 'Jordan Lee', 'Morgan Kim', 'Casey Reeves', 'Sam Patel']

export default function NewServiceOrderPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([])
  const [contracts, setContracts] = useState<ServiceContract[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [customerId, setCustomerId] = useState('')
  const [serviceItemId, setServiceItemId] = useState('')
  const [contractId, setContractId] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('normal')
  const [assignedTech, setAssignedTech] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(d => setCustomers(d.customers ?? d))
    fetch('/api/service/items').then(r => r.json()).then(d => setServiceItems(d))
    fetch('/api/service/contracts').then(r => r.json()).then(d => setContracts(d))
  }, [])

  const filteredItems = customerId
    ? serviceItems.filter(i => i.customerId === customerId)
    : serviceItems

  const filteredContracts = customerId
    ? contracts.filter(c => c.customerId === customerId)
    : contracts

  async function handleSave() {
    if (!description) { setError('Description is required'); return }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/service/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customerId || null,
          serviceItemId: serviceItemId || null,
          contractId: contractId || null,
          description,
          priority,
          assignedTech: assignedTech || null,
          estimatedHours: estimatedHours || null,
          dueDate: dueDate || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); return }
      router.push(`/service/orders/${data.id}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Service Order" />
      <main className="flex-1 p-6 overflow-auto max-w-2xl space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-1.5">
              <Label>Customer</Label>
              <select
                value={customerId}
                onChange={e => { setCustomerId(e.target.value); setServiceItemId(''); setContractId('') }}
                className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
              >
                <option value="">Select customer…</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName} — {c.email}</option>
                ))}
              </select>
            </div>

            {filteredItems.length > 0 && (
              <div className="space-y-1.5">
                <Label>Service Item (optional)</Label>
                <select
                  value={serviceItemId}
                  onChange={e => setServiceItemId(e.target.value)}
                  className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
                >
                  <option value="">None</option>
                  {filteredItems.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.description}{i.serialNumber ? ` — SN: ${i.serialNumber}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {filteredContracts.length > 0 && (
              <div className="space-y-1.5">
                <Label>Service Contract (optional)</Label>
                <select
                  value={contractId}
                  onChange={e => setContractId(e.target.value)}
                  className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
                >
                  <option value="">None</option>
                  {filteredContracts.map(c => (
                    <option key={c.id} value={c.id}>{c.contractNumber}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Problem Description *</Label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe the issue or service required…"
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
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Assign Technician</Label>
                <select
                  value={assignedTech}
                  onChange={e => setAssignedTech(e.target.value)}
                  className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
                >
                  <option value="">Unassigned</option>
                  {TECHS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Estimated Hours</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={estimatedHours}
                  onChange={e => setEstimatedHours(e.target.value)}
                  placeholder="e.g. 2.5"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push('/service/orders')}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !description}>
            {saving ? 'Creating…' : 'Create Order'}
          </Button>
        </div>
      </main>
    </>
  )
}
