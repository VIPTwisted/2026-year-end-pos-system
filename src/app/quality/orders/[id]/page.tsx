'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Plus, ArrowLeft, Send, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type QualityTest = { id: string; name: string; testType: string; minValue: number | null; maxValue: number | null; unit: string | null }
type QualityTestGroup = { id: string; name: string; tests: QualityTest[] }
type QualityResult = { id: string; testName: string; testType: string; value: string | null; minValue: number | null; maxValue: number | null; unit: string | null; passed: boolean; notes: string | null }
type NonConformance = { id: string; ncNumber: string; problemType: string; severity: string; status: string; description: string }
type QualityOrder = { id: string; orderNumber: string; productName: string; qty: number; sampleQty: number; referenceType: string; referenceId: string | null; locationName: string | null; status: string; testGroupId: string | null; inspectedBy: string | null; inspectedAt: string | null; results: QualityResult[]; nonConformances: NonConformance[]; testGroup: QualityTestGroup | null }

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary' | 'outline'> = { open: 'secondary', 'in-progress': 'default', passed: 'success', failed: 'destructive', cancelled: 'outline' }
const SEVERITY_VARIANT: Record<string, 'destructive' | 'warning' | 'secondary'> = { critical: 'destructive', major: 'warning', minor: 'secondary' }

export default function QualityOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<QualityOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [testValues, setTestValues] = useState<Record<string, string>>({})
  const [inspectorName, setInspectorName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [inspectResult, setInspectResult] = useState<{ total: number; passed: number; failed: number; overallStatus: string } | null>(null)
  const [showNCForm, setShowNCForm] = useState(false)
  const [savingNC, setSavingNC] = useState(false)
  const [ncForm, setNcForm] = useState({ problemType: 'defect', description: '', severity: 'minor', assignedTo: '' })

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/quality/orders/${id}`)
    if (res.ok) { const data = await res.json(); setOrder(data); setInspectorName(data.inspectedBy ?? '') }
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  function isOutOfRange(test: QualityTest, val: string): boolean {
    if (test.testType === 'boolean') return false
    const num = parseFloat(val)
    if (isNaN(num)) return false
    if (test.minValue != null && num < test.minValue) return true
    if (test.maxValue != null && num > test.maxValue) return true
    return false
  }

  async function handleSubmitInspection() {
    if (!order?.testGroup) return
    setSubmitting(true)
    const tests = order.testGroup.tests.map(t => ({ testName: t.name, testType: t.testType, value: testValues[t.name] ?? '', minValue: t.minValue, maxValue: t.maxValue, unit: t.unit }))
    const res = await fetch(`/api/quality/orders/${id}/inspect`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tests, inspectedBy: inspectorName }) })
    if (res.ok) { const data = await res.json(); setInspectResult(data.summary); load() }
    setSubmitting(false)
  }

  async function handleCreateNC(e: React.FormEvent) {
    e.preventDefault(); setSavingNC(true)
    const res = await fetch(`/api/quality/orders/${id}/nc`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ncForm) })
    if (res.ok) { setShowNCForm(false); setNcForm({ problemType: 'defect', description: '', severity: 'minor', assignedTo: '' }); load() }
    setSavingNC(false)
  }

  if (loading) return <><TopBar title="Quality Order" /><main className="flex-1 p-6"><p className="text-zinc-500">Loading...</p></main></>
  if (!order) return <><TopBar title="Quality Order" /><main className="flex-1 p-6"><p className="text-red-400">Order not found.</p></main></>

  const hasResults = order.results.length > 0
  const canInspect = order.testGroup && (order.status === 'open' || order.status === 'in-progress')

  return (
    <>
      <TopBar title={`Quality Order ${order.orderNumber}`} />
      <main className="flex-1 p-6 overflow-auto max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/quality/orders"><Button variant="ghost" size="icon" className="text-zinc-400"><ArrowLeft className="w-4 h-4" /></Button></Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-zinc-100">{order.orderNumber}</h2>
              <Badge variant={STATUS_VARIANT[order.status] ?? 'secondary'} className="capitalize">{order.status}</Badge>
            </div>
            <p className="text-sm text-zinc-400 mt-0.5">{order.productName}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          {[
            { label: 'Quantity', value: order.qty },
            { label: 'Sample Qty', value: order.sampleQty },
            { label: 'Reference', value: order.referenceType },
            { label: 'Location', value: order.locationName ?? '—' },
            { label: 'Test Group', value: order.testGroup?.name ?? 'None' },
            { label: 'Inspector', value: order.inspectedBy ?? '—' },
          ].map(item => (
            <div key={item.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <p className="text-xs text-zinc-500">{item.label}</p>
              <p className="text-sm font-medium text-zinc-100 mt-0.5 capitalize">{item.value}</p>
            </div>
          ))}
        </div>

        {inspectResult && (
          <div className={cn('rounded-lg border p-4 mb-6 flex items-center gap-4', inspectResult.overallStatus === 'passed' ? 'bg-emerald-900/20 border-emerald-700/40' : 'bg-red-900/20 border-red-700/40')}>
            {inspectResult.overallStatus === 'passed' ? <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" /> : <XCircle className="w-6 h-6 text-red-400 shrink-0" />}
            <div>
              <p className={cn('font-semibold', inspectResult.overallStatus === 'passed' ? 'text-emerald-400' : 'text-red-400')}>Inspection {inspectResult.overallStatus === 'passed' ? 'Passed' : 'Failed'}</p>
              <p className="text-sm text-zinc-400">{inspectResult.passed} of {inspectResult.total} tests passed{inspectResult.failed > 0 && ` · ${inspectResult.failed} failed`}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {order.testGroup && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-zinc-100">Inspection — {order.testGroup.name}</CardTitle></CardHeader>
              <CardContent className="p-0">
                {canInspect && <div className="px-4 pb-3"><Input value={inspectorName} onChange={e => setInspectorName(e.target.value)} placeholder="Inspector name" className="bg-zinc-800 border-zinc-700 text-zinc-100 text-sm h-8 w-48" /></div>}
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-zinc-800"><th className="text-left px-4 py-2 text-xs text-zinc-500 font-medium">Test</th><th className="text-left px-4 py-2 text-xs text-zinc-500 font-medium">Type</th><th className="text-left px-4 py-2 text-xs text-zinc-500 font-medium">Range</th><th className="text-left px-4 py-2 text-xs text-zinc-500 font-medium">Value</th></tr></thead>
                  <tbody>
                    {order.testGroup.tests.map((t) => {
                      const val = testValues[t.name] ?? ''
                      const outOfRange = canInspect && val !== '' && isOutOfRange(t, val)
                      return (
                        <tr key={t.id} className="border-b border-zinc-800/60">
                          <td className="px-4 py-3 text-zinc-200 text-xs font-medium">{t.name}</td>
                          <td className="px-4 py-3 text-zinc-400 text-xs capitalize">{t.testType}</td>
                          <td className="px-4 py-3 text-zinc-400 text-xs">{t.testType === 'boolean' ? 'Pass/Fail' : [t.minValue != null ? `≥${t.minValue}` : null, t.maxValue != null ? `≤${t.maxValue}` : null, t.unit].filter(Boolean).join(' ') || '—'}</td>
                          <td className="px-4 py-3">
                            {canInspect ? (t.testType === 'boolean' ? (
                              <select value={val} onChange={e => setTestValues(prev => ({ ...prev, [t.name]: e.target.value }))} className="bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs h-7 rounded px-2 w-24">
                                <option value="">Select</option><option value="pass">Pass</option><option value="fail">Fail</option>
                              </select>
                            ) : (
                              <Input type="number" value={val} onChange={e => setTestValues(prev => ({ ...prev, [t.name]: e.target.value }))} className={cn('bg-zinc-800 border-zinc-700 text-zinc-100 text-xs h-7 w-24', outOfRange && 'border-red-500 bg-red-900/20')} placeholder="Enter" />
                            )) : <span className="text-zinc-400 text-xs">{val || '—'}</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {canInspect && <div className="p-4"><Button onClick={handleSubmitInspection} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white text-sm"><Send className="w-4 h-4 mr-2" />{submitting ? 'Submitting...' : 'Submit Inspection'}</Button></div>}
              </CardContent>
            </Card>
          )}

          {hasResults && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold text-zinc-100">Inspection Results</CardTitle></CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-zinc-800"><th className="text-left px-4 py-2 text-xs text-zinc-500 font-medium">Test</th><th className="text-left px-4 py-2 text-xs text-zinc-500 font-medium">Value</th><th className="text-left px-4 py-2 text-xs text-zinc-500 font-medium">Range</th><th className="text-left px-4 py-2 text-xs text-zinc-500 font-medium">Result</th></tr></thead>
                  <tbody>
                    {order.results.map((r) => (
                      <tr key={r.id} className="border-b border-zinc-800/60">
                        <td className="px-4 py-3 text-zinc-200 text-xs">{r.testName}</td>
                        <td className="px-4 py-3 text-zinc-300 text-xs font-mono">{r.value ?? '—'}{r.unit ? ` ${r.unit}` : ''}</td>
                        <td className="px-4 py-3 text-zinc-400 text-xs">{r.testType === 'boolean' ? 'Pass/Fail' : [r.minValue != null ? `≥${r.minValue}` : null, r.maxValue != null ? `≤${r.maxValue}` : null].filter(Boolean).join(' ') || '—'}</td>
                        <td className="px-4 py-3">{r.passed ? <Badge variant="success" className="text-xs"><CheckCircle className="w-3 h-3 mr-1" />Pass</Badge> : <Badge variant="destructive" className="text-xs"><XCircle className="w-3 h-3 mr-1" />Fail</Badge>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          <Card className="bg-zinc-900 border-zinc-800 xl:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-zinc-100">Non-Conformances</CardTitle>
              <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 text-xs" onClick={() => setShowNCForm(true)}><Plus className="w-3 h-3 mr-1" /> Create NC</Button>
            </CardHeader>
            <CardContent className="p-0">
              {showNCForm && (
                <div className="px-4 pb-4 border-b border-zinc-800">
                  <form onSubmit={handleCreateNC} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div><label className="text-xs text-zinc-500 block mb-1">Problem Type *</label><select value={ncForm.problemType} onChange={e => setNcForm(f => ({ ...f, problemType: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs h-7 rounded px-2"><option value="defect">Defect</option><option value="damage">Damage</option><option value="contamination">Contamination</option><option value="wrong-spec">Wrong Spec</option><option value="missing-label">Missing Label</option></select></div>
                    <div><label className="text-xs text-zinc-500 block mb-1">Severity</label><select value={ncForm.severity} onChange={e => setNcForm(f => ({ ...f, severity: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs h-7 rounded px-2"><option value="minor">Minor</option><option value="major">Major</option><option value="critical">Critical</option></select></div>
                    <div><label className="text-xs text-zinc-500 block mb-1">Assigned To</label><Input value={ncForm.assignedTo} onChange={e => setNcForm(f => ({ ...f, assignedTo: e.target.value }))} placeholder="Assignee" className="bg-zinc-800 border-zinc-700 text-zinc-100 text-xs h-7" /></div>
                    <div className="col-span-2 md:col-span-4"><label className="text-xs text-zinc-500 block mb-1">Description *</label><Input value={ncForm.description} onChange={e => setNcForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe" required className="bg-zinc-800 border-zinc-700 text-zinc-100 text-xs h-7" /></div>
                    <div className="col-span-2 md:col-span-4 flex justify-end gap-2"><Button type="button" variant="ghost" size="sm" onClick={() => setShowNCForm(false)} className="text-zinc-400 text-xs">Cancel</Button><Button type="submit" size="sm" disabled={savingNC} className="bg-blue-600 hover:bg-blue-700 text-white text-xs">{savingNC ? 'Saving...' : 'Create NC'}</Button></div>
                  </form>
                </div>
              )}
              <table className="w-full text-sm">
                <thead><tr className="border-b border-zinc-800"><th className="text-left px-4 py-2 text-xs text-zinc-500 font-medium">NC#</th><th className="text-left px-4 py-2 text-xs text-zinc-500 font-medium">Problem</th><th className="text-left px-4 py-2 text-xs text-zinc-500 font-medium">Severity</th><th className="text-left px-4 py-2 text-xs text-zinc-500 font-medium">Status</th><th className="px-4 py-2"></th></tr></thead>
                <tbody>
                  {order.nonConformances.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-zinc-600 text-xs">No non-conformances</td></tr>}
                  {order.nonConformances.map((nc) => (
                    <tr key={nc.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/40">
                      <td className="px-4 py-3"><Link href={`/quality/nc/${nc.id}`} className="text-blue-400 hover:text-blue-300 font-mono text-xs">{nc.ncNumber}</Link></td>
                      <td className="px-4 py-3 text-zinc-300 text-xs capitalize">{nc.problemType.replace('-', ' ')}</td>
                      <td className="px-4 py-3"><Badge variant={SEVERITY_VARIANT[nc.severity] ?? 'secondary'} className="text-xs capitalize">{nc.severity}</Badge></td>
                      <td className="px-4 py-3"><Badge variant={nc.status === 'closed' ? 'outline' : 'default'} className="text-xs capitalize">{nc.status}</Badge></td>
                      <td className="px-4 py-3"><Link href={`/quality/nc/${nc.id}`} className="text-zinc-600 hover:text-zinc-300"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg></Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
