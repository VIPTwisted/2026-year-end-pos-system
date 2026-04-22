'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, Star, X } from 'lucide-react'

interface Language {
  id: string
  code: string
  name: string
  nativeName: string
  isDefault: boolean
  isActive: boolean
  rtl: boolean
  createdAt: string
}

interface LangForm {
  code: string
  name: string
  nativeName: string
  rtl: boolean
  isDefault: boolean
}

export default function LanguagesPage() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<LangForm>({ code: '', name: '', nativeName: '', rtl: false, isDefault: false })

  useEffect(() => { fetchLanguages() }, [])

  async function fetchLanguages() {
    setLoading(true)
    const res = await fetch('/api/global/languages')
    const data = await res.json()
    setLanguages(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/global/languages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm({ code: '', name: '', nativeName: '', rtl: false, isDefault: false })
    setShowForm(false)
    fetchLanguages()
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/global/languages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    })
    fetchLanguages()
  }

  async function setDefault(id: string) {
    await fetch(`/api/global/languages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDefault: true }),
    })
    fetchLanguages()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this language?')) return
    await fetch(`/api/global/languages/${id}`, { method: 'DELETE' })
    fetchLanguages()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-100">Language Management</h1>
        <button
          onClick={() => { setShowForm(true); setForm({ code: '', name: '', nativeName: '', rtl: false, isDefault: false }) }}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white"
        >
          <Plus className="w-4 h-4" /> New Language
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-200">New Language</h2>
            <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Code * (e.g. en-US)</label>
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="en-US" required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="English (United States)" required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Native Name *</label>
              <input value={form.nativeName} onChange={e => setForm(f => ({ ...f, nativeName: e.target.value }))} placeholder="English" required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.rtl} onChange={e => setForm(f => ({ ...f, rtl: e.target.checked }))} className="w-4 h-4 rounded accent-blue-500" />
                <span className="text-sm text-zinc-300">RTL Language</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isDefault} onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))} className="w-4 h-4 rounded accent-blue-500" />
                <span className="text-sm text-zinc-300">Set as Default</span>
              </label>
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm text-zinc-300">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-zinc-600">Loading...</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {languages.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-zinc-600">No languages configured</div>
          ) : languages.map(lang => (
            <div key={lang.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-lg font-bold text-zinc-100">{lang.nativeName}</span>
                    {lang.isDefault && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                  </div>
                  <div className="text-sm text-zinc-400">{lang.name}</div>
                </div>
                <span className="font-mono text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-400">{lang.code}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {lang.rtl && <span className="px-2 py-0.5 bg-violet-600/20 border border-violet-600/30 rounded text-violet-400 text-xs font-medium">RTL</span>}
                {lang.isDefault && <span className="px-2 py-0.5 bg-amber-600/20 border border-amber-600/30 rounded text-amber-400 text-xs font-medium">Default</span>}
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-zinc-800">
                <button onClick={() => toggleActive(lang.id, lang.isActive)} className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${lang.isActive ? 'bg-blue-600' : 'bg-zinc-700'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${lang.isActive ? 'translate-x-4' : ''}`} />
                </button>
                <span className="text-xs text-zinc-500">{lang.isActive ? 'Active' : 'Inactive'}</span>
                {!lang.isDefault && (
                  <button onClick={() => setDefault(lang.id)} className="ml-auto text-xs text-zinc-500 hover:text-amber-400 transition-colors">Set Default</button>
                )}
                <button onClick={() => handleDelete(lang.id)} className="text-zinc-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
