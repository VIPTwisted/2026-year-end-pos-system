'use client'
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, CheckCircle, XCircle, BookOpen } from 'lucide-react'

interface BusinessRule {
  id: string; name: string; entity: string; ruleType: string; conditions: string
  action: string; priority: number; isActive: boolean; createdAt: string
}
type EntityFilter = 'all' | 'order' | 'customer' | 'product' | 'case' | 'employee'
const ENTITIES: EntityFilter[] = ['all', 'order', 'customer', 'product', 'case', 'employee']
const RULE_TYPES = ['validation', 'calculation', 'visibility', 'default-value']
const OPERATORS = ['equals', 'not-equals', 'greater-than', 'less-than', 'contains', 'is-empty', 'is-not-empty']
const TYPE_COLORS: Record<string, string> = {
  'validation': 'bg-red-500/15 text-red-400', 'calculation': 'bg-blue-500/15 text-blue-400',
  'visibility': 'bg-amber-500/15 text-amber-400', 'default-value': 'bg-violet-500/15 text-violet-400',
}
const ENTITY_FIELDS: Record<string, string[]> = {
  order: ['order.total', 'order.status', 'order.itemCount', 'order.paymentMethod'],
  customer: ['customer.tier', 'customer.totalSpent', 'customer.visitCount', 'customer.email'],
  product: ['product.stock', 'product.price', 'product.category', 'product.sku'],
  case: ['case.priority', 'case.status', 'case.category', 'case.agentId'],
  employee: ['employee.department', 'employee.position', 'employee.hourlyRate'],
}
interface Condition { field: string; operator: string; value: string }
const emptyForm = () => ({ name: '', entity: 'order', ruleType: 'validation', priority: 0, isActive: true, conditions: [] as Condition[], action: '{}' })

export default function BusinessRulesPage() {
  const [rules, setRules] = useState<BusinessRule[]>([])
  const [entity, setEntity] = useState<EntityFilter>('all')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadRules() }, [entity])

  async function loadRules() {
    setLoading(true)
    const res = await fetch(`/api/automation/rules?entity=${entity}`)
    setRules(await res.json())
    setLoading(false)
  }

  async function saveRule() {
    setSaving(true)
    const url = editing ? `/api/automation/rules/${editing}` : '/api/automation/rules'
    let action: unknown = {}
    try { action = JSON.parse(form.action) } catch {}
    await fetch(url, { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, action }) })
    await loadRules()
    setShowForm(false); setEditing(null); setForm(emptyForm()); setSaving(false)
  }

  async function deleteRule(id: string) {
    if (!confirm('Delete this rule?')) return
    await fetch(`/api/automation/rules/${id}`, { method: 'DELETE' })
    setRules(prev => prev.filter(r => r.id !== id))
  }

  async function toggleRule(id: string, current: boolean) {
    await fetch(`/api/automation/rules/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !current }) })
    setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !current } : r))
  }

  function startEdit(rule: BusinessRule) {
    let conds: Condition[] = []
    try { conds = JSON.parse(rule.conditions) } catch {}
    setForm({ name: rule.name, entity: rule.entity, ruleType: rule.ruleType, priority: rule.priority, isActive: rule.isActive, conditions: conds, action: rule.action })
    setEditing(rule.id); setShowForm(true)
  }

  function addCondition() {
    const fields = ENTITY_FIELDS[form.entity] ?? []
    setForm(prev => ({ ...prev, conditions: [...prev.conditions, { field: fields[0] ?? '', operator: 'equals', value: '' }] }))
  }

  function updateCondition(i: number, key: keyof Condition, val: string) {
    setForm(prev => ({ ...prev, conditions: prev.conditions.map((c, idx) => idx === i ? { ...c, [key]: val } : c) }))
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2"><BookOpen className="w-6 h-6 text-blue-400" />Business Rules</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Validation, calculation, and visibility rules per entity</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm()) }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Rule
        </button>
      </div>

      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
        {ENTITIES.map(e => (
          <button key={e} onClick={() => setEntity(e)} className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${entity === e ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-100'}`}>{e}</button>
        ))}
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-blue-500/30 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-zinc-100">{editing ? 'Edit Rule' : 'New Business Rule'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Rule Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Require approval for large orders" className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Entity</label>
                <select value={form.entity} onChange={e => setForm(p => ({ ...p, entity: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                  {['order', 'customer', 'product', 'case', 'employee'].map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Rule Type</label>
                <select value={form.ruleType} onChange={e => setForm(p => ({ ...p, ruleType: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                  {RULE_TYPES.map(t => <option key={t} value={t}>{t.replace('-', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Priority</label>
                <input type="number" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: parseInt(e.target.value) || 0 }))} className="w-full bg-zinc-800 border border-zinc-700 rounded px-2.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-zinc-400 font-medium">Conditions</label>
              <button onClick={addCondition} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"><Plus className="w-3 h-3" />Add</button>
            </div>
            <div className="space-y-2">
              {form.conditions.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select value={c.field} onChange={e => updateCondition(i, 'field', e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500">
                    {(ENTITY_FIELDS[form.entity] ?? []).map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  <select value={c.operator} onChange={e => updateCondition(i, 'operator', e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500">
                    {OPERATORS.map(op => <option key={op} value={op}>{op.replace('-', ' ')}</option>)}
                  </select>
                  {!['is-empty', 'is-not-empty'].includes(c.operator) && (
                    <input value={c.value} onChange={e => updateCondition(i, 'value', e.target.value)} placeholder="value" className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
                  )}
                  <button onClick={() => setForm(prev => ({ ...prev, conditions: prev.conditions.filter((_, idx) => idx !== i) }))} className="text-zinc-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
              {form.conditions.length === 0 && <p className="text-xs text-zinc-600 italic">No conditions — rule applies to all records</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1 font-medium">Action Definition (JSON)</label>
            <textarea value={form.action} onChange={e => setForm(p => ({ ...p, action: e.target.value }))} rows={3} placeholder={`{"message": "Order total must be approved"}`} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs text-zinc-300 font-mono placeholder-zinc-600 focus:outline-none focus:border-blue-500 resize-none" />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="rounded border-zinc-700 bg-zinc-800" />
              <span className="text-sm text-zinc-300">Active</span>
            </label>
            <div className="flex items-center gap-2">
              <button onClick={() => { setShowForm(false); setEditing(null) }} className="px-3 py-1.5 border border-zinc-700 text-zinc-400 hover:text-zinc-100 rounded text-sm transition-colors">Cancel</button>
              <button onClick={saveRule} disabled={saving || !form.name} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded text-sm font-medium transition-colors">{saving ? 'Saving...' : editing ? 'Update Rule' : 'Create Rule'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Rule Name</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Entity</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Type</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Priority</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Active</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-zinc-600">Loading...</td></tr>
            ) : rules.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-zinc-600">No rules found. Create one above.</td></tr>
            ) : rules.map(rule => (
              <tr key={rule.id} className="hover:bg-zinc-800/30">
                <td className="px-5 py-3 font-medium text-zinc-200">{rule.name}</td>
                <td className="px-5 py-3"><span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded text-xs capitalize">{rule.entity}</span></td>
                <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded text-xs capitalize ${TYPE_COLORS[rule.ruleType] ?? 'bg-zinc-700 text-zinc-400'}`}>{rule.ruleType.replace('-', ' ')}</span></td>
                <td className="px-5 py-3 text-zinc-400">{rule.priority}</td>
                <td className="px-5 py-3">
                  <button onClick={() => toggleRule(rule.id, rule.isActive)} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors ${rule.isActive ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25' : 'bg-zinc-700/40 text-zinc-500 hover:bg-zinc-700/60'}`}>
                    {rule.isActive ? <><CheckCircle className="w-3 h-3" />Yes</> : <><XCircle className="w-3 h-3" />No</>}
                  </button>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => startEdit(rule)} className="p-1.5 rounded text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => deleteRule(rule.id)} className="p-1.5 rounded text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
