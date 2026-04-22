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

type Customer = { id: string; firstName: string; lastName: string; email: string }

export default function NewLoanerPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [description, setDescription] = useState('')
  const [itemNo, setItemNo] = useState('')
  const [serialNo, setSerialNo] = useState('')
  const [status, setStatus] = useState('Available')
  const [lentToCustomerId, setLentToCustomerId] = useState('')
  const [dateLent, setDateLent] = useState('')
  const [dateReturned, setDateReturned] = useState('')

  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(d => setCustomers(d.customers ?? d))
  }, [])

  async function handleSave() {
    if (!description) { setError('Description is required'); return }
    setSaving(true); setError(null)
    try {
      const res = await fetch('/api/service/loaners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          itemNo: itemNo || null,
          serialNo: serialNo || null,
          status,
          lentToCustomerId: lentToCustomerId || null,
          dateLent: dateLent || null,
          dateReturned: dateReturned || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); return }
      router.push('/service/loaners')
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Service Loaner" />
      <main className="flex-1 p-6 overflow-auto space-y-5 max-w-2xl">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/service/loaners"><ArrowLeft className="w-4 h-4 mr-1" />Back</Link>
          </Button>
          <h1 className="text-base font-semibold text-zinc-100">New Service Loaner</h1>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Description *</Label>
                <Input value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Dell Laptop 15 — Loaner Unit A" />
              </div>
              <div className="space-y-1.5">
                <Label>Item No.</Label>
                <Input value={itemNo} onChange={e => setItemNo(e.target.value)}
                  placeholder="Item / product number" className="font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label>Serial No.</Label>
                <Input value={serialNo} onChange={e => setSerialNo(e.target.value)}
                  placeholder="Serial number" className="font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <select value={status} onChange={e => setStatus(e.target.value)}
                  className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100">
                  <option value="Available">Available</option>
                  <option value="Loaned">Loaned</option>
                </select>
              </div>
              {status === 'Loaned' && (
                <>
                  <div className="col-span-2 space-y-1.5">
                    <Label>Lent to Customer</Label>
                    <select value={lentToCustomerId} onChange={e => setLentToCustomerId(e.target.value)}
                      className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100">
                      <option value="">Select customer…</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.firstName} {c.lastName} — {c.email}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Date Lent</Label>
                    <Input type="date" value={dateLent} onChange={e => setDateLent(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Date Returned</Label>
                    <Input type="date" value={dateReturned} onChange={e => setDateReturned(e.target.value)} />
                  </div>
                </>
              )}
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pb-6">
          <Button variant="outline" onClick={() => router.push('/service/loaners')}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !description}>
            {saving ? 'Creating…' : 'Create Loaner'}
          </Button>
        </div>
      </main>
    </>
  )
}
