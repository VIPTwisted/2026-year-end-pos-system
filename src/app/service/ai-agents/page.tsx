'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { cn } from '@/lib/utils'
import { Plus, Bot, Zap, CheckCircle, AlertCircle, Settings, Power, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

type Agent = {
  id: string
  name: string
  agentType: string
  status: string
  channels: string | null
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

const TYPE_ICONS: Record<string, React.ReactNode> = {
  case:      <Bot className="w-4 h-4 text-indigo-400" />,
  knowledge: <CheckCircle className="w-4 h-4 text-blue-400" />,
  intent:    <Zap className="w-4 h-4 text-yellow-400" />,
  email:     <Bot className="w-4 h-4 text-purple-400" />,
  chat:      <Bot className="w-4 h-4 text-teal-400" />,
}

export default function AIAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAgents = useCallback(() => {
    setLoading(true)
    fetch('/api/service/ai-agents')
      .then((r) => r.json())
      .then((d) => { setAgents(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { fetchAgents() }, [fetchAgents])

  const activeCount   = agents.filter((a) => a.status === 'active').length
  const casesToday    = agents.reduce((s, a) => s + a.casesHandled, 0)
  const avgResolution = agents.length
    ? (agents.reduce((s, a) => s + a.resolutionRate, 0) / agents.length).toFixed(1)
    : '0.0'
  const avgConfidence = 91.4

  async function toggleStatus(agent: Agent) {
    const next = agent.status === 'active' ? 'inactive' : 'active'
    await fetch(`/api/service/ai-agents/${agent.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    fetchAgents()
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      <TopBar title="AI Agents" subtitle="Autonomous service agents powered by AI" />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-6 py-5">
        {[
          { label: 'Active Agents',       value: activeCount,    icon: <Bot className="w-5 h-5 text-green-400" /> },
          { label: 'Cases Handled Today', value: casesToday,     icon: <Zap className="w-5 h-5 text-indigo-400" /> },
          { label: 'Auto-Resolution Rate',value: `${avgResolution}%`, icon: <CheckCircle className="w-5 h-5 text-teal-400" /> },
          { label: 'Avg Confidence',      value: `${avgConfidence}%`, icon: <AlertCircle className="w-5 h-5 text-yellow-400" /> },
        ].map((k) => (
          <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">{k.icon}<span className="text-xs text-zinc-500">{k.label}</span></div>
            <div className="text-2xl font-bold text-zinc-100">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 pb-4">
        <h2 className="text-sm font-semibold text-zinc-300">All Agents ({agents.length})</h2>
        <Link
          href="/service/ai-agents/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> New Agent
        </Link>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 px-6 pb-8">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-zinc-700 rounded w-32 mb-3" />
                <div className="h-3 bg-zinc-800 rounded w-20" />
              </div>
            ))
          : agents.length === 0
          ? (
            <div className="col-span-full text-center py-16 text-zinc-500">
              No agents yet. <Link href="/service/ai-agents/new" className="text-indigo-400 hover:underline">Create one</Link>
            </div>
          )
          : agents.map((a) => (
            <div key={a.id} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {TYPE_ICONS[a.agentType] ?? <Bot className="w-4 h-4 text-zinc-400" />}
                  <div>
                    <div className="text-sm font-semibold text-zinc-100">{a.name}</div>
                    <div className="text-xs text-zinc-500 capitalize">{a.agentType} agent</div>
                  </div>
                </div>
                <span className={cn('text-xs px-2 py-0.5 rounded border font-medium capitalize', STATUS_COLORS[a.status] ?? 'bg-zinc-700 text-zinc-400 border-zinc-600')}>
                  {a.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-zinc-900/50 rounded-lg px-3 py-2">
                  <div className="text-zinc-500 mb-0.5">Cases Handled</div>
                  <div className="font-bold text-zinc-100">{a.casesHandled}</div>
                </div>
                <div className="bg-zinc-900/50 rounded-lg px-3 py-2">
                  <div className="text-zinc-500 mb-0.5">Resolution Rate</div>
                  <div className="font-bold text-zinc-100">{a.resolutionRate.toFixed(1)}%</div>
                </div>
              </div>

              {a.channels && (
                <div className="text-xs text-zinc-500">
                  Channels: <span className="text-zinc-400">{a.channels}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => toggleStatus(a)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    a.status === 'active'
                      ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30'
                      : 'bg-green-500/15 text-green-400 hover:bg-green-500/25 border border-green-500/30'
                  )}
                >
                  <Power className="w-3 h-3" />
                  {a.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <Link
                  href={`/service/ai-agents/${a.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 transition-colors"
                >
                  <Settings className="w-3 h-3" /> Configure
                </Link>
                <Link href={`/service/ai-agents/${a.id}`} className="ml-auto text-zinc-600 hover:text-zinc-300">
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
