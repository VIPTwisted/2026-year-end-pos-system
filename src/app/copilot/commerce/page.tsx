'use client'

import { useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { BrainCircuit, Sparkles, TrendingUp, BarChart2, RotateCcw, CheckCircle2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface CopilotFeature {
  id: string
  icon: React.ElementType
  title: string
  description: string
  enabled: boolean
  lastUsed: string | null
  status: 'active' | 'inactive' | 'beta'
}

const INITIAL_FEATURES: CopilotFeature[] = [
  {
    id: 'product-recs',
    icon: Sparkles,
    title: 'AI-Powered Product Recommendations',
    description: 'Surface personalized product suggestions on POS, storefront, and customer detail pages using purchase history and behavior signals.',
    enabled: true,
    lastUsed: '2026-04-22T09:14:00Z',
    status: 'active',
  },
  {
    id: 'smart-pricing',
    icon: TrendingUp,
    title: 'Smart Pricing Suggestions',
    description: 'Automatically suggest competitive price adjustments based on demand patterns, competitor signals, and margin targets.',
    enabled: true,
    lastUsed: '2026-04-21T16:42:00Z',
    status: 'active',
  },
  {
    id: 'demand-forecast',
    icon: BarChart2,
    title: 'Demand Forecasting Copilot',
    description: 'Generate AI-assisted demand forecasts for replenishment planning. Integrates with purchasing and inventory reorder workflows.',
    enabled: false,
    lastUsed: '2026-04-18T11:00:00Z',
    status: 'beta',
  },
  {
    id: 'returns-intel',
    icon: RotateCcw,
    title: 'Returns Intelligence',
    description: 'Detect return fraud patterns, predict high-return SKUs, and generate actionable insights to reduce reverse logistics costs.',
    enabled: false,
    lastUsed: null,
    status: 'beta',
  },
]

function StatusBadge({ status }: { status: CopilotFeature['status'] }) {
  const map: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    inactive: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
    beta: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  }
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide border ${map[status]}`}>
      {status}
    </span>
  )
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-blue-600' : 'bg-zinc-700'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${enabled ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
    </button>
  )
}

export default function CopilotCommercePage() {
  const [features, setFeatures] = useState(INITIAL_FEATURES)

  function toggle(id: string, val: boolean) {
    setFeatures(fs => fs.map(f => f.id === id ? { ...f, enabled: val, status: val ? 'active' : 'inactive' } : f))
  }

  const activeCount = features.filter(f => f.enabled).length

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="Copilot Commerce Admin" />
      <main className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <BrainCircuit className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-200">Copilot Commerce Admin</h1>
            <p className="text-[12px] text-zinc-500">{activeCount} of {features.length} AI features enabled</p>
          </div>
        </div>

        {/* Feature toggle cards */}
        <div className="space-y-3">
          {features.map(feat => (
            <div key={feat.id} className={`bg-[#16213e] border rounded-lg p-5 transition-colors ${feat.enabled ? 'border-blue-500/20' : 'border-zinc-800/50'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg mt-0.5 ${feat.enabled ? 'bg-blue-500/10' : 'bg-zinc-800'}`}>
                    <feat.icon className={`w-4 h-4 ${feat.enabled ? 'text-blue-400' : 'text-zinc-500'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[13px] font-semibold text-zinc-200">{feat.title}</h3>
                      <StatusBadge status={feat.enabled ? 'active' : feat.status === 'beta' ? 'beta' : 'inactive'} />
                    </div>
                    <p className="text-[12px] text-zinc-500 leading-relaxed max-w-xl">{feat.description}</p>
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-600">
                      <CheckCircle2 className="w-3 h-3" />
                      {feat.lastUsed
                        ? `Last used: ${new Date(feat.lastUsed).toLocaleString()}`
                        : 'Never used'}
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 mt-1">
                  <Toggle enabled={feat.enabled} onChange={v => toggle(feat.id, v)} />
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  )
}
