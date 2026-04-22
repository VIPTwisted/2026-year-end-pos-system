'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, AlertTriangle, Globe, ChevronDown, ChevronUp, Save, Map } from 'lucide-react'

type SiteSeoConfig = {
  id: string
  pageId: string | null
  metaTitle: string | null
  metaDesc: string | null
  ogTitle: string | null
  ogDesc: string | null
  ogImageUrl: string | null
  canonicalUrl: string | null
  robotsDirective: string
  keywords: string | null
  structuredData: string | null
  page: { id: string; title: string; slug: string; status: string } | null
}

type PageRow = {
  id: string
  title: string
  slug: string
  status: string
  seoConfig: SiteSeoConfig | null
}

const ROBOTS_OPTIONS = [
  'index,follow',
  'noindex,follow',
  'index,nofollow',
  'noindex,nofollow',
]

const BLANK_SEO = (pageId: string): Partial<SiteSeoConfig> => ({
  pageId,
  metaTitle: '',
  metaDesc: '',
  ogTitle: '',
  ogDesc: '',
  ogImageUrl: '',
  canonicalUrl: '',
  robotsDirective: 'index,follow',
  keywords: '',
  structuredData: '',
})

export default function SeoManagementPage() {
  const [pages, setPages] = useState<PageRow[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [forms, setForms] = useState<Record<string, Partial<SiteSeoConfig>>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/site/pages')
    const data: PageRow[] = await res.json()
    setPages(data)
    // Pre-fill forms from existing SEO config
    const initialForms: Record<string, Partial<SiteSeoConfig>> = {}
    for (const p of data) {
      initialForms[p.id] = p.seoConfig ? { ...p.seoConfig } : BLANK_SEO(p.id)
    }
    setForms(initialForms)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function saveSeo(pageId: string) {
    setSaving(pageId)
    const form = forms[pageId]
    await fetch('/api/site/seo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(null)
    setSaved(pageId)
    setTimeout(() => setSaved(null), 2000)
    load()
  }

  function setField(pageId: string, field: string, value: string) {
    setForms(prev => ({ ...prev, [pageId]: { ...prev[pageId], [field]: value } }))
  }

  const totalPublished = pages.filter(p => p.status === 'published').length
  const withSeo = pages.filter(p => p.seoConfig?.metaTitle).length
  const missingDesc = pages.filter(p => !p.seoConfig?.metaDesc).length

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <TopBar title="SEO Management" />
      <div className="flex-1 overflow-auto p-6 space-y-5">

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-5 flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-emerald-400">{withSeo}</div>
                <div className="text-xs text-zinc-500 mt-1">Pages with SEO configured</div>
              </div>
              <Search className="w-8 h-8 text-emerald-500 opacity-50" />
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-5 flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-amber-400">{missingDesc}</div>
                <div className="text-xs text-zinc-500 mt-1">Missing meta descriptions</div>
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-500 opacity-50" />
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-5 flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-400">{totalPublished}</div>
                <div className="text-xs text-zinc-500 mt-1">Total published pages</div>
              </div>
              <Globe className="w-8 h-8 text-blue-500 opacity-50" />
            </CardContent>
          </Card>
        </div>

        {/* Sitemap link */}
        <div className="flex justify-end">
          <Link href="/site-builder/seo/sitemap">
            <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-2">
              <Map className="w-3 h-3" /> Manage Sitemaps
            </Button>
          </Link>
        </div>

        {/* Pages Table */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-zinc-100">Pages SEO Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-zinc-500 py-8 text-center">Loading…</div>
            ) : pages.length === 0 ? (
              <div className="text-sm text-zinc-500 py-8 text-center">No pages found. Create pages in the Pages section first.</div>
            ) : (
              <div className="space-y-0">
                {/* Header row */}
                <div className="grid grid-cols-12 gap-2 text-xs text-zinc-500 font-medium py-2 border-b border-zinc-800 px-2">
                  <div className="col-span-3">Page Name</div>
                  <div className="col-span-3">Meta Title</div>
                  <div className="col-span-3">Meta Description</div>
                  <div className="col-span-1">Robots</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1 text-right">Edit</div>
                </div>

                {pages.map(p => {
                  const form = forms[p.id] ?? BLANK_SEO(p.id)
                  const isOpen = expandedRow === p.id
                  const hasSeo = !!p.seoConfig?.metaTitle
                  const missingMetaDesc = !p.seoConfig?.metaDesc

                  return (
                    <div key={p.id}>
                      {/* Table row */}
                      <div className={`grid grid-cols-12 gap-2 items-center py-2.5 px-2 border-b border-zinc-800/50 hover:bg-zinc-800/20 ${isOpen ? 'bg-zinc-800/30' : ''}`}>
                        <div className="col-span-3 text-sm text-zinc-200 font-medium truncate">{p.title}</div>
                        <div className="col-span-3 text-xs text-zinc-400 truncate">{p.seoConfig?.metaTitle || <span className="text-zinc-600 italic">—</span>}</div>
                        <div className="col-span-3 text-xs text-zinc-400 truncate">
                          {p.seoConfig?.metaDesc
                            ? p.seoConfig.metaDesc.slice(0, 60) + (p.seoConfig.metaDesc.length > 60 ? '…' : '')
                            : <span className="text-amber-600 italic flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Missing</span>}
                        </div>
                        <div className="col-span-1 text-xs text-zinc-500">{p.seoConfig?.robotsDirective ?? '—'}</div>
                        <div className="col-span-1">
                          <Badge variant={p.status === 'published' ? 'success' : 'secondary'} className="text-xs capitalize">{p.status}</Badge>
                        </div>
                        <div className="col-span-1 text-right">
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-blue-400 hover:text-blue-300"
                            onClick={() => setExpandedRow(isOpen ? null : p.id)}>
                            {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded edit form */}
                      {isOpen && (
                        <div className="bg-zinc-800/40 border-b border-zinc-800 px-4 py-4 space-y-4">
                          <div className="text-xs font-semibold text-blue-400 mb-2">Configure SEO — {p.title}</div>

                          <div className="grid grid-cols-2 gap-4">
                            {/* Meta Title */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-xs text-zinc-400">Meta Title</label>
                                <span className={`text-xs ${(form.metaTitle?.length ?? 0) > 60 ? 'text-red-400' : 'text-zinc-500'}`}>
                                  {form.metaTitle?.length ?? 0}/60
                                </span>
                              </div>
                              <input
                                maxLength={70}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                                value={form.metaTitle ?? ''}
                                onChange={e => setField(p.id, 'metaTitle', e.target.value)}
                              />
                            </div>

                            {/* Canonical URL */}
                            <div>
                              <label className="text-xs text-zinc-400 mb-1 block">Canonical URL</label>
                              <input
                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
                                value={form.canonicalUrl ?? ''}
                                onChange={e => setField(p.id, 'canonicalUrl', e.target.value)}
                                placeholder="https://example.com/page"
                              />
                            </div>

                            {/* Meta Description */}
                            <div className="col-span-2">
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-xs text-zinc-400">Meta Description</label>
                                <span className={`text-xs ${(form.metaDesc?.length ?? 0) > 160 ? 'text-red-400' : 'text-zinc-500'}`}>
                                  {form.metaDesc?.length ?? 0}/160
                                </span>
                              </div>
                              <textarea
                                rows={2}
                                maxLength={180}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none"
                                value={form.metaDesc ?? ''}
                                onChange={e => setField(p.id, 'metaDesc', e.target.value)}
                              />
                            </div>

                            {/* OG Title */}
                            <div>
                              <label className="text-xs text-zinc-400 mb-1 block">OG Title</label>
                              <input
                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                                value={form.ogTitle ?? ''}
                                onChange={e => setField(p.id, 'ogTitle', e.target.value)}
                              />
                            </div>

                            {/* OG Image URL */}
                            <div>
                              <label className="text-xs text-zinc-400 mb-1 block">OG Image URL</label>
                              <input
                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
                                value={form.ogImageUrl ?? ''}
                                onChange={e => setField(p.id, 'ogImageUrl', e.target.value)}
                                placeholder="https://..."
                              />
                            </div>

                            {/* OG Description */}
                            <div className="col-span-2">
                              <label className="text-xs text-zinc-400 mb-1 block">OG Description</label>
                              <textarea
                                rows={2}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none"
                                value={form.ogDesc ?? ''}
                                onChange={e => setField(p.id, 'ogDesc', e.target.value)}
                              />
                            </div>

                            {/* Robots Directive */}
                            <div>
                              <label className="text-xs text-zinc-400 mb-1 block">Robots Directive</label>
                              <select
                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none"
                                value={form.robotsDirective ?? 'index,follow'}
                                onChange={e => setField(p.id, 'robotsDirective', e.target.value)}
                              >
                                {ROBOTS_OPTIONS.map(r => (
                                  <option key={r} value={r}>{r}</option>
                                ))}
                              </select>
                            </div>

                            {/* Keywords */}
                            <div>
                              <label className="text-xs text-zinc-400 mb-1 block">Keywords (comma-separated)</label>
                              <input
                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                                value={form.keywords ?? ''}
                                onChange={e => setField(p.id, 'keywords', e.target.value)}
                                placeholder="keyword1, keyword2, keyword3"
                              />
                            </div>

                            {/* Structured Data */}
                            <div className="col-span-2">
                              <label className="text-xs text-zinc-400 mb-1 block">Structured Data (JSON-LD)</label>
                              <textarea
                                rows={4}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-blue-500 resize-none"
                                value={form.structuredData ?? ''}
                                onChange={e => setField(p.id, 'structuredData', e.target.value)}
                                placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "WebPage"\n}'}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-3 pt-1">
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 gap-2"
                              onClick={() => saveSeo(p.id)}
                              disabled={saving === p.id}
                            >
                              <Save className="w-3 h-3" />
                              {saving === p.id ? 'Saving…' : saved === p.id ? 'Saved!' : 'Save SEO Config'}
                            </Button>
                            <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => setExpandedRow(null)}>
                              Close
                            </Button>
                            {saved === p.id && (
                              <span className="text-xs text-emerald-400">Changes saved successfully</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
