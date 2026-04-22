'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare, ChevronRight } from 'lucide-react'

interface BCContact { id: string; contactNo: string; name: string }

const TEMPLATES = ['Phone Call', 'E-Mail', 'Meeting', 'Letter', 'Fax', 'Demo', 'Trade Show', 'Other']

export default function NewInteractionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [contacts, setContacts] = useState<BCContact[]>([])
  const [form, setForm] = useState({
    contactId: searchParams?.get('contactId') ?? '',
    template: 'Phone Call',
    description: '',
    cost: '',
    duration: '',
    initiatedBy: 'Us',
    interactionDate: new Date().toISOString().slice(0, 10),
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/crm/contacts').then(r => r.json()).then(d => setContacts(Array.isArray(d) ? d : []))
  }, [])

  function set(k: keyof typeof form) { return (v: string) => setForm(f => ({ ...f, [k]: v })) }

  async function handleSave() {
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/crm/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId: form.contactId || null,
          template: form.template,
          description: form.description || null,
          cost: parseFloat(form.cost || '0'),
          duration: parseInt(form.duration || '0'),
          initiatedBy: form.initiatedBy,
          interactionDate: form.interactionDate,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); setSaving(false); return }
      router.push(`/crm/interactions${form.contactId ? `?contactId=${form.contactId}` : ''}`)
    } catch {
      setError('Network error'); setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-zinc-950">
      <div className="px-6 pt-4 pb-1 flex items-center gap-1.5 text-xs text-zinc-500">
        <Link href="/crm/interactions" className="hover:text-zinc-300 transition-colors">Interaction Log</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-300">Log Interaction</span>
      </div>

      <div className="px-6 pt-2 pb-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <h1 className="text-lg font-semibold text-white">Log Interaction</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/crm/interactions"
            className="px-4 py-1.5 text-sm text-zinc-400 hover:text-white border border-zinc-700 rounded transition-colors">
            Cancel
          </Link>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded font-medium transition-colors">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-3 px-4 py-2 bg-red-900/30 border border-red-800/50 rounded text-red-400 text-sm">{error}</div>
      )}

      <div className="px-6 py-5 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <label className="text-[11px] text-zinc-400 mb-1 block">Contact</label>
            <select value={form.contactId} onChange={e => set('contactId')(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500">
              <option value="">— No Contact —</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.name} ({c.contactNo})</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-zinc-400 mb-1 block">Date</label>
            <input type="date" value={form.interactionDate} onChange={e => set('interactionDate')(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-[11px] text-zinc-400 mb-1 block">Interaction Template</label>
            <select value={form.template} onChange={e => set('template')(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500">
              {TEMPLATES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-zinc-400 mb-1 block">Initiated By</label>
            <select value={form.initiatedBy} onChange={e => set('initiatedBy')(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500">
              <option>Us</option>
              <option>Them</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-zinc-400 mb-1 block">Cost (USD)</label>
            <input type="number" min="0" step="0.01" value={form.cost} onChange={e => set('cost')(e.target.value)}
              placeholder="0.00"
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-[11px] text-zinc-400 mb-1 block">Duration (minutes)</label>
            <input type="number" min="0" value={form.duration} onChange={e => set('duration')(e.target.value)}
              placeholder="0"
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="md:col-span-2">
            <label className="text-[11px] text-zinc-400 mb-1 block">Description</label>
            <textarea rows={4} value={form.description} onChange={e => set('description')(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 resize-none" />
          </div>
        </div>
      </div>
    </div>
  )
}
