'use client'
import { useState, useEffect, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Sparkles, BookOpen, Clock, TrendingUp, CheckCircle, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

type Feature = { key: string; label: string; description: string }
type AuditEntry = { id: string; caseId: string; action: string; agent: string; outcome: string; ts: string }
type Config = {
  features: Record<string, boolean>
  stats: { suggestionsShown: number; accepted: number; rejected: number }
  knowledge: { articlesConnected: number; lastIndexed: string }
  auditLog: AuditEntry[]
  acceptanceRate: string
}

const FEATURES: Feature[] = [
  { key: 'caseSummary',          label: 'Case Summary',          description: 'Auto-generate case summaries for agents when opening a case' },
  { key: 'emailDraft',           label: 'Email Draft',           description: 'AI-drafted response emails based on case context' },
  { key: 'knowledgeSuggest',     label: 'Knowledge Suggest',     description: 'Surface relevant KB articles during case resolution' },
  { key: 'sentimentDetection',   label: 'Sentiment Detection',   description: 'Real-time customer sentiment scoring during interactions' },
  { key: 'autoCloseSuggestions', label: 'Auto-close Suggestions',description: 'Suggest case closure when resolution confidence is high' },
]

const ACTION_LABELS: Record<string, string> = {
  case_summary:      'Case Summary',
  email_draft:       'Email Draft',
  knowledge_suggest: 'Knowledge Suggest',
  sentiment:         'Sentiment',
  auto_close:        'Auto Close',
}
const OUTCOME_COLORS: Record<string, string> = {
  accepted:  'bg-green-500/20 text-green-300',
  rejected:  'bg-red-500/20 text-red-400',
  edited:    'bg-yellow-500/20 text-yellow-300',
  dismissed: 'bg-zinc-700 text-zinc-400',
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function CopilotPage() {
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  const fetchConfig = useCallback(() => {
    setLoading(true)
    fetch('/api/service/copilot')
      .then((r) => r.json())
      .then((d) => { setConfig(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { fetchConfig() }, [fetchConfig])

  async function toggleFeature(key: string) {
    if (!config) return
    setToggling(key)
    const next = !config.features[key]
    await fetch('/api/service/copilot', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature: key, enabled: next }),
    })
    setConfig((c) => c ? { ...c, features: { ...c.features, [key]: next } } : c)
    setToggling(null)
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      <TopBar title="Copilot for Service" subtitle="AI assistance configuration and monitoring" />

      <div className="px-6 py-6 space-y-6 max-w-5xl">

        {/* Feature Toggles */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold">Feature Toggles</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {FEATURES.map((f) => {
              const enabled = config?.features[f.key] ?? false
              return (
                <div key={f.key} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-zinc-200">{f.label}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{f.description}</div>
                    </div>
                    <button
                      onClick={() => toggleFeature(f.key)}
                      disabled={toggling === f.key || loading}
                      className={`shrink-0 w-10 h-6 rounded-full transition-colors relative ${enabled ? 'bg-indigo-600' : 'bg-zinc-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-800/50">
                    <span className={`text-xs font-medium ${enabled ? 'text-green-400' : 'text-zinc-500'}`}>
                      {enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <button className="flex items-center gap-1 text-xs text-zinc-500 hover:text-indigo-400 transition-colors">
                      Configure <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Usage Stats */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-semibold">Usage Stats (This Month)</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4 animate-pulse">
                  <div className="h-3 bg-zinc-700 rounded w-20 mb-3" />
                  <div className="h-7 bg-zinc-800 rounded w-14" />
                </div>
              ))
            ) : config ? [
              { label: 'Suggestions Shown', value: config.stats.suggestionsShown, color: 'text-zinc-100' },
              { label: 'Accepted',           value: config.stats.accepted,         color: 'text-green-400' },
              { label: 'Rejected',           value: config.stats.rejected,         color: 'text-red-400' },
              { label: 'Acceptance Rate',    value: `${config.acceptanceRate}%`,  color: 'text-indigo-400' },
            ].map((s) => (
              <div key={s.label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
                <div className="text-xs text-zinc-500 mb-2">{s.label}</div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              </div>
            )) : null}
          </div>
        </section>

        {/* Knowledge Grounding */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold">Knowledge Grounding</h2>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-zinc-700 rounded w-40" />
                <div className="h-3 bg-zinc-800 rounded w-32" />
              </div>
            ) : config ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-zinc-200">
                      {config.knowledge.articlesConnected} articles connected
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-1 ml-6">
                    Last indexed {timeAgo(config.knowledge.lastIndexed)}
                  </div>
                </div>
                <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs font-medium transition-colors">
                  Re-index Now
                </button>
              </div>
            ) : null}
          </div>
        </section>

        {/* Audit Log */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-zinc-500" />
            <h2 className="text-sm font-semibold">Recent Copilot Actions</h2>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-zinc-500 uppercase tracking-wide border-b border-zinc-800">
                  <th className="px-4 py-3 text-left">Case</th>
                  <th className="px-4 py-3 text-left">Action</th>
                  <th className="px-4 py-3 text-left">Agent</th>
                  <th className="px-4 py-3 text-left">Outcome</th>
                  <th className="px-4 py-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <td key={j} className="px-4 py-3"><div className="h-3 bg-zinc-800 rounded w-16" /></td>
                        ))}
                      </tr>
                    ))
                  : config?.auditLog.map((e) => (
                    <tr key={e.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-zinc-400">{e.caseId}</td>
                      <td className="px-4 py-3 text-zinc-300">{ACTION_LABELS[e.action] ?? e.action}</td>
                      <td className="px-4 py-3 text-zinc-400">{e.agent}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${OUTCOME_COLORS[e.outcome] ?? 'bg-zinc-700 text-zinc-400'}`}>
                          {e.outcome}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-zinc-500">{timeAgo(e.ts)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
