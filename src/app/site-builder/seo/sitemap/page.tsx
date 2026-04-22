'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Map, Plus, Trash2, Download, RefreshCw, Check, X } from 'lucide-react'

type SiteMap = {
  id: string
  name: string
  type: string
  url: string | null
  includeProducts: boolean
  includeCategories: boolean
  includePages: boolean
  lastGenerated: string | null
  isActive: boolean
  createdAt: string
}

export default function SitemapPage() {
  const [sitemaps, setSitemaps] = useState<SiteMap[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [generated, setGenerated] = useState<string | null>(null)

  // Auto config state (first auto sitemap)
  const [autoConfig, setAutoConfig] = useState({
    includeProducts: true,
    includeCategories: true,
    includePages: true,
  })

  // Manual form
  const [showManualForm, setShowManualForm] = useState(false)
  const [manualForm, setManualForm] = useState({ name: '', url: '' })
  const [savingManual, setSavingManual] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/site/sitemap')
    const data: SiteMap[] = await res.json()
    setSitemaps(data)
    // Sync auto config from the first auto sitemap
    const auto = data.find(s => s.type === 'auto')
    if (auto) {
      setAutoConfig({
        includeProducts: auto.includeProducts,
        includeCategories: auto.includeCategories,
        includePages: auto.includePages,
      })
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const autoSitemap = sitemaps.find(s => s.type === 'auto')
  const manualSitemaps = sitemaps.filter(s => s.type === 'manual')

  async function ensureAutoSitemap() {
    if (autoSitemap) return autoSitemap.id
    // Create auto sitemap if doesn't exist
    const res = await fetch('/api/site/sitemap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Auto Sitemap', type: 'auto', ...autoConfig }),
    })
    const data = await res.json()
    return data.id
  }

  async function saveAutoConfig() {
    if (autoSitemap) {
      await fetch(`/api/site/sitemap/${autoSitemap.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(autoConfig),
      })
    } else {
      await fetch('/api/site/sitemap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Auto Sitemap', type: 'auto', ...autoConfig }),
      })
    }
    load()
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/site/sitemap/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    })
    load()
  }

  async function generate() {
    const id = await ensureAutoSitemap()
    // Save config first
    await fetch(`/api/site/sitemap/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(autoConfig),
    })
    setGenerating(id)
    const res = await fetch(`/api/site/sitemap/${id}/generate`, { method: 'POST' })
    const data = await res.json()
    setGenerating(null)
    setGenerated(id)
    setTimeout(() => setGenerated(null), 3000)
    load()
  }

  async function download(id: string) {
    window.open(`/api/site/sitemap/${id}/download`, '_blank')
  }

  async function removeSitemap(id: string) {
    if (!confirm('Delete this sitemap?')) return
    await fetch(`/api/site/sitemap/${id}`, { method: 'DELETE' })
    load()
  }

  async function addManual() {
    setSavingManual(true)
    await fetch('/api/site/sitemap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: manualForm.name, type: 'manual', url: manualForm.url }),
    })
    setSavingManual(false)
    setShowManualForm(false)
    setManualForm({ name: '', url: '' })
    load()
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <TopBar title="Site Maps" />
      <div className="flex-1 overflow-auto p-6 space-y-6">

        <div className="text-sm text-zinc-400">
          XML sitemaps help search engines discover and index your pages faster.
        </div>

        {/* Automated Sitemap */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <Map className="w-4 h-4 text-blue-400" />
                Automated Sitemap
              </CardTitle>
              {autoSitemap && (
                <Badge variant={autoSitemap.isActive ? 'success' : 'secondary'} className="text-xs">
                  {autoSitemap.isActive ? 'Active' : 'Inactive'}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-zinc-500">Automatically generated from your published content. Regenerate anytime to reflect latest changes.</p>

            {/* Toggle */}
            {autoSitemap && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleActive(autoSitemap.id, autoSitemap.isActive)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${autoSitemap.isActive ? 'bg-blue-600' : 'bg-zinc-700'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${autoSitemap.isActive ? 'translate-x-4' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm text-zinc-300">{autoSitemap.isActive ? 'Enabled' : 'Disabled'}</span>
              </div>
            )}

            {/* Checkboxes */}
            <div className="space-y-2">
              <div className="text-xs text-zinc-500 font-medium">Include in sitemap:</div>
              {([
                ['includePages', 'Pages'],
                ['includeProducts', 'Products'],
                ['includeCategories', 'Categories'],
              ] as [keyof typeof autoConfig, string][]).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-blue-600"
                    checked={autoConfig[key]}
                    onChange={e => setAutoConfig(prev => ({ ...prev, [key]: e.target.checked }))}
                  />
                  {label}
                </label>
              ))}
            </div>

            {/* Last generated */}
            {autoSitemap?.lastGenerated && (
              <div className="text-xs text-zinc-500">
                Last generated: <span className="text-zinc-300">{new Date(autoSitemap.lastGenerated).toLocaleString()}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 gap-2"
                onClick={generate}
                disabled={!!generating}
              >
                <RefreshCw className={`w-3 h-3 ${generating ? 'animate-spin' : ''}`} />
                {generating ? 'Generating…' : generated ? 'Generated!' : 'Generate Now'}
              </Button>
              {autoSitemap?.lastGenerated && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-2"
                  onClick={() => download(autoSitemap.id)}
                >
                  <Download className="w-3 h-3" />
                  Download XML
                </Button>
              )}
              {!autoSitemap && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  onClick={saveAutoConfig}
                >
                  Save Config
                </Button>
              )}
            </div>

            {generated && (
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <Check className="w-3 h-3" /> Sitemap generated successfully
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manual Sitemaps */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-zinc-100">Manual Sitemaps</CardTitle>
              <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-1"
                onClick={() => setShowManualForm(true)}>
                <Plus className="w-3 h-3" /> Add Manual Sitemap
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-zinc-500">Link to externally hosted sitemap XML files.</p>

            {showManualForm && (
              <div className="bg-zinc-800 rounded-lg p-4 space-y-3">
                <div className="text-xs font-semibold text-zinc-300">New Manual Sitemap</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">Name</label>
                    <input className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                      value={manualForm.name} onChange={e => setManualForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">URL (externally hosted XML)</label>
                    <input className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
                      value={manualForm.url} onChange={e => setManualForm(f => ({ ...f, url: e.target.value }))}
                      placeholder="https://example.com/sitemap.xml" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={addManual} disabled={savingManual}>{savingManual ? 'Adding…' : 'Add'}</Button>
                  <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => setShowManualForm(false)}>Cancel</Button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-sm text-zinc-500 py-4 text-center">Loading…</div>
            ) : manualSitemaps.length === 0 ? (
              <div className="text-sm text-zinc-500 py-4 text-center">No manual sitemaps added yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                    <th className="text-left py-2 font-medium">Name</th>
                    <th className="text-left py-2 font-medium">URL</th>
                    <th className="text-left py-2 font-medium">Status</th>
                    <th className="text-right py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {manualSitemaps.map(s => (
                    <tr key={s.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                      <td className="py-2 text-zinc-200 font-medium">{s.name}</td>
                      <td className="py-2 text-zinc-400 font-mono text-xs truncate max-w-xs">{s.url}</td>
                      <td className="py-2">
                        <Badge variant={s.isActive ? 'success' : 'secondary'} className="text-xs">{s.isActive ? 'Active' : 'Inactive'}</Badge>
                      </td>
                      <td className="py-2 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline"
                            className={`h-7 px-2 text-xs border-zinc-700 ${s.isActive ? 'text-zinc-400' : 'text-emerald-400 border-emerald-700'}`}
                            onClick={() => toggleActive(s.id, s.isActive)}>
                            {s.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-red-400 hover:text-red-300" onClick={() => removeSitemap(s.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
