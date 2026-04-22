'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, FileText, Globe, Clock, Eye, Upload, UploadOff, Search, Filter } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { TopBar } from '@/components/layout/TopBar'

interface SitePage {
  id: string
  pageId: string
  pageName: string
  pageType: string
  urlPath: string
  status: string
  publishedAt: string | null
  updatedAt: string
  siteId: string
}

const PAGE_TYPE_BADGE: Record<string, string> = {
  home: 'bg-blue-500/15 text-blue-300 border border-blue-500/25',
  category: 'bg-violet-500/15 text-violet-300 border border-violet-500/25',
  product: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25',
  checkout: 'bg-amber-500/15 text-amber-300 border border-amber-500/25',
  custom: 'bg-zinc-700 text-zinc-300',
  landing: 'bg-rose-500/15 text-rose-300 border border-rose-500/25',
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-400',
  published: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25',
}

function fmt(d?: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

type StatusFilter = 'All' | 'Published' | 'Draft'
type TypeFilter = 'All' | 'home' | 'category' | 'product' | 'checkout' | 'custom' | 'landing'

export default function PageBuilderPage() {
  const [pages, setPages] = useState<SitePage[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All')
  const [search, setSearch] = useState('')
  const [publishing, setPublishing] = useState<string | null>(null)

  const load = () => {
    fetch('/api/ecommerce/pages')
      .then(r => r.json())
      .then(d => setPages(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = pages.filter(p => {
    const matchStatus = statusFilter === 'All' || (statusFilter === 'Published' && p.status === 'published') || (statusFilter === 'Draft' && p.status === 'draft')
    const matchType = typeFilter === 'All' || p.pageType === typeFilter
    const q = search.toLowerCase()
    return matchStatus && matchType && (!q || p.pageName.toLowerCase().includes(q) || p.urlPath.toLowerCase().includes(q))
  })

  const total = pages.length
  const published = pages.filter(p => p.status === 'published').length
  const drafts = pages.filter(p => p.status === 'draft').length

  async function handlePublish(id: string, currentStatus: string) {
    setPublishing(id)
    const endpoint = currentStatus === 'published' ? `/api/ecommerce/pages/${id}/unpublish` : `/api/ecommerce/pages/${id}/publish`
    await fetch(endpoint, { method: 'POST' }).catch(() => {})
    load()
    setPublishing(null)
  }

  return (
    <>
      <TopBar title="Page Builder" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        {/* KPI cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Pages', value: total, color: 'text-zinc-100', icon: FileText },
            { label: 'Published', value: published, color: 'text-emerald-400', icon: Globe },
            { label: 'Draft', value: drafts, color: 'text-zinc-400', icon: Clock },
          ].map(({ label, value, color, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">{label}</p>
                  <Icon className="w-4 h-4 text-zinc-600" />
                </div>
                <p className={`text-3xl font-bold ${color}`}>{loading ? '—' : value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-1 flex-wrap">
            {(['All', 'Published', 'Draft'] as StatusFilter[]).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'}`}>
                {s}
              </button>
            ))}
            <span className="mx-1 border-l border-zinc-800 self-stretch" />
            <div className="flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-zinc-600 ml-1" />
              {(['All', 'home', 'category', 'product', 'checkout', 'landing', 'custom'] as TypeFilter[]).map(t => (
                <button key={t} onClick={() => setTypeFilter(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${typeFilter === t ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pages..."
                className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-56" />
            </div>
            <Link href="/ecom/page-builder/new"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors">
              <Plus className="w-4 h-4" />New Page
            </Link>
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="pt-0 pb-0 px-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Page Name', 'URL Path', 'Type', 'Status', 'Published', 'Last Modified', 'Actions'].map(h => (
                      <th key={h} className={`px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider text-left first:pl-6 last:text-center`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan={7} className="px-6 py-12 text-center text-zinc-500">Loading...</td></tr>}
                  {!loading && filtered.length === 0 && (
                    <tr><td colSpan={7} className="px-6 py-12 text-center text-zinc-500">No pages found.</td></tr>
                  )}
                  {filtered.map(page => (
                    <tr key={page.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/25 transition-colors">
                      <td className="pl-6 pr-4 py-3">
                        <span className="font-medium text-zinc-100">{page.pageName}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-zinc-400">{page.urlPath}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${PAGE_TYPE_BADGE[page.pageType] ?? 'bg-zinc-700 text-zinc-300'}`}>
                          {page.pageType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_BADGE[page.status] ?? 'bg-zinc-700 text-zinc-300'}`}>
                          {page.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">{fmt(page.publishedAt)}</td>
                      <td className="px-4 py-3 text-xs text-zinc-500">{fmt(page.updatedAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Link href={`/ecom/page-builder/${page.id}/preview`} target="_blank"
                            className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors" title="Preview">
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handlePublish(page.id, page.status)}
                            disabled={publishing === page.id}
                            title={page.status === 'published' ? 'Unpublish' : 'Publish'}
                            className={`p-1.5 rounded transition-colors disabled:opacity-40 ${page.status === 'published' ? 'hover:bg-zinc-700 text-amber-400 hover:text-amber-300' : 'hover:bg-zinc-700 text-zinc-400 hover:text-emerald-400'}`}>
                            {page.status === 'published' ? <UploadOff className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
