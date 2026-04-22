'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type Customer = { id: string; firstName: string; lastName: string; email?: string }
type Vendor = { id: string; name: string; vendorCode: string }

export default function NewPrepaymentPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [type, setType] = useState<'customer' | 'vendor'>('customer')
  const [customerId, setCustomerId] = useState('')
  const [vendorId, setVendorId] = useState('')
  const [orderId, setOrderId] = useState('')
  const [purchaseOrderId, setPurchaseOrderId] = useState('')
  const [amount, setAmount] = useState('')
  const [pctOfOrder, setPctOfOrder] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/customers').then(r => r.json()),
      fetch('/api/vendors').then(r => r.json()),
    ]).then(([c, v]) => { setCustomers(c); setVendors(v) })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) { setError('Amount must be positive'); return }
    if (type === 'customer' && !customerId) { setError('Customer is required'); return }
    if (type === 'vendor' && !vendorId) { setError('Vendor is required'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/prepayments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          customerId: type === 'customer' ? customerId : undefined,
          vendorId: type === 'vendor' ? vendorId : undefined,
          orderId: orderId || null,
          purchaseOrderId: purchaseOrderId || null,
          amount: Number(amount),
          pctOfOrder: pctOfOrder ? Number(pctOfOrder) : null,
          dueDate: dueDate || null,
          notes: notes || null,
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
      router.push('/purchasing/prepayments')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Prepayment" />
      <main className="flex-1 p-6 overflow-auto max-w-2xl">
        <div className="mb-4">
          <Link href="/purchasing/prepayments">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader><CardTitle className="text-base text-zinc-100">Prepayment Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* Type toggle */}
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Type *</label>
                <div className="flex gap-2">
                  {(['customer', 'vendor'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${type === t ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {type === 'customer' ? (
                <div>
                  <label className="text-xs text-zinc-400 block mb-1.5">Customer *</label>
                  <select value={customerId} onChange={e => setCustomerId(e.target.value)} required
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="">Select customer...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}{c.email ? ` (${c.email})` : ''}</option>)}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-xs text-zinc-400 block mb-1.5">Vendor *</label>
                  <select value={vendorId} onChange={e => setVendorId(e.target.value)} required
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="">Select vendor...</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name} ({v.vendorCode})</option>)}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1.5">Amount ($) *</label>
                  <input type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="0.00" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1.5">% of Order (optional)</label>
                  <input type="number" min="0" max="100" step="0.01" value={pctOfOrder} onChange={e => setPctOfOrder(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. 30" />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Due Date</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1.5">Linked Order ID (optional)</label>
                  <input type="text" value={orderId} onChange={e => setOrderId(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="ORD-..." />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1.5">Linked PO ID (optional)</label>
                  <input type="text" value={purchaseOrderId} onChange={e => setPurchaseOrderId(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="PO-..." />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  placeholder="Internal notes..." />
              </div>
            </CardContent>
          </Card>

          {error && <div className="bg-red-900/30 border border-red-700 text-red-400 text-sm px-4 py-3 rounded-md">{error}</div>}
          <div className="flex justify-end gap-3">
            <Link href="/purchasing/prepayments"><Button type="button" variant="outline">Cancel</Button></Link>
            <Button type="submit" disabled={saving}><Save className="w-4 h-4 mr-1" />{saving ? 'Creating...' : 'Create Prepayment'}</Button>
          </div>
        </form>
      </main>
    </>
  )
}
