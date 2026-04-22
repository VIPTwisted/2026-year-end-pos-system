'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, Plus, ExternalLink, CheckCircle, XCircle } from 'lucide-react'

interface SearchConfig {
  id: string; name: string; channelId: string | null; minSearchLength: number
  maxResults: number; enableAutocomplete: boolean; isActive: boolean; createdAt: string
}

export default function SearchConfigPage() {
  const [configs, setConfigs] = useState<SearchConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', channelId: '', minSearchLength: '2', maxResults: '48', enableAutocomplete: true })
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const data = await fetch('/api/ecom/search-config').then(r => r.json())
    setConfigs(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function create(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/ecom/search-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        channelId: form.channelId || null,
        minSearchLength: parseInt(form.minSearchLength),
        maxResults: parseInt(form.maxResults),
        enableAutocomplete: form.enableAutocomplete,
      }),
    })
    setForm({ name: '', channelId: '', minSearchLength: '2', maxResults: '48', enableAutocomplete: true })
    setShowForm(false)
    setSaving(false)
    load()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Search className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-zinc-100">Search Configuration</h1>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg">
          <Plus className="w-4 h-4" /> New Config
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="rounded-xl border border-zinc-700 bg-zinc-900 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-300">New Search Configuration</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Config Name *</label>
              <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Default Search Config"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Channel ID</label>
              <input value={form.channelId} onChange={e => setForm(p => ({ ...p, channelId: e.target.value }))} placeholder="Optional"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Min Search Length</label>
              <input type="number" value={form.minSearchLength} onChange={e => setForm(p => ({ ...p, minSearchLength: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Max Results</label>
              <input type="number" value={form.maxResults} onChange={e => setForm(p => ({ ...p, maxResults: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <button type="button" onClick={() => setForm(p => ({ ...p, enableAutocomplete: !p.enableAutocomplete }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.enableAutocomplete ? 'bg-blue-600' : 'bg-zinc-700'}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.enableAutocomplete ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-sm text-zinc-300">Enable Autocomplete</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg disabled:opacity-50">
              {saving ? 'Creating...' : 'Create Config'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-2 gap-4">
        {loading && <div className="col-span-2 text-center py-8 text-zinc-500">Loading...</div>}
        {!loading && configs.length === 0 && <div className="col-span-2 text-center py-8 text-zinc-500">No search configs yet</div>}
        {configs.map(c => (
          <div key={c.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">{c.name}</h3>
                {c.channelId && <p className="text-xs text-zinc-500">Channel: {c.channelId}</p>}
              </div>
              <div className="flex items-center gap-2">
                {c.isActive ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle className="w-3.5 h-3.5" />Active</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-zinc-500"><XCircle className="w-3.5 h-3.5" />Inactive</span>
                )}
                <Link href={`/ecom/search-config/${c.id}`} className="p-1.5 hover:bg-zinc-700 rounded text-zinc-400 hover:text-zinc-100">
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-800 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-zinc-100">{c.minSearchLength}</div>
                <div className="text-xs text-zinc-500">Min Length</div>
              </div>
              <div className="bg-zinc-800 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-zinc-100">{c.maxResults}</div>
                <div className="text-xs text-zinc-500">Max Results</div>
              </div>
              <div className="bg-zinc-800 rounded-lg p-3 text-center">
                <div className={`text-lg font-bold ${c.enableAutocomplete ? 'text-emerald-400' : 'text-zinc-500'}`}>{c.enableAutocomplete ? 'On' : 'Off'}</div>
                <div className="text-xs text-zinc-500">Autocomplete</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
