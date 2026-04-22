'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, Save, Globe, ThumbsUp, Eye } from 'lucide-react'

type Article = {
  id: string; title: string; slug: string; category: string; body: string
  summary: string | null; tags: string | null; status: string; publishedAt: string | null
  viewCount: number; helpfulCount: number; authorName: string | null
  createdAt: string; updatedAt: string
}

const CATEGORIES = ['general', 'order-issue', 'returns', 'billing', 'shipping', 'account', 'product']

export default function ArticleEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [form, setForm]       = useState({ title: '', category: 'general', summary: '', body: '', tags: '', authorName: '' })

  useEffect(() => {
    fetch(`/api/service/knowledge/${id}`).then(r => r.json()).then((a: Article) => {
      setArticle(a)
      setForm({ title: a.title, category: a.category, summary: a.summary ?? '', body: a.body, tags: a.tags ?? '', authorName: a.authorName ?? '' })
    })
  }, [id])

  async function save() {
    setSaving(true)
    await fetch(`/api/service/knowledge/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  async function publish() {
    await fetch(`/api/service/knowledge/${id}/publish`, { method: 'POST' })
    setArticle(a => a ? { ...a, status: 'published', publishedAt: new Date().toISOString() } : a)
  }

  async function markHelpful() {
    const res = await fetch(`/api/service/knowledge/${id}/helpful`, { method: 'POST' })
    const updated: Article = await res.json()
    setArticle(a => a ? { ...a, helpfulCount: updated.helpfulCount } : a)
  }

  const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)

  if (!article) return (<><TopBar title="Article Editor" /><main className="flex-1 p-6"><p className="text-zinc-600 animate-pulse">Loading...</p></main></>)

  return (
    <>
      <TopBar title="Article Editor" />
      <main className="flex-1 p-6 overflow-auto max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 text-sm"><ArrowLeft className="w-4 h-4" /> Knowledge Base</button>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{article.viewCount} views</span>
              <button onClick={markHelpful} className="flex items-center gap-1 hover:text-emerald-400 transition-colors"><ThumbsUp className="w-3.5 h-3.5" />{article.helpfulCount} helpful</button>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full capitalize ${article.status === 'published' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : article.status === 'draft' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-zinc-700 text-zinc-400'}`}>{article.status}</span>
            {article.status !== 'published' && <button onClick={publish} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/40 text-emerald-400 text-sm rounded-lg transition-colors"><Globe className="w-3.5 h-3.5" /> Publish</button>}
            <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"><Save className="w-3.5 h-3.5" />{saved ? 'Saved!' : saving ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
        <div className="space-y-5">
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Article title..."
            className="w-full bg-transparent border-b border-zinc-800 focus:border-zinc-600 px-0 py-2 text-2xl font-bold text-zinc-100 placeholder-zinc-700 focus:outline-none transition-colors" />
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-xs text-zinc-500 mb-1">Category</label><select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200">{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label className="block text-xs text-zinc-500 mb-1">Author</label><input value={form.authorName} onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200" /></div>
            <div><label className="block text-xs text-zinc-500 mb-1">Tags</label><input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="tag1, tag2" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200" /></div>
          </div>
          {tags.length > 0 && <div className="flex gap-2 flex-wrap">{tags.map(t => <span key={t} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{t}</span>)}</div>}
          <div><label className="block text-xs text-zinc-500 mb-1">Summary</label><textarea rows={2} value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} placeholder="Brief description shown in search results..." className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-zinc-600 transition-colors" /></div>
          <div><label className="block text-xs text-zinc-500 mb-1">Body</label><textarea rows={20} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Write your article content here..." className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-zinc-600 transition-colors font-mono" /></div>
          {article.publishedAt && <p className="text-xs text-zinc-600">Published {new Date(article.publishedAt).toLocaleDateString()}</p>}
        </div>
      </main>
    </>
  )
}
