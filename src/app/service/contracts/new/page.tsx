'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Plus, X } from 'lucide-react'

type Customer = { id: string; firstName: string; lastName: string; email: string }
type ServiceItem = { id: string; description: string; serialNumber: string | null; customerId: string | null }

type ContractLine = {
  serviceItemId: string
  description: string
  startingDate: string
  annualAmount: string
}

const CONTRACT_TYPES = ['Contract', 'Maintenance', 'Support', 'Extended Warranty', 'SLA']
const STATUSES = ['Draft', 'Signed', 'Cancelled', 'Expired']
const TAB_LABELS = ['General', 'Invoice Details', 'Service Contract Lines'] as const
type Tab = (typeof TAB_LABELS)[number]

function emptyLine(): ContractLine {
  return { serviceItemId: '', description: '', startingDate: '', annualAmount: '' }
}

export default function NewServiceContractPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('General')

  // General
  const [customerId, setCustomerId] = useState('')
  const [contractType, setContractType] = useState('Contract')
  const [status, setStatus] = useState('Draft')
  const [startingDate, setStartingDate] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [description, setDescription] = useState('')

  // Invoice Details
  const [annualAmount, setAnnualAmount] = useState('')
  const [billingCycle, setBillingCycle] = useState('annually')
  const [invoiceDate, setInvoiceDate] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('')

  // Lines
  const [lines, setLines] = useState<ContractLine[]>([emptyLine()])

  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(d => setCustomers(d.customers ?? d))
    fetch('/api/service/items').then(r => r.json()).then(d => setServiceItems(d)).catch(() => {})
  }, [])

  const filteredItems = customerId
    ? serviceItems.filter(i => i.customerId === customerId)
    : serviceItems

  function updateLine(idx: number, field: keyof ContractLine, val: string) {
    setLines(prev => prev.map((l, i) => {
      if (i !== idx) return l
      if (field === 'serviceItemId' && val) {
        const item = serviceItems.find(si => si.id === val)
        return { ...l, serviceItemId: val, description: item?.description ?? l.description }
      }
      return { ...l, [field]: val }
    }))
  }

  async function handleSave() {
    if (!customerId || !startingDate) { setError('Customer and Starting Date are required'); return }
    setSaving(true); setError(null)
    try {
      const totalAmount = lines.reduce((s, l) => s + (parseFloat(l.annualAmount) || 0), 0)
      const res = await fetch('/api/service/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          contractType,
          status,
          startDate: startingDate,
          endDate: expirationDate || null,
          value: annualAmount ? parseFloat(annualAmount) : totalAmount,
          billingCycle,
          description: description || null,
          name: `${contractType} — ${new Date(startingDate).getFullYear()}`,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); return }
      router.push(`/service/contracts/${data.id}`)
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Service Contract" />
      <main className="flex-1 p-6 overflow-auto space-y-5 max-w-5xl">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/service/contracts"><ArrowLeft className="w-4 h-4 mr-1" />Back</Link>
          </Button>
          <h1 className="text-base font-semibold text-zinc-100">New Service Contract</h1>
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
                <div className="space-y-1.5">
                  <Label>Customer *</Label>
                  <select value={customerId} onChange={e => { setCustomerId(e.target.value) }}
                    className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100">
                    <option value="">Select customer…</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.firstName} {c.lastName} — {c.email}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Contract Type</Label>
                  <select value={contractType} onChange={e => setContractType(e.target.value)}
                    className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100">
                    {CONTRACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Starting Date *</Label>
                  <Input type="date" value={startingDate} onChange={e => setStartingDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Expiration Date</Label>
                  <Input type="date" value={expirationDate} onChange={e => setExpirationDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <select value={status} onChange={e => setStatus(e.target.value)}
                    className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Description</Label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 resize-none"
                    placeholder="Contract description or scope…" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invoice Details */}
        {activeTab === 'Invoice Details' && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Annual Amount</Label>
                  <Input type="number" min="0" step="0.01" value={annualAmount}
                    onChange={e => setAnnualAmount(e.target.value)} placeholder="e.g. 1200.00" />
                </div>
                <div className="space-y-1.5">
                  <Label>Billing Cycle</Label>
                  <select value={billingCycle} onChange={e => setBillingCycle(e.target.value)}
                    className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100">
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                    <option value="one_time">One-time</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Invoice Date</Label>
                  <Input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Payment Terms</Label>
                  <Input value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)}
                    placeholder="e.g. Net 30" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service Contract Lines */}
        {activeTab === 'Service Contract Lines' && (
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Contract Lines</p>
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1"
                  onClick={() => setLines(prev => [...prev, emptyLine()])}>
                  <Plus className="w-3 h-3" />Add Line
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wide">
                      <th className="text-left pb-2 font-medium pr-3">Service Item</th>
                      <th className="text-left pb-2 font-medium pr-3">Description</th>
                      <th className="text-left pb-2 font-medium pr-3">Starting Date</th>
                      <th className="text-right pb-2 font-medium pr-3">Annual Amount</th>
                      <th className="pb-2 w-6"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {lines.map((line, idx) => (
                      <tr key={idx}>
                        <td className="py-1.5 pr-3">
                          <select value={line.serviceItemId}
                            onChange={e => updateLine(idx, 'serviceItemId', e.target.value)}
                            className="h-7 rounded border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-100 w-full">
                            <option value="">Select item…</option>
                            {filteredItems.map(i => (
                              <option key={i.id} value={i.id}>
                                {i.description}{i.serialNumber ? ` / ${i.serialNumber}` : ''}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-1.5 pr-3">
                          <Input value={line.description}
                            onChange={e => updateLine(idx, 'description', e.target.value)}
                            placeholder="Line description" className="h-7 text-xs" />
                        </td>
                        <td className="py-1.5 pr-3">
                          <Input type="date" value={line.startingDate}
                            onChange={e => updateLine(idx, 'startingDate', e.target.value)}
                            className="h-7 text-xs" />
                        </td>
                        <td className="py-1.5 pr-3">
                          <Input type="number" min="0" step="0.01" value={line.annualAmount}
                            onChange={e => updateLine(idx, 'annualAmount', e.target.value)}
                            placeholder="0.00" className="h-7 text-xs text-right" />
                        </td>
                        <td className="py-1.5">
                          <button onClick={() => setLines(prev => prev.filter((_, i) => i !== idx))}
                            className="text-zinc-600 hover:text-red-400 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex justify-end gap-3 pb-6">
          <Button variant="outline" onClick={() => router.push('/service/contracts')}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !customerId || !startingDate}>
            {saving ? 'Creating…' : 'Create Contract'}
          </Button>
        </div>
      </main>
    </>
  )
}
