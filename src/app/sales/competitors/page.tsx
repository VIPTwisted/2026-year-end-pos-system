'use client'

import { useState, useEffect } from 'react'
import { Plus, Globe, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

type Competitor = {
  id: string
  name: string
  rating: string | null
  websiteUrl: string | null
  strengths: string | null
  weaknesses: string | null
  notes: string | null
  createdAt: string
}

const ratingColor: Record<string, string> = {
  low: 'bg-emerald-500/20 text-emerald-400',
  medium: 'bg-amber-500/20 text-amber-400',
  high: 'bg-red-500/20 text-red-400',
}

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', rating: 'medium', websiteUrl: '', strengths: '', weaknesses: '', notes: '' })
  const [editId, setEditId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/sales/competitors')
    setCompetitors(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function save() {
    if (editId) {
      await fetch(`/api/sales/competitors/${editId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    } else {
      await fetch('/api/sales/competitors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    }
    setShowModal(false)
    setEditId(null)
    setForm({ name: '', rating: 'medium', websiteUrl: '', strengths: '', weaknesses: '', notes: '' })
    load()
  }

  function openEdit(c: Competitor) {
    setForm({ name: c.name, rating: c.rating || 'medium', websiteUrl: c.websiteUrl || '', strengths: c.strengths || '', weaknesses: c.weaknesses || '', notes: c.notes || '' })
    setEditId(c.id)
    setShowModal(true)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Competitors</h1>
          <p className="text-sm text-zinc-400 mt-1">Competitive intelligence tracking</p>
        </div>
        <button onClick={() => { setEditId(null); setForm({ name: '', rating: 'medium', websiteUrl: '', strengths: '', weaknesses: '', notes: '' }); setShowModal(true) }}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-md transition-colors">
          <Plus className="w-4 h-4" /> New Competitor
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Name</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Rating</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Website</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Strengths</th>
              <th className="text-left px-4 py-3 text-zinc-500 font-medium">Weaknesses</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-600">Loading...</td></tr>}
            {!loading && competitors.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-600">No competitors tracked</td></tr>}
            {competitors.map((c) => (
              <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                <td className="px-4 py-3 text-zinc-200 font-medium">{c.name}</td>
                <td className="px-4 py-3">
                  {c.rating && (
                    <span className={cn('px-2 py-0.5 rounded text-xs capitalize flex items-center gap-1 w-fit', ratingColor[c.rating] || 'bg-zinc-700 text-zinc-300')}>
                      <Star className="w-3 h-3" /> {c.rating}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {c.websiteUrl ? (
                    <a href={c.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs">
                      <Globe className="w-3.5 h-3.5" /> {c.websiteUrl.replace(/^https?:\/\//, '').split('/')[0]}
                    </a>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-zinc-400 text-xs max-w-xs">
                  <span className="line-clamp-2">{c.strengths || '—'}</span>
                </td>
                <td className="px-4 py-3 text-zinc-400 text-xs max-w-xs">
                  <span className="line-clamp-2">{c.weaknesses || '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => openEdit(c)} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-zinc-100">{editId ? 'Edit' : 'New'} Competitor</h2>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Threat Rating</label>
              <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Website URL</label>
              <input value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} placeholder="https://"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Strengths</label>
              <textarea value={form.strengths} onChange={(e) => setForm({ ...form, strengths: e.target.value })} rows={2}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 resize-none" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Weaknesses</label>
              <textarea value={form.weaknesses} onChange={(e) => setForm({ ...form, weaknesses: e.target.value })} rows={2}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500 resize-none" />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 px-3 py-2 text-sm rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">Cancel</button>
              <button onClick={save} className="flex-1 px-3 py-2 text-sm rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors">{editId ? 'Save' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
