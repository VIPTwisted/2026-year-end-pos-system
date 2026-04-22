'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users2, ChevronRight, Plus, Trash2 } from 'lucide-react'

interface BCContact { id: string; contactNo: string; name: string }
interface BCCampaign { id: string; campaignNo: string; description: string }

type TabKey = 'General' | 'Contacts'

export default function NewSegmentPage() {
  const router = useRouter()
  const [tab, setTab] = useState<TabKey>('General')
  const [contacts, setContacts] = useState<BCContact[]>([])
  const [campaigns, setCampaigns] = useState<BCCampaign[]>([])
  const [contactSearch, setContactSearch] = useState('')
  const [selectedContacts, setSelectedContacts] = useState<BCContact[]>([])
  const [form, setForm] = useState({
    description: '',
    salesperson: '',
    segmentDate: new Date().toISOString().slice(0, 10),
    campaignId: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/crm/contacts').then(r => r.json()),
      fetch('/api/crm/campaigns').then(r => r.json()),
    ]).then(([c, camp]) => {
      setContacts(Array.isArray(c) ? c : [])
      setCampaigns(Array.isArray(camp) ? camp : [])
    })
  }, [])

  function set(k: keyof typeof form) { return (v: string) => setForm(f => ({ ...f, [k]: v })) }

  function addContact(c: BCContact) {
    if (!selectedContacts.find(sc => sc.id === c.id)) setSelectedContacts(prev => [...prev, c])
  }
  function removeContact(id: string) { setSelectedContacts(prev => prev.filter(c => c.id !== id)) }

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.contactNo.toLowerCase().includes(contactSearch.toLowerCase())
  )

  async function handleSave() {
    if (!form.description.trim()) { setError('Description is required'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/crm/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: form.description,
          salesperson: form.salesperson || null,
          segmentDate: form.segmentDate || null,
          campaignId: form.campaignId || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); setSaving(false); return }
      router.push('/crm/segments')
    } catch {
      setError('Network error'); setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-zinc-950">
      <div className="px-6 pt-4 pb-1 flex items-center gap-1.5 text-xs text-zinc-500">
        <Link href="/crm/segments" className="hover:text-zinc-300 transition-colors">Segments</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-300">New Segment</span>
      </div>

      <div className="px-6 pt-2 pb-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users2 className="w-5 h-5 text-indigo-400" />
          <h1 className="text-lg font-semibold text-white">New Segment</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/crm/segments"
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

      <div className="flex border-b border-zinc-800 px-6 gap-0 mt-2">
        {(['General', 'Contacts'] as TabKey[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 px-6 py-5">
        {tab === 'General' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 max-w-3xl">
            <div className="md:col-span-2">
              <label className="text-[11px] text-zinc-400 mb-1 block">Description *</label>
              <input value={form.description} onChange={e => set('description')(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Salesperson Code</label>
              <input value={form.salesperson} onChange={e => set('salesperson')(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Date</label>
              <input type="date" value={form.segmentDate} onChange={e => set('segmentDate')(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Campaign No.</label>
              <select value={form.campaignId} onChange={e => set('campaignId')(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500">
                <option value="">— None —</option>
                {campaigns.map(c => <option key={c.id} value={c.id}>{c.description} ({c.campaignNo})</option>)}
              </select>
            </div>
          </div>
        )}

        {tab === 'Contacts' && (
          <div className="flex gap-6 max-w-4xl">
            {/* Available contacts */}
            <div className="flex-1">
              <p className="text-xs text-zinc-400 font-medium mb-2">Available Contacts</p>
              <input value={contactSearch} onChange={e => setContactSearch(e.target.value)}
                placeholder="Search contacts..."
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 mb-2" />
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-auto max-h-80">
                {filteredContacts.map(c => (
                  <button key={c.id} onClick={() => addContact(c)}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-800 text-left transition-colors border-b border-zinc-800 last:border-0">
                    <span className="text-xs text-white">{c.name}</span>
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                      {c.contactNo} <Plus className="w-3 h-3 text-indigo-400" />
                    </span>
                  </button>
                ))}
                {filteredContacts.length === 0 && <p className="px-3 py-4 text-xs text-zinc-600 text-center">No contacts</p>}
              </div>
            </div>

            {/* Selected contacts */}
            <div className="flex-1">
              <p className="text-xs text-zinc-400 font-medium mb-2">Segment Contacts ({selectedContacts.length})</p>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-auto max-h-80">
                {selectedContacts.length === 0 && (
                  <p className="px-3 py-4 text-xs text-zinc-600 text-center">Add contacts from the left</p>
                )}
                {selectedContacts.map(c => (
                  <div key={c.id} className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 last:border-0">
                    <span className="text-xs text-white">{c.name}</span>
                    <button onClick={() => removeContact(c.id)} className="text-zinc-500 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
