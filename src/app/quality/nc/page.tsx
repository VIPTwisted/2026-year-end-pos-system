'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Plus, X, ChevronRight } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

type NonConformance = {
  id: string; ncNumber: string; productName: string | null; problemType: string; severity: string; status: string; assignedTo: string | null; createdAt: string; correctiveActions: { id: string; status: string }[]
}

const SEVERITY_VARIANT: Record<string, 'destructive' | 'warning' | 'secondary'> = { critical: 'destructive', major: 'warning', minor: 'secondary' }
const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary' | 'outline'> = { open: 'secondary', 'under-review': 'default', 'corrective-action': 'warning', closed: 'outline' }

export default function NonConformancesPage() {
  const [ncs, setNcs] = useState<NonConformance[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ productName: '', problemType: 'defect', description: '', severity: 'minor', assignedTo: '' })

  const load = useCallback(async () => { setLoading(true); const res = await fetch('/api/quality/nc'); setNcs(await res.json()); setLoading(false) }, [])
  useEffect(() => { load() }, [load])

  const openCount = ncs.filter(nc => nc.status !== 'closed').length
  const criticalCount = ncs.filter(nc => nc.severity === 'critical' && nc.status !== 'closed').length
  const nowMs = Date.now()
  const avgDaysOpen = (() => {
    const openNCs = ncs.filter(nc => nc.status !== 'closed')
    if (openNCs.length === 0) return 0
    return Math.round(openNCs.reduce((sum, nc) => sum + Math.floor((nowMs - new Date(nc.createdAt).getTime()) / 86400000), 0) / openNCs.length)
  })()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const res = await fetch('/api/quality/nc', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, productName: form.productName || undefined, assignedTo: form.assignedTo || undefined }) })
    if (res.ok) { setShowForm(false); setForm({ productName: '', problemType: 'defect', description: '', severity: 'minor', assignedTo: '' }); load() }
    setSaving(false)
  }

  return (
    <>
      <TopBar title="Non-Conformances" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="bg-zinc-900 border-zinc-800"><CardContent className="pt-5"><p className="text-2xl font-bold text-zinc-100">{openCount}</p><p className="text-xs text-zinc-500 mt-1">Open Non-Conformances</p></CardContent></Card>
          <Card className="bg-zinc-900 border-zinc-800"><CardContent className="pt-5"><p className="text-2xl font-bold text-red-400">{criticalCount}</p><p className="text-xs text-zinc-500 mt-1">Critical Severity</p></CardContent></Card>
          <Card className="bg-zinc-900 border-zinc-800"><CardContent className="pt-5"><p className="text-2xl font-bold text-amber-400">{avgDaysOpen}</p><p className="text-xs text-zinc-500 mt-1">Avg Days Open</p></CardContent></Card>
        </div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-zinc-100">All Non-Conformances</h3>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-1" /> New Non-Conformance</Button>
        </div>
        {showForm && (
          <Card className="bg-zinc-900 border-zinc-700 mb-6"><CardContent className="pt-5">
            <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold text-zinc-100">New Non-Conformance</h3><button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button></div>
            <form onSubmit={handleCreate} className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div><label className="text-xs text-zinc-500 block mb-1">Product Name</label><Input value={form.productName} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} placeholder="Product" className="bg-zinc-800 border-zinc-700 text-zinc-100 text-sm h-8" /></div>
              <div><label className="text-xs text-zinc-500 block mb-1">Problem Type *</label><select value={form.problemType} onChange={e => setForm(f => ({ ...f, problemType: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm h-8 rounded-md px-2"><option value="defect">Defect</option><option value="damage">Damage</option><option value="contamination">Contamination</option><option value="wrong-spec">Wrong Spec</option><option value="missing-label">Missing Label</option></select></div>
              <div><label className="text-xs text-zinc-500 block mb-1">Severity</label><select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm h-8 rounded-md px-2"><option value="minor">Minor</option><option value="major">Major</option><option value="critical">Critical</option></select></div>
              <div><label className="text-xs text-zinc-500 block mb-1">Assigned To</label><Input value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} placeholder="Assignee" className="bg-zinc-800 border-zinc-700 text-zinc-100 text-sm h-8" /></div>
              <div className="col-span-2 md:col-span-3"><label className="text-xs text-zinc-500 block mb-1">Description *</label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the non-conformance" required className="bg-zinc-800 border-zinc-700 text-zinc-100 text-sm h-8" /></div>
              <div className="col-span-2 md:col-span-3 flex justify-end gap-2"><Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)} className="text-zinc-400">Cancel</Button><Button type="submit" size="sm" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">{saving ? 'Saving...' : 'Create NC'}</Button></div>
            </form>
          </CardContent></Card>
        )}
        <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-0">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-zinc-800"><th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">NC#</th><th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Product</th><th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Problem</th><th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Severity</th><th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Status</th><th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Assigned</th><th className="px-4 py-3"></th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-600 text-sm">Loading...</td></tr>}
              {!loading && ncs.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-zinc-600 text-sm"><AlertTriangle className="w-8 h-8 text-zinc-700 mx-auto mb-2" />No non-conformances</td></tr>}
              {ncs.map(nc => (
                <tr key={nc.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/40 transition-colors">
                  <td className="px-4 py-3"><Link href={`/quality/nc/${nc.id}`} className="text-blue-400 hover:text-blue-300 font-mono text-xs">{nc.ncNumber}</Link></td>
                  <td className="px-4 py-3 text-zinc-300 text-xs">{nc.productName ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs capitalize">{nc.problemType.replace('-', ' ')}</td>
                  <td className="px-4 py-3"><Badge variant={SEVERITY_VARIANT[nc.severity] ?? 'secondary'} className="text-xs capitalize">{nc.severity}</Badge></td>
                  <td className="px-4 py-3"><Badge variant={STATUS_VARIANT[nc.status] ?? 'secondary'} className="text-xs capitalize">{nc.status}</Badge></td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{nc.assignedTo ?? '—'}</td>
                  <td className="px-4 py-3"><Link href={`/quality/nc/${nc.id}`} className="text-zinc-600 hover:text-zinc-300"><ChevronRight className="w-4 h-4" /></Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent></Card>
      </main>
    </>
  )
}

