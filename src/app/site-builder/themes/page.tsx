'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Pencil, Trash2, CheckCircle } from 'lucide-react'

type SiteTheme = {
  id: string
  name: string
  primaryColor: string
  accentColor: string
  fontFamily: string
  logoUrl: string | null
  isActive: boolean
  createdAt: string
}

const BLANK: Partial<SiteTheme> = {
  name: '', primaryColor: '#2563eb', accentColor: '#7c3aed', fontFamily: 'Inter', logoUrl: '', isActive: false,
}

export default function SiteThemesPage() {
  const [themes, setThemes] = useState<SiteTheme[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<Partial<SiteTheme>>(BLANK)
  const [editing, setEditing] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/site/themes')
    setThemes(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function save() {
    setSaving(true)
    if (editing) {
      await fetch(`/api/site/themes/${editing}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    } else {
      await fetch('/api/site/themes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    }
    setSaving(false); setShowForm(false); setEditing(null); setForm(BLANK); load()
  }

  async function activate(id: string) {
    // Deactivate all, then activate selected
    for (const t of themes) {
      if (t.isActive) await fetch(`/api/site/themes/${t.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: false }) })
    }
    await fetch(`/api/site/themes/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: true }) })
    load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this theme?')) return
    await fetch(`/api/site/themes/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <TopBar title="Themes" />
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-zinc-400">{themes.length} theme{themes.length !== 1 ? 's' : ''}</div>
          <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700" onClick={() => { setForm(BLANK); setEditing(null); setShowForm(true) }}>
            <Plus className="w-3 h-3" /> New Theme
          </Button>
        </div>

        {showForm && (
          <Card className="bg-zinc-900 border-blue-600/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-100">{editing ? 'Edit Theme' : 'New Theme'}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Name</label>
                  <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Primary Color</label>
                  <input type="color" className="w-full h-9 bg-zinc-800 border border-zinc-700 rounded px-1 cursor-pointer"
                    value={form.primaryColor ?? '#2563eb'} onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Accent Color</label>
                  <input type="color" className="w-full h-9 bg-zinc-800 border border-zinc-700 rounded px-1 cursor-pointer"
                    value={form.accentColor ?? '#7c3aed'} onChange={e => setForm(f => ({ ...f, accentColor: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Font Family</label>
                  <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    value={form.fontFamily ?? ''} onChange={e => setForm(f => ({ ...f, fontFamily: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-zinc-400 mb-1 block">Logo URL</label>
                  <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    value={form.logoUrl ?? ''} onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
                <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => { setShowForm(false); setEditing(null); setForm(BLANK) }}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 text-sm text-zinc-500 py-8 text-center">Loading…</div>
          ) : themes.length === 0 ? (
            <div className="col-span-3 text-sm text-zinc-500 py-8 text-center">No themes yet.</div>
          ) : themes.map(t => (
            <Card key={t.id} className={`bg-zinc-900 border ${t.isActive ? 'border-emerald-600' : 'border-zinc-800'}`}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-zinc-100 text-sm">{t.name}</span>
                  {t.isActive && <Badge variant="success" className="text-xs">Active</Badge>}
                </div>
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full border border-zinc-700" style={{ backgroundColor: t.primaryColor }} title={`Primary: ${t.primaryColor}`} />
                  <div className="w-6 h-6 rounded-full border border-zinc-700" style={{ backgroundColor: t.accentColor }} title={`Accent: ${t.accentColor}`} />
                  <span className="text-xs text-zinc-500 self-center">{t.fontFamily}</span>
                </div>
                <div className="flex gap-2 pt-1">
                  {!t.isActive && (
                    <Button size="sm" variant="outline" className="border-emerald-700 text-emerald-400 hover:bg-emerald-900/30 gap-1 text-xs" onClick={() => activate(t.id)}>
                      <CheckCircle className="w-3 h-3" /> Activate
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-zinc-100" onClick={() => { setForm(t); setEditing(t.id); setShowForm(true) }}><Pencil className="w-3 h-3" /></Button>
                  <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => remove(t.id)}><Trash2 className="w-3 h-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
