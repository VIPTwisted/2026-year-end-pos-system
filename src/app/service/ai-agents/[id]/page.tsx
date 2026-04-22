'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { cn } from '@/lib/utils'
import { ArrowLeft, Bot, Send, Power, Save } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Agent = {
  id: string
  name: string
  agentType: string
  status: string
  channels: string | null
  promptSystem: string | null
  escalationRule: string | null
  modelConfig: string | null
  casesHandled: number
  resolutionRate: number
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  active:   'bg-green-500/20 text-green-300 border-green-500/30',
  inactive: 'bg-zinc-700 text-zinc-400 border-zinc-600',
  training: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  error:    'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function AgentDetailPage() {
  const params  = useParams<{ id: string }>()
  const router  = useRouter()
  const [agent, setAgent]       = useState<Agent | null>(null)
  const [loading, setLoading]   = useState(true)
  const [prompt, setPrompt]     = useState('')
  const [testInput, setTestInput]   = useState('')
  const [testOutput, setTestOutput] = useState('')
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    fetch(`/api/service/ai-agents/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        setAgent(d)
        setPrompt(d.promptSystem ?? '')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  async function savePrompt() {
    if (!agent) return
    setSaving(true)
    await fetch(`/api/service/ai-agents/${agent.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ promptSystem: prompt }),
    })
    setSaving(false)
  }

  async function toggleStatus() {
    if (!agent) return
    const next = agent.status === 'active' ? 'inactive' : 'active'
    const res = await fetch(`/api/service/ai-agents/${agent.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    const updated = await res.json()
    setAgent(updated)
  }

  function runTest() {
    if (!testInput.trim()) return
    // Simulate AI response
    setTestOutput(
      `[Simulated Response]\n\nBased on the input: "${testInput}"\n\nAgent "${agent?.name}" (type: ${agent?.agentType}) would process this request according to the configured system prompt and escalation rules.\n\nConfidence: 92% — No escalation required.`
    )
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#0f0f1a] flex items-center justify-center">
        <div className="text-zinc-500 animate-pulse">Loading agent...</div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="min-h-[100dvh] bg-[#0f0f1a] flex items-center justify-center">
        <div className="text-zinc-500">Agent not found. <Link href="/service/ai-agents" className="text-indigo-400">Back</Link></div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      <TopBar title={agent.name} subtitle={`${agent.agentType} agent`} />

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/service/ai-agents" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <button
            onClick={toggleStatus}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
              agent.status === 'active'
                ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25 border-red-500/30'
                : 'bg-green-500/15 text-green-400 hover:bg-green-500/25 border-green-500/30'
            )}
          >
            <Power className="w-4 h-4" />
            {agent.status === 'active' ? 'Deactivate Agent' : 'Activate Agent'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Status',        value: agent.status,                      accent: STATUS_COLORS[agent.status] },
            { label: 'Type',          value: agent.agentType,                   accent: '' },
            { label: 'Cases Handled', value: agent.casesHandled.toString(),     accent: '' },
            { label: 'Resolution Rate', value: `${agent.resolutionRate.toFixed(1)}%`, accent: '' },
          ].map((s) => (
            <div key={s.label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl px-4 py-3">
              <div className="text-xs text-zinc-500 mb-1">{s.label}</div>
              <div className={cn('text-sm font-semibold capitalize', s.accent ? '' : 'text-zinc-100')}>
                {s.accent
                  ? <span className={cn('px-2 py-0.5 rounded border text-xs', s.accent)}>{s.value}</span>
                  : s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Channels + Escalation */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2"><Bot className="w-4 h-4 text-indigo-400" /> Agent Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-zinc-500 mb-1">Channels</div>
              <div className="text-zinc-300">{agent.channels ?? '—'}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1">Escalation Rule</div>
              <div className="text-zinc-300">{agent.escalationRule ?? '—'}</div>
            </div>
          </div>
        </div>

        {/* Prompt Editor */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">System Prompt</h3>
            <button
              onClick={savePrompt}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-xs font-medium transition-colors"
            >
              <Save className="w-3 h-3" /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 resize-none font-mono"
            placeholder="System prompt..."
          />
        </div>

        {/* Test Panel */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 space-y-3">
          <h3 className="text-sm font-semibold">Test Panel</h3>
          <div className="flex gap-2">
            <input
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runTest()}
              placeholder="Send a test input to this agent..."
              className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={runTest}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors"
            >
              <Send className="w-4 h-4" /> Run
            </button>
          </div>
          {testOutput && (
            <pre className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-xs text-zinc-300 whitespace-pre-wrap font-mono">
              {testOutput}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
