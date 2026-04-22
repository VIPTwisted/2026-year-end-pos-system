'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, FileText, Globe, Clock, AlertCircle, Search, Eye, Edit2, Upload, MoreHorizontal } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface SitePage {
  id: string; name: string; slug: string; pageType: string; status: string
  checkedOutBy?: string | null; publishedAt?: string | null; updatedAt: string
  _count?: { modules: number; versions: number }
}

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  'checked-out': 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  'checked-in': 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  published: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
}

const TAB_FILTERS = ['All', 'Published', 'Draft', 'Checked Out'] as const
type TabFilter = typeof TAB_FILTERS[number]

function fmt(d?: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function SiteBuilderPage() {
  const [pages, setPages] = useState<SitePage[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabFilter>('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/site/pages').then(r => r.json()).then(data => { setPages(Array.isArray(data) ? data : []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const filtered = pages.filter(p => {
    const matchTab = tab === 'All' || (tab === 'Published' && p.status === 'published') || (tab === 'Draft' && p.status === 'draft') || (tab === 'Checked Out' && p.status === 'checked-out')
    const q = search.toLowerCase()
    return matchTab && (!q || p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q))
  })

  const total = pages.length
  const published = pages.filter(p => p.status === 'published').length
  const drafts = pages.filter(p => p.status === 'draft').length
  const checkedOut = pages.filter(p => p.status === 'checked-out').length

  async function handlePublish(id: string) {
    await fetch(`/api/site/pages/${id}/publish`, { method: 'POST', body: JSON.stringify({ publishedBy: 'Admin' }), headers: { 'Content-Type': 'application/json' } })
    const data = await fetch('/api/site/pages').then(r => r.json())
    setPages(Array.isArray(data) ? data : [])
  }

  return (
    <>
      <TopBar title="Commerce Site Builder" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Pages', value: total, color: 'text-zinc-100', icon: FileText },
            { label: 'Published', value: published, color: 'text-emerald-400', icon: Globe },
            { label: 'Drafts', value: drafts, color: 'text-zinc-400', icon: Clock },
            { label: 'Checked Out', value: checkedOut, color: 'text-yellow-400', icon: AlertCircle },
          ].map(({ label, value, color, icon: Icon }) => (
            <Card key={label}><CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-1"><p className="text-xs text-zinc-500 uppercase tracking-wide">{label}</p><Icon className="w-4 h-4 text-zinc-600" /></div>
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
            </CardContent></Card>
          ))}
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-1">
            {TAB_FILTERS.map(t => <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'}`}>{t}</button>)}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pages..." className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-56" /></div>
            <Link href="/site-builder/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"><Plus className="w-4 h-4" />New Page</Link>
          </div>
        </div>
        <Card><CardContent className="pt-0 pb-0 px-0">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead><tr className="border-b border-zinc-800">
              {['Name','Slug','Type','Status','Last Modified','Actions'].map((h,i) => <th key={h} className={`text-xs text-zinc-500 uppercase tracking-wide px-${i===0?6:4} py-3 text-${i===5?'center':'left'}`}>{h}</th>)}
            </tr></thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="px-6 py-10 text-center text-zinc-500">Loading...</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={6} className="px-6 py-10 text-center text-zinc-500">No pages found.</td></tr>}
              {filtered.map(page => (
                <tr key={page.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-3"><Link href={`/site-builder/${page.id}`} className="font-medium text-zinc-100 hover:text-blue-400">{page.name}</Link>{page.checkedOutBy && <p className="text-xs text-yellow-500 mt-0.5">Checked out by {page.checkedOutBy}</p>}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">/{page.slug}</td>
                  <td className="px-4 py-3 text-zinc-400 capitalize">{page.pageType}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[page.status] ?? 'bg-zinc-700 text-zinc-300'}`}>{page.status}</span></td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{fmt(page.updatedAt)}</td>
                  <td className="px-4 py-3"><div className="flex items-center justify-center gap-1">
                    <Link href={`/site-builder/${page.id}/editor`} className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors" title="Edit"><Edit2 className="w-3.5 h-3.5" /></Link>
                    <Link href={`/site-builder/${page.id}/preview`} target="_blank" className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors" title="Preview"><Eye className="w-3.5 h-3.5" /></Link>
                    <button onClick={() => handlePublish(page.id)} disabled={page.status === 'checked-out'} className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Publish"><Upload className="w-3.5 h-3.5" /></button>
                    <Link href={`/site-builder/${page.id}`} className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors" title="Details"><MoreHorizontal className="w-3.5 h-3.5" /></Link>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </CardContent></Card>
      </main>
    </>
  )
}
