'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Save, X, Search } from 'lucide-react'

interface Language {
  id: string
  code: string
  name: string
  nativeName: string
  isActive: boolean
}

interface Translation {
  id: string
  languageCode: string
  entityType: string
  entityId: string | null
  key: string
  value: string
}

interface AddForm {
  languageCode: string
  entityType: string
  entityId: string
  key: string
  value: string
}

const ENTITY_TYPES = ['all', 'product', 'category', 'ui-label', 'receipt', 'email-template']

export default function TranslationsPage() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [translations, setTranslations] = useState<Translation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLang, setSelectedLang] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [addForm, setAddForm] = useState<AddForm>({ languageCode: '', entityType: 'ui-label', entityId: '', key: '', value: '' })

  useEffect(() => { fetchLanguages() }, [])
  useEffect(() => { fetchTranslations() }, [selectedLang, selectedType])

  async function fetchLanguages() {
    const res = await fetch('/api/global/languages')
    const data = await res.json()
    setLanguages(Array.isArray(data) ? data.filter((l: Language) => l.isActive) : [])
  }

  const fetchTranslations = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedLang !== 'all') params.set('languageCode', selectedLang)
    if (selectedType !== 'all') params.set('entityType', selectedType)
    const res = await fetch(`/api/global/translations?${params}`)
    const data = await res.json()
    setTranslations(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [selectedLang, selectedType])

  async function handleSave(t: Translation) {
    setSavingId(t.id)
    const newValue = editValues[t.id] ?? t.value
    await fetch(`/api/global/translations/${t.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: newValue }),
    })
    setSavingId(null)
    fetchTranslations()
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/global/translations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...addForm, entityId: addForm.entityId || null }),
    })
    setAddForm({ languageCode: '', entityType: 'ui-label', entityId: '', key: '', value: '' })
    setShowAddForm(false)
    fetchTranslations()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this translation?')) return
    await fetch(`/api/global/translations/${id}`, { method: 'DELETE' })
    fetchTranslations()
  }

  const filtered = translations.filter(t =>
    !search ||
    t.key.toLowerCase().includes(search.toLowerCase()) ||
    t.value.toLowerCase().includes(search.toLowerCase())
  )

  const totalForLang = translations.length
  const withValue = translations.filter(t => t.value.trim().length > 0).length
  const pct = totalForLang > 0 ? Math.round((withValue / totalForLang) * 100) : 0

  const entityTypeBadge: Record<string, string> = {
    product: 'bg-blue-600/20 text-blue-400',
    category: 'bg-violet-600/20 text-violet-400',
    'ui-label': 'bg-emerald-600/20 text-emerald-400',
    receipt: 'bg-amber-600/20 text-amber-400',
    'email-template': 'bg-orange-600/20 text-orange-400',
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-100">Translation Management</h1>
        <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white">
          <Plus className="w-4 h-4" /> Add Translation
        </button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Language</label>
          <select value={selectedLang} onChange={e => setSelectedLang(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500">
            <option value="all">All Languages</option>
            {languages.map(l => <option key={l.code} value={l.code}>{l.code} — {l.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Entity Type</label>
          <div className="flex gap-1">
            {ENTITY_TYPES.map(t => (
              <button key={t} onClick={() => setSelectedType(t)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${selectedType === t ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                {t === 'all' ? 'All' : t}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 min-w-48">
          <label className="block text-xs text-zinc-400 mb-1">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search keys or values..."
              className="w-full pl-9 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
          </div>
        </div>
      </div>

      {selectedLang !== 'all' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Translation Progress</span>
            <span className="text-sm font-semibold text-zinc-200">{withValue} / {totalForLang} strings ({pct}%)</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full">
            <div className="h-2 bg-blue-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-200">Add Translation</h2>
            <button onClick={() => setShowAddForm(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleAdd} className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Language *</label>
              <select value={addForm.languageCode} onChange={e => setAddForm(f => ({ ...f, languageCode: e.target.value }))} required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500">
                <option value="">Select...</option>
                {languages.map(l => <option key={l.code} value={l.code}>{l.code} — {l.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Entity Type *</label>
              <select value={addForm.entityType} onChange={e => setAddForm(f => ({ ...f, entityType: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500">
                {ENTITY_TYPES.filter(t => t !== 'all').map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Entity ID (optional)</label>
              <input value={addForm.entityId} onChange={e => setAddForm(f => ({ ...f, entityId: e.target.value }))} placeholder="Leave blank for global"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Key *</label>
              <input value={addForm.key} onChange={e => setAddForm(f => ({ ...f, key: e.target.value }))} required placeholder="checkout.button.continue"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-zinc-400 mb-1">Value *</label>
              <input value={addForm.value} onChange={e => setAddForm(f => ({ ...f, value: e.target.value }))} required placeholder="Translated text"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div className="col-span-3 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white">Save</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm text-zinc-300">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Language</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Key</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Translation</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-zinc-600">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-zinc-600">No translations found</td></tr>
            ) : filtered.map(t => (
              <tr key={t.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="px-4 py-3"><span className="font-mono text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">{t.languageCode}</span></td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${entityTypeBadge[t.entityType] ?? 'bg-zinc-700 text-zinc-400'}`}>{t.entityType}</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-300">{t.key}</td>
                <td className="px-4 py-3">
                  <input value={editValues[t.id] ?? t.value} onChange={e => setEditValues(v => ({ ...v, [t.id]: e.target.value }))}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleSave(t)} disabled={savingId === t.id}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 hover:bg-blue-600/40 rounded text-blue-400 text-xs disabled:opacity-50">
                      <Save className="w-3 h-3" />
                      {savingId === t.id ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="text-zinc-500 hover:text-red-400 transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
