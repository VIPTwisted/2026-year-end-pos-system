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

type ServiceItemLine = {
  serviceItemNo: string
  serialNo: string
  description: string
  faultCode: string
  symptom: string
  resolution: string
}

const STATUSES = ['Pending', 'In Process', 'On Hold', 'Finished']
const PRIORITIES = ['Low', 'Normal', 'High', 'Urgent']

function emptyLine(): ServiceItemLine {
  return { serviceItemNo: '', serialNo: '', description: '', faultCode: '', symptom: '', resolution: '' }
}

const TAB_LABELS = ['General', 'Customer', 'Details', 'Service Item Lines'] as const
type Tab = (typeof TAB_LABELS)[number]

export default function NewServiceOrderPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [faultCodes, setFaultCodes] = useState<{ id: string; code: string; description: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('General')

  // General
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('Pending')
  const [priority, setPriority] = useState('Normal')
  const [responseDate, setResponseDate] = useState('')
  const [repairStatus, setRepairStatus] = useState('')

  // Customer
  const [customerId, setCustomerId] = useState('')
  const [contactName, setContactName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  // Details
  const [estimatedHours, setEstimatedHours] = useState('')
  const [assignedTech, setAssignedTech] = useState('')
  const [notes, setNotes] = useState('')

  // Service Item Lines
  const [lines, setLines] = useState<ServiceItemLine[]>([emptyLine()])

  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(d => setCustomers(d.customers ?? d))
    fetch('/api/service/setup/fault-codes').then(r => r.json()).then(setFaultCodes).catch(() => {})
  }, [])

  function updateLine(idx: number, field: keyof ServiceItemLine, val: string) {
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, [field]: val } : l))
  }
  function addLine() { setLines(prev => [...prev, emptyLine()]) }
  function removeLine(idx: number) { setLines(prev => prev.filter((_, i) => i !== idx)) }

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
          description,
          status,
          priority,
          dueDate: responseDate || null,
          assignedTech: assignedTech || null,
          estimatedHours: estimatedHours || null,
          notes: notes || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to create order'); return }
      router.push(`/service/orders/${data.id}`)
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  const selectedCustomer = customers.find(c => c.id === customerId)

  return (
    <>
      <TopBar title="New Service Order" />
      <main className="flex-1 p-6 overflow-auto space-y-5 max-w-5xl">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/service/orders"><ArrowLeft className="w-4 h-4 mr-1" />Back</Link>
          </Button>
          <h1 className="text-base font-semibold text-zinc-100">New Service Order</h1>
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
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Brief description of the service request…"
                    className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <select value={status} onChange={e => setStatus(e.target.value)}
                    className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Priority</Label>
                  <select value={priority} onChange={e => setPriority(e.target.value)}
                    className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100">
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Response Date</Label>
                  <Input type="date" value={responseDate} onChange={e => setResponseDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Repair Status</Label>
                  <Input value={repairStatus} onChange={e => setRepairStatus(e.target.value)}
                    placeholder="e.g. Awaiting Parts" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customer */}
        {activeTab === 'Customer' && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1.5">
                <Label>Customer</Label>
                <select value={customerId}
                  onChange={e => {
                    setCustomerId(e.target.value)
                    const c = customers.find(x => x.id === e.target.value)
                    if (c) setEmail(c.email ?? '')
                  }}
                  className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100">
                  <option value="">Select customer…</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName} — {c.email}</option>
                  ))}
                </select>
              </div>
              {selectedCustomer && (
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <Label>Contact Name</Label>
                    <Input value={contactName} onChange={e => setContactName(e.target.value)}
                      placeholder={`${selectedCustomer.firstName} ${selectedCustomer.lastName}`} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Details */}
        {activeTab === 'Details' && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Estimated Hours</Label>
                  <Input type="number" min="0" step="0.5" value={estimatedHours}
                    onChange={e => setEstimatedHours(e.target.value)} placeholder="e.g. 2.5" />
                </div>
                <div className="space-y-1.5">
                  <Label>Assigned Technician</Label>
                  <Input value={assignedTech} onChange={e => setAssignedTech(e.target.value)}
                    placeholder="Technician name" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Internal Notes</Label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 resize-none"
                    placeholder="Internal notes, special instructions…"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Service Item Lines */}
        {activeTab === 'Service Item Lines' && (
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Service Item Lines</p>
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1" onClick={addLine}>
                  <Plus className="w-3 h-3" />Add Line
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wide">
                      <th className="text-left pb-2 font-medium pr-3">Service Item No.</th>
                      <th className="text-left pb-2 font-medium pr-3">Serial No.</th>
                      <th className="text-left pb-2 font-medium pr-3">Description</th>
                      <th className="text-left pb-2 font-medium pr-3">Fault Code</th>
                      <th className="text-left pb-2 font-medium pr-3">Symptom</th>
                      <th className="text-left pb-2 font-medium pr-3">Resolution</th>
                      <th className="pb-2 w-6"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {lines.map((line, idx) => (
                      <tr key={idx}>
                        <td className="py-1.5 pr-3">
                          <Input value={line.serviceItemNo}
                            onChange={e => updateLine(idx, 'serviceItemNo', e.target.value)}
                            placeholder="SI-XXXX" className="h-7 text-xs font-mono" />
                        </td>
                        <td className="py-1.5 pr-3">
                          <Input value={line.serialNo}
                            onChange={e => updateLine(idx, 'serialNo', e.target.value)}
                            placeholder="SN" className="h-7 text-xs font-mono" />
                        </td>
                        <td className="py-1.5 pr-3">
                          <Input value={line.description}
                            onChange={e => updateLine(idx, 'description', e.target.value)}
                            placeholder="Item description" className="h-7 text-xs" />
                        </td>
                        <td className="py-1.5 pr-3">
                          <select value={line.faultCode}
                            onChange={e => updateLine(idx, 'faultCode', e.target.value)}
                            className="h-7 rounded border border-zinc-700 bg-zinc-900 px-2 text-xs text-zinc-100 w-full">
                            <option value="">—</option>
                            {faultCodes.map(fc => (
                              <option key={fc.id} value={fc.code}>{fc.code} — {fc.description}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-1.5 pr-3">
                          <Input value={line.symptom}
                            onChange={e => updateLine(idx, 'symptom', e.target.value)}
                            placeholder="Symptom" className="h-7 text-xs" />
                        </td>
                        <td className="py-1.5 pr-3">
                          <Input value={line.resolution}
                            onChange={e => updateLine(idx, 'resolution', e.target.value)}
                            placeholder="Resolution" className="h-7 text-xs" />
                        </td>
                        <td className="py-1.5">
                          <button onClick={() => removeLine(idx)}
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
          <Button variant="outline" onClick={() => router.push('/service/orders')}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !description}>
            {saving ? 'Creating…' : 'Create Order'}
          </Button>
        </div>
      </main>
    </>
  )
}
