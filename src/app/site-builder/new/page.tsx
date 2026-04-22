'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Loader2 } from 'lucide-react'

const PAGE_TYPES = [
  { value: 'content', label: 'Content Page' },
  { value: 'category', label: 'Category Page' },
  { value: 'product', label: 'Product Detail Page' },
  { value: 'home', label: 'Home Page' },
  { value: 'search', label: 'Search Results' },
  { value: 'cart', label: 'Cart' },
  { value: 'checkout', label: 'Checkout' },
]

const TEMPLATES = [
  { value: 'default', label: 'Default' },
  { value: 'full-width', label: 'Full Width' },
  { value: 'sidebar-left', label: 'Sidebar Left' },
  { value: 'sidebar-right', label: 'Sidebar Right' },
  { value: 'landing', label: 'Landing Page' },
]

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function NewPagePage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', slug: '', title: '', description: '', pageType: 'content', template: 'default', metaTitle: '', metaDesc: '', robotsIndex: true })
  const [slugManual, setSlugManual] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(key: string, value: string | boolean) { setForm(prev => ({ ...prev, [key]: value })) }

  function handleNameChange(name: string) {
    setForm(prev => ({ ...prev, name, slug: slugManual ? prev.slug : slugify(name) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) { setError('Page name is required'); return }
    if (!form.slug.trim()) { setError('Slug is required'); return }
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/site/pages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to create page'); setSaving(false); return }
      router.push(`/site-builder/${data.id}/editor`)
    } catch { setError('Network error'); setSaving(false) }
  }

  return (
    <>
      <TopBar title="New Page" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          <Link href="/site-builder" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"><ArrowLeft className="w-4 h-4" />Back to Site Builder</Link>
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold text-zinc-100 mb-6">Create New Page</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Page Name <span className="text-red-400">*</span></label>
                  <input value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Summer Sale Landing" className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Slug <span className="text-red-400">*</span></label>
                  <div className="flex items-center">
                    <span className="px-3 py-2 bg-zinc-800 border border-r-0 border-zinc-700 rounded-l-lg text-sm text-zinc-500">/</span>
                    <input value={form.slug} onChange={e => { setSlugManual(true); set('slug', e.target.value) }} placeholder="summer-sale" className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-r-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <p className="text-xs text-zinc-600 mt-1">Auto-generated from name. Edit to customize.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Page Title <span className="text-red-400">*</span></label>
                  <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Page display title" className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Brief description of this page" className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Page Type</label>
                    <select value={form.pageType} onChange={e => set('pageType', e.target.value)} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500">
                      {PAGE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Template</label>
                    <select value={form.template} onChange={e => set('template', e.target.value)} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500">
                      {TEMPLATES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="border-t border-zinc-800 pt-5 space-y-4">
                  <p className="text-sm font-medium text-zinc-400">SEO Settings</p>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Meta Title</label>
                    <input value={form.metaTitle} onChange={e => set('metaTitle', e.target.value)} placeholder="Browser tab title (defaults to page title)" className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Meta Description</label>
                    <textarea value={form.metaDesc} onChange={e => set('metaDesc', e.target.value)} rows={2} placeholder="Search engine description (150–160 chars)" className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => set('robotsIndex', !form.robotsIndex)} className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${form.robotsIndex ? 'bg-blue-600' : 'bg-zinc-700'}`}>
                      <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${form.robotsIndex ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                    <span className="text-sm text-zinc-300">Allow search engines to index this page</span>
                  </div>
                </div>
                {error && <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">{error}</div>}
                <div className="flex gap-3 pt-2">
                  <Link href="/site-builder" className="px-4 py-2 border border-zinc-700 text-zinc-400 hover:text-zinc-100 rounded-lg text-sm transition-colors">Cancel</Link>
                  <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}Create Page
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
