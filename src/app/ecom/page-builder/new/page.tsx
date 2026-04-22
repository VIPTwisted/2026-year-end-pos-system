'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Layers } from 'lucide-react'
import Link from 'next/link'

const PAGE_TYPES = [
  { value: 'home', label: 'Home', desc: 'Site homepage' },
  { value: 'category', label: 'Category', desc: 'Product category listing' },
  { value: 'product', label: 'Product', desc: 'Product detail page (PDP)' },
  { value: 'checkout', label: 'Checkout', desc: 'Cart & checkout flow' },
  { value: 'landing', label: 'Landing', desc: 'Marketing landing page' },
  { value: 'custom', label: 'Custom', desc: 'Free-form custom page' },
]

const TEMPLATES = [
  { value: 'blank', label: 'Blank', desc: 'Start with an empty canvas', icon: '□' },
  { value: 'hero', label: 'Hero + Content', desc: 'Full-width hero banner with content blocks', icon: '▬' },
  { value: 'category', label: 'Category Grid', desc: 'Product grid with filters sidebar', icon: '⊞' },
  { value: 'landing', label: 'Marketing Landing', desc: 'Hero + features + CTA + testimonials', icon: '⚡' },
]

export default function NewPagePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    pageName: '',
    pageType: 'custom',
    urlSlug: '',
    template: 'blank',
    seoTitle: '',
    seoDescription: '',
  })

  function slugify(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  function handleNameChange(val: string) {
    setForm(f => ({ ...f, pageName: val, urlSlug: f.urlSlug || slugify(val) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.pageName.trim()) { setError('Page name is required.'); return }
    if (!form.urlSlug.trim()) { setError('URL slug is required.'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/ecommerce/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageName: form.pageName.trim(),
          pageType: form.pageType,
          urlPath: '/' + form.urlSlug.replace(/^\//, ''),
          template: form.template,
          seoTitle: form.seoTitle || null,
          seoDescription: form.seoDescription || null,
          status: 'draft',
        }),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error ?? 'Failed to create page') }
      router.push('/ecom/page-builder')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Page" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Link href="/ecom/page-builder" className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-zinc-100">New Site Page</h1>
              <p className="text-xs text-zinc-500 mt-0.5">Create a new page for your e-commerce site</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Basic Info */}
            <Card>
              <CardContent className="pt-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <h2 className="text-sm font-semibold text-zinc-100">Page Details</h2>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Page Name <span className="text-red-400">*</span></label>
                  <input
                    value={form.pageName}
                    onChange={e => handleNameChange(e.target.value)}
                    placeholder="e.g. Summer Sale Landing"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">URL Slug <span className="text-red-400">*</span></label>
                  <div className="flex items-center gap-0">
                    <span className="px-3 py-2 bg-zinc-800/60 border border-r-0 border-zinc-700 rounded-l-lg text-xs text-zinc-500">/</span>
                    <input
                      value={form.urlSlug}
                      onChange={e => setForm(f => ({ ...f, urlSlug: slugify(e.target.value) }))}
                      placeholder="summer-sale-landing"
                      className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-r-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Page Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PAGE_TYPES.map(t => (
                      <button key={t.value} type="button" onClick={() => setForm(f => ({ ...f, pageType: t.value }))}
                        className={`px-3 py-2.5 rounded-lg border text-left transition-colors ${form.pageType === t.value ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'}`}>
                        <div className="text-xs font-medium text-zinc-100">{t.label}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Template */}
            <Card>
              <CardContent className="pt-5 space-y-3">
                <h2 className="text-sm font-semibold text-zinc-100">Template</h2>
                <div className="grid grid-cols-2 gap-3">
                  {TEMPLATES.map(t => (
                    <button key={t.value} type="button" onClick={() => setForm(f => ({ ...f, template: t.value }))}
                      className={`p-4 rounded-lg border text-left transition-colors ${form.template === t.value ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'}`}>
                      <div className="text-2xl mb-2 font-mono text-zinc-400">{t.icon}</div>
                      <div className="text-sm font-medium text-zinc-100">{t.label}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardContent className="pt-5 space-y-4">
                <h2 className="text-sm font-semibold text-zinc-100">SEO Settings</h2>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">SEO Title</label>
                  <input
                    value={form.seoTitle}
                    onChange={e => setForm(f => ({ ...f, seoTitle: e.target.value }))}
                    placeholder="Leave blank to inherit page name"
                    maxLength={70}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-xs text-zinc-600 mt-1">{form.seoTitle.length}/70 characters</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Meta Description</label>
                  <textarea
                    value={form.seoDescription}
                    onChange={e => setForm(f => ({ ...f, seoDescription: e.target.value }))}
                    placeholder="Brief description for search engines"
                    maxLength={160}
                    rows={3}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-xs text-zinc-600 mt-1">{form.seoDescription.length}/160 characters</p>
                </div>
              </CardContent>
            </Card>

            {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{error}</p>}

            <div className="flex justify-end gap-3 pt-1">
              <Link href="/ecom/page-builder"
                className="px-5 py-2 rounded-lg border border-zinc-700 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
                Cancel
              </Link>
              <button type="submit" disabled={saving}
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? 'Creating...' : 'Create Page'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
