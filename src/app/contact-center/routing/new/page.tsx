'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

type Condition = { field: string; operator: string; value: string }

const CONDITION_FIELDS = ['customerTier', 'language', 'keyword', 'timeOfDay', 'dayOfWeek']
const OPERATORS = ['equals', 'contains', 'starts_with']

export default function NewRoutingRulePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    channelType: 'any',
    priority: 0,
    action: 'assign_queue',
    targetQueue: '',
    targetAgent: '',
    isActive: true,
  })
  const [conditions, setConditions] = useState<Condition[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function addCondition() {
    setConditions(c => [...c, { field: 'customerTier', operator: 'equals', value: '' }])
  }

  function removeCondition(i: number) {
    setConditions(c => c.filter((_, idx) => idx !== i))
  }

  function updateCondition(i: number, key: keyof Condition, val: string) {
    setConditions(c => c.map((cd, idx) => idx === i ? { ...cd, [key]: val } : cd))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    // Build conditions object
    const condObj: Record<string, string> = {}
    conditions.forEach(c => { if (c.value) condObj[c.field] = c.value })

    try {
      const res = await fetch('/api/contact-center/routing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, conditions: condObj }),
      })
      if (!res.ok) throw new Error(await res.text())
      router.push('/contact-center/routing')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto min-h-[100dvh] bg-zinc-950 text-zinc-100">
      <h1 className="text-xl font-bold mb-6">New Routing Rule</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Rule Name *</label>
            <input required type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Channel Type</label>
            <select value={form.channelType} onChange={e => setForm(f => ({ ...f, channelType: e.target.value }))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['any', 'voice', 'live_chat', 'email', 'whatsapp', 'facebook', 'sms'].map(t => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Priority</label>
            <input type="number" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Action</label>
            <select value={form.action} onChange={e => setForm(f => ({ ...f, action: e.target.value }))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['assign_queue', 'assign_agent', 'set_priority', 'auto_close'].map(a => (
                <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Active</label>
            <select value={form.isActive ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, isActive: e.target.value === 'true' }))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          {(form.action === 'assign_queue') && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Target Queue</label>
              <input type="text" value={form.targetQueue} onChange={e => setForm(f => ({ ...f, targetQueue: e.target.value }))}
                placeholder="Queue name..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}
          {(form.action === 'assign_agent') && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Target Agent</label>
              <input type="text" value={form.targetAgent} onChange={e => setForm(f => ({ ...f, targetAgent: e.target.value }))}
                placeholder="Agent name..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}
        </div>

        {/* Conditions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-zinc-400">Conditions</label>
            <button type="button" onClick={addCondition}
              className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors">
              + Add Condition
            </button>
          </div>
          {conditions.length === 0 && (
            <div className="text-sm text-zinc-600 bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              No conditions — rule applies to all conversations
            </div>
          )}
          <div className="space-y-2">
            {conditions.map((c, i) => (
              <div key={i} className="flex gap-2 items-center bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                <select value={c.field} onChange={e => updateCondition(i, 'field', e.target.value)}
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                  {CONDITION_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <select value={c.operator} onChange={e => updateCondition(i, 'operator', e.target.value)}
                  className="flex-shrink-0 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                  {OPERATORS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <input type="text" value={c.value} onChange={e => updateCondition(i, 'value', e.target.value)}
                  placeholder="value..."
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                <button type="button" onClick={() => removeCondition(i)} className="text-zinc-600 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
            {loading ? 'Saving...' : 'Create Rule'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
