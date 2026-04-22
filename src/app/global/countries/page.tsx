'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, X } from 'lucide-react'

interface TaxRegion {
  id: string
  name: string
  country: string
}

interface CountryConfig {
  id: string
  countryCode: string
  countryName: string
  currencyCode: string
  defaultLanguage: string
  taxRegionId: string | null
  dateFormat: string
  addressFormat: string
  phoneFormat: string | null
  isActive: boolean
  createdAt: string
}

interface CountryForm {
  countryCode: string
  countryName: string
  currencyCode: string
  defaultLanguage: string
  taxRegionId: string
  dateFormat: string
  addressFormat: string
  phoneFormat: string
}

const DATE_FORMATS = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD.MM.YYYY', 'YYYY/MM/DD']
const ADDRESS_FORMATS = ['standard', 'european', 'asian', 'latin']

export default function CountriesPage() {
  const [countries, setCountries] = useState<CountryConfig[]>([])
  const [taxRegions, setTaxRegions] = useState<TaxRegion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<CountryForm>({
    countryCode: '', countryName: '', currencyCode: 'USD', defaultLanguage: 'en-US',
    taxRegionId: '', dateFormat: 'MM/DD/YYYY', addressFormat: 'standard', phoneFormat: '',
  })

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const [cRes, tRes] = await Promise.all([
      fetch('/api/global/countries'),
      fetch('/api/global/tax-regions'),
    ])
    const [cData, tData] = await Promise.all([cRes.json(), tRes.json()])
    setCountries(Array.isArray(cData) ? cData : [])
    setTaxRegions(Array.isArray(tData) ? tData : [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const method = editId ? 'PATCH' : 'POST'
    const url = editId ? `/api/global/countries/${editId}` : '/api/global/countries'
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, taxRegionId: form.taxRegionId || null, phoneFormat: form.phoneFormat || null }),
    })
    setForm({ countryCode: '', countryName: '', currencyCode: 'USD', defaultLanguage: 'en-US', taxRegionId: '', dateFormat: 'MM/DD/YYYY', addressFormat: 'standard', phoneFormat: '' })
    setShowForm(false)
    setEditId(null)
    fetchAll()
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/global/countries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    })
    fetchAll()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this country configuration?')) return
    await fetch(`/api/global/countries/${id}`, { method: 'DELETE' })
    fetchAll()
  }

  function startEdit(c: CountryConfig) {
    setForm({
      countryCode: c.countryCode, countryName: c.countryName, currencyCode: c.currencyCode,
      defaultLanguage: c.defaultLanguage, taxRegionId: c.taxRegionId ?? '',
      dateFormat: c.dateFormat, addressFormat: c.addressFormat, phoneFormat: c.phoneFormat ?? '',
    })
    setEditId(c.id)
    setShowForm(true)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-100">Country Configuration</h1>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ countryCode: '', countryName: '', currencyCode: 'USD', defaultLanguage: 'en-US', taxRegionId: '', dateFormat: 'MM/DD/YYYY', addressFormat: 'standard', phoneFormat: '' }) }}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white"
        >
          <Plus className="w-4 h-4" /> New Country Config
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-200">{editId ? 'Edit Country Config' : 'New Country Config'}</h2>
            <button onClick={() => { setShowForm(false); setEditId(null) }} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Country Code * (ISO 3166)</label>
              <input value={form.countryCode} onChange={e => setForm(f => ({ ...f, countryCode: e.target.value.toUpperCase() }))} placeholder="US" maxLength={3} required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Country Name *</label>
              <input value={form.countryName} onChange={e => setForm(f => ({ ...f, countryName: e.target.value }))} placeholder="United States" required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Currency Code</label>
              <input value={form.currencyCode} onChange={e => setForm(f => ({ ...f, currencyCode: e.target.value.toUpperCase() }))} placeholder="USD" maxLength={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Default Language</label>
              <input value={form.defaultLanguage} onChange={e => setForm(f => ({ ...f, defaultLanguage: e.target.value }))} placeholder="en-US"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Tax Region</label>
              <select value={form.taxRegionId} onChange={e => setForm(f => ({ ...f, taxRegionId: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500">
                <option value="">None</option>
                {taxRegions.map(r => <option key={r.id} value={r.id}>{r.name} ({r.country})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Date Format</label>
              <select value={form.dateFormat} onChange={e => setForm(f => ({ ...f, dateFormat: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500">
                {DATE_FORMATS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Address Format</label>
              <select value={form.addressFormat} onChange={e => setForm(f => ({ ...f, addressFormat: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500">
                {ADDRESS_FORMATS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Phone Format</label>
              <input value={form.phoneFormat} onChange={e => setForm(f => ({ ...f, phoneFormat: e.target.value }))} placeholder="+1 (###) ###-####"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div className="col-span-4 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white">{editId ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm text-zinc-300">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Code</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Country</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Currency</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Language</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tax Region</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Date Format</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-8 text-zinc-600">Loading...</td></tr>
            ) : countries.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-8 text-zinc-600">No country configs. Add one above.</td></tr>
            ) : countries.map(c => {
              const region = taxRegions.find(r => r.id === c.taxRegionId)
              return (
                <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-4 py-3 font-mono font-bold text-zinc-100">{c.countryCode}</td>
                  <td className="px-4 py-3 text-zinc-300">{c.countryName}</td>
                  <td className="px-4 py-3 font-mono text-emerald-400">{c.currencyCode}</td>
                  <td className="px-4 py-3"><span className="font-mono text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">{c.defaultLanguage}</span></td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{region ? region.name : '—'}</td>
                  <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{c.dateFormat}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(c.id, c.isActive)} className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${c.isActive ? 'bg-blue-600' : 'bg-zinc-700'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${c.isActive ? 'translate-x-4' : ''}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => startEdit(c)} className="text-zinc-400 hover:text-blue-400 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(c.id)} className="text-zinc-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
