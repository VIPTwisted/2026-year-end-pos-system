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
import { ArrowLeft, Plus, X, Clock, Package, CheckCircle, XCircle, RefreshCw, Receipt, MapPin } from 'lucide-react'

const PRIORITY_VARIANT: Record<string, 'destructive' | 'warning' | 'default' | 'secondary'> = {
  Urgent: 'destructive', High: 'warning', Normal: 'default', Low: 'secondary',
  urgent: 'destructive', high: 'warning', normal: 'default', low: 'secondary',
}
const STATUS_VARIANT: Record<string, 'warning' | 'default' | 'success' | 'secondary' | 'destructive'> = {
  Pending:      'warning',
  'In Process': 'default',
  Finished:     'success',
  'On Hold':    'secondary',
  open:         'warning',
  'in-progress':'default',
  completed:    'success',
  'on-hold':    'secondary',
  cancelled:    'destructive',
}

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

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

const BC_STATUSES = ['Pending', 'In Process', 'On Hold', 'Finished']
const TAB_LABELS = ['General', 'Customer', 'Details', 'Service Item Lines'] as const
type Tab = (typeof TAB_LABELS)[number]

export default function ServiceOrderCardPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('General')

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
    setSavingPart(false); setShowPartModal(false)
    setPartName(''); setPartNumber(''); setPartQty('1'); setPartCost('0')
  }

  async function addLabor() {
    if (!laborTech || !laborHours) return
    setSavingLabor(true)
    await doAction('add-labor', { techName: laborTech, hoursWorked: laborHours, notes: laborNotes })
    setSavingLabor(false); setShowLaborModal(false)
    setLaborTech(''); setLaborHours(''); setLaborNotes('')
  }

  async function changeStatus(newStatus: string) {
    setUpdatingStatus(true)
    if (newStatus === 'Finished' || newStatus === 'completed') {
      await doAction('complete')
    } else if (newStatus === 'cancelled') {
      await doAction('cancel')
    } else {
      await doAction('', { status: newStatus })
    }
    setUpdatingStatus(false)
  }

  if (loading) return <><TopBar title="Service Order" /><main className="flex-1 p-6"><p className="text-zinc-500">Loading…</p></main></>
  if (!order) return <><TopBar title="Not Found" /><main className="flex-1 p-6"><p className="text-zinc-500">Order not found.</p></main></>

  const partsTotal = order.parts.reduce((s, p) => s + p.lineTotal, 0)
  const isActive = !['Finished', 'completed', 'cancelled'].includes(order.status)

  return (
    <>
      <TopBar title={`Service Order — ${order.orderNumber}`} />
      <main className="flex-1 overflow-auto">

        {/* Ribbon */}
        <div className="border-b border-zinc-800 bg-zinc-950 px-4 py-2 flex items-center gap-1 flex-wrap">
          <div className="flex items-center gap-1 pr-3 border-r border-zinc-800">
            <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1">
              <Link href="/service/orders"><ArrowLeft className="w-3.5 h-3.5" />Back</Link>
            </Button>
          </div>
          <div className="flex items-center gap-1 px-3 border-r border-zinc-800">
            {isActive && (
              <>
                <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs gap-1 text-emerald-400 border-emerald-900"
                  onClick={() => changeStatus('Finished')} disabled={updatingStatus}>
                  <CheckCircle className="w-3.5 h-3.5" />Finish
                </Button>
                <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs gap-1" disabled>
                  <RefreshCw className="w-3.5 h-3.5" />Release
                </Button>
                <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs gap-1" disabled>
                  <Receipt className="w-3.5 h-3.5" />Create Invoice
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 px-3">
            <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs gap-1" disabled>
              <MapPin className="w-3.5 h-3.5" />Dispatch
            </Button>
            <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs gap-1" disabled>
              <MapPin className="w-3.5 h-3.5" />Allocations
            </Button>
            {isActive && (
              <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs gap-1 text-red-400 border-red-900"
                onClick={() => changeStatus('cancelled')} disabled={updatingStatus}>
                <XCircle className="w-3.5 h-3.5" />Cancel
              </Button>
            )}
          </div>
        </div>

        <div className="p-5 space-y-5 max-w-6xl">
          {/* Header */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-xs text-zinc-500">{order.orderNumber}</span>
            <Badge variant={PRIORITY_VARIANT[order.priority] ?? 'secondary'} className="capitalize text-xs">{order.priority}</Badge>
            <Badge variant={STATUS_VARIANT[order.status] ?? 'secondary'} className="text-xs">{order.status}</Badge>
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

          {/* General tab */}
          {activeTab === 'General' && (
            <div className="grid grid-cols-3 gap-5">
              <Card className="col-span-2">
                <CardContent className="pt-5 space-y-4">
                  <p className="text-sm text-zinc-100">{order.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm border-t border-zinc-800 pt-4">
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Status</p>
                      {isActive ? (
                        <div className="flex gap-1 flex-wrap mt-1">
                          {BC_STATUSES.map(s => (
                            <button key={s} onClick={() => changeStatus(s)}
                              disabled={order.status === s || updatingStatus}
                              className={`px-2.5 py-0.5 rounded text-xs font-medium border transition-colors disabled:opacity-40 ${
                                order.status === s
                                  ? 'bg-indigo-700 text-white border-indigo-600'
                                  : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500'
                              }`}>
                              {s}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <Badge variant={STATUS_VARIANT[order.status] ?? 'secondary'} className="text-xs mt-1">{order.status}</Badge>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Priority</p>
                      <Badge variant={PRIORITY_VARIANT[order.priority] ?? 'secondary'} className="capitalize text-xs mt-1">{order.priority}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Response Date</p>
                      <p className="text-zinc-300 text-sm">{fmtDate(order.dueDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Completed At</p>
                      <p className="text-zinc-400 text-sm">{fmtDate(order.completedAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Created</p>
                      <p className="text-zinc-400 text-sm">{fmtDate(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Last Modified</p>
                      <p className="text-zinc-400 text-sm">{fmtDate(order.updatedAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FactBox */}
              <div className="space-y-3">
                <Card>
                  <CardContent className="pt-4 pb-4 space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Service Item Statistics</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Est. Hours</span>
                      <span className="text-zinc-200 font-medium">{order.estimatedHours ?? '—'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Actual Hours</span>
                      <span className="text-zinc-200 font-medium">{order.actualHours?.toFixed(1) ?? '0.0'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Parts Cost</span>
                      <span className="text-zinc-200 font-medium">{fmtCurrency(partsTotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Parts Lines</span>
                      <span className="text-zinc-200 font-medium">{order.parts.length}</span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4 space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Allocation</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Assigned Tech</span>
                      <span className="text-zinc-300 font-medium">{order.assignedTech ?? '—'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500">Labor Entries</span>
                      <span className="text-zinc-300 font-medium">{order.laborLogs.length}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Customer tab */}
          {activeTab === 'Customer' && (
            <Card>
              <CardContent className="pt-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-zinc-500 mb-0.5">Customer</p>
                    {order.customer ? (
                      <Link href={`/customers/${order.customer.id}`} className="text-indigo-400 hover:underline text-sm">
                        {order.customer.firstName} {order.customer.lastName}
                      </Link>
                    ) : <span className="text-zinc-600 text-sm">—</span>}
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-0.5">Contract</p>
                    {order.contract ? (
                      <Link href={`/service/contracts/${order.contract.id}`} className="text-indigo-400 hover:underline font-mono text-sm">
                        {order.contract.contractNumber}
                      </Link>
                    ) : <span className="text-zinc-600 text-sm">—</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Details tab */}
          {activeTab === 'Details' && (
            <Card>
              <CardContent className="pt-5 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-zinc-500 mb-0.5">Assigned Technician</p>
                    <p className="text-zinc-300">{order.assignedTech ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-0.5">Service Item</p>
                    {order.serviceItem ? (
                      <Link href={`/service/items/${order.serviceItem.id}`} className="text-indigo-400 hover:underline text-xs">
                        {order.serviceItem.description}
                        {order.serviceItem.serialNumber && <span className="ml-1 text-zinc-500 font-mono">#{order.serviceItem.serialNumber}</span>}
                      </Link>
                    ) : <span className="text-zinc-600">—</span>}
                  </div>
                  {order.resolutionNotes && (
                    <div className="col-span-2">
                      <p className="text-xs text-zinc-500 mb-0.5">Resolution Notes</p>
                      <p className="text-zinc-300">{order.resolutionNotes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Service Item Lines tab */}
          {activeTab === 'Service Item Lines' && (
            <div className="space-y-4">
              {/* Parts */}
              <Card>
                <CardContent className="pt-5 pb-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-zinc-500" />
                      <h3 className="text-sm font-semibold text-zinc-100">Parts Used</h3>
                      <span className="text-xs text-zinc-500">({order.parts.length})</span>
                    </div>
                    {isActive && (
                      <Button size="sm" variant="outline" onClick={() => setShowPartModal(true)} className="h-7 px-2.5 text-xs gap-1">
                        <Plus className="w-3 h-3" />Add Part
                      </Button>
                    )}
                  </div>
                  {order.parts.length === 0 ? (
                    <p className="text-xs text-zinc-600 py-4 text-center">No parts added.</p>
                  ) : (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wide">
                          <th className="text-left pb-2 font-medium pr-4">Part</th>
                          <th className="text-left pb-2 font-medium pr-4">Part #</th>
                          <th className="text-right pb-2 font-medium pr-4">Qty</th>
                          <th className="text-right pb-2 font-medium pr-4">Unit Cost</th>
                          <th className="text-right pb-2 font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {order.parts.map(p => (
                          <tr key={p.id} className="hover:bg-zinc-900/30">
                            <td className="py-2 pr-4 text-zinc-300">{p.partName}</td>
                            <td className="py-2 pr-4 font-mono text-zinc-500">{p.partNumber ?? '—'}</td>
                            <td className="py-2 pr-4 text-right text-zinc-400">{p.quantity}</td>
                            <td className="py-2 pr-4 text-right text-zinc-400">{fmtCurrency(p.unitCost)}</td>
                            <td className="py-2 text-right text-zinc-200 font-medium">{fmtCurrency(p.lineTotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-zinc-700">
                          <td colSpan={4} className="pt-2 text-right text-zinc-500 pr-4">Total</td>
                          <td className="pt-2 text-right font-bold text-zinc-100">{fmtCurrency(partsTotal)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  )}
                </CardContent>
              </Card>

              {/* Labor */}
              <Card>
                <CardContent className="pt-5 pb-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-zinc-500" />
                      <h3 className="text-sm font-semibold text-zinc-100">Labor Hours</h3>
                      <span className="text-xs text-zinc-500">({order.laborLogs.length})</span>
                    </div>
                    {isActive && (
                      <Button size="sm" variant="outline" onClick={() => setShowLaborModal(true)} className="h-7 px-2.5 text-xs gap-1">
                        <Plus className="w-3 h-3" />Log Hours
                      </Button>
                    )}
                  </div>
                  {order.laborLogs.length === 0 ? (
                    <p className="text-xs text-zinc-600 py-4 text-center">No labor logged.</p>
                  ) : (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wide">
                          <th className="text-left pb-2 font-medium pr-4">Technician</th>
                          <th className="text-right pb-2 font-medium pr-4">Hours</th>
                          <th className="text-left pb-2 font-medium pr-4">Notes</th>
                          <th className="text-left pb-2 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {order.laborLogs.map(l => (
                          <tr key={l.id} className="hover:bg-zinc-900/30">
                            <td className="py-2 pr-4 text-zinc-300">{l.techName}</td>
                            <td className="py-2 pr-4 text-right tabular-nums text-zinc-200 font-medium">{l.hoursWorked}h</td>
                            <td className="py-2 pr-4 text-zinc-500 max-w-[200px] truncate">{l.notes ?? '—'}</td>
                            <td className="py-2 text-zinc-500">{fmtDate(l.logDate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Add Part Modal */}
      {showPartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold text-zinc-100">Add Part</h3>
                <button onClick={() => setShowPartModal(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
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
                <Button onClick={addPart} disabled={savingPart || !partName}>{savingPart ? 'Adding…' : 'Add Part'}</Button>
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
                <button onClick={() => setShowLaborModal(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-1.5">
                <Label>Technician *</Label>
                <Input value={laborTech} onChange={e => setLaborTech(e.target.value)} placeholder="Technician name" />
              </div>
              <div className="space-y-1.5">
                <Label>Hours Worked *</Label>
                <Input type="number" min="0.5" step="0.5" value={laborHours} onChange={e => setLaborHours(e.target.value)} placeholder="e.g. 1.5" />
              </div>
              <div className="space-y-1.5">
                <Label>Notes</Label>
                <textarea value={laborNotes} onChange={e => setLaborNotes(e.target.value)} rows={2}
                  placeholder="What was done…"
                  className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 resize-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowLaborModal(false)}>Cancel</Button>
                <Button onClick={addLabor} disabled={savingLabor || !laborTech || !laborHours}>{savingLabor ? 'Logging…' : 'Log Hours'}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
