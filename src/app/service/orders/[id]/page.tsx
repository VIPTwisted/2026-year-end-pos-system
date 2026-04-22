'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Plus, X, Clock, Package, CheckCircle, XCircle } from 'lucide-react'

const PRIORITY_VARIANT: Record<string, 'destructive' | 'warning' | 'default' | 'secondary'> = {
  urgent: 'destructive', high: 'warning', normal: 'default', low: 'secondary',
}
const STATUS_VARIANT: Record<string, 'warning' | 'default' | 'success' | 'secondary' | 'destructive'> = {
  open: 'warning', 'in-progress': 'default', 'on-hold': 'secondary', completed: 'success', cancelled: 'destructive',
}
const STATUS_TIMELINE = ['open', 'in-progress', 'on-hold', 'completed', 'cancelled']
const TECHS = ['Alex Torres', 'Jordan Lee', 'Morgan Kim', 'Casey Reeves', 'Sam Patel']

type Part = { id: string; partName: string; partNumber: string | null; quantity: number; unitCost: number; lineTotal: number }
type LaborLog = { id: string; techName: string; hoursWorked: number; notes: string | null; logDate: string }
type Order = {
  id: string; orderNumber: string; description: string; priority: string; status: string
  assignedTech: string | null; estimatedHours: number | null; actualHours: number | null
  dueDate: string | null; completedAt: string | null; resolutionNotes: string | null
  customer: { id: string; firstName: string; lastName: string } | null
  serviceItem: { id: string; description: string; serialNumber: string | null } | null
  contract: { id: string; contractNumber: string } | null
  parts: Part[]; laborLogs: LaborLog[]
  createdAt: string; updatedAt: string
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export default function ServiceOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  // Add Part modal
  const [showPartModal, setShowPartModal] = useState(false)
  const [partName, setPartName] = useState('')
  const [partNumber, setPartNumber] = useState('')
  const [partQty, setPartQty] = useState('1')
  const [partCost, setPartCost] = useState('0')
  const [savingPart, setSavingPart] = useState(false)

  // Add Labor modal
  const [showLaborModal, setShowLaborModal] = useState(false)
  const [laborTech, setLaborTech] = useState('')
  const [laborHours, setLaborHours] = useState('')
  const [laborNotes, setLaborNotes] = useState('')
  const [savingLabor, setSavingLabor] = useState(false)

  // Status change
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const fetchOrder = useCallback(async () => {
    const res = await fetch(`/api/service/orders/${id}`)
    if (res.ok) setOrder(await res.json())
    setLoading(false)
  }, [id])

  useEffect(() => { fetchOrder() }, [fetchOrder])

  async function doAction(action: string, extra: Record<string, unknown> = {}) {
    const res = await fetch(`/api/service/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...extra }),
    })
    if (res.ok) await fetchOrder()
  }

  async function addPart() {
    if (!partName) return
    setSavingPart(true)
    await doAction('add-part', { partName, partNumber, quantity: partQty, unitCost: partCost })
    setSavingPart(false)
    setShowPartModal(false)
    setPartName(''); setPartNumber(''); setPartQty('1'); setPartCost('0')
  }

  async function addLabor() {
    if (!laborTech || !laborHours) return
    setSavingLabor(true)
    await doAction('add-labor', { techName: laborTech, hoursWorked: laborHours, notes: laborNotes })
    setSavingLabor(false)
    setShowLaborModal(false)
    setLaborTech(''); setLaborHours(''); setLaborNotes('')
  }

  async function changeStatus(newStatus: string) {
    setUpdatingStatus(true)
    const action = newStatus === 'completed' ? 'complete' : newStatus === 'cancelled' ? 'cancel' : undefined
    if (action) {
      await doAction(action)
    } else {
      await doAction('', { status: newStatus })
    }
    setUpdatingStatus(false)
  }

  if (loading) return <><TopBar title="Service Order" /><main className="flex-1 p-6"><p className="text-zinc-500">Loading…</p></main></>
  if (!order) return <><TopBar title="Not Found" /><main className="flex-1 p-6"><p className="text-zinc-500">Order not found.</p></main></>

  const partsTotal = order.parts.reduce((s, p) => s + p.lineTotal, 0)
  const isActive = !['completed', 'cancelled'].includes(order.status)

  return (
    <>
      <TopBar title={`Order ${order.orderNumber}`} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/service/orders"><ArrowLeft className="w-4 h-4 mr-1" />Back</Link>
          </Button>
        </div>

        {/* Header card */}
        <div className="grid grid-cols-3 gap-6">
          <Card className="col-span-2">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-zinc-500">{order.orderNumber}</span>
                    <Badge variant={PRIORITY_VARIANT[order.priority] ?? 'secondary'} className="capitalize text-xs">
                      {order.priority}
                    </Badge>
                    <Badge variant={STATUS_VARIANT[order.status] ?? 'secondary'} className="capitalize text-xs">
                      {order.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <p className="text-base text-zinc-100">{order.description}</p>
                </div>
                {isActive && (
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-emerald-400 border-emerald-800 hover:bg-emerald-950"
                      onClick={() => changeStatus('completed')}
                      disabled={updatingStatus}
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-400 border-red-900 hover:bg-red-950"
                      onClick={() => changeStatus('cancelled')}
                      disabled={updatingStatus}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm border-t border-zinc-800 pt-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Customer</p>
                  {order.customer ? (
                    <Link href={`/customers/${order.customer.id}`} className="text-blue-400 hover:underline">
                      {order.customer.firstName} {order.customer.lastName}
                    </Link>
                  ) : <span className="text-zinc-600">—</span>}
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Service Item</p>
                  {order.serviceItem ? (
                    <Link href={`/service/items/${order.serviceItem.id}`} className="text-blue-400 hover:underline text-xs">
                      {order.serviceItem.description}
                      {order.serviceItem.serialNumber && <span className="ml-1 text-zinc-500 font-mono">#{order.serviceItem.serialNumber}</span>}
                    </Link>
                  ) : <span className="text-zinc-600">—</span>}
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Assigned Tech</p>
                  <p className="text-zinc-300">{order.assignedTech ?? <span className="text-zinc-600">Unassigned</span>}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Contract</p>
                  {order.contract ? (
                    <Link href={`/service/contracts/${order.contract.id}`} className="text-blue-400 hover:underline font-mono text-xs">
                      {order.contract.contractNumber}
                    </Link>
                  ) : <span className="text-zinc-600">—</span>}
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Due Date</p>
                  <p className="text-zinc-300">{formatDate(order.dueDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-0.5">Est. Hours</p>
                  <p className="text-zinc-300">{order.estimatedHours ?? '—'}</p>
                </div>
              </div>

              {/* Status change buttons */}
              {isActive && (
                <div className="border-t border-zinc-800 pt-4">
                  <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wide">Change Status</p>
                  <div className="flex gap-2">
                    {(['open', 'in-progress', 'on-hold'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => changeStatus(s)}
                        disabled={order.status === s || updatingStatus}
                        className={`px-3 py-1 rounded text-xs font-medium border transition-colors disabled:opacity-40 ${
                          order.status === s
                            ? 'bg-blue-700 text-white border-blue-600'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500'
                        }`}
                      >
                        {s.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status timeline */}
          <div className="space-y-3">
            <Card>
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Timeline</p>
                <div className="space-y-2">
                  {STATUS_TIMELINE.map((s, i) => {
                    const currentIdx = STATUS_TIMELINE.indexOf(order.status)
                    const isDone = i <= currentIdx && !['cancelled'].includes(order.status)
                    const isCurrent = s === order.status
                    return (
                      <div key={s} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          isCurrent ? 'bg-blue-400' : isDone ? 'bg-emerald-500' : 'bg-zinc-700'
                        }`} />
                        <span className={`text-xs capitalize ${
                          isCurrent ? 'text-zinc-100 font-medium' : isDone ? 'text-zinc-400' : 'text-zinc-600'
                        }`}>{s.replace('-', ' ')}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Hours</p>
                <p className="text-2xl font-bold text-zinc-100">
                  {order.actualHours?.toFixed(1) ?? '0'}
                  <span className="text-sm text-zinc-500 font-normal ml-1">
                    / {order.estimatedHours ?? '?'}h est.
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Parts Cost</p>
                <p className="text-2xl font-bold text-zinc-100">{formatCurrency(partsTotal)}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Parts table */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-zinc-500" />
              <h2 className="text-base font-semibold text-zinc-100">Parts Used</h2>
              <span className="text-xs text-zinc-500">({order.parts.length})</span>
            </div>
            {isActive && (
              <Button size="sm" variant="outline" onClick={() => setShowPartModal(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" />Add Part
              </Button>
            )}
          </div>
          {order.parts.length === 0 ? (
            <Card><CardContent className="py-6 text-center text-zinc-600 text-sm">No parts added yet.</CardContent></Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-2 font-medium">Part</th>
                    <th className="text-left pb-2 font-medium">Part #</th>
                    <th className="text-right pb-2 font-medium">Qty</th>
                    <th className="text-right pb-2 font-medium">Unit Cost</th>
                    <th className="text-right pb-2 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {order.parts.map(p => (
                    <tr key={p.id} className="hover:bg-zinc-900/50">
                      <td className="py-2.5 pr-4 text-zinc-300">{p.partName}</td>
                      <td className="py-2.5 pr-4 font-mono text-xs text-zinc-500">{p.partNumber ?? '—'}</td>
                      <td className="py-2.5 pr-4 text-right text-zinc-400">{p.quantity}</td>
                      <td className="py-2.5 pr-4 text-right text-zinc-400">{formatCurrency(p.unitCost)}</td>
                      <td className="py-2.5 text-right text-zinc-200 font-medium">{formatCurrency(p.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-zinc-700">
                    <td colSpan={4} className="pt-2 text-right text-xs text-zinc-500 uppercase tracking-wide pr-4">Total</td>
                    <td className="pt-2 text-right font-bold text-zinc-100">{formatCurrency(partsTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>

        {/* Labor logs */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-500" />
              <h2 className="text-base font-semibold text-zinc-100">Labor Hours</h2>
              <span className="text-xs text-zinc-500">({order.laborLogs.length} entries)</span>
            </div>
            {isActive && (
              <Button size="sm" variant="outline" onClick={() => setShowLaborModal(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" />Log Hours
              </Button>
            )}
          </div>
          {order.laborLogs.length === 0 ? (
            <Card><CardContent className="py-6 text-center text-zinc-600 text-sm">No labor logged yet.</CardContent></Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-2 font-medium">Technician</th>
                    <th className="text-right pb-2 font-medium">Hours</th>
                    <th className="text-left pb-2 font-medium">Notes</th>
                    <th className="text-left pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {order.laborLogs.map(l => (
                    <tr key={l.id} className="hover:bg-zinc-900/50">
                      <td className="py-2.5 pr-4 text-zinc-300">{l.techName}</td>
                      <td className="py-2.5 pr-4 text-right tabular-nums text-zinc-200 font-medium">{l.hoursWorked}h</td>
                      <td className="py-2.5 pr-4 text-zinc-500 text-xs max-w-[200px] truncate">{l.notes ?? '—'}</td>
                      <td className="py-2.5 text-zinc-500 text-xs">{formatDate(l.logDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Add Part Modal */}
      {showPartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-zinc-100">Add Part</h3>
                <button onClick={() => setShowPartModal(false)} className="text-zinc-500 hover:text-zinc-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1.5">
                <Label>Part Name *</Label>
                <Input value={partName} onChange={e => setPartName(e.target.value)} placeholder="e.g. Filter HEPA 12x24" />
              </div>
              <div className="space-y-1.5">
                <Label>Part Number</Label>
                <Input value={partNumber} onChange={e => setPartNumber(e.target.value)} placeholder="Optional" className="font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Quantity</Label>
                  <Input type="number" min="1" step="1" value={partQty} onChange={e => setPartQty(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Unit Cost ($)</Label>
                  <Input type="number" min="0" step="0.01" value={partCost} onChange={e => setPartCost(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowPartModal(false)}>Cancel</Button>
                <Button onClick={addPart} disabled={savingPart || !partName}>
                  {savingPart ? 'Adding…' : 'Add Part'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Labor Modal */}
      {showLaborModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-zinc-100">Log Labor Hours</h3>
                <button onClick={() => setShowLaborModal(false)} className="text-zinc-500 hover:text-zinc-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1.5">
                <Label>Technician *</Label>
                <select
                  value={laborTech}
                  onChange={e => setLaborTech(e.target.value)}
                  className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
                >
                  <option value="">Select tech…</option>
                  {TECHS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Hours Worked *</Label>
                <Input type="number" min="0.5" step="0.5" value={laborHours} onChange={e => setLaborHours(e.target.value)} placeholder="e.g. 1.5" />
              </div>
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <textarea
                  value={laborNotes}
                  onChange={e => setLaborNotes(e.target.value)}
                  rows={2}
                  placeholder="What was done…"
                  className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowLaborModal(false)}>Cancel</Button>
                <Button onClick={addLabor} disabled={savingLabor || !laborTech || !laborHours}>
                  {savingLabor ? 'Logging…' : 'Log Hours'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
