'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Building2, Plus, Star, Phone, Mail } from 'lucide-react'

type Carrier = {
  id: string
  carrierCode: string
  name: string
  scac: string | null
  carrierType: string
  mode: string
  contactName: string | null
  contactPhone: string | null
  contactEmail: string | null
  city: string | null
  state: string | null
  rating: number | null
  onTimeRate: number | null
  isPreferred: boolean
  isActive: boolean
}

const MODE_COLORS: Record<string, string> = {
  road: 'bg-blue-500/15 text-blue-400',
  air: 'bg-cyan-500/15 text-cyan-400',
  rail: 'bg-amber-500/15 text-amber-400',
  ocean: 'bg-emerald-500/15 text-emerald-400',
  intermodal: 'bg-purple-500/15 text-purple-400',
}

export default function CarriersPage() {
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filterMode, setFilterMode] = useState('')
  const [form, setForm] = useState({
    carrierCode: '', name: '', scac: '', dotNumber: '', mcNumber: '',
    carrierType: 'truckload', mode: 'road', contactName: '', contactPhone: '',
    contactEmail: '', address: '', city: '', state: '', zip: '', country: 'US',
    isPreferred: false, isActive: true,
  })

  async function load() {
    setLoading(true)
    const params = filterMode ? `?mode=${filterMode}` : ''
    const res = await fetch(`/api/transportation/carriers${params}`)
    const d = await res.json()
    setCarriers(Array.isArray(d) ? d : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filterMode])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/transportation/carriers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setShowModal(false)
    setForm({ carrierCode: '', name: '', scac: '', dotNumber: '', mcNumber: '', carrierType: 'truckload', mode: 'road', contactName: '', contactPhone: '', contactEmail: '', address: '', city: '', state: '', zip: '', country: 'US', isPreferred: false, isActive: true })
    load()
  }

  const inputCls = 'w-full rounded-md bg-zinc-800 border border-zinc-700 text-zinc-100 text-[13px] px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500'
  const labelCls = 'block text-[12px] text-zinc-400 mb-1'

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-blue-400" />
            <div>
              <h1 className="text-[18px] font-semibold text-zinc-100">Carriers</h1>
              <p className="text-[13px] text-zinc-500">Freight carriers, contacts &amp; performance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/transportation" className="text-[12px] text-zinc-400 hover:text-zinc-200 border border-zinc-700 px-3 py-1.5 rounded-md transition-colors">TMS Hub</Link>
            <button onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium transition-colors">
              <Plus className="w-3.5 h-3.5" />
              New Carrier
            </button>
          </div>
        </div>

        {/* Mode filter */}
        <div className="flex gap-2 flex-wrap">
          {['', 'road', 'air', 'rail', 'ocean', 'intermodal'].map(m => (
            <button key={m} onClick={() => setFilterMode(m)}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium capitalize transition-colors ${filterMode === m ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}>
              {m === '' ? 'All Modes' : m}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-zinc-500">Loading carriers…</div>
        ) : (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            {carriers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-500">
                <Building2 className="w-10 h-10 opacity-20" />
                <p className="text-[13px]">No carriers found</p>
                <button onClick={() => setShowModal(true)} className="text-[12px] text-blue-400 hover:underline">Add first carrier</button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-zinc-800/50">
                      {['Code', 'Name', 'SCAC', 'Type', 'Mode', 'Contact', 'Location', 'On-Time %', 'Rating', ''].map(h => (
                        <th key={h} className={`text-left px-4 pb-3 pt-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium ${h === 'On-Time %' || h === 'Rating' ? 'text-right' : ''}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {carriers.map(c => (
                      <tr key={c.id} className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20 transition-colors">
                        <td className="px-4 py-2">
                          <Link href={`/transportation/carriers/${c.id}`} className="font-mono text-blue-400 hover:underline text-[12px]">{c.carrierCode}</Link>
                        </td>
                        <td className="px-4 py-2 font-medium text-zinc-100">
                          {c.name}
                          {c.isPreferred && <span className="ml-1.5 text-[10px] text-purple-400">★ Preferred</span>}
                        </td>
                        <td className="px-4 py-2 font-mono text-zinc-400">{c.scac ?? '—'}</td>
                        <td className="px-4 py-2 text-zinc-400 capitalize">{c.carrierType}</td>
                        <td className="px-4 py-2">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${MODE_COLORS[c.mode] ?? 'bg-zinc-700 text-zinc-300'}`}>{c.mode}</span>
                        </td>
                        <td className="px-4 py-2">
                          {c.contactName && <p className="text-zinc-300">{c.contactName}</p>}
                          {c.contactPhone && (
                            <p className="flex items-center gap-1 text-zinc-500 text-[11px]">
                              <Phone className="w-3 h-3" />{c.contactPhone}
                            </p>
                          )}
                          {c.contactEmail && (
                            <p className="flex items-center gap-1 text-zinc-500 text-[11px]">
                              <Mail className="w-3 h-3" />{c.contactEmail}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-2 text-zinc-400">
                          {c.city && c.state ? `${c.city}, ${c.state}` : '—'}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {c.onTimeRate != null ? (
                            <span className={`font-medium ${c.onTimeRate >= 95 ? 'text-emerald-400' : c.onTimeRate >= 85 ? 'text-amber-400' : 'text-red-400'}`}>
                              {c.onTimeRate.toFixed(1)}%
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {c.rating != null ? (
                            <span className="flex items-center justify-end gap-0.5 text-amber-400">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {c.rating.toFixed(1)}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`text-[11px] rounded-full px-2 py-0.5 ${c.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-700 text-zinc-500'}`}>
                            {c.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Carrier Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-[16px] font-semibold mb-5">New Carrier</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Carrier Code *</label>
                  <input required value={form.carrierCode} onChange={e => setForm(f => ({ ...f, carrierCode: e.target.value }))} placeholder="FEDX" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>SCAC Code</label>
                  <input value={form.scac} onChange={e => setForm(f => ({ ...f, scac: e.target.value }))} placeholder="FDXE" className={inputCls} />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Carrier Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="FedEx Freight" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Type</label>
                  <select value={form.carrierType} onChange={e => setForm(f => ({ ...f, carrierType: e.target.value }))} className={inputCls}>
                    {['truckload', 'ltl', 'parcel', 'air_freight', 'ocean', 'rail', 'intermodal'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Mode</label>
                  <select value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value }))} className={inputCls}>
                    {['road', 'air', 'rail', 'ocean', 'intermodal'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>DOT Number</label>
                  <input value={form.dotNumber} onChange={e => setForm(f => ({ ...f, dotNumber: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>MC Number</label>
                  <input value={form.mcNumber} onChange={e => setForm(f => ({ ...f, mcNumber: e.target.value }))} className={inputCls} />
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-3">
                <p className="text-[11px] uppercase tracking-widest text-zinc-500 mb-3">Contact</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Contact Name</label>
                    <input value={form.contactName} onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} className={inputCls} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Email</label>
                    <input type="email" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>City</label>
                    <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>State</label>
                    <input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} maxLength={2} className={inputCls} />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isPreferred} onChange={e => setForm(f => ({ ...f, isPreferred: e.target.checked }))} className="w-4 h-4" />
                  <span className="text-[13px] text-zinc-300">Preferred Carrier</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-[13px] transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-[13px] font-medium transition-colors">Create Carrier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
