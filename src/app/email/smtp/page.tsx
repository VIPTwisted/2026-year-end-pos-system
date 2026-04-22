'use client'

import { useEffect, useState } from 'react'
import { Server, Plus, X, CheckCircle, AlertCircle, Star } from 'lucide-react'

interface SMTP { id: string; profileName: string; host: string; port: number; username: string | null; useTLS: boolean; fromEmail: string; fromName: string; isDefault: boolean; isActive: boolean; testStatus: string | null; lastTestedAt: string | null }

export default function SMTPPage() {
  const [profiles, setProfiles] = useState<SMTP[]>([])
  const [showModal, setShowModal] = useState(false)
  const [testing, setTesting] = useState<string | null>(null)
  const [form, setForm] = useState({ profileName: '', host: '', port: '587', username: '', useTLS: true, fromEmail: '', fromName: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetch('/api/email/smtp').then(r => r.json()).then(setProfiles) }, [])

  async function create() {
    setSaving(true)
    const res = await fetch('/api/email/smtp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, port: parseInt(form.port) }) })
    if (res.ok) { const p = await res.json(); setProfiles(prev => [p, ...prev]); setShowModal(false) }
    setSaving(false)
  }

  async function test(id: string) {
    setTesting(id)
    await fetch(`/api/email/smtp/${id}/test`, { method: 'POST' })
    const fresh = await fetch('/api/email/smtp').then(r => r.json())
    setProfiles(fresh); setTesting(null)
  }

  async function setDefault(id: string) {
    await fetch(`/api/email/smtp/${id}/set-default`, { method: 'POST' })
    setProfiles(prev => prev.map(p => ({ ...p, isDefault: p.id === id })))
  }

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Email Server Profiles</h2>
          <p className="text-xs text-zinc-500 mt-0.5">D365 — Email server configuration</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
          <Plus className="w-3 h-3" /> Add SMTP
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profiles.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center justify-center py-16 text-zinc-600">
            <Server className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">No SMTP profiles configured</p>
          </div>
        ) : profiles.map(p => (
          <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-zinc-500" />
                <span className="text-sm font-semibold text-zinc-100">{p.profileName}</span>
                {p.isDefault && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
              </div>
              <div className="flex items-center gap-1.5">
                {p.testStatus === 'success' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : p.testStatus ? <AlertCircle className="w-3.5 h-3.5 text-red-400" /> : null}
              </div>
            </div>
            <div className="space-y-1 text-xs mb-4">
              <div className="flex justify-between"><span className="text-zinc-500">Host</span><span className="text-zinc-300 font-mono">{p.host}:{p.port}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">From</span><span className="text-zinc-300">{p.fromEmail}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">TLS</span><span className={p.useTLS ? 'text-emerald-400' : 'text-zinc-500'}>{p.useTLS ? 'Yes' : 'No'}</span></div>
              {p.lastTestedAt && <div className="flex justify-between"><span className="text-zinc-500">Last tested</span><span className="text-zinc-500">{new Date(p.lastTestedAt).toLocaleString()}</span></div>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => test(p.id)} disabled={testing === p.id} className="flex-1 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 rounded transition-colors disabled:opacity-50">
                {testing === p.id ? 'Testing...' : 'Test Connection'}
              </button>
              {!p.isDefault && (
                <button onClick={() => setDefault(p.id)} className="flex-1 py-1.5 text-xs border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 rounded transition-colors">
                  Set Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-[440px] shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-100">Add SMTP Profile</h3>
              <button onClick={() => setShowModal(false)}><X className="w-4 h-4 text-zinc-500" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Profile Name', key: 'profileName', col: 2 },
                { label: 'SMTP Host', key: 'host', col: 1 },
                { label: 'Port', key: 'port', col: 1 },
                { label: 'Username', key: 'username', col: 2 },
                { label: 'From Email', key: 'fromEmail', col: 1 },
                { label: 'From Name', key: 'fromName', col: 1 },
              ].map(f => (
                <div key={f.key} className={f.col === 2 ? 'col-span-2' : ''}>
                  <label className="block text-xs text-zinc-500 mb-1">{f.label}</label>
                  <input value={(form as Record<string, string | boolean>)[f.key] as string} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="w-full px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 focus:outline-none" />
                </div>
              ))}
              <div className="col-span-2">
                <label className="flex items-center gap-2 text-xs text-zinc-400">
                  <input type="checkbox" checked={form.useTLS} onChange={e => setForm(p => ({ ...p, useTLS: e.target.checked }))} /> Use TLS
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 text-xs border border-zinc-700 text-zinc-400 rounded">Cancel</button>
              <button onClick={create} disabled={saving || !form.host || !form.fromEmail} className="flex-1 py-2 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
