'use client'

import { useEffect, useState } from 'react'
import { Plus, X, Settings } from 'lucide-react'

interface Profile { id: string; profileId: string; name: string; description: string | null; isActive: boolean }

export default function FunctionalityProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ profileId: '', name: '', description: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/functionality-profiles').then(r => r.json()).then(setProfiles)
  }, [])

  async function create() {
    setSaving(true)
    const res = await fetch('/api/functionality-profiles', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    if (res.ok) { const p = await res.json(); setProfiles(prev => [p, ...prev]); setShowModal(false); setForm({ profileId: '', name: '', description: '' }) }
    setSaving(false)
  }

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Functionality Profiles</h2>
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
              <th className="text-left pb-2 font-medium uppercase tracking-widest pr-6">Description</th>
              <th className="text-left pb-2 font-medium uppercase tracking-widest">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {profiles.length === 0 ? (
              <tr><td colSpan={4} className="py-12 text-center text-zinc-600">
                <Settings className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No profiles yet
              </td></tr>
            ) : profiles.map(p => (
              <tr key={p.id} className="hover:bg-zinc-900/50">
                <td className="py-2.5 pr-6 text-zinc-300 font-mono">{p.profileId}</td>
                <td className="py-2.5 pr-6 text-zinc-200 font-medium">{p.name}</td>
                <td className="py-2.5 pr-6 text-zinc-500">{p.description ?? '—'}</td>
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
              <h3 className="text-sm font-semibold text-zinc-100">New Functionality Profile</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-300"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              {[{ label: 'Profile ID', key: 'profileId', placeholder: 'e.g. FP-RETAIL' }, { label: 'Name', key: 'name', placeholder: 'Profile name' }, { label: 'Description', key: 'description', placeholder: 'Optional description' }].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-zinc-500 mb-1">{f.label}</label>
                  <input value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                    className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-500" />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-700 rounded transition-colors">Cancel</button>
              <button onClick={create} disabled={saving || !form.profileId || !form.name} className="flex-1 py-2 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded transition-colors">
                {saving ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
