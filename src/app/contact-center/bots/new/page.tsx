'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

type Intent = { name: string; keywords: string; response: string; action: string }

export default function NewBotPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    type: 'rule_based',
    channelType: 'chat',
    handoffCondition: 'customer_request',
    greetingMessage: '',
    escalationMessage: '',
    isActive: true,
  })
  const [intents, setIntents] = useState<Intent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function addIntent() {
    setIntents(i => [...i, { name: '', keywords: '', response: '', action: '' }])
  }

  function removeIntent(i: number) {
    setIntents(lst => lst.filter((_, idx) => idx !== i))
  }

  function updateIntent(i: number, key: keyof Intent, val: string) {
    setIntents(lst => lst.map((intent, idx) => idx === i ? { ...intent, [key]: val } : intent))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const botRes = await fetch('/api/contact-center/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!botRes.ok) throw new Error(await botRes.text())
      const bot = await botRes.json()

      // Create intents
      for (let i = 0; i < intents.length; i++) {
        const intent = intents[i]
        if (intent.name && intent.keywords) {
          await fetch(`/api/contact-center/bots/${bot.id}/intents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...intent, sortOrder: i }),
          })
        }
      }

      router.push(`/contact-center/bots/${bot.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto min-h-[100dvh] bg-zinc-950 text-zinc-100">
      <h1 className="text-xl font-bold mb-6">New Bot</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Bot Name *</label>
            <input required type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="rule_based">Rule-based</option>
              <option value="ai_powered">AI Powered</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Channel</label>
            <select value={form.channelType} onChange={e => setForm(f => ({ ...f, channelType: e.target.value }))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['voice', 'chat', 'email', 'any'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Handoff Condition</label>
            <select value={form.handoffCondition} onChange={e => setForm(f => ({ ...f, handoffCondition: e.target.value }))}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="customer_request">Customer Request</option>
              <option value="unresolved">Unresolved</option>
              <option value="always">Always</option>
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
          <div className="col-span-2">
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Greeting Message</label>
            <textarea value={form.greetingMessage} onChange={e => setForm(f => ({ ...f, greetingMessage: e.target.value }))}
              rows={2} placeholder="Hello! How can I help you today?"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-zinc-400 mb-1.5">Escalation Message</label>
            <textarea value={form.escalationMessage} onChange={e => setForm(f => ({ ...f, escalationMessage: e.target.value }))}
              rows={2} placeholder="Let me connect you with a live agent..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>

        {/* Intents */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-zinc-400">Intents</label>
            <button type="button" onClick={addIntent}
              className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded transition-colors">
              + Add Intent
            </button>
          </div>
          <div className="space-y-3">
            {intents.map((intent, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-500">Intent #{i + 1}</span>
                  <button type="button" onClick={() => removeIntent(i)} className="text-zinc-600 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Intent Name</label>
                    <input type="text" value={intent.name} onChange={e => updateIntent(i, 'name', e.target.value)}
                      placeholder="e.g. order_status"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Action</label>
                    <select value={intent.action} onChange={e => updateIntent(i, 'action', e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option value="">None</option>
                      <option value="handoff_to_agent">Handoff to Agent</option>
                      <option value="create_case">Create Case</option>
                      <option value="lookup_order">Lookup Order</option>
                      <option value="faq">FAQ</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-zinc-500 mb-1">Trigger Keywords (comma-separated)</label>
                    <input type="text" value={intent.keywords} onChange={e => updateIntent(i, 'keywords', e.target.value)}
                      placeholder="order, track, status, where is my"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-zinc-500 mb-1">Response</label>
                    <textarea value={intent.response} onChange={e => updateIntent(i, 'response', e.target.value)}
                      rows={2}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
            {loading ? 'Saving...' : 'Create Bot'}
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
