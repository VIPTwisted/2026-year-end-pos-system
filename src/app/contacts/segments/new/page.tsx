'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2, Plus, X, Zap, List } from 'lucide-react'
import Link from 'next/link'

type Customer = { id: string; firstName: string; lastName: string; email: string | null }

const CRITERIA_FIELDS = [
  { value: 'totalSpent', label: 'Purchase Amount' },
  { value: 'loyaltyPoints', label: 'Loyalty Points' },
  { value: 'visitCount', label: 'Visit Count' },
  { value: 'city', label: 'City' },
  { value: 'state', label: 'State' },
  { value: 'tags', label: 'Tag' },
]

const OPERATORS = ['=', '>', '<', '>=', '<=', 'contains']

type Criterion = { field: string; operator: string; value: string }

export default function NewSegmentPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Customer[]>([])
  const [form, setForm] = useState({ name: '', description: '', segmentType: 'static' })
  const [criteria, setCriteria] = useState<Criterion[]>([{ field: 'totalSpent', operator: '>', value: '100' }])

  useEffect(() => {
    fetch('/api/customers?limit=200')
      .then(r => r.json())
      .then((d: { customers?: Customer[] } | Customer[]) => {
        const list = Array.isArray(d) ? d : d.customers ?? []
        setCustomers(list)
      })
      .catch(() => {})
  }, [])

  function setField(field: string, val: string) {
    setForm(prev => ({ ...prev, [field]: val }))
  }

  function addCriterion() {
    setCriteria(prev => [...prev, { field: 'totalSpent', operator: '>', value: '' }])
  }

  function removeCriterion(i: number) {
    setCriteria(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateCriterion(i: number, key: keyof Criterion, val: string) {
    setCriteria(prev => prev.map((c, idx) => idx === i ? { ...c, [key]: val } : c))
  }

  const filtered = customers.filter(c =>
    !selected.find(s => s.id === c.id) &&
    (`${c.firstName} ${c.lastName} ${c.email ?? ''}`.toLowerCase().includes(search.toLowerCase()))
  )

  const estimatedCount = form.segmentType === 'static' ? selected.length : Math.floor(customers.length * 0.3)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/contacts/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          segmentType: form.segmentType,
          criteriaJson: form.segmentType === 'dynamic' ? criteria : null,
          customerIds: form.segmentType === 'static' ? selected.map(c => c.id) : [],
        }),
      })
      if (!res.ok) throw new Error('Failed to create segment')
      const seg = await res.json()
      router.push(`/contacts/segments/${seg.id}`)
    } catch {
      setError('Failed to create segment.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar
        title="New Segment"
        breadcrumb={[
          { label: 'Contacts', href: '/crm/contacts' },
          { label: 'Segments', href: '/contacts/segments' },
        ]}
      />
      <main className="flex-1 p-6 bg-[#0f0f1a] min-h-screen">
        <div className="max-w-2xl">
          <Link href="/contacts/segments" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 mb-6">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 space-y-4">
              <h2 className="text-sm font-semibold text-zinc-200">Segment Details</h2>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Segment Name</Label>
                <Input required value={form.name} onChange={e => setField('name', e.target.value)} placeholder="e.g. High-Value Customers" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Description <span className="text-zinc-600">(optional)</span></Label>
                <Input value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Brief description of this segment" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Type</Label>
                <div className="flex gap-3">
                  {[
                    { val: 'static', label: 'Static', desc: 'Manually curated list', Icon: List },
                    { val: 'dynamic', label: 'Dynamic', desc: 'Auto-refreshed by criteria', Icon: Zap },
                  ].map(({ val, label, desc, Icon }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setField('segmentType', val)}
                      className={`flex-1 px-4 py-3 rounded-lg border text-left transition-colors ${
                        form.segmentType === val
                          ? 'border-blue-600 bg-blue-600/10'
                          : 'border-zinc-700 hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-xs font-semibold text-zinc-200">{label}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dynamic criteria builder */}
            {form.segmentType === 'dynamic' && (
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-zinc-200">Filter Criteria</h2>
                  <button type="button" onClick={addCriterion} className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300">
                    <Plus className="w-3.5 h-3.5" /> Add Rule
                  </button>
                </div>
                <div className="space-y-2">
                  {criteria.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select
                        className="flex-1 h-8 rounded border border-zinc-700 bg-zinc-900 text-zinc-200 text-xs px-2"
                        value={c.field}
                        onChange={e => updateCriterion(i, 'field', e.target.value)}
                      >
                        {CRITERIA_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                      </select>
                      <select
                        className="w-28 h-8 rounded border border-zinc-700 bg-zinc-900 text-zinc-200 text-xs px-2"
                        value={c.operator}
                        onChange={e => updateCriterion(i, 'operator', e.target.value)}
                      >
                        {OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
                      </select>
                      <Input
                        className="flex-1 h-8 text-xs"
                        value={c.value}
                        onChange={e => updateCriterion(i, 'value', e.target.value)}
                        placeholder="Value"
                      />
                      <button type="button" onClick={() => removeCriterion(i)} className="text-zinc-600 hover:text-red-400 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Static member search */}
            {form.segmentType === 'static' && (
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 space-y-4">
                <h2 className="text-sm font-semibold text-zinc-200">Add Customers</h2>
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="text-xs"
                />
                {/* Results */}
                {search.length > 1 && filtered.length > 0 && (
                  <div className="border border-zinc-700 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                    {filtered.slice(0, 20).map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setSelected(prev => [...prev, c]); setSearch('') }}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 text-left border-b border-zinc-800/50 last:border-0 transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center text-[10px] text-blue-400 font-semibold shrink-0">
                          {c.firstName[0]}{c.lastName[0]}
                        </div>
                        <div>
                          <p className="text-xs text-zinc-200">{c.firstName} {c.lastName}</p>
                          <p className="text-[11px] text-zinc-500">{c.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {/* Selected */}
                {selected.length > 0 && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-2">{selected.length} selected</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.map(c => (
                        <span key={c.id} className="inline-flex items-center gap-1.5 bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full text-xs">
                          {c.firstName} {c.lastName}
                          <button type="button" onClick={() => setSelected(prev => prev.filter(s => s.id !== c.id))}>
                            <X className="w-3 h-3 text-zinc-500 hover:text-red-400" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Preview */}
            <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-lg px-4 py-3 flex items-center justify-between">
              <p className="text-xs text-zinc-400">Estimated members</p>
              <p className="text-sm font-bold text-zinc-200">{estimatedCount.toLocaleString()}</p>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <div className="flex gap-3">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                {saving ? 'Creating...' : 'Create Segment'}
              </Button>
              <Link href="/contacts/segments">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
