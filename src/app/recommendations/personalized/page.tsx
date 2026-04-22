'use client'

import { useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { User, FlaskConical, Save, ChevronDown } from 'lucide-react'

const SEGMENTS = [
  { value: 'all', label: 'All Customers', desc: 'Applies to every visitor' },
  { value: 'new', label: 'New Visitors', desc: 'First-time visitors with no purchase history' },
  { value: 'returning', label: 'Returning Customers', desc: 'Customers who have made at least one purchase' },
  { value: 'vip', label: 'VIP / High Value', desc: 'Top 10% by lifetime spend' },
  { value: 'at_risk', label: 'At-Risk', desc: '60+ days since last purchase' },
  { value: 'loyalty', label: 'Loyalty Members', desc: 'Enrolled in loyalty program' },
  { value: 'b2b', label: 'B2B Accounts', desc: 'Wholesale/business buyers' },
]

const REC_TYPES = [
  { value: 'personalized', label: 'Personalized Feed', desc: 'Model-generated for each customer profile' },
  { value: 'trending', label: 'Trending Now', desc: 'Top trending products globally' },
  { value: 'new_arrivals', label: 'New Arrivals', desc: 'Recently added products' },
  { value: 'top_rated', label: 'Top Rated', desc: 'Highest-rated products by review score' },
  { value: 'frequently_bought', label: 'Frequently Bought Together', desc: 'Bundled with recently viewed items' },
  { value: 'recently_viewed', label: 'Based on Browsing', desc: 'Similar to recently viewed' },
]

const FALLBACKS = [
  { value: 'trending', label: 'Trending Products' },
  { value: 'new_arrivals', label: 'New Arrivals' },
  { value: 'top_rated', label: 'Top Rated' },
  { value: 'bestsellers', label: 'Bestsellers' },
  { value: 'empty', label: 'Show Nothing (hide widget)' },
]

interface SegmentConfig {
  segment: string
  recType: string
  fallback: string
  maxItems: number
  abTestEnabled: boolean
  abTestVariantA: string
  abTestVariantB: string
  abSplitPct: number
}

function defaultConfig(segment: string): SegmentConfig {
  return {
    segment,
    recType: segment === 'new' ? 'trending' : 'personalized',
    fallback: 'trending',
    maxItems: 8,
    abTestEnabled: false,
    abTestVariantA: 'personalized',
    abTestVariantB: 'trending',
    abSplitPct: 50,
  }
}

export default function PersonalizedRecommendationsPage() {
  const [activeSegment, setActiveSegment] = useState('all')
  const [configs, setConfigs] = useState<Record<string, SegmentConfig>>(
    Object.fromEntries(SEGMENTS.map(s => [s.value, defaultConfig(s.value)]))
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const cfg = configs[activeSegment]
  const setCfg = (patch: Partial<SegmentConfig>) => setConfigs(c => ({ ...c, [activeSegment]: { ...c[activeSegment], ...patch } }))

  async function handleSave() {
    setSaving(true)
    await fetch('/api/recommendations/personalized-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.values(configs)),
    }).catch(() => {})
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <>
      <TopBar title="Personalized Recommendations" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="grid grid-cols-4 gap-6">
          {/* Segment selector */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Customer Segments</h2>
            <div className="space-y-1.5">
              {SEGMENTS.map(s => (
                <button key={s.value} onClick={() => setActiveSegment(s.value)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${activeSegment === s.value ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="text-sm font-medium text-zinc-100 truncate">{s.label}</span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5 ml-5.5 pl-5 line-clamp-1">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Config panel */}
          <div className="col-span-3 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">{SEGMENTS.find(s => s.value === activeSegment)?.label}</h2>
              <p className="text-xs text-zinc-500 mt-0.5">{SEGMENTS.find(s => s.value === activeSegment)?.desc}</p>
            </div>

            {/* Recommendation Type */}
            <Card>
              <CardContent className="pt-5 space-y-4">
                <h3 className="text-sm font-semibold text-zinc-100">Recommendation Type</h3>
                <div className="grid grid-cols-2 gap-2">
                  {REC_TYPES.map(t => (
                    <button key={t.value} onClick={() => setCfg({ recType: t.value })}
                      className={`p-3 rounded-lg border text-left transition-colors ${cfg.recType === t.value ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'}`}>
                      <div className="text-sm font-medium text-zinc-100">{t.label}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fallback + Max Items */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-5 space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-100">Fallback Strategy</h3>
                  <p className="text-xs text-zinc-500">Used when personalized data is insufficient.</p>
                  <div className="relative">
                    <select value={cfg.fallback} onChange={e => setCfg({ fallback: e.target.value })}
                      className="w-full appearance-none px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-9 cursor-pointer">
                      {FALLBACKS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-5 space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-100">Max Items</h3>
                  <p className="text-xs text-zinc-500">Maximum recommendations shown per widget.</p>
                  <div className="flex items-center gap-3">
                    <input type="range" min={1} max={24} value={cfg.maxItems} onChange={e => setCfg({ maxItems: parseInt(e.target.value) })}
                      className="flex-1 accent-blue-500 cursor-pointer" />
                    <span className="text-2xl font-bold text-blue-400 w-8 text-center">{cfg.maxItems}</span>
                  </div>
                  <p className="text-xs text-zinc-600">Showing up to {cfg.maxItems} product{cfg.maxItems !== 1 ? 's' : ''}</p>
                </CardContent>
              </Card>
            </div>

            {/* A/B Test */}
            <Card>
              <CardContent className="pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-violet-400" />
                    <h3 className="text-sm font-semibold text-zinc-100">A/B Test</h3>
                  </div>
                  <button onClick={() => setCfg({ abTestEnabled: !cfg.abTestEnabled })}
                    className={`relative w-10 h-6 rounded-full transition-colors ${cfg.abTestEnabled ? 'bg-violet-500' : 'bg-zinc-700'}`}>
                    <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                      style={{ left: cfg.abTestEnabled ? '1.125rem' : '0.125rem' }} />
                  </button>
                </div>

                {cfg.abTestEnabled && (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Variant A</label>
                        <div className="relative">
                          <select value={cfg.abTestVariantA} onChange={e => setCfg({ abTestVariantA: e.target.value })}
                            className="w-full appearance-none px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-8 cursor-pointer">
                            {REC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Variant B</label>
                        <div className="relative">
                          <select value={cfg.abTestVariantB} onChange={e => setCfg({ abTestVariantB: e.target.value })}
                            className="w-full appearance-none px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-8 cursor-pointer">
                            {REC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                        <span>A: {cfg.abSplitPct}%</span>
                        <span>B: {100 - cfg.abSplitPct}%</span>
                      </div>
                      <input type="range" min={10} max={90} value={cfg.abSplitPct} onChange={e => setCfg({ abSplitPct: parseInt(e.target.value) })}
                        className="w-full accent-violet-500 cursor-pointer" />
                      <div className="mt-2 h-2 bg-zinc-800 rounded-full overflow-hidden flex">
                        <div className="h-full bg-violet-500 rounded-l-full transition-all" style={{ width: `${cfg.abSplitPct}%` }} />
                        <div className="h-full bg-blue-500 rounded-r-full transition-all" style={{ width: `${100 - cfg.abSplitPct}%` }} />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Save */}
            <div className="flex justify-end">
              <button onClick={handleSave} disabled={saving}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${saved ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
                <Save className="w-4 h-4" />
                {saved ? 'Saved!' : saving ? 'Saving...' : 'Save All Segment Configs'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
