'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { BookOpen, Plus, Search, Eye, ThumbsUp, Trash2, Globe } from 'lucide-react'

type Article = {
  id: string; title: string; slug: string; category: string
  status: string; viewCount: number; helpfulCount: number
  authorName: string | null; publishedAt: string | null; updatedAt: string
}

const CATEGORIES = ['all', 'general', 'order-issue', 'returns', 'billing', 'shipping', 'account', 'product']
const STATUSES   = ['all', 'draft', 'published', 'archived']

const STATUS_COLOR: Record<string, string> = {
  draft:     'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  published: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  archived:  'bg-zinc-700 text-zinc-400',
}

export default function KnowledgePage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [status, setStatus]     = useState('all')
  const [category, setCategory] = useState('all')
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(true)
  const [showNew, setShowNew]   = useState(false)
  const [form, setForm]         = useState({ title: '', category: 'general', summary: '', body: '', tags: '', authorName: '' })

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (status   !== 'all') params.set('status', status)
    if (category !== 'all') params.set('category', category)
    if (search)             params.set('search', search)
    const res = await fetch(`/api/service/knowledge?${params}`)
    setArticles(await res.json())
    setLoading(false)
  }, [status, category, search])

  useEffect(() => { load() }, [load])

  async function createArticle(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/service/knowledge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setShowNew(false)
    setForm({ title:'', category:'general', summary:'', body:'', tags:'', authorName:'' })
    load()
  }

  async function publishArticle(id: string) {
    await fetch(`/api/service/knowledge/${id}/publish`, { method: 'POST' })
    load()
  }

  async function deleteArticle(id: string) {
    if (!confirm('Delete this article?')) return
    await fetch(`/api/service/knowledge/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <>
      <TopBar title="Knowledge Base" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex items-center gap-3 mb-5">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder-zinc-600 w-56 focus:outline-none focus:border-zinc-600" />
          </div>
          <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            {STATUSES.map(s => <button key={s} onClick={() => setStatus(s)} className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-colors ${status === s ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>{s}</button>)}
          </div>
          <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 flex-wrap">
            {CATEGORIES.map(c => <button key={c} onClick={() => setCategory(c)} className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-colors ${category === c ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}>{c}</button>)}
          </div>
          <button onClick={() => setShowNew(true)} className="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> New Article
          </button>
        </div>

        {loading ? <p className="text-zinc-600 animate-pulse">Loading...</p>
          : articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
              <BookOpen className="w-12 h-12 mb-3 opacity-30" /><p className="text-base">No articles found</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {articles.map(a => (
                <div key={a.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-zinc-200 line-clamp-2 flex-1">{a.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLOR[a.status] ?? 'bg-zinc-700 text-zinc-400'}`}>{a.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full capitalize">{a.category}</span>
                    {a.authorName && <span className="text-xs text-zinc-600">{a.authorName}</span>}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{a.viewCount}</span>
                    <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{a.helpfulCount}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-zinc-800">
                    <Link href={`/service/knowledge/${a.id}`} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Edit</Link>
                    {a.status !== 'published' && (
                      <button onClick={() => publishArticle(a.id)} className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                        <Globe className="w-3 h-3" /> Publish
                      </button>
                    )}
                    <button onClick={() => deleteArticle(a.id)} className="ml-auto text-xs text-zinc-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

        {showNew && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold text-zinc-100 mb-5">New Knowledge Article</h2>
              <form onSubmit={createArticle} className="space-y-4">
                <div><label className="block text-xs text-zinc-400 mb-1">Title *</label><input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs text-zinc-400 mb-1">Category</label><select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200">{CATEGORIES.filter(c => c !== 'all').map(c => <option key={c}>{c}</option>)}</select></div>
                  <div><label className="block text-xs text-zinc-400 mb-1">Author</label><input value={form.authorName} onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200" /></div>
                </div>
                <div><label className="block text-xs text-zinc-400 mb-1">Summary</label><textarea rows={2} value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 resize-none" /></div>
                <div><label className="block text-xs text-zinc-400 mb-1">Body *</label><textarea required rows={6} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 resize-none" /></div>
                <div><label className="block text-xs text-zinc-400 mb-1">Tags (comma-separated)</label><input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="returns, refund, policy" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200" /></div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg">Create Article</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  )
}
