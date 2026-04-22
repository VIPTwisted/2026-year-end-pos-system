'use client'

import { useEffect, useState } from 'react'
import { FileText, Plus, X } from 'lucide-react'

interface Profile { id: string; profileId: string; profileName: string; showBarcode: boolean; barcodeType: string; isActive: boolean }

export default function ReceiptProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ profileId: '', profileName: '', headerLines: '', footerLines: '', showBarcode: true, barcodeType: 'Code128' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetch('/api/receipt-profiles').then(r => r.json()).then(setProfiles) }, [])

  async function create() {
    setSaving(true)
    const res = await fetch('/api/receipt-profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { const p = await res.json(); setProfiles(prev => [p, ...prev]); setShowModal(false) }
    setSaving(false)
  }

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Receipt Profiles</h2>
          <p className="text-xs text-zinc-500 mt-0.5">{profiles.length} profiles</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
          <Plus className="w-3 h-3" /> New Profile
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500">
              <th className="text-left pb-2 font-medium uppercase tracking-widest pr-6">Profile ID</th>
              <th className="text-left pb-2 font-medium uppercase tracking-widest pr-6">Name</th>
              <th className="text-left pb-2 font-medium uppercase tracking-widest pr-6">Barcode</th>
              <th className="text-left pb-2 font-medium uppercase tracking-widest">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {profiles.length === 0 ? (
              <tr><td colSpan={4} className="py-16 text-center text-zinc-600">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />No receipt profiles
              </td></tr>
            ) : profiles.map(p => (
              <tr key={p.id} className="hover:bg-zinc-900/50">
                <td className="py-2.5 pr-6 text-zinc-300 font-mono">{p.profileId}</td>
                <td className="py-2.5 pr-6 text-zinc-200 font-medium">{p.profileName}</td>
                <td className="py-2.5 pr-6 text-zinc-400">{p.showBarcode ? p.barcodeType : 'None'}</td>
                <td className="py-2.5"><span className={p.isActive ? 'text-emerald-400' : 'text-zinc-600'}>{p.isActive ? 'Yes' : 'No'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-96 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-100">New Receipt Profile</h3>
              <button onClick={() => setShowModal(false)}><X className="w-4 h-4 text-zinc-500" /></button>
            </div>
            <div className="space-y-3">
              {[{ label: 'Profile ID', key: 'profileId' }, { label: 'Profile Name', key: 'profileName' }, { label: 'Header Lines', key: 'headerLines' }, { label: 'Footer Lines', key: 'footerLines' }].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-zinc-500 mb-1">{f.label}</label>
                  <input value={(form as Record<string, string | boolean>)[f.key] as string} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none" />
                </div>
              ))}
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Barcode Type</label>
                <select value={form.barcodeType} onChange={e => setForm(p => ({ ...p, barcodeType: e.target.value }))} className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none">
                  <option value="Code128">Code128</option>
                  <option value="QR">QR Code</option>
                  <option value="Code39">Code39</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-xs text-zinc-400">
                <input type="checkbox" checked={form.showBarcode} onChange={e => setForm(p => ({ ...p, showBarcode: e.target.checked }))} /> Show barcode
              </label>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-xs border border-zinc-700 text-zinc-400 rounded">Cancel</button>
              <button onClick={create} disabled={saving || !form.profileId || !form.profileName} className="flex-1 py-2 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded">
                {saving ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
