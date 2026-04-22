'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Bot, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const AGENT_TYPES = ['case', 'knowledge', 'intent', 'email', 'chat']
const CHANNEL_OPTIONS = ['chat', 'email', 'voice', 'social', 'self_service']

export default function NewAgentPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name:           '',
    agentType:      'case',
    channels:       [] as string[],
    promptSystem:   '',
    escalationRule: '',
    temperature:    0.3,
  })

  function toggleChannel(ch: string) {
    setForm((f) => ({
      ...f,
      channels: f.channels.includes(ch)
        ? f.channels.filter((c) => c !== ch)
        : [...f.channels, ch],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/service/ai-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:           form.name,
          agentType:      form.agentType,
          channels:       form.channels.join(',') || null,
          promptSystem:   form.promptSystem || null,
          escalationRule: form.escalationRule || null,
          modelConfig:    JSON.stringify({ temperature: form.temperature }),
        }),
      })
      if (res.ok) router.push('/service/ai-agents')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      <TopBar title="New AI Agent" subtitle="Configure and deploy an autonomous service agent" />

      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link href="/service/ai-agents" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to AI Agents
        </Link>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name + Type */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-indigo-400" />
              <h2 className="text-sm font-semibold">Agent Identity</h2>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Agent Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Tier-1 Case Handler"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Agent Type *</label>
              <div className="grid grid-cols-5 gap-2">
                {AGENT_TYPES.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setForm({ ...form, agentType: t })}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors capitalize ${
                      form.agentType === t
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Channels */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold">Channels</h2>
            <div className="flex flex-wrap gap-2">
              {CHANNEL_OPTIONS.map((ch) => (
                <button
                  type="button"
                  key={ch}
                  onClick={() => toggleChannel(ch)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    form.channels.includes(ch)
                      ? 'bg-teal-600/20 border-teal-500/50 text-teal-300'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  {ch.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt + Escalation */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold">Behavior Configuration</h2>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">System Prompt</label>
              <textarea
                value={form.promptSystem}
                onChange={(e) => setForm({ ...form, promptSystem: e.target.value })}
                rows={5}
                placeholder="You are a helpful customer service agent for NovaPOS. Your goal is to..."
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 resize-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Escalation Rule</label>
              <input
                value={form.escalationRule}
                onChange={(e) => setForm({ ...form, escalationRule: e.target.value })}
                placeholder="e.g. Escalate when confidence below 70%"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Model Config */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold">Model Configuration</h2>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-zinc-400">Temperature</label>
                <span className="text-xs text-indigo-400 font-mono">{form.temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={form.temperature}
                onChange={(e) => setForm({ ...form, temperature: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-zinc-600 mt-1">
                <span>Precise (0)</span>
                <span>Creative (1)</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/service/ai-agents"
              className="flex-1 text-center py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
