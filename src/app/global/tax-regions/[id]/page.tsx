'use client'
import { useEffect, useState, use } from 'react'
import { ArrowLeft, Plus, Trash2, X } from 'lucide-react'
import Link from 'next/link'

interface RegionTaxCode {
  id: string
  code: string
  description: string | null
  rate: number
  category: string
  productTypes: string
  createdAt: string
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
}

interface CodeForm {
  code: string
  description: string
  rate: string
  category: string
  productTypes: string
}

export default function TaxRegionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [region, setRegion] = useState<TaxRegion | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCodeForm, setShowCodeForm] = useState(false)
  const [codeForm, setCodeForm] = useState<CodeForm>({ code: '', description: '', rate: '0', category: 'standard', productTypes: '' })

  useEffect(() => { fetchRegion() }, [id])

  async function fetchRegion() {
    setLoading(true)
    const res = await fetch(`/api/global/tax-regions/${id}`)
    const data = await res.json()
    setRegion(data)
    setLoading(false)
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault()
    await fetch(`/api/global/tax-regions/${id}/codes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(codeForm),
    })
    setCodeForm({ code: '', description: '', rate: '0', category: 'standard', productTypes: '' })
    setShowCodeForm(false)
    fetchRegion()
  }

  async function handleDeleteCode(cid: string) {
    if (!confirm('Delete this tax code?')) return
    await fetch(`/api/global/tax-regions/${id}/codes?cid=${cid}`, { method: 'DELETE' })
    fetchRegion()
  }

  const taxTypeBadge: Record<string, string> = {
    vat: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
    gst: 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30',
    'sales-tax': 'bg-amber-600/20 text-amber-400 border-amber-600/30',
    hst: 'bg-violet-600/20 text-violet-400 border-violet-600/30',
  }

  const categoryBadge: Record<string, string> = {
    standard: 'bg-blue-600/20 text-blue-400',
    reduced: 'bg-amber-600/20 text-amber-400',
    zero: 'bg-zinc-700 text-zinc-400',
    exempt: 'bg-red-600/20 text-red-400',
  }

  if (loading) return <div className="p-6 text-zinc-600">Loading...</div>
  if (!region) return <div className="p-6 text-red-400">Tax region not found</div>

  const productTypesList = (pt: string) => { try { return JSON.parse(pt) } catch { return [] } }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/global/tax-regions" className="text-zinc-400 hover:text-zinc-200"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-xl font-bold text-zinc-100">{region.name}</h1>
          <p className="text-sm text-zinc-500">{region.country}{region.stateProvince ? ` — ${region.stateProvince}` : ''}</p>
        </div>
        <span className={`px-2 py-0.5 rounded border text-xs font-medium uppercase ${taxTypeBadge[region.taxType] ?? 'bg-zinc-700 text-zinc-400 border-zinc-600'}`}>{region.taxType}</span>
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${region.isActive ? 'bg-emerald-600/20 text-emerald-400' : 'bg-zinc-700 text-zinc-500'}`}>
          {region.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="text-xs text-zinc-500 mb-1">Standard Rate</div>
          <div className="text-2xl font-bold text-zinc-100">{region.standardRate}%</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="text-xs text-zinc-500 mb-1">Reduced Rate</div>
          <div className="text-2xl font-bold text-zinc-100">{region.reducedRate !== null ? `${region.reducedRate}%` : '—'}</div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="text-xs text-zinc-500 mb-1">Zero Rate</div>
          <div className="text-2xl font-bold text-zinc-100">{region.zeroRate}%</div>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-300">Tax Codes ({region.codes.length})</h2>
          <button onClick={() => setShowCodeForm(true)} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs text-white">
            <Plus className="w-3 h-3" /> Add Tax Code
          </button>
        </div>

        {showCodeForm && (
          <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-800/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-zinc-300">New Tax Code</h3>
              <button onClick={() => setShowCodeForm(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCodeSubmit} className="grid grid-cols-5 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Code *</label>
                <input value={codeForm.code} onChange={e => setCodeForm(f => ({ ...f, code: e.target.value }))} required
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Description</label>
                <input value={codeForm.description} onChange={e => setCodeForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Rate %</label>
                <input type="number" step="0.01" value={codeForm.rate} onChange={e => setCodeForm(f => ({ ...f, rate: e.target.value }))}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Category</label>
                <select value={codeForm.category} onChange={e => setCodeForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500">
                  <option value="standard">Standard</option>
                  <option value="reduced">Reduced</option>
                  <option value="zero">Zero</option>
                  <option value="exempt">Exempt</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Product Types (comma-sep)</label>
                <input value={codeForm.productTypes} onChange={e => setCodeForm(f => ({ ...f, productTypes: e.target.value }))} placeholder="food, medical"
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="col-span-5 flex gap-2">
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white">Add Code</button>
                <button type="button" onClick={() => setShowCodeForm(false)} className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm text-zinc-300">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Code</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Rate %</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Category</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Product Types</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {region.codes.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-zinc-600">No tax codes. Add one above.</td></tr>
            ) : region.codes.map(c => {
              const types = productTypesList(c.productTypes)
              return (
                <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-4 py-3 font-mono font-bold text-zinc-100">{c.code}</td>
                  <td className="px-4 py-3 text-zinc-400">{c.description ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-300">{c.rate}%</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryBadge[c.category] ?? 'bg-zinc-700 text-zinc-400'}`}>{c.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {types.length > 0 ? types.map((t: string) => (
                        <span key={t} className="px-1.5 py-0.5 bg-zinc-800 rounded text-xs text-zinc-400">{t}</span>
                      )) : <span className="text-zinc-600 text-xs">All</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDeleteCode(c.id)} className="text-zinc-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
