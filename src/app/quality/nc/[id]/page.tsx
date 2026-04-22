'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus, CheckCircle, ShieldCheck } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

type CorrectiveAction = { id: string; action: string; assignedTo: string | null; dueDate: string | null; status: string; completedAt: string | null; verifiedBy: string | null; notes: string | null }
type LinkedOrder = { id: string; orderNumber: string; productName: string; status: string } | null
type NonConformance = { id: string; ncNumber: string; productName: string | null; problemType: string; description: string; severity: string; status: string; disposition: string | null; assignedTo: string | null; closedAt: string | null; createdAt: string; updatedAt: string; correctiveActions: CorrectiveAction[]; order: LinkedOrder }

const SEVERITY_VARIANT: Record<string, 'destructive' | 'warning' | 'secondary'> = { critical: 'destructive', major: 'warning', minor: 'secondary' }
const CA_STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'secondary' | 'outline'> = { open: 'secondary', 'in-progress': 'default', completed: 'success', verified: 'success' }

export default function NCDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [nc, setNc] = useState<NonConformance | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCAForm, setShowCAForm] = useState(false)
  const [caForm, setCaForm] = useState({ action: '', assignedTo: '', dueDate: '', notes: '' })
  const [savingCA, setSavingCA] = useState(false)
  const [closingNC, setClosingNC] = useState(false)

  const load = useCallback(async () => { setLoading(true); const res = await fetch(`/api/quality/nc/${id}`); if (res.ok) setNc(await res.json()); setLoading(false) }, [id])
  useEffect(() => { load() }, [load])

  async function handleAddCA(e: React.FormEvent) {
    e.preventDefault(); setSavingCA(true)
    const res = await fetch(`/api/quality/nc/${id}/actions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...caForm, assignedTo: caForm.assignedTo || undefined, dueDate: caForm.dueDate || undefined, notes: caForm.notes || undefined }) })
    if (res.ok) { setShowCAForm(false); setCaForm({ action: '', assignedTo: '', dueDate: '', notes: '' }); load() }
    setSavingCA(false)
  }

  async function handleCAAction(aid: string, status: string, extra?: Record<string, string>) {
    await fetch(`/api/quality/nc/${id}/actions/${aid}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, ...extra }) })
    load()
  }

  async function handleCloseNC() {
    setClosingNC(true)
    await fetch(`/api/quality/nc/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'closed' }) })
    load(); setClosingNC(false)
  }

  async function handleUpdateDisposition(disposition: string) {
    await fetch(`/api/quality/nc/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ disposition }) })
    load()
  }

  if (loading) return <><TopBar title="Non-Conformance" /><main className="flex-1 p-6"><p className="text-zinc-500">Loading...</p></main></>
  if (!nc) return <><TopBar title="Non-Conformance" /><main className="flex-1 p-6"><p className="text-red-400">NC not found.</p></main></>

  const allActionsCompleted = nc.correctiveActions.length > 0 && nc.correctiveActions.every(a => a.status === 'completed' || a.status === 'verified')
  const canClose = allActionsCompleted && nc.status !== 'closed'

  return (
    <>
      <TopBar title={`Non-Conformance ${nc.ncNumber}`} />
      <main className="flex-1 p-6 overflow-auto max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/quality/nc"><Button variant="ghost" size="icon" className="text-zinc-400"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-zinc-100">{nc.ncNumber}</h2>
              <Badge variant={SEVERITY_VARIANT[nc.severity] ?? 'secondary'} className="capitalize">{nc.severity}</Badge>
              <Badge variant={nc.status === 'closed' ? 'outline' : 'secondary'} className="capitalize">{nc.status}</Badge>
            </div>
            <p className="text-sm text-zinc-400 mt-0.5">{nc.productName ?? 'No product'}</p>
          </div>
          <Button size="sm" disabled={!canClose || closingNC} onClick={handleCloseNC} className={cn('text-xs', canClose ? 'bg-emerald-700 hover:bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed')}>
            <CheckCircle className="w-3 h-3 mr-1" />{closingNC ? 'Closing...' : 'Close NC'}
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-1 flex flex-col gap-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-zinc-100">Details</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div><p className="text-xs text-zinc-500">Problem Type</p><p className="text-sm text-zinc-200 capitalize mt-0.5">{nc.problemType.replace('-', ' ')}</p></div>
                <div><p className="text-xs text-zinc-500">Description</p><p className="text-sm text-zinc-200 mt-0.5">{nc.description}</p></div>
                <div><p className="text-xs text-zinc-500">Assigned To</p><p className="text-sm text-zinc-200 mt-0.5">{nc.assignedTo ?? '—'}</p></div>
                <div>
                  <p className="text-xs text-zinc-500">Disposition</p>
                  <select value={nc.disposition ?? ''} onChange={e => handleUpdateDisposition(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs h-7 rounded px-2 mt-0.5">
                    <option value="">— Pending —</option><option value="use-as-is">Use As-Is</option><option value="rework">Rework</option><option value="scrap">Scrap</option><option value="return-to-vendor">Return to Vendor</option>
                  </select>
                </div>
                <div><p className="text-xs text-zinc-500">Created</p><p className="text-sm text-zinc-400 mt-0.5">{formatDate(nc.createdAt)}</p></div>
                {nc.closedAt && <div><p className="text-xs text-zinc-500">Closed</p><p className="text-sm text-zinc-400 mt-0.5">{formatDate(nc.closedAt)}</p></div>}
                {nc.order && <div><p className="text-xs text-zinc-500">Linked Quality Order</p><Link href={`/quality/orders/${nc.order.id}`} className="text-blue-400 hover:text-blue-300 text-sm font-mono">{nc.order.orderNumber}</Link><p className="text-xs text-zinc-500">{nc.order.productName}</p></div>}
              </CardContent>
            </Card>
          </div>

          <Card className="xl:col-span-2 bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-zinc-100">Corrective Actions</CardTitle>
              <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 text-xs" onClick={() => setShowCAForm(true)} disabled={nc.status === 'closed'}><Plus className="w-3 h-3 mr-1" /> Add Action</Button>
            </CardHeader>
            <CardContent className="p-0">
              {showCAForm && (
                <div className="px-4 pb-4 border-b border-zinc-800">
                  <form onSubmit={handleAddCA} className="grid grid-cols-2 gap-3">
                    <div className="col-span-2"><label className="text-xs text-zinc-500 block mb-1">Action *</label><Input value={caForm.action} onChange={e => setCaForm(f => ({ ...f, action: e.target.value }))} placeholder="Describe the corrective action" required className="bg-zinc-800 border-zinc-700 text-zinc-100 text-xs h-7" /></div>
                    <div><label className="text-xs text-zinc-500 block mb-1">Assigned To</label><Input value={caForm.assignedTo} onChange={e => setCaForm(f => ({ ...f, assignedTo: e.target.value }))} placeholder="Assignee" className="bg-zinc-800 border-zinc-700 text-zinc-100 text-xs h-7" /></div>
                    <div><label className="text-xs text-zinc-500 block mb-1">Due Date</label><Input type="date" value={caForm.dueDate} onChange={e => setCaForm(f => ({ ...f, dueDate: e.target.value }))} className="bg-zinc-800 border-zinc-700 text-zinc-100 text-xs h-7" /></div>
                    <div className="col-span-2 flex justify-end gap-2"><Button type="button" variant="ghost" size="sm" onClick={() => setShowCAForm(false)} className="text-zinc-400 text-xs">Cancel</Button><Button type="submit" size="sm" disabled={savingCA} className="bg-blue-600 hover:bg-blue-700 text-white text-xs">{savingCA ? 'Saving...' : 'Add Action'}</Button></div>
                  </form>
                </div>
              )}
              {nc.correctiveActions.length === 0 && !showCAForm && <p className="px-4 py-8 text-center text-zinc-600 text-sm">No corrective actions yet</p>}
              <div className="divide-y divide-zinc-800">
                {nc.correctiveActions.map(ca => (
                  <div key={ca.id} className="px-4 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-zinc-200">{ca.action}</p>
                        <div className="flex items-center gap-4 mt-1.5">
                          {ca.assignedTo && <span className="text-xs text-zinc-500">Assigned: {ca.assignedTo}</span>}
                          {ca.dueDate && <span className={cn('text-xs', new Date(ca.dueDate) < new Date() && ca.status !== 'completed' && ca.status !== 'verified' ? 'text-red-400' : 'text-zinc-500')}>Due: {new Date(ca.dueDate).toLocaleDateString()}</span>}
                          {ca.verifiedBy && <span className="text-xs text-emerald-500">Verified by: {ca.verifiedBy}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={CA_STATUS_VARIANT[ca.status] ?? 'secondary'} className="text-xs capitalize">{ca.status}</Badge>
                        {(ca.status === 'open' || ca.status === 'in-progress') ? (
                          <Button size="sm" variant="ghost" className="text-xs text-emerald-400 hover:text-emerald-300 h-7 px-2" onClick={() => handleCAAction(ca.id, 'completed')}><CheckCircle className="w-3 h-3 mr-1" /> Complete</Button>
                        ) : ca.status === 'completed' ? (
                          <Button size="sm" variant="ghost" className="text-xs text-blue-400 hover:text-blue-300 h-7 px-2" onClick={() => { const v = prompt('Verified by:'); if (v) handleCAAction(ca.id, 'verified', { verifiedBy: v }) }}><ShieldCheck className="w-3 h-3 mr-1" /> Verify</Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
