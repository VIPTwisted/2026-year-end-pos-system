'use client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Save } from 'lucide-react'

interface BoostField { field: string; weight: number }
interface Facet { field: string; label: string; type: string }
interface SynonymGroup { terms: string[] }
interface Config {
  id: string; name: string; channelId: string | null
  boostFields: string; facets: string; synonyms: string; stopWords: string
  minSearchLength: number; maxResults: number; enableAutocomplete: boolean; isActive: boolean
}

const BOOST_FIELD_OPTIONS = ['name', 'description', 'tags', 'category', 'sku']
const FACET_TYPE_OPTIONS = ['checkbox', 'range', 'dropdown']

export default function SearchConfigDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [minLen, setMinLen] = useState(2)
  const [maxResults, setMaxResults] = useState(48)
  const [autocomplete, setAutocomplete] = useState(true)
  const [boostFields, setBoostFields] = useState<BoostField[]>([])
  const [facets, setFacets] = useState<Facet[]>([])
  const [synonyms, setSynonyms] = useState<SynonymGroup[]>([])
  const [stopWords, setStopWords] = useState('')
  const [synInput, setSynInput] = useState('')
  const [newBoost, setNewBoost] = useState<BoostField>({ field: 'name', weight: 5 })
  const [newFacet, setNewFacet] = useState<Facet>({ field: '', label: '', type: 'checkbox' })

  async function load() {
    setLoading(true)
    const data = await fetch(`/api/ecom/search-config/${id}`).then(r => r.json())
    setConfig(data)
    setMinLen(data.minSearchLength)
    setMaxResults(data.maxResults)
    setAutocomplete(data.enableAutocomplete)
    try { setBoostFields(JSON.parse(data.boostFields ?? '[]')) } catch { setBoostFields([]) }
    try { setFacets(JSON.parse(data.facets ?? '[]')) } catch { setFacets([]) }
    try { setSynonyms(JSON.parse(data.synonyms ?? '[]')) } catch { setSynonyms([]) }
    try { setStopWords(JSON.parse(data.stopWords ?? '[]').join(', ')) } catch { setStopWords('') }
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  async function save() {
    setSaving(true)
    const stopArr = stopWords.split(',').map(w => w.trim()).filter(Boolean)
    await fetch(`/api/ecom/search-config/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        minSearchLength: minLen,
        maxResults,
        enableAutocomplete: autocomplete,
        boostFields,
        facets,
        synonyms,
        stopWords: stopArr,
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function addBoostField() {
    if (!newBoost.field) return
    setBoostFields(prev => [...prev, { ...newBoost }])
    setNewBoost({ field: 'name', weight: 5 })
  }

  function addFacet() {
    if (!newFacet.field || !newFacet.label) return
    setFacets(prev => [...prev, { ...newFacet }])
    setNewFacet({ field: '', label: '', type: 'checkbox' })
  }

  function moveFacet(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= facets.length) return
    setFacets(prev => {
      const arr = [...prev]
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
      return arr
    })
  }

  function addSynonymGroup() {
    if (!synInput.trim()) return
    const terms = synInput.split(',').map(t => t.trim()).filter(Boolean)
    if (terms.length < 2) return
    setSynonyms(prev => [...prev, { terms }])
    setSynInput('')
  }

  if (loading || !config) return <div className="p-6 text-zinc-400">Loading...</div>

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/ecom/search-config" className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400"><ArrowLeft className="w-4 h-4" /></Link>
        <h1 className="text-xl font-bold text-zinc-100 flex-1">{config.name}</h1>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg disabled:opacity-50">
          <Save className="w-4 h-4" /> {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* 1. General */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">General</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 grid grid-cols-3 gap-6">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Min Search Length</label>
            <input type="number" value={minLen} onChange={e => setMinLen(parseInt(e.target.value))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Max Results</label>
            <input type="number" value={maxResults} onChange={e => setMaxResults(parseInt(e.target.value))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
          </div>
          <div className="flex items-center gap-3 pt-5">
            <button type="button" onClick={() => setAutocomplete(v => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${autocomplete ? 'bg-blue-600' : 'bg-zinc-700'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${autocomplete ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
            <span className="text-sm text-zinc-300">Enable Autocomplete</span>
          </div>
        </div>
      </section>

      {/* 2. Boost Fields */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Boost Fields</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
          <div className="flex gap-2 items-end">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Field</label>
              <select value={newBoost.field} onChange={e => setNewBoost(p => ({ ...p, field: e.target.value }))}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                {BOOST_FIELD_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Weight (1-10)</label>
              <input type="number" min="1" max="10" value={newBoost.weight} onChange={e => setNewBoost(p => ({ ...p, weight: parseInt(e.target.value) }))}
                className="w-24 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <button onClick={addBoostField} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          {boostFields.length === 0 && <p className="text-sm text-zinc-500">No boost fields configured</p>}
          {boostFields.length > 0 && (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-zinc-700">
                <th className="text-left py-2 text-xs text-zinc-400">Field</th>
                <th className="text-left py-2 text-xs text-zinc-400">Weight</th>
                <th />
              </tr></thead>
              <tbody>
                {boostFields.map((b, i) => (
                  <tr key={i} className="border-b border-zinc-800/50">
                    <td className="py-2 text-zinc-300">{b.field}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-zinc-700 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${b.weight * 10}%` }} />
                        </div>
                        <span className="text-zinc-400 text-xs">{b.weight}</span>
                      </div>
                    </td>
                    <td className="py-2 text-right">
                      <button onClick={() => setBoostFields(prev => prev.filter((_, j) => j !== i))} className="p-1 hover:bg-zinc-700 rounded text-zinc-500 hover:text-rose-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* 3. Facets */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Facets</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-3">
          <div className="flex gap-2 items-end">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Field</label>
              <input value={newFacet.field} onChange={e => setNewFacet(p => ({ ...p, field: e.target.value }))} placeholder="e.g. brand"
                className="w-32 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Label</label>
              <input value={newFacet.label} onChange={e => setNewFacet(p => ({ ...p, label: e.target.value }))} placeholder="Brand"
                className="w-32 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Type</label>
              <select value={newFacet.type} onChange={e => setNewFacet(p => ({ ...p, type: e.target.value }))}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                {FACET_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <button onClick={addFacet} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          {facets.length === 0 && <p className="text-sm text-zinc-500">No facets configured</p>}
          {facets.length > 0 && (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-zinc-700">
                <th className="text-left py-2 text-xs text-zinc-400">Field</th>
                <th className="text-left py-2 text-xs text-zinc-400">Label</th>
                <th className="text-left py-2 text-xs text-zinc-400">Type</th>
                <th className="text-right py-2 text-xs text-zinc-400">Order</th>
                <th />
              </tr></thead>
              <tbody>
                {facets.map((f, i) => (
                  <tr key={i} className="border-b border-zinc-800/50">
                    <td className="py-2 text-zinc-300">{f.field}</td>
                    <td className="py-2 text-zinc-300">{f.label}</td>
                    <td className="py-2 text-zinc-400 text-xs">{f.type}</td>
                    <td className="py-2 text-right">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => moveFacet(i, -1)} disabled={i === 0} className="p-1 hover:bg-zinc-700 rounded text-zinc-500 disabled:opacity-30">
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button onClick={() => moveFacet(i, 1)} disabled={i === facets.length - 1} className="p-1 hover:bg-zinc-700 rounded text-zinc-500 disabled:opacity-30">
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="py-2">
                      <button onClick={() => setFacets(prev => prev.filter((_, j) => j !== i))} className="p-1 hover:bg-zinc-700 rounded text-zinc-500 hover:text-rose-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* 4. Synonyms + Stop Words */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Synonyms & Stop Words</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-5">
          <div>
            <label className="block text-xs text-zinc-400 mb-2">Add Synonym Group (comma-separated, min 2 terms)</label>
            <div className="flex gap-2">
              <input value={synInput} onChange={e => setSynInput(e.target.value)} placeholder="sneakers, shoes, trainers"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSynonymGroup() }}}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
              <button onClick={addSynonymGroup} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {synonyms.map((g, i) => (
                <div key={i} className="flex items-center gap-1 px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full">
                  <span className="text-sm text-zinc-300">{g.terms.join(' = ')}</span>
                  <button onClick={() => setSynonyms(prev => prev.filter((_, j) => j !== i))} className="hover:text-rose-400 text-zinc-500 ml-1">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {synonyms.length === 0 && <p className="text-sm text-zinc-500">No synonym groups</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Stop Words (comma-separated)</label>
            <textarea value={stopWords} onChange={e => setStopWords(e.target.value)} rows={3}
              placeholder="the, a, an, in, on, at, for, with..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none" />
          </div>
        </div>
      </section>
    </div>
  )
}
