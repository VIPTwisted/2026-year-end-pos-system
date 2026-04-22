'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Cpu, Plus, Trash2, Search, Save, RefreshCw } from 'lucide-react'

interface ProductRecommendation {
  id: string
  sourceProductId: string | null
  sourceProductName: string | null
  recommendedProductId: string | null
  recommendedProductName: string | null
  recommendedSku: string | null
  recommendationType: string
  score: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const REC_TYPES = [
  { value: 'collaborative_filtering', label: 'Collaborative Filtering', desc: 'Based on purchase patterns across customers' },
  { value: 'content_based', label: 'Content-Based', desc: 'Based on product attributes and metadata' },
  { value: 'hybrid', label: 'Hybrid', desc: 'Blend of collaborative and content-based' },
  { value: 'frequently_bought', label: 'Frequently Bought Together', desc: 'Products commonly purchased together' },
  { value: 'similar', label: 'Similar Items', desc: 'Visually or functionally similar products' },
  { value: 'upsell', label: 'Upsell', desc: 'Higher-value alternatives to viewed products' },
  { value: 'cross_sell', label: 'Cross-Sell', desc: 'Complementary products from other categories' },
]

const ALGO_OPTIONS = [
  { value: 'collaborative_filtering', label: 'Collaborative Filtering' },
  { value: 'content_based', label: 'Content-Based' },
  { value: 'hybrid', label: 'Hybrid' },
]

export default function ProductRecommendationsPage() {
  const [recs, setRecs] = useState<ProductRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [algo, setAlgo] = useState('hybrid')
  const [excludeCategories, setExcludeCategories] = useState('')
  const [includeCategories, setIncludeCategories] = useState('')
  const [minScore, setMinScore] = useState('0.5')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [retraining, setRetraining] = useState(false)

  const load = () => {
    fetch('/api/recommendations/seed-products')
      .then(r => r.json())
      .then(d => setRecs(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const types = ['All', ...Array.from(new Set(recs.map(r => r.recommendationType))).sort()]

  const filtered = recs.filter(r => {
    const matchType = typeFilter === 'All' || r.recommendationType === typeFilter
    const q = search.toLowerCase()
    return matchType && (!q || (r.sourceProductName ?? '').toLowerCase().includes(q) || (r.recommendedProductName ?? '').toLowerCase().includes(q) || (r.recommendedSku ?? '').toLowerCase().includes(q))
  })

  async function handleToggle(id: string, current: boolean) {
    await fetch(`/api/recommendations/seed-products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    }).catch(() => {})
    load()
  }

  async function handleDelete(id: string) {
    await fetch(`/api/recommendations/seed-products/${id}`, { method: 'DELETE' }).catch(() => {})
    load()
  }

  async function handleSaveConfig() {
    setSaving(true)
    await fetch('/api/recommendations/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ algorithm: algo, excludeCategories, includeCategories, minScore: parseFloat(minScore) || 0.5 }),
    }).catch(() => {})
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function handleRetrain() {
    setRetraining(true)
    await fetch('/api/recommendations/retrain', { method: 'POST' }).catch(() => {})
    setRetraining(false)
    load()
  }

  const active = recs.filter(r => r.isActive).length
  const avgScore = recs.length ? (recs.reduce((s, r) => s + r.score, 0) / recs.length) : 0

  return (
    <>
      <TopBar title="Product Recommendation Engine" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Seed Rules', value: recs.length, color: 'text-zinc-100' },
            { label: 'Active Rules', value: active, color: 'text-emerald-400' },
            { label: 'Avg Score', value: loading ? '—' : avgScore.toFixed(3), color: 'text-blue-400' },
          ].map(k => (
            <Card key={k.label}>
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">{k.label}</p>
                <p className={`text-3xl font-bold ${k.color}`}>{loading ? '—' : k.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Config panel */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <h2 className="text-sm font-semibold text-zinc-100">Algorithm Config</h2>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Algorithm</label>
                  <div className="space-y-1.5">
                    {ALGO_OPTIONS.map(a => (
                      <button key={a.value} onClick={() => setAlgo(a.value)}
                        className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${algo === a.value ? 'border-blue-500 bg-blue-500/10 text-zinc-100' : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600'}`}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Include Categories</label>
                  <input value={includeCategories} onChange={e => setIncludeCategories(e.target.value)}
                    placeholder="e.g. electronics, apparel"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  <p className="text-xs text-zinc-600 mt-1">Comma-separated. Blank = all.</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Exclude Categories</label>
                  <input value={excludeCategories} onChange={e => setExcludeCategories(e.target.value)}
                    placeholder="e.g. clearance, discontinued"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Min Score Threshold</label>
                  <input value={minScore} onChange={e => setMinScore(e.target.value)} type="number" min="0" max="1" step="0.05"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  <div className="mt-1.5 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(parseFloat(minScore) || 0, 1) * 100}%` }} />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button onClick={handleSaveConfig} disabled={saving}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${saved ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
                    <Save className="w-3.5 h-3.5" />{saved ? 'Saved!' : saving ? 'Saving...' : 'Save Config'}
                  </button>
                  <button onClick={handleRetrain} disabled={retraining}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors disabled:opacity-50">
                    <RefreshCw className={`w-3.5 h-3.5 ${retraining ? 'animate-spin' : ''}`} />
                    {retraining ? 'Training...' : 'Retrain'}
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Rec type reference */}
            <Card>
              <CardContent className="pt-5 space-y-2">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Recommendation Types</h3>
                {REC_TYPES.map(t => (
                  <button key={t.value} onClick={() => setTypeFilter(t.value === typeFilter ? 'All' : t.value)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors ${typeFilter === t.value ? 'bg-blue-500/10 border border-blue-500/25' : 'hover:bg-zinc-800'}`}>
                    <p className="text-xs font-medium text-zinc-300">{t.label}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Seed products table */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-zinc-100">Seed Products</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Source → Recommended product pairs that seed the engine</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
                  className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-52" />
              </div>
            </div>

            <Card>
              <CardContent className="pt-0 pb-0 px-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        {['Source Product', 'Recommended Product', 'Type', 'Score', 'Status', ''].map(h => (
                          <th key={h} className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider text-left first:pl-6">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading && <tr><td colSpan={6} className="py-12 text-center text-zinc-500">Loading...</td></tr>}
                      {!loading && filtered.length === 0 && (
                        <tr><td colSpan={6} className="py-12 text-center text-zinc-500">No seed products found.</td></tr>
                      )}
                      {filtered.map(rec => (
                        <tr key={rec.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                          <td className="pl-6 pr-4 py-3">
                            <p className="text-zinc-200 text-xs font-medium">{rec.sourceProductName ?? '—'}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-zinc-200 text-xs font-medium">{rec.recommendedProductName ?? '—'}</p>
                            {rec.recommendedSku && <p className="text-zinc-600 text-xs font-mono">{rec.recommendedSku}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-zinc-400 capitalize">{rec.recommendationType.replace(/_/g, ' ')}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${rec.score * 100}%` }} />
                              </div>
                              <span className="text-xs text-zinc-400 font-mono w-10">{rec.score.toFixed(3)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => handleToggle(rec.id, rec.isActive)}
                              className={`text-xs px-2 py-0.5 rounded-full transition-colors ${rec.isActive ? 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25' : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'}`}>
                              {rec.isActive ? 'Active' : 'Off'}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => handleDelete(rec.id)} className="p-1.5 rounded hover:bg-zinc-700 text-zinc-600 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
