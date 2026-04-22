'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { GitBranch, Plus, Trash2, GripVertical, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEP_TYPES = [
  { value: 'route_to_warehouse', label: 'Route to Warehouse' },
  { value: 'check_inventory', label: 'Check Inventory' },
  { value: 'reserve_inventory', label: 'Reserve Inventory' },
  { value: 'assign_carrier', label: 'Assign Carrier' },
  { value: 'send_notification', label: 'Send Notification' },
  { value: 'split_order', label: 'Split Order' },
  { value: 'wait', label: 'Wait' },
  { value: 'custom', label: 'Custom' },
]

const TRIGGER_OPTIONS = [
  { value: 'order_created', label: 'Order Created' },
  { value: 'order_updated', label: 'Order Updated' },
  { value: 'inventory_low', label: 'Inventory Low' },
  { value: 'manual', label: 'Manual' },
]

const CONDITION_FIELDS = ['order_value', 'order_priority', 'customer_tier', 'inventory_qty', 'shipping_zone']
const OPERATORS = ['equals', 'not_equals', 'greater_than', 'less_than', 'contains']

interface Step {
  id: string
  type: string
  label: string
}

interface Condition {
  id: string
  field: string
  operator: string
  value: string
}

export default function NewFlowPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [triggerType, setTriggerType] = useState('order_created')
  const [steps, setSteps] = useState<Step[]>([
    { id: '1', type: 'check_inventory', label: 'Check Inventory' },
    { id: '2', type: 'reserve_inventory', label: 'Reserve Inventory' },
    { id: '3', type: 'assign_carrier', label: 'Assign Carrier' },
  ])
  const [conditions, setConditions] = useState<Condition[]>([
    { id: '1', field: 'order_value', operator: 'greater_than', value: '100' },
  ])

  function addStep() {
    const id = Date.now().toString()
    setSteps((prev) => [...prev, { id, type: 'custom', label: 'Custom Step' }])
  }

  function removeStep(id: string) {
    setSteps((prev) => prev.filter((s) => s.id !== id))
  }

  function updateStep(id: string, field: keyof Step, val: string) {
    setSteps((prev) => prev.map((s) => {
      if (s.id !== id) return s
      if (field === 'type') {
        const found = STEP_TYPES.find(t => t.value === val)
        return { ...s, type: val, label: found?.label ?? val }
      }
      return { ...s, [field]: val }
    }))
  }

  function addCondition() {
    const id = Date.now().toString()
    setConditions((prev) => [...prev, { id, field: 'order_value', operator: 'equals', value: '' }])
  }

  function removeCondition(id: string) {
    setConditions((prev) => prev.filter((c) => c.id !== id))
  }

  function updateCondition(id: string, field: keyof Condition, val: string) {
    setConditions((prev) => prev.map((c) => c.id === id ? { ...c, [field]: val } : c))
  }

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/iom/flow-designer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, description, triggerType,
          stepsJson: steps,
          conditionsJson: conditions,
        }),
      })
      if (res.ok) {
        const flow = await res.json()
        router.push(`/iom/flow-designer/${flow.id}`)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="New Flow"
        breadcrumb={[
          { label: 'IOM', href: '/iom' },
          { label: 'Flow Designer', href: '/iom/flow-designer' },
        ]}
        actions={
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
          >
            {saving ? 'Saving…' : 'Save Flow'}
          </button>
        }
      />

      <div className="p-6 max-w-4xl space-y-6">
        {/* Basic Info */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-blue-400" /> Flow Details
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Flow Name <span className="text-red-400">*</span></label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Standard Order Routing"
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Trigger Type</label>
              <div className="relative">
                <select
                  value={triggerType}
                  onChange={(e) => setTriggerType(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 appearance-none"
                >
                  {TRIGGER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>
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

        {/* Steps Builder */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300">Flow Steps</h2>
            <button onClick={addStep} className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Step
            </button>
          </div>

          <div className="space-y-2">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-700/50 rounded-lg px-3 py-2.5">
                <GripVertical className="w-4 h-4 text-zinc-600 shrink-0 cursor-grab" />
                <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 text-[11px] font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div className="relative flex-1">
                  <select
                    value={step.type}
                    onChange={(e) => updateStep(step.id, 'type', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 appearance-none"
                  >
                    {STEP_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                </div>
                <input
                  value={step.label}
                  onChange={(e) => updateStep(step.id, 'label', e.target.value)}
                  placeholder="Step label"
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                />
                <button onClick={() => removeStep(step.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {steps.length === 0 && (
              <div className="py-6 text-center text-sm text-zinc-600">No steps — add one above</div>
            )}
          </div>
        </div>

        {/* Conditions Builder */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300">Conditions (IF / THEN)</h2>
            <button onClick={addCondition} className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Condition
            </button>
          </div>

          <div className="space-y-2">
            {conditions.map((cond, idx) => (
              <div key={cond.id} className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-700/50 rounded-lg px-3 py-2.5">
                {idx === 0 ? (
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase w-8 shrink-0">IF</span>
                ) : (
                  <span className="text-[11px] font-semibold text-amber-500 uppercase w-8 shrink-0">AND</span>
                )}
                <div className="relative flex-1">
                  <select
                    value={cond.field}
                    onChange={(e) => updateCondition(cond.id, 'field', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 appearance-none"
                  >
                    {CONDITION_FIELDS.map((f) => (
                      <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                </div>
                <div className="relative flex-1">
                  <select
                    value={cond.operator}
                    onChange={(e) => updateCondition(cond.id, 'operator', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 appearance-none"
                  >
                    {OPERATORS.map((op) => (
                      <option key={op} value={op}>{op.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                </div>
                <input
                  value={cond.value}
                  onChange={(e) => updateCondition(cond.id, 'value', e.target.value)}
                  placeholder="Value"
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                />
                <button onClick={() => removeCondition(cond.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {conditions.length === 0 && (
              <div className="py-4 text-center text-sm text-zinc-600">No conditions — flow will run on all triggers</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
