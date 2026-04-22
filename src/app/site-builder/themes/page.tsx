'use client'

import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Palette, CheckCircle2, Loader2 } from 'lucide-react'

interface SiteTheme {
  id: string
  name: string
  isActive: boolean
  primaryColor: string
  fontFamily: string
  logoUrl?: string | null
  faviconUrl?: string | null
  createdAt: string
}

const FONT_FAMILIES = [
  'Segoe UI', 'Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat', 'Georgia', 'Times New Roman',
]

export default function ThemesPage() {
  const [themes, setThemes] = useState<SiteTheme[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [activating, setActivating] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    primaryColor: '#0078d4',
    fontFamily: 'Segoe UI',
    logoUrl: '',
    faviconUrl: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/site/themes').then(r => r.json()).then(data => {
      setThemes(Array.isArray(data) ? data : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function handleActivate(id: string) {
    setActivating(id)
    const res = await fetch(`/api/site/themes/${id}/activate`, { method: 'POST' })
    if (res.ok) {
      setThemes(prev => prev.map(t => ({ ...t, isActive: t.id === id })))
    }
    setActivating(null)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) { setError('Name required'); return }
    setCreating(true)
    const res = await fetch('/api/site/themes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        primaryColor: form.primaryColor,
        fontFamily: form.fontFamily,
        logoUrl: form.logoUrl || undefined,
        faviconUrl: form.faviconUrl || undefined,
      }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed'); setCreating(false); return }
    setThemes(prev => [data, ...prev])
    setForm({ name: '', primaryColor: '#0078d4', fontFamily: 'Segoe UI', logoUrl: '', faviconUrl: '' })
    setShowForm(false)
    setCreating(false)
  }

  function set(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  return (
    <>
      <TopBar title="Theme Settings" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Site Themes</h2>
            <p className="text-sm text-zinc-500">Manage your store&apos;s visual themes</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> New Theme
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <Card>
            <CardContent className="pt-5">
              <h3 className="text-sm font-semibold text-zinc-100 mb-4">Create Theme</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Theme Name <span className="text-red-400">*</span></label>
                    <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Summer 2026" className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Font Family</label>
                    <select value={form.fontFamily} onChange={e => set('fontFamily', e.target.value)} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500">
                      {FONT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={form.primaryColor} onChange={e => set('primaryColor', e.target.value)} className="w-10 h-9 rounded border border-zinc-700 bg-zinc-900 cursor-pointer" />
                      <input value={form.primaryColor} onChange={e => set('primaryColor', e.target.value)} className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Logo URL</label>
                    <input value={form.logoUrl} onChange={e => set('logoUrl', e.target.value)} placeholder="https://..." className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">Favicon URL</label>
                    <input value={form.faviconUrl} onChange={e => set('faviconUrl', e.target.value)} placeholder="https://..." className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-zinc-700 text-zinc-400 rounded-lg text-sm">Cancel</button>
                  <button type="submit" disabled={creating} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                    {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create Theme
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Themes grid */}
        {loading && <p className="text-zinc-500 text-sm">Loading...</p>}
        {!loading && themes.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-600">
              <Palette className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No themes created yet.</p>
              <button onClick={() => setShowForm(true)} className="mt-2 text-sm text-blue-400 hover:text-blue-300">Create your first theme</button>
            </CardContent>
          </Card>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {themes.map(theme => (
            <Card
              key={theme.id}
              className={`border transition-all ${theme.isActive ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-zinc-800'}`}
            >
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg shadow"
                      style={{ backgroundColor: theme.primaryColor }}
                    />
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                        {theme.name}
                        {theme.isActive && (
                          <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-zinc-500">{theme.fontFamily}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 mb-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 w-20">Primary:</span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
                      <span className="font-mono text-zinc-300">{theme.primaryColor}</span>
                    </span>
                  </div>
                  {theme.logoUrl && (
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 w-20">Logo:</span>
                      <span className="text-zinc-400 truncate">{theme.logoUrl}</span>
                    </div>
                  )}
                </div>

                {!theme.isActive && (
                  <button
                    onClick={() => handleActivate(theme.id)}
                    disabled={activating === theme.id}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-zinc-700 hover:border-emerald-500 text-zinc-400 hover:text-emerald-300 rounded-lg text-xs font-medium transition-colors"
                  >
                    {activating === theme.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    Activate
                  </button>
                )}
                {theme.isActive && (
                  <div className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Currently Active
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  )
}
