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
type Product  = { id: string; name: string; sku: string | null }

const TAB_LABELS = ['General', 'Service Item Components', 'Troubleshooting', 'Warranty'] as const
type Tab = (typeof TAB_LABELS)[number]

export default function NewServiceItemPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('General')

  // General
  const [description, setDescription] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [productId, setProductId] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [status, setStatus] = useState('active')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [lastServiceDate, setLastServiceDate] = useState('')
  const [nextServiceDate, setNextServiceDate] = useState('')
  const [notes, setNotes] = useState('')

  // Warranty
  const [warrantyStart, setWarrantyStart] = useState('')
  const [warrantyEnd, setWarrantyEnd] = useState('')
  const [warrantyNotes, setWarrantyNotes] = useState('')

  // Troubleshooting
  const [troubleshootingNotes, setTroubleshootingNotes] = useState('')

  // Components
  const [componentDesc, setComponentDesc] = useState('')

  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(d => setCustomers(d.customers ?? d))
    fetch('/api/products').then(r => r.json()).then(d => setProducts(d.products ?? d)).catch(() => {})
  }, [])

  async function handleSave() {
    if (!description || !customerId) { setError('Description and Customer are required'); return }
    setSaving(true); setError(null)
    try {
      const res = await fetch('/api/service/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          productId: productId || null,
          description,
          serialNumber: serialNumber || null,
          status,
          purchaseDate: purchaseDate || null,
          warrantyStart: warrantyStart || null,
          warrantyEnd: warrantyEnd || null,
          lastServiceDate: lastServiceDate || null,
          nextServiceDate: nextServiceDate || null,
          notes: [notes, troubleshootingNotes, componentDesc, warrantyNotes].filter(Boolean).join('\n\n') || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); return }
      router.push(`/service/items/${data.id}`)
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Service Item" />
      <main className="flex-1 p-6 overflow-auto space-y-5 max-w-4xl">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/service/items"><ArrowLeft className="w-4 h-4 mr-1" />Back</Link>
          </Button>
          <h1 className="text-base font-semibold text-zinc-100">New Service Item</h1>
        </div>

        {/* FastTab nav */}
        <div className="flex border-b border-zinc-800">
          {TAB_LABELS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === t
                  ? 'border-indigo-500 text-indigo-300'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* General */}
        {activeTab === 'General' && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label>Description *</Label>
                  <Input value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="Service item description" />
                </div>
                <div className="space-y-1.5">
                  <Label>Customer *</Label>
                  <select value={customerId} onChange={e => setCustomerId(e.target.value)}
                    className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100">
                    <option value="">Select customer…</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.firstName} {c.lastName} — {c.email}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Item No. (Product)</Label>
                  <select value={productId} onChange={e => setProductId(e.target.value)}
                    className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100">
                    <option value="">None</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}{p.sku ? ` — ${p.sku}` : ''}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Serial No.</Label>
                  <Input value={serialNumber} onChange={e => setSerialNumber(e.target.value)}
                    placeholder="Serial number" className="font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <select value={status} onChange={e => setStatus(e.target.value)}
                    className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100">
                    {['active','inactive','retired'].map(s => (
                      <option key={s} value={s} className="capitalize">{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Purchase Date</Label>
                  <Input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Last Service Date</Label>
                  <Input type="date" value={lastServiceDate} onChange={e => setLastServiceDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Next Service Date</Label>
                  <Input type="date" value={nextServiceDate} onChange={e => setNextServiceDate(e.target.value)} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Notes</Label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 resize-none"
                    placeholder="General notes…" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service Item Components */}
        {activeTab === 'Service Item Components' && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="text-xs text-zinc-500">List the components / sub-items associated with this service item.</p>
              <div className="space-y-1.5">
                <Label>Components Description</Label>
                <textarea value={componentDesc} onChange={e => setComponentDesc(e.target.value)} rows={5}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 resize-none"
                  placeholder="Component list, BOM notes, sub-assembly details…" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Troubleshooting */}
        {activeTab === 'Troubleshooting' && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="text-xs text-zinc-500">Document known issues, troubleshooting steps, and resolution history.</p>
              <div className="space-y-1.5">
                <Label>Troubleshooting Notes</Label>
                <textarea value={troubleshootingNotes} onChange={e => setTroubleshootingNotes(e.target.value)} rows={6}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 resize-none"
                  placeholder="Known faults, troubleshooting checklist, resolution steps…" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Warranty */}
        {activeTab === 'Warranty' && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Warranty Start</Label>
                  <Input type="date" value={warrantyStart} onChange={e => setWarrantyStart(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Warranty Expiry Date</Label>
                  <Input type="date" value={warrantyEnd} onChange={e => setWarrantyEnd(e.target.value)} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Warranty Notes</Label>
                  <textarea value={warrantyNotes} onChange={e => setWarrantyNotes(e.target.value)} rows={3}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 resize-none"
                    placeholder="Coverage terms, exclusions, vendor warranty info…" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-end gap-3 pb-6">
          <Button variant="outline" onClick={() => router.push('/service/items')}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !description || !customerId}>
            {saving ? 'Creating…' : 'Create Service Item'}
          </Button>
        </div>
      </main>
    </>
  )
}
