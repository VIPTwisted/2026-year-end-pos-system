'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Customer = { id: string; firstName: string; lastName: string; email: string }
type Contract = { id: string; contractNumber: string; customerId: string }

export default function NewServiceItemPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [customerId, setCustomerId] = useState('')
  const [contractId, setContractId] = useState('')
  const [description, setDescription] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [warrantyStart, setWarrantyStart] = useState('')
  const [warrantyEnd, setWarrantyEnd] = useState('')
  const [nextServiceDate, setNextServiceDate] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(d => setCustomers(d.customers ?? d))
    fetch('/api/service/contracts').then(r => r.json()).then(d => setContracts(d))
  }, [])

  const filteredContracts = customerId
    ? contracts.filter(c => c.customerId === customerId)
    : contracts

  async function handleSave() {
    if (!customerId || !description) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/service/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          contractId: contractId || null,
          description,
          serialNumber: serialNumber || null,
          warrantyStart: warrantyStart || null,
          warrantyEnd: warrantyEnd || null,
          nextServiceDate: nextServiceDate || null,
          notes: notes || null,
          status: 'active',
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); return }
      router.push(`/service/items/${data.id}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Service Item" />
      <main className="flex-1 p-6 overflow-auto max-w-2xl space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-1.5">
              <Label>Customer *</Label>
              <select
                value={customerId}
                onChange={e => { setCustomerId(e.target.value); setContractId('') }}
                className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
              >
                <option value="">Select customer…</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName} — {c.email}</option>
                ))}
              </select>
            </div>
            {filteredContracts.length > 0 && (
              <div className="space-y-1.5">
                <Label>Service Contract (optional)</Label>
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
            )}
            <div className="space-y-1.5">
              <Label>Description *</Label>
              <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. HVAC Unit – Roof Level 2" />
            </div>
            <div className="space-y-1.5">
              <Label>Serial Number</Label>
              <Input value={serialNumber} onChange={e => setSerialNumber(e.target.value)} placeholder="Optional serial / asset number" className="font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Warranty Start</Label>
                <Input type="date" value={warrantyStart} onChange={e => setWarrantyStart(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Warranty End</Label>
                <Input type="date" value={warrantyEnd} onChange={e => setWarrantyEnd(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Next Service Date</Label>
              <Input type="date" value={nextServiceDate} onChange={e => setNextServiceDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Additional notes…"
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 resize-none"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.push('/service/items')}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !customerId || !description}>
            {saving ? 'Creating…' : 'Create Item'}
          </Button>
        </div>
      </main>
    </>
  )
}
