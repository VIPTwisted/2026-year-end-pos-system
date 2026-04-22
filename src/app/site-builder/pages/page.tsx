'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Pencil, Trash2, Globe, FileText } from 'lucide-react'

type SitePage = {
  id: string
  title: string
  slug: string
  status: string
  template: string
  isHomePage: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'secondary' | 'outline'> = {
  published: 'success',
  draft: 'secondary',
  archived: 'outline',
}

const BLANK: Partial<SitePage> = { title: '', slug: '', status: 'draft', template: 'default', isHomePage: false, sortOrder: 0 }

export default function SitePagesPage() {
  const [pages, setPages] = useState<SitePage[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<Partial<SitePage>>(BLANK)
  const [editing, setEditing] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/site/pages')
    setPages(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function save() {
    setSaving(true)
    if (editing) {
      await fetch(`/api/site/pages/${editing}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    } else {
      await fetch('/api/site/pages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    }
    setSaving(false)
    setShowForm(false)
    setEditing(null)
    setForm(BLANK)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this page?')) return
    await fetch(`/api/site/pages/${id}`, { method: 'DELETE' })
    load()
  }

  function startEdit(p: SitePage) {
    setForm(p)
    setEditing(p.id)
    setShowForm(true)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <TopBar title="Pages" />
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-zinc-400">{pages.length} page{pages.length !== 1 ? 's' : ''}</div>
          <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700" onClick={() => { setForm(BLANK); setEditing(null); setShowForm(true) }}>
            <Plus className="w-3 h-3" /> New Page
          </Button>
        </div>

        {showForm && (
          <Card className="bg-zinc-900 border-blue-600/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-zinc-100">{editing ? 'Edit Page' : 'New Page'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Title</label>
                  <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    value={form.title ?? ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Slug</label>
                  <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
                    value={form.slug ?? ''} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Template</label>
                  <select className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none"
                    value={form.template ?? 'default'} onChange={e => setForm(f => ({ ...f, template: e.target.value }))}>
                    <option value="default">Default</option>
                    <option value="landing">Landing</option>
                    <option value="blog">Blog</option>
                    <option value="blank">Blank</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Status</label>
                  <select className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none"
                    value={form.status ?? 'draft'} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input type="checkbox" className="accent-blue-600" checked={!!form.isHomePage} onChange={e => setForm(f => ({ ...f, isHomePage: e.target.checked }))} />
                  Set as Home Page
                </label>
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
                <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => { setShowForm(false); setEditing(null); setForm(BLANK) }}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4">
            {loading ? (
              <div className="text-sm text-zinc-500 py-8 text-center">Loading…</div>
            ) : pages.length === 0 ? (
              <div className="text-sm text-zinc-500 py-8 text-center">No pages yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                    <th className="text-left py-2 font-medium">Title</th>
                    <th className="text-left py-2 font-medium">Slug</th>
                    <th className="text-left py-2 font-medium">Template</th>
                    <th className="text-left py-2 font-medium">Status</th>
                    <th className="text-left py-2 font-medium">Home</th>
                    <th className="text-right py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map(p => (
                    <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-2 text-zinc-200 font-medium flex items-center gap-2">
                        <FileText className="w-3 h-3 text-zinc-500" /> {p.title}
                      </td>
                      <td className="py-2 text-zinc-400 font-mono text-xs">/{p.slug}</td>
                      <td className="py-2 text-zinc-400 capitalize">{p.template}</td>
                      <td className="py-2">
                        <Badge variant={STATUS_VARIANT[p.status] ?? 'secondary'} className="capitalize text-xs">{p.status}</Badge>
                      </td>
                      <td className="py-2">{p.isHomePage && <Globe className="w-3 h-3 text-blue-400" />}</td>
                      <td className="py-2 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-zinc-400 hover:text-zinc-100" onClick={() => startEdit(p)}><Pencil className="w-3 h-3" /></Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-red-400 hover:text-red-300" onClick={() => remove(p.id)}><Trash2 className="w-3 h-3" /></Button>
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
