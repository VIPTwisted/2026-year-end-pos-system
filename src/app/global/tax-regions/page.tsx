'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit2, X } from 'lucide-react'
import Link from 'next/link'

interface RegionTaxCode {
  id: string
  code: string
  rate: number
  category: string
}

interface TaxRegion {
  id: string
  name: string
  country: string
  stateProvince: string | null
  taxType: string
  standardRate: number
  reducedRate: number | null
  zeroRate: number
  isActive: boolean
  codes: RegionTaxCode[]
  createdAt: string
}

interface RegionForm {
  name: string
  country: string
  stateProvince: string
  taxType: string
  standardRate: string
  reducedRate: string
  zeroRate: string
}

export default function TaxRegionsPage() {
  const [regions, setRegions] = useState<TaxRegion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState('all')

  const [form, setForm] = useState<RegionForm>({
    name: '', country: '', stateProvince: '', taxType: 'vat',
    standardRate: '0', reducedRate: '', zeroRate: '0',
  })

  useEffect(() => { fetchRegions() }, [])

  async function fetchRegions() {
    setLoading(true)
    const res = await fetch('/api/global/tax-regions')
    const data = await res.json()
    setRegions(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const method = editId ? 'PATCH' : 'POST'
    const url = editId ? `/api/global/tax-regions/${editId}` : '/api/global/tax-regions'
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        standardRate: parseFloat(form.standardRate),
        reducedRate: form.reducedRate ? parseFloat(form.reducedRate) : null,
        zeroRate: parseFloat(form.zeroRate),
        stateProvince: form.stateProvince || null,
      }),
    })
    setForm({ name: '', country: '', stateProvince: '', taxType: 'vat', standardRate: '0', reducedRate: '', zeroRate: '0' })
    setShowForm(false)
    setEditId(null)
    fetchRegions()
  }

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/global/tax-regions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    })
    fetchRegions()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this tax region and all its codes?')) return
    await fetch(`/api/global/tax-regions/${id}`, { method: 'DELETE' })
    fetchRegions()
  }

  function startEdit(r: TaxRegion) {
    setForm({
      name: r.name, country: r.country, stateProvince: r.stateProvince ?? '',
      taxType: r.taxType, standardRate: String(r.standardRate),
      reducedRate: r.reducedRate !== null ? String(r.reducedRate) : '',
      zeroRate: String(r.zeroRate),
    })
    setEditId(r.id)
    setShowForm(true)
  }

  const countries = ['all', ...Array.from(new Set(regions.map(r => r.country))).sort()]
  const filtered = selectedCountry === 'all' ? regions : regions.filter(r => r.country === selectedCountry)

  const taxTypeBadge: Record<string, string> = {
    vat: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
    gst: 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30',
    'sales-tax': 'bg-amber-600/20 text-amber-400 border-amber-600/30',
    hst: 'bg-violet-600/20 text-violet-400 border-violet-600/30',
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-100">Tax Regions</h1>
        <button
          onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', country: '', stateProvince: '', taxType: 'vat', standardRate: '0', reducedRate: '', zeroRate: '0' }) }}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white"
        >
          <Plus className="w-4 h-4" /> New Tax Region
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-200">{editId ? 'Edit Tax Region' : 'New Tax Region'}</h2>
            <button onClick={() => { setShowForm(false); setEditId(null) }} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Country *</label>
              <input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} placeholder="United States" required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">State/Province</label>
              <input value={form.stateProvince} onChange={e => setForm(f => ({ ...f, stateProvince: e.target.value }))} placeholder="California"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Tax Type</label>
              <select value={form.taxType} onChange={e => setForm(f => ({ ...f, taxType: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500">
                <option value="vat">VAT</option>
                <option value="gst">GST</option>
                <option value="sales-tax">Sales Tax</option>
                <option value="hst">HST</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Standard Rate %</label>
              <input type="number" step="0.01" value={form.standardRate} onChange={e => setForm(f => ({ ...f, standardRate: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Reduced Rate %</label>
              <input type="number" step="0.01" value={form.reducedRate} onChange={e => setForm(f => ({ ...f, reducedRate: e.target.value }))} placeholder="Optional"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Zero Rate %</label>
              <input type="number" step="0.01" value={form.zeroRate} onChange={e => setForm(f => ({ ...f, zeroRate: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white">{editId ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm text-zinc-300">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {countries.map(c => (
          <button key={c} onClick={() => setSelectedCountry(c)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedCountry === c ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
            {c === 'all' ? 'All Countries' : c}
          </button>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Country</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">State/Province</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tax Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Standard %</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Reduced %</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Codes</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="text-center py-8 text-zinc-600">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-8 text-zinc-600">No tax regions found</td></tr>
            ) : filtered.map(r => (
              <tr key={r.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                <td className="px-4 py-3">
                  <Link href={`/global/tax-regions/${r.id}`} className="text-zinc-100 hover:text-blue-400 font-medium transition-colors">{r.name}</Link>
                </td>
                <td className="px-4 py-3 text-zinc-400">{r.country}</td>
                <td className="px-4 py-3 text-zinc-500">{r.stateProvince ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded border text-xs font-medium uppercase ${taxTypeBadge[r.taxType] ?? 'bg-zinc-700 text-zinc-400 border-zinc-600'}`}>{r.taxType}</span>
                </td>
                <td className="px-4 py-3 text-zinc-300">{r.standardRate}%</td>
                <td className="px-4 py-3 text-zinc-500">{r.reducedRate !== null ? `${r.reducedRate}%` : '—'}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-400">{r.codes?.length ?? 0}</span></td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(r.id, r.isActive)} className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${r.isActive ? 'bg-blue-600' : 'bg-zinc-700'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${r.isActive ? 'translate-x-4' : ''}`} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(r)} className="text-zinc-400 hover:text-blue-400 transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(r.id)} className="text-zinc-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
