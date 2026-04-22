'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { SlidersHorizontal, Plus, Trash2, ChevronDown } from 'lucide-react'

const RULE_TYPES = [
  { value: 'cost', label: 'Cost Optimization' },
  { value: 'distance', label: 'Distance / Proximity' },
  { value: 'priority', label: 'Order Priority' },
  { value: 'inventory', label: 'Inventory Level' },
  { value: 'custom', label: 'Custom' },
]

const CONDITION_FIELDS = [
  { value: 'ship_from', label: 'Ship From (Warehouse)' },
  { value: 'inventory_threshold', label: 'Inventory Threshold' },
  { value: 'distance_radius', label: 'Distance Radius (miles)' },
  { value: 'cost_ceiling', label: 'Cost Ceiling ($)' },
  { value: 'order_priority', label: 'Order Priority' },
  { value: 'carrier', label: 'Carrier' },
]

const ACTIONS = [
  { value: 'prefer_warehouse', label: 'Prefer Warehouse' },
  { value: 'split_order', label: 'Split Order' },
  { value: 'hold', label: 'Hold Order' },
  { value: 'notify', label: 'Notify Team' },
  { value: 'escalate', label: 'Escalate Priority' },
]

const OPERATORS = ['equals', 'not_equals', 'greater_than', 'less_than', 'within']

interface Condition {
  id: string
  field: string
  operator: string
  value: string
}

interface Action {
  id: string
  action: string
  value: string
}

export default function NewFulfillmentRulePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [ruleType, setRuleType] = useState('cost')
  const [priority, setPriority] = useState('1')
  const [description, setDescription] = useState('')
  const [conditions, setConditions] = useState<Condition[]>([
    { id: '1', field: 'cost_ceiling', operator: 'less_than', value: '50' },
  ])
  const [actions, setActions] = useState<Action[]>([
    { id: '1', action: 'prefer_warehouse', value: '' },
  ])

  function addCondition() {
    const id = Date.now().toString()
    setConditions((p) => [...p, { id, field: 'inventory_threshold', operator: 'greater_than', value: '' }])
  }

  function removeCondition(id: string) {
    setConditions((p) => p.filter((c) => c.id !== id))
  }

  function updateCondition(id: string, field: keyof Condition, val: string) {
    setConditions((p) => p.map((c) => c.id === id ? { ...c, [field]: val } : c))
  }

  function addAction() {
    const id = Date.now().toString()
    setActions((p) => [...p, { id, action: 'notify', value: '' }])
  }

  function removeAction(id: string) {
    setActions((p) => p.filter((a) => a.id !== id))
  }

  function updateAction(id: string, field: keyof Action, val: string) {
    setActions((p) => p.map((a) => a.id === id ? { ...a, [field]: val } : a))
  }

  async function handleSave() {
    if (!name.trim() || !ruleType) return
    setSaving(true)
    try {
      const res = await fetch('/api/iom/fulfillment-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, ruleType, description,
          priority: parseInt(priority) || 1,
          conditionsJson: conditions,
          actionsJson: actions,
        }),
      })
      if (res.ok) router.push('/iom/fulfillment-optimization')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="New Fulfillment Rule"
        breadcrumb={[
          { label: 'IOM', href: '/iom' },
          { label: 'Fulfillment Optimization', href: '/iom/fulfillment-optimization' },
        ]}
        actions={
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
          >
            {saving ? 'Saving…' : 'Save Rule'}
          </button>
        }
      />

      <div className="p-6 max-w-3xl space-y-5">
        {/* Basic Info */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-400" /> Rule Details
          </h2>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 space-y-1">
              <label className="text-xs text-zinc-500">Rule Name <span className="text-red-400">*</span></label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Minimize Shipping Cost"
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Rule Type <span className="text-red-400">*</span></label>
              <div className="relative">
                <select
                  value={ruleType}
                  onChange={(e) => setRuleType(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 appearance-none"
                >
                  {RULE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Priority (lower = higher priority)</label>
              <input
                type="number"
                min="1"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-500">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Optional description…"
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Conditions */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300">When (Conditions)</h2>
            <button onClick={addCondition} className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          <div className="space-y-2">
            {conditions.map((c, idx) => (
              <div key={c.id} className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-700/50 rounded-lg px-3 py-2.5">
                <span className={`text-[11px] font-semibold uppercase w-8 ${idx === 0 ? 'text-zinc-500' : 'text-amber-500'}`}>
                  {idx === 0 ? 'IF' : 'AND'}
                </span>
                <div className="relative flex-1">
                  <select value={c.field} onChange={(e) => updateCondition(c.id, 'field', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 appearance-none">
                    {CONDITION_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                </div>
                <div className="relative">
                  <select value={c.operator} onChange={(e) => updateCondition(c.id, 'operator', e.target.value)}
                    className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 appearance-none pr-7">
                    {OPERATORS.map(op => <option key={op} value={op}>{op.replace(/_/g, ' ')}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                </div>
                <input value={c.value} onChange={(e) => updateCondition(c.id, 'value', e.target.value)}
                  placeholder="Value"
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
                <button onClick={() => removeCondition(c.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300">Then (Actions)</h2>
            <button onClick={addAction} className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
          <div className="space-y-2">
            {actions.map((a) => (
              <div key={a.id} className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-700/50 rounded-lg px-3 py-2.5">
                <span className="text-[11px] font-semibold uppercase text-blue-400 w-10">THEN</span>
                <div className="relative flex-1">
                  <select value={a.action} onChange={(e) => updateAction(a.id, 'action', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 appearance-none">
                    {ACTIONS.map(ac => <option key={ac.value} value={ac.value}>{ac.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                </div>
                <input value={a.value} onChange={(e) => updateAction(a.id, 'value', e.target.value)}
                  placeholder="Parameter (optional)"
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
                <button onClick={() => removeAction(a.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
