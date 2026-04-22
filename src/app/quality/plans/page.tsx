'use client'
import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, X, FileSearch, Pencil, Trash2, Check } from 'lucide-react'

type TestGroup = { id: string; name: string }
type InspectionPlan = {
  id: string
  name: string
  referenceType: string
  productFilter: string | null
  vendorFilter: string | null
  samplingMethod: string
  sampleSize: number
  samplePct: number | null
  testGroupId: string | null
  autoCreate: boolean
  isActive: boolean
  createdAt: string
}

const emptyForm = {
  name: '', referenceType: 'purchase', productFilter: '', vendorFilter: '',
  samplingMethod: 'fixed', sampleSize: '5', samplePct: '', testGroupId: '',
  autoCreate: true, isActive: true,
}

export default function InspectionPlansPage() {
  const [plans, setPlans] = useState<InspectionPlan[]>([])
  const [testGroups, setTestGroups] = useState<TestGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })

  const load = useCallback(async () => {
    setLoading(true)
    const [plansRes, groupsRes] = await Promise.all([
      fetch('/api/quality/plans'),
      fetch('/api/quality/test-groups'),
    ])
    setPlans(await plansRes.json())
    setTestGroups(await groupsRes.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function startEdit(plan: InspectionPlan) {
    setEditingId(plan.id)
    setForm({
      name: plan.name,
      referenceType: plan.referenceType,
      productFilter: plan.productFilter ?? '',
      vendorFilter: plan.vendorFilter ?? '',
      samplingMethod: plan.samplingMethod,
      sampleSize: String(plan.sampleSize),
      samplePct: plan.samplePct ? String(plan.samplePct) : '',
      testGroupId: plan.testGroupId ?? '',
      autoCreate: plan.autoCreate,
      isActive: plan.isActive,
    })
    setShowForm(true)
  }

  function resetForm() {
    setForm({ ...emptyForm })
    setEditingId(null)
    setShowForm(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      name: form.name,
      referenceType: form.referenceType,
      productFilter: form.productFilter || null,
      vendorFilter: form.vendorFilter || null,
      samplingMethod: form.samplingMethod,
      sampleSize: parseInt(form.sampleSize) || 5,
      samplePct: form.samplePct ? parseFloat(form.samplePct) : null,
      testGroupId: form.testGroupId || null,
      autoCreate: form.autoCreate,
      isActive: form.isActive,
    }

    if (editingId) {
      await fetch(`/api/quality/plans/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch('/api/quality/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }

    resetForm()
    load()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this inspection plan?')) return
    await fetch(`/api/quality/plans/${id}`, { method: 'DELETE' })
    load()
  }

  async function toggleActive(plan: InspectionPlan) {
    await fetch(`/api/quality/plans/${plan.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !plan.isActive }),
    })
    load()
  }

  const groupName = (id: string | null) => testGroups.find(g => g.id === id)?.name ?? '—'

  return (
    <>
      <TopBar title="Inspection Plans" />
      <main className="flex-1 p-6 overflow-auto">

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-zinc-500">{plans.length} inspection plan{plans.length !== 1 ? 's' : ''}</p>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => { resetForm(); setShowForm(true) }}>
            <Plus className="w-4 h-4 mr-1" /> New Plan
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="bg-zinc-900 border-zinc-700 mb-6">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-zinc-100">{editingId ? 'Edit Plan' : 'New Inspection Plan'}</h3>
                <button onClick={resetForm} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs text-zinc-500 block mb-1">Plan Name *</label>
                  <Input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Incoming Receiving QC"
                    required
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 text-sm h-8"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Reference Type *</label>
                  <select
                    value={form.referenceType}
                    onChange={e => setForm(f => ({ ...f, referenceType: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm h-8 rounded-md px-2"
                  >
                    <option value="purchase">Purchase</option>
                    <option value="production">Production</option>
                    <option value="receiving">Receiving</option>
                    <option value="inventory">Inventory</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Product Filter</label>
                  <Input
                    value={form.productFilter}
                    onChange={e => setForm(f => ({ ...f, productFilter: e.target.value }))}
                    placeholder="all or pattern"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 text-sm h-8"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Vendor Filter</label>
                  <Input
                    value={form.vendorFilter}
                    onChange={e => setForm(f => ({ ...f, vendorFilter: e.target.value }))}
                    placeholder="Vendor name pattern"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 text-sm h-8"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Sampling Method</label>
                  <select
                    value={form.samplingMethod}
                    onChange={e => setForm(f => ({ ...f, samplingMethod: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm h-8 rounded-md px-2"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="percentage">Percentage</option>
                    <option value="ansi">ANSI/ASQ</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Sample Size</label>
                  <Input
                    type="number"
                    value={form.sampleSize}
                    onChange={e => setForm(f => ({ ...f, sampleSize: e.target.value }))}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 text-sm h-8"
                  />
                </div>
                {form.samplingMethod === 'percentage' && (
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1">Sample %</label>
                    <Input
                      type="number"
                      value={form.samplePct}
                      onChange={e => setForm(f => ({ ...f, samplePct: e.target.value }))}
                      placeholder="e.g. 10"
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 text-sm h-8"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs text-zinc-500 block mb-1">Test Group</label>
                  <select
                    value={form.testGroupId}
                    onChange={e => setForm(f => ({ ...f, testGroupId: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm h-8 rounded-md px-2"
                  >
                    <option value="">— None —</option>
                    {testGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-4 col-span-2 md:col-span-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.autoCreate}
                      onChange={e => setForm(f => ({ ...f, autoCreate: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-xs text-zinc-400">Auto-create quality orders</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-xs text-zinc-400">Active</span>
                  </label>
                </div>
                <div className="col-span-2 md:col-span-3 flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={resetForm} className="text-zinc-400">Cancel</Button>
                  <Button type="submit" size="sm" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {saving ? 'Saving...' : editingId ? 'Update Plan' : 'Create Plan'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Plan Name</th>
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Reference</th>
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Product Filter</th>
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Sampling</th>
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Sample Size</th>
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Test Group</th>
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Auto-Create</th>
                  <th className="text-left px-4 py-3 text-xs text-zinc-500 font-medium">Active</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-zinc-600 text-sm">Loading...</td></tr>
                )}
                {!loading && plans.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-zinc-600 text-sm">
                      <FileSearch className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                      No inspection plans yet
                    </td>
                  </tr>
                )}
                {plans.map(plan => (
                  <tr key={plan.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3 text-zinc-200 text-sm font-medium">{plan.name}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs capitalize">{plan.referenceType}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{plan.productFilter ?? 'all'}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs capitalize">{plan.samplingMethod}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">
                      {plan.samplingMethod === 'percentage' ? `${plan.samplePct ?? plan.sampleSize}%` : plan.sampleSize}
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{groupName(plan.testGroupId)}</td>
                    <td className="px-4 py-3">
                      {plan.autoCreate
                        ? <Check className="w-4 h-4 text-emerald-400" />
                        : <span className="text-zinc-600 text-xs">—</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(plan)}>
                        <Badge
                          variant={plan.isActive ? 'success' : 'secondary'}
                          className="text-xs cursor-pointer hover:opacity-80"
                        >
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          className="text-zinc-500 hover:text-blue-400 transition-colors"
                          onClick={() => startEdit(plan)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="text-zinc-500 hover:text-red-400 transition-colors"
                          onClick={() => handleDelete(plan.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
