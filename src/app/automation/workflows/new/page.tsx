'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShoppingCart, Truck, CreditCard, Package, UserPlus, Star,
  HeadphonesIcon, CheckCircle, Clock, Calendar, ChevronRight,
  ChevronLeft, Plus, Trash2, ArrowUp, ArrowDown
} from 'lucide-react'

const TRIGGERS = [
  { value: 'order-created', label: 'Order Created', icon: ShoppingCart, desc: 'Fires when a new order is placed in the system' },
  { value: 'order-shipped', label: 'Order Shipped', icon: Truck, desc: 'Fires when an order shipment is confirmed' },
  { value: 'payment-received', label: 'Payment Received', icon: CreditCard, desc: 'Fires when a payment is successfully processed' },
  { value: 'inventory-low', label: 'Inventory Low', icon: Package, desc: 'Fires when stock falls below reorder point' },
  { value: 'customer-created', label: 'Customer Created', icon: UserPlus, desc: 'Fires when a new customer account is created' },
  { value: 'loyalty-tier-change', label: 'Loyalty Tier Changed', icon: Star, desc: 'Fires when customer loyalty tier changes' },
  { value: 'case-created', label: 'Case Created', icon: HeadphonesIcon, desc: 'Fires when a new support case is opened' },
  { value: 'case-resolved', label: 'Case Resolved', icon: CheckCircle, desc: 'Fires when a support case is marked resolved' },
  { value: 'shift-started', label: 'Shift Started', icon: Clock, desc: 'Fires when an employee clocks in for a shift' },
  { value: 'shift-ended', label: 'Shift Ended', icon: Clock, desc: 'Fires when an employee clocks out of a shift' },
  { value: 'daily-schedule', label: 'Daily Schedule', icon: Calendar, desc: 'Fires once per day at configured time' },
  { value: 'weekly-schedule', label: 'Weekly Schedule', icon: Calendar, desc: 'Fires once per week on configured day' },
]

const TRIGGER_FIELDS: Record<string, string[]> = {
  'order-created': ['order.total', 'order.itemCount', 'order.customerId', 'order.paymentMethod'],
  'order-shipped': ['shipment.carrier', 'shipment.trackingNumber', 'order.total'],
  'payment-received': ['payment.amount', 'payment.method', 'payment.status'],
  'inventory-low': ['product.stock', 'product.sku', 'product.reorderPoint', 'product.category'],
  'customer-created': ['customer.email', 'customer.tier', 'customer.source'],
  'loyalty-tier-change': ['customer.oldTier', 'customer.newTier', 'customer.points'],
  'case-created': ['case.priority', 'case.category', 'case.subject'],
  'case-resolved': ['case.priority', 'case.agentId', 'case.resolutionTime'],
  'shift-started': ['employee.department', 'employee.position', 'shift.storeId'],
  'shift-ended': ['employee.department', 'shift.hoursWorked'],
  'daily-schedule': [],
  'weekly-schedule': [],
}

const OPERATORS = ['equals', 'not-equals', 'greater-than', 'less-than', 'contains', 'is-empty', 'is-not-empty']
const ACTION_TYPES = ['send-email', 'send-sms', 'create-task', 'update-record', 'create-case', 'send-webhook', 'notify-team', 'add-loyalty-points', 'apply-discount', 'flag-for-review']

interface Condition { field: string; operator: string; value: string }
interface Action { actionType: string; config: Record<string, string>; position: number }

function ActionConfigFields({ actionType, config, onChange }: { actionType: string; config: Record<string, string>; onChange: (k: string, v: string) => void }) {
  const field = (key: string, label: string, placeholder = '') => (
    <div key={key}>
      <label className="block text-xs text-zinc-400 mb-1">{label}</label>
      <input value={config[key] ?? ''} onChange={e => onChange(key, e.target.value)} placeholder={placeholder} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
    </div>
  )
  const sel = (key: string, label: string, options: string[]) => (
    <div key={key}>
      <label className="block text-xs text-zinc-400 mb-1">{label}</label>
      <select value={config[key] ?? options[0]} onChange={e => onChange(key, e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
  switch (actionType) {
    case 'send-email': return <div className="grid grid-cols-2 gap-2 mt-2">{field('to', 'To', '{{customer.email}}')}{field('subject', 'Subject', 'Your order is ready')}{field('templateName', 'Template', 'order-confirmation')}</div>
    case 'send-sms': return <div className="grid grid-cols-2 gap-2 mt-2">{field('to', 'To', '{{customer.phone}}')}{field('message', 'Message', 'Your order has shipped!')}</div>
    case 'create-task': return <div className="grid grid-cols-2 gap-2 mt-2">{field('taskName', 'Task Name', 'Follow up on order')}{field('assignedTo', 'Assign To', 'manager@store.com')}{field('dueInDays', 'Due In (days)', '3')}</div>
    case 'update-record': return <div className="grid grid-cols-3 gap-2 mt-2">{field('entity', 'Entity', 'order')}{field('field', 'Field', 'status')}{field('value', 'Value', 'processing')}</div>
    case 'create-case': return <div className="grid grid-cols-2 gap-2 mt-2">{field('subject', 'Subject', 'Auto-generated case')}{sel('category', 'Category', ['billing', 'shipping', 'product', 'general'])}{sel('priority', 'Priority', ['low', 'normal', 'high', 'critical'])}{field('assignedTo', 'Assign To', 'support@store.com')}</div>
    case 'send-webhook': return <div className="grid grid-cols-2 gap-2 mt-2">{field('url', 'URL', 'https://hooks.example.com/')}{sel('method', 'Method', ['POST', 'GET', 'PUT'])}{field('body', 'Body (JSON)', '{"event": "{{trigger}}"}')}</div>
    case 'notify-team': return <div className="grid grid-cols-2 gap-2 mt-2">{field('team', 'Team', 'sales')}{field('message', 'Message', 'Attention: {{trigger}}')}{sel('priority', 'Priority', ['normal', 'high', 'critical'])}</div>
    case 'add-loyalty-points': return <div className="grid grid-cols-2 gap-2 mt-2">{field('points', 'Points', '100')}{field('reason', 'Reason', 'Loyalty bonus')}</div>
    case 'apply-discount': return <div className="grid grid-cols-3 gap-2 mt-2">{field('code', 'Code', 'AUTO10')}{field('amount', 'Amount ($)', '10')}{field('pct', 'Percent (%)', '10')}</div>
    case 'flag-for-review': return <div className="mt-2">{field('reason', 'Reason', 'Requires manual review')}</div>
    default: return null
  }
}

export default function NewWorkflowPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [trigger, setTrigger] = useState('')
  const [conditions, setConditions] = useState<Condition[]>([])
  const [conditionLogic, setConditionLogic] = useState<'AND' | 'OR'>('AND')
  const [actions, setActions] = useState<Action[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function addCondition() {
    const fields = trigger ? (TRIGGER_FIELDS[trigger] ?? []) : []
    setConditions(prev => [...prev, { field: fields[0] ?? '', operator: 'equals', value: '' }])
  }

  function updateCondition(i: number, key: keyof Condition, val: string) {
    setConditions(prev => prev.map((c, idx) => idx === i ? { ...c, [key]: val } : c))
  }

  function addAction() {
    setActions(prev => [...prev, { actionType: 'send-email', config: {}, position: prev.length }])
  }

  function updateActionConfig(i: number, k: string, v: string) {
    setActions(prev => prev.map((a, idx) => idx === i ? { ...a, config: { ...a.config, [k]: v } } : a))
  }

  function moveAction(i: number, dir: 'up' | 'down') {
    const next = [...actions]
    const swap = dir === 'up' ? i - 1 : i + 1
    if (swap < 0 || swap >= next.length) return;
    [next[i], next[swap]] = [next[swap], next[i]]
    setActions(next.map((a, idx) => ({ ...a, position: idx })))
  }

  function removeAction(i: number) {
    setActions(prev => prev.filter((_, idx) => idx !== i).map((a, idx) => ({ ...a, position: idx })))
  }

  async function save() {
    if (!name.trim()) { setError('Workflow name is required'); return }
    if (!trigger) { setError('Please select a trigger'); return }
    setSaving(true); setError('')
    const res = await fetch('/api/automation/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, trigger, conditions, actions }),
    })
    if (!res.ok) { setError('Failed to save workflow'); setSaving(false); return }
    router.push('/automation/workflows')
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">New Workflow</h1>
        <p className="text-sm text-zinc-400 mt-0.5">Build a trigger-action automation</p>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === s ? 'bg-blue-600 text-white' : s < step ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
              {s < step ? <CheckCircle className="w-4 h-4" /> : s}
            </div>
            <span className={`text-sm ${step === s ? 'text-zinc-100 font-medium' : 'text-zinc-500'}`}>{s === 1 ? 'Trigger' : s === 2 ? 'Conditions' : 'Actions'}</span>
            {s < 3 && <ChevronRight className="w-4 h-4 text-zinc-700" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Workflow Name <span className="text-red-400">*</span></label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Notify team on large orders" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
          <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
        </div>
      </div>

      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Select a Trigger Event</h2>
          <div className="grid grid-cols-2 gap-3">
            {TRIGGERS.map(t => {
              const Icon = t.icon
              const selected = trigger === t.value
              return (
                <button key={t.value} onClick={() => setTrigger(t.value)} className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${selected ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${selected ? 'bg-blue-500/20' : 'bg-zinc-800'}`}>
                    <Icon className={`w-4 h-4 ${selected ? 'text-blue-400' : 'text-zinc-400'}`} />
                  </div>
                  <div>
                    <div className={`font-medium text-sm ${selected ? 'text-blue-300' : 'text-zinc-200'}`}>{t.label}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{t.desc}</div>
                  </div>
                </button>
              )
            })}
          </div>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          <div className="mt-6 flex justify-end">
            <button onClick={() => { if (!trigger) { setError('Please select a trigger'); return }; setError(''); setStep(2) }} className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
              Next: Conditions <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Conditions <span className="text-zinc-500 text-sm font-normal ml-2">(optional)</span></h2>
              <p className="text-xs text-zinc-500 mt-0.5">No conditions = workflow always runs on trigger</p>
            </div>
            {conditions.length > 1 && (
              <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                {(['AND', 'OR'] as const).map(l => (
                  <button key={l} onClick={() => setConditionLogic(l)} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${conditionLogic === l ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-100'}`}>{l}</button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-3">
            {conditions.map((cond, i) => {
              const fields = TRIGGER_FIELDS[trigger] ?? []
              return (
                <div key={i} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                  {i > 0 && <span className="text-xs text-zinc-500 font-medium w-8 shrink-0">{conditionLogic}</span>}
                  <select value={cond.field} onChange={e => updateCondition(i, 'field', e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                    {fields.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <select value={cond.operator} onChange={e => updateCondition(i, 'operator', e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                    {OPERATORS.map(op => <option key={op} value={op}>{op.replace('-', ' ')}</option>)}
                  </select>
                  {!['is-empty', 'is-not-empty'].includes(cond.operator) && (
                    <input value={cond.value} onChange={e => updateCondition(i, 'value', e.target.value)} placeholder="value" className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
                  )}
                  <button onClick={() => setConditions(prev => prev.filter((_, idx) => idx !== i))} className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              )
            })}
          </div>
          <button onClick={addCondition} className="mt-3 flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"><Plus className="w-4 h-4" /> Add Condition</button>
          <div className="mt-6 flex items-center justify-between">
            <button onClick={() => setStep(1)} className="flex items-center gap-1.5 px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-zinc-100 rounded-lg text-sm transition-colors"><ChevronLeft className="w-4 h-4" /> Back</button>
            <button onClick={() => { setError(''); setStep(3) }} className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">Next: Actions <ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Actions</h2>
          <div className="space-y-3">
            {actions.map((action, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveAction(i, 'up')} disabled={i === 0} className="p-0.5 text-zinc-600 hover:text-zinc-300 disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={() => moveAction(i, 'down')} disabled={i === actions.length - 1} className="p-0.5 text-zinc-600 hover:text-zinc-300 disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">{i + 1}</div>
                  <select value={action.actionType} onChange={e => setActions(prev => prev.map((a, idx) => idx === i ? { ...a, actionType: e.target.value, config: {} } : a))} className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                    {ACTION_TYPES.map(t => <option key={t} value={t}>{t.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                  </select>
                  <button onClick={() => removeAction(i)} className="ml-auto p-1.5 text-zinc-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
                <ActionConfigFields actionType={action.actionType} config={action.config} onChange={(k, v) => updateActionConfig(i, k, v)} />
              </div>
            ))}
          </div>
          <button onClick={addAction} className="mt-3 flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"><Plus className="w-4 h-4" /> Add Action</button>
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          <div className="mt-6 flex items-center justify-between">
            <button onClick={() => setStep(2)} className="flex items-center gap-1.5 px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-zinc-100 rounded-lg text-sm transition-colors"><ChevronLeft className="w-4 h-4" /> Back</button>
            <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">{saving ? 'Saving...' : 'Save Workflow'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
