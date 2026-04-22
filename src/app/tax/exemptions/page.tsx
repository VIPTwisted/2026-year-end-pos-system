'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Plus, X } from 'lucide-react'

type TaxExemption = {
  id: string
  exemptionCode: string
  exemptionName: string
  exemptionType: string
  customerName: string | null
  certificateNumber: string | null
  expiresAt: string | null
  isActive: boolean
}

export default function TaxExemptionsPage() {
  const [exemptions, setExemptions] = useState<TaxExemption[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    exemptionCode: '', exemptionName: '', exemptionType: 'resale',
    customerName: '', certificateNumber: '', expiresAt: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/tax/exemptions')
      .then((r) => r.json())
      .then(setExemptions)
      .finally(() => setLoading(false))
  }, [])

  function isExpired(expiresAt: string | null) {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  async function handleCreate() {
    setSaving(true)
    const res = await fetch('/api/tax/exemptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const created = await res.json()
    setExemptions((prev) => [...prev, created])
    setShowModal(false)
    setForm({ exemptionCode: '', exemptionName: '', exemptionType: 'resale', customerName: '', certificateNumber: '', expiresAt: '' })
    setSaving(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Tax Exemptions</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage customer tax exemption certificates</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Exemption
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Code</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Name</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Type</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Customer</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Certificate #</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Expires</th>
              <th className="text-left text-zinc-400 font-medium px-4 py-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center text-zinc-500 py-8">Loading...</td></tr>
            ) : exemptions.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-zinc-500 py-8">No exemptions</td></tr>
            ) : exemptions.map((e) => {
              const expired = isExpired(e.expiresAt)
              return (
                <tr key={e.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                  <td className={cn('px-4 py-3 font-mono', expired ? 'text-red-400' : 'text-zinc-300')}>{e.exemptionCode}</td>
                  <td className={cn('px-4 py-3', expired ? 'text-red-400' : 'text-zinc-100')}>{e.exemptionName}</td>
                  <td className="px-4 py-3 text-zinc-400 capitalize">{e.exemptionType}</td>
                  <td className={cn('px-4 py-3', expired ? 'text-red-400' : 'text-zinc-400')}>{e.customerName ?? '—'}</td>
                  <td className={cn('px-4 py-3 font-mono text-xs', expired ? 'text-red-400' : 'text-zinc-400')}>{e.certificateNumber ?? '—'}</td>
                  <td className={cn('px-4 py-3', expired ? 'text-red-400 font-medium' : 'text-zinc-400')}>
                    {e.expiresAt ? new Date(e.expiresAt).toLocaleDateString() : '—'}
                    {expired && <span className="ml-1 text-xs">(Expired)</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full', e.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500')}>
                      {e.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-zinc-100">New Exemption</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-zinc-400" /></button>
            </div>
            <div className="space-y-3">
              {[
                { key: 'exemptionCode', label: 'Code', placeholder: 'EX-001' },
                { key: 'exemptionName', label: 'Name', placeholder: 'Resale Exemption' },
                { key: 'customerName', label: 'Customer Name', placeholder: 'Acme Corp' },
                { key: 'certificateNumber', label: 'Certificate #', placeholder: 'CERT-000' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs text-zinc-400 block mb-1.5">{f.label}</label>
                  <input className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    value={(form as Record<string, string>)[f.key]} onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} />
                </div>
              ))}
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Type</label>
                <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  value={form.exemptionType} onChange={(e) => setForm((f) => ({ ...f, exemptionType: e.target.value }))}>
                  <option value="resale">Resale</option>
                  <option value="nonprofit">Non-Profit</option>
                  <option value="government">Government</option>
                  <option value="agricultural">Agricultural</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5">Expires</label>
                <input type="date" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  value={form.expiresAt} onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm py-2 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.exemptionCode || !form.exemptionName} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition-colors">
                {saving ? 'Saving...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
