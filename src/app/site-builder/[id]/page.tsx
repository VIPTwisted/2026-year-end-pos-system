'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Edit2, Eye, Upload, Trash2, History, CheckCircle, AlertCircle, Clock, Globe, Loader2 } from 'lucide-react'

interface SitePage {
  id: string; name: string; slug: string; title: string; description?: string | null
  status: string; checkedOutBy?: string | null; checkedOutAt?: string | null
  publishedAt?: string | null; pageType: string; template: string
  metaTitle?: string | null; metaDesc?: string | null; robotsIndex: boolean
  createdAt: string; updatedAt: string
  modules: Array<{ id: string; name: string; moduleType: string; position: number }>
  versions: Array<{ id: string; version: number; publishedBy?: string | null; publishedAt: string }>
  _count?: { modules: number; versions: number }
}

const STATUS_BADGE: Record<string, { label: string; cls: string; icon: React.ComponentType<{ className?: string }> }> = {
  draft: { label: 'Draft', cls: 'bg-zinc-700 text-zinc-300', icon: Clock },
  'checked-out': { label: 'Checked Out', cls: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30', icon: AlertCircle },
  'checked-in': { label: 'Checked In', cls: 'bg-blue-500/20 text-blue-300 border border-blue-500/30', icon: CheckCircle },
  published: { label: 'Published', cls: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30', icon: Globe },
}

function fmt(d?: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function PageDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [page, setPage] = useState<SitePage | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    fetch(`/api/site/pages/${id}`).then(r => r.json()).then(data => { setPage(data); setLoading(false) }).catch(() => setLoading(false))
  }, [id])

  async function handleCheckout() {
    setActionLoading('checkout')
    const res = await fetch(`/api/site/pages/${id}/checkout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user: 'Admin' }) })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Checkout failed'); setActionLoading(null); return }
    setPage(data); setActionLoading(null)
    router.push(`/site-builder/${id}/editor`)
  }

  async function handleCheckin() {
    setActionLoading('checkin')
    const res = await fetch(`/api/site/pages/${id}/checkin`, { method: 'POST' })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Check-in failed'); setActionLoading(null); return }
    setPage(data); setActionLoading(null)
  }

  async function handlePublish() {
    setActionLoading('publish')
    const res = await fetch(`/api/site/pages/${id}/publish`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ publishedBy: 'Admin' }) })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Publish failed'); setActionLoading(null); return }
    setPage(prev => prev ? { ...prev, ...data } : data); setActionLoading(null)
  }

  async function handleDelete() {
    setActionLoading('delete')
    await fetch(`/api/site/pages/${id}`, { method: 'DELETE' })
    router.push('/site-builder')
  }

  if (loading) return (<><TopBar title="Page Detail" /><main className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-500" /></main></>)
  if (!page) return (<><TopBar title="Page Not Found" /><main className="flex-1 p-6"><p className="text-zinc-500">Page not found.</p><Link href="/site-builder" className="text-blue-400 text-sm">Back to Site Builder</Link></main></>)

  const sb = STATUS_BADGE[page.status] ?? STATUS_BADGE.draft
  const StatusIcon = sb.icon

  return (
    <>
      <TopBar title={page.name} />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/site-builder" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100"><ArrowLeft className="w-4 h-4" />Site Builder</Link>
            <div className="flex items-center gap-2">
              <Link href={`/site-builder/${id}/preview`} target="_blank" className="flex items-center gap-2 px-3 py-1.5 border border-zinc-700 text-zinc-400 hover:text-zinc-100 rounded-lg text-sm transition-colors"><Eye className="w-4 h-4" /> Preview</Link>
              {page.status === 'checked-in' && (
                <button onClick={handlePublish} disabled={actionLoading === 'publish'} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {actionLoading === 'publish' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}Publish
                </button>
              )}
              <button onClick={handleCheckout} disabled={!!actionLoading || page.status === 'checked-out'} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {actionLoading === 'checkout' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit2 className="w-4 h-4" />}Edit Page
              </button>
            </div>
          </div>
          {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">{error}</div>}
          <div className="grid grid-cols-3 gap-4">
            <Card className="col-span-2">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-4">
                  <div><h2 className="text-xl font-bold text-zinc-100">{page.name}</h2><p className="text-sm text-zinc-500 font-mono mt-0.5">/{page.slug}</p></div>
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sb.cls}`}><StatusIcon className="w-3 h-3" />{sb.label}</span>
                </div>
                {page.checkedOutBy && (
                  <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-2 text-sm text-yellow-300">
                    <AlertCircle className="w-4 h-4 shrink-0" />Checked out by <strong>{page.checkedOutBy}</strong> on {fmt(page.checkedOutAt)}
                    {page.checkedOutBy === 'Admin' && <button onClick={handleCheckin} disabled={!!actionLoading} className="ml-auto text-xs text-blue-400 hover:text-blue-300">Check In</button>}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Page Type</p><p className="text-zinc-200 capitalize">{page.pageType}</p></div>
                  <div><p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Template</p><p className="text-zinc-200 capitalize">{page.template}</p></div>
                  <div><p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Title</p><p className="text-zinc-200">{page.title}</p></div>
                  <div><p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Published</p><p className="text-zinc-200">{fmt(page.publishedAt)}</p></div>
                  {page.description && <div className="col-span-2"><p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Description</p><p className="text-zinc-400">{page.description}</p></div>}
                </div>
              </CardContent>
            </Card>
            <div className="space-y-4">
              <Card><CardContent className="pt-5"><p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">SEO</p>
                <div className="space-y-2 text-sm">
                  <div><span className="text-zinc-500">Meta Title: </span><span className="text-zinc-300">{page.metaTitle || '(uses page title)'}</span></div>
                  <div><span className="text-zinc-500">Index: </span><span className={page.robotsIndex ? 'text-emerald-400' : 'text-red-400'}>{page.robotsIndex ? 'Yes' : 'No'}</span></div>
                </div>
              </CardContent></Card>
              <Card><CardContent className="pt-5"><p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Modules</p><p className="text-3xl font-bold text-zinc-100">{page.modules?.length ?? 0}</p><p className="text-xs text-zinc-600">on this page</p></CardContent></Card>
            </div>
          </div>
          {page.modules && page.modules.length > 0 && (
            <Card><CardContent className="pt-5">
              <p className="text-sm font-medium text-zinc-300 mb-3">Page Modules</p>
              <div className="space-y-1">
                {page.modules.map(m => (
                  <div key={m.id} className="flex items-center justify-between px-3 py-2 bg-zinc-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-600 w-4 text-right">{m.position + 1}</span>
                      <span className="text-sm text-zinc-200">{m.name}</span>
                      <span className="text-xs text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">{m.moduleType}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent></Card>
          )}
          {page.versions && page.versions.length > 0 && (
            <Card><CardContent className="pt-5">
              <p className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2"><History className="w-4 h-4 text-zinc-500" /> Version History</p>
              <div className="space-y-1">
                {page.versions.map(v => (
                  <div key={v.id} className="flex items-center justify-between px-3 py-2 bg-zinc-800/50 rounded-lg">
                    <div className="flex items-center gap-3"><span className="text-xs font-mono text-zinc-400">v{v.version}</span><span className="text-xs text-zinc-500">Published by {v.publishedBy || 'Unknown'}</span></div>
                    <span className="text-xs text-zinc-600">{fmt(v.publishedAt)}</span>
                  </div>
                ))}
              </div>
            </CardContent></Card>
          )}
          <Card className="border-red-500/20"><CardContent className="pt-5">
            <p className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Danger Zone</p>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)} className="px-4 py-2 border border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors">Delete this page</button>
            ) : (
              <div className="flex items-center gap-3">
                <p className="text-sm text-red-300">This cannot be undone.</p>
                <button onClick={handleDelete} disabled={actionLoading === 'delete'} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors">
                  {actionLoading === 'delete' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}Yes, delete
                </button>
                <button onClick={() => setConfirmDelete(false)} className="px-4 py-2 border border-zinc-700 text-zinc-400 rounded-lg text-sm transition-colors">Cancel</button>
              </div>
            )}
          </CardContent></Card>
        </div>
      </main>
    </>
  )
}
