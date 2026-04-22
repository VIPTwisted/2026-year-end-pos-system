'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Eye } from 'lucide-react'

export default function NewKBArticlePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [category, setCategory] = useState('')
  const [keywords, setKeywords] = useState('')
  const [language, setLanguage] = useState('en-US')
  const [content, setContent] = useState('')

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    const res = await fetch('/api/service/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, summary, category, keywords, language, content }),
    })
    if (res.ok) {
      const data = await res.json()
      router.push(`/service/knowledge/${data.id}`)
    } else {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Knowledge Article" />
      <main className="flex-1 p-6 max-w-3xl space-y-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/service/knowledge"><ArrowLeft className="w-4 h-4 mr-1" />Back</Link>
        </Button>

        <Card>
          <CardContent className="pt-6 pb-6 space-y-5">
            <h2 className="text-lg font-semibold text-zinc-100">Article Details</h2>

            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Article title…" />
            </div>

            <div className="space-y-1.5">
              <Label>Summary</Label>
              <Input value={summary} onChange={e => setSummary(e.target.value)} placeholder="Short description shown in search results…" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Billing, Technical, Product" />
              </div>
              <div className="space-y-1.5">
                <Label>Language</Label>
                <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100">
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Keywords <span className="text-zinc-600">(comma-separated)</span></Label>
              <Input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="refund, billing, payment, invoice…" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between mb-1">
                <Label>Content * <span className="text-zinc-600">(Markdown supported)</span></Label>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setPreview(v => !v)}>
                  <Eye className="w-3.5 h-3.5 mr-1" />{preview ? 'Edit' : 'Preview'}
                </Button>
              </div>
              {preview ? (
                <div className="min-h-[200px] rounded-md border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-300 whitespace-pre-wrap">
                  {content || <span className="text-zinc-700">Nothing to preview yet…</span>}
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={10}
                  placeholder="Write article content in Markdown…"
                  className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 resize-y font-mono"
                />
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSubmit} disabled={saving || !title.trim() || !content.trim()}>
                {saving ? 'Saving…' : 'Save as Draft'}
              </Button>
              <Button asChild variant="ghost">
                <Link href="/service/knowledge">Cancel</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
