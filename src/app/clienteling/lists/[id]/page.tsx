'use client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { ChevronLeft, Plus, X, Phone, Mail, MessageSquare, StickyNote, Store, Check, UserCheck, Activity } from 'lucide-react'

interface ListDetail {
  id: string
  name: string
  listType: string
  assignedTo: string | null
  status: string
  description: string | null
  entries: Entry[]
  activities: ClientActivity[]
}

interface Entry {
  id: string
  customerName: string
  customerEmail: string | null
  customerPhone: string | null
  priority: string
  status: string
  lastContact: string | null
  notes: string | null
}

interface ClientActivity {
  id: string
  activityType: string
  customerName: string | null
  subject: string | null
  notes: string
  outcome: string | null
  recordedBy: string | null
  createdAt: string
}

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  normal: 'bg-zinc-700/50 text-zinc-300 border-zinc-600',
  low: 'bg-zinc-800/50 text-zinc-500 border-zinc-700',
}

const ENTRY_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-zinc-700/50 text-zinc-400 border-zinc-600',
  contacted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  converted: 'bg-green-500/20 text-green-400 border-green-500/30',
  'no-response': 'bg-red-500/20 text-red-400 border-red-500/30',
}

const ACTIVITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  email: Mail,
  sms: MessageSquare,
  note: StickyNote,
  'in-store-visit': Store,
}

const OUTCOME_COLORS: Record<string, string> = {
  interested: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  converted: 'bg-green-500/20 text-green-400 border-green-500/30',
  'not-interested': 'bg-red-500/20 text-red-400 border-red-500/30',
  'follow-up-needed': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
}

export default function ListDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [list, setList] = useState<ListDetail | null>(null)
  const [tab, setTab] = useState<'entries' | 'activities' | 'settings'>('entries')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showAddForm, setShowAddForm] = useState(false)
  const [showActivityForm, setShowActivityForm] = useState<string | null>(null)
  const [newEntry, setNewEntry] = useState({ customerName: '', customerEmail: '', customerPhone: '', priority: 'normal', notes: '' })
  const [actForm, setActForm] = useState({ activityType: 'call', subject: '', notes: '', outcome: '', followUpDate: '', recordedBy: '' })
  const [settings, setSettings] = useState({ name: '', description: '', assignedTo: '', listType: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    const res = await fetch(`/api/clienteling/lists/${id}`)
    const data = await res.json()
    setList(data)
    setSettings({ name: data.name, description: data.description || '', assignedTo: data.assignedTo || '', listType: data.listType })
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  async function addEntry() {
    if (!newEntry.customerName.trim()) return
    setSaving(true)
    await fetch(`/api/clienteling/lists/${id}/entries`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newEntry),
    })
    setNewEntry({ customerName: '', customerEmail: '', customerPhone: '', priority: 'normal', notes: '' })
    setShowAddForm(false); setSaving(false); load()
  }

  async function updateEntryStatus(eid: string, status: string) {
    await fetch(`/api/clienteling/lists/${id}/entries/${eid}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, lastContact: status !== 'pending' ? new Date().toISOString() : undefined }),
    })
    load()
  }

  async function deleteEntry(eid: string) {
    await fetch(`/api/clienteling/lists/${id}/entries/${eid}`, { method: 'DELETE' }); load()
  }

  async function bulkMarkContacted() {
    await Promise.all([...selected].map(eid => updateEntryStatus(eid, 'contacted'))); setSelected(new Set())
  }

  async function logActivity(entryCustomerName: string) {
    if (!actForm.notes.trim()) return
    setSaving(true)
    await fetch('/api/clienteling/activities', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...actForm, listId: id, customerName: entryCustomerName }),
    })
    setActForm({ activityType: 'call', subject: '', notes: '', outcome: '', followUpDate: '', recordedBy: '' })
    setShowActivityForm(null); setSaving(false); load()
  }

  async function saveSettings() {
    setSaving(true)
    await fetch(`/api/clienteling/lists/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings),
    })
    setSaving(false); load()
  }

  if (loading) return <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center text-zinc-500">Loading...</div>
  if (!list) return <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center text-zinc-500">List not found</div>

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6 space-y-6">
      <div className="flex items-start gap-4">
        <Link href="/clienteling/lists" className="mt-1 text-zinc-400 hover:text-zinc-100"><ChevronLeft className="w-5 h-5" /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{list.name}</h1>
            <span className={`text-xs px-2 py-0.5 rounded border ${list.listType === 'vip' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : list.listType === 'birthday' ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' : 'bg-zinc-700/50 text-zinc-400 border-zinc-600'}`}>{list.listType}</span>
            <span className={`text-xs px-2 py-0.5 rounded border ${list.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-zinc-700/50 text-zinc-400 border-zinc-600'}`}>{list.status}</span>
          </div>
          {list.assignedTo && <p className="text-sm text-zinc-500 mt-0.5">Assigned to {list.assignedTo}</p>}
        </div>
      </div>

      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
        {(['entries', 'activities', 'settings'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-100'}`}>
            {t} {t === 'entries' ? `(${list.entries.length})` : t === 'activities' ? `(${list.activities.length})` : ''}
          </button>
        ))}
      </div>

      {tab === 'entries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            {selected.size > 0 && (
              <button onClick={bulkMarkContacted} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
                <UserCheck className="w-4 h-4" /> Mark {selected.size} Contacted
              </button>
            )}
            <div className="ml-auto">
              <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
                <Plus className="w-4 h-4" /> Add Customer
              </button>
            </div>
          </div>

          {showAddForm && (
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Add Customer to List</h3>
                <button onClick={() => setShowAddForm(false)}><X className="w-4 h-4 text-zinc-400" /></button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs text-zinc-400 mb-1">Name *</label>
                  <input value={newEntry.customerName} onChange={e => setNewEntry({ ...newEntry, customerName: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" placeholder="Customer name" /></div>
                <div><label className="block text-xs text-zinc-400 mb-1">Email</label>
                  <input value={newEntry.customerEmail} onChange={e => setNewEntry({ ...newEntry, customerEmail: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" placeholder="email@example.com" /></div>
                <div><label className="block text-xs text-zinc-400 mb-1">Phone</label>
                  <input value={newEntry.customerPhone} onChange={e => setNewEntry({ ...newEntry, customerPhone: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" placeholder="555-0100" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-zinc-400 mb-1">Priority</label>
                  <select value={newEntry.priority} onChange={e => setNewEntry({ ...newEntry, priority: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                    <option value="high">High</option><option value="normal">Normal</option><option value="low">Low</option>
                  </select></div>
                <div><label className="block text-xs text-zinc-400 mb-1">Notes</label>
                  <input value={newEntry.notes} onChange={e => setNewEntry({ ...newEntry, notes: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" placeholder="Optional notes" /></div>
              </div>
              <div className="flex gap-2">
                <button onClick={addEntry} disabled={saving || !newEntry.customerName.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-medium">{saving ? 'Adding...' : 'Add Customer'}</button>
                <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          )}

          {list.entries.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">No entries yet. Add customers to this list.</div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
                    <th className="px-4 py-3 text-left w-8">
                      <input type="checkbox" checked={selected.size === list.entries.length && list.entries.length > 0}
                        onChange={e => setSelected(e.target.checked ? new Set(list.entries.map(e => e.id)) : new Set())} className="accent-blue-500" />
                    </th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Contact</th>
                    <th className="px-4 py-3 text-left">Priority</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Last Contact</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {list.entries.map(entry => (
                    <>
                      <tr key={entry.id} className="hover:bg-zinc-800/30">
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={selected.has(entry.id)}
                            onChange={e => { const s = new Set(selected); e.target.checked ? s.add(entry.id) : s.delete(entry.id); setSelected(s) }}
                            className="accent-blue-500" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-zinc-100">{entry.customerName}</div>
                          {entry.notes && <div className="text-xs text-zinc-500 truncate max-w-xs">{entry.notes}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-zinc-400">{entry.customerEmail || '—'}</div>
                          <div className="text-xs text-zinc-500">{entry.customerPhone || ''}</div>
                        </td>
                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded border ${PRIORITY_COLORS[entry.priority] || PRIORITY_COLORS.normal}`}>{entry.priority}</span></td>
                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded border ${ENTRY_STATUS_COLORS[entry.status] || ENTRY_STATUS_COLORS.pending}`}>{entry.status}</span></td>
                        <td className="px-4 py-3 text-xs text-zinc-500">{entry.lastContact ? new Date(entry.lastContact).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {entry.status === 'pending' && (
                              <button onClick={() => updateEntryStatus(entry.id, 'contacted')} className="text-xs px-2 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-md transition-colors">Contacted</button>
                            )}
                            {entry.status !== 'converted' && (
                              <button onClick={() => updateEntryStatus(entry.id, 'converted')} className="text-xs px-2 py-1 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-md transition-colors">Converted</button>
                            )}
                            <button onClick={() => setShowActivityForm(showActivityForm === entry.id ? null : entry.id)} className="text-xs px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-md transition-colors">Log Activity</button>
                            <button onClick={() => deleteEntry(entry.id)} className="text-xs text-zinc-600 hover:text-red-400 transition-colors"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                      {showActivityForm === entry.id && (
                        <tr key={`act-${entry.id}`}>
                          <td colSpan={7} className="px-4 py-3 bg-zinc-800/50">
                            <div className="grid grid-cols-6 gap-3 items-end">
                              <div><label className="block text-xs text-zinc-400 mb-1">Type</label>
                                <select value={actForm.activityType} onChange={e => setActForm({ ...actForm, activityType: e.target.value })}
                                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500">
                                  <option value="call">Call</option><option value="email">Email</option><option value="sms">SMS</option><option value="in-store-visit">In-Store Visit</option><option value="note">Note</option>
                                </select></div>
                              <div><label className="block text-xs text-zinc-400 mb-1">Subject</label>
                                <input value={actForm.subject} onChange={e => setActForm({ ...actForm, subject: e.target.value })}
                                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500" /></div>
                              <div className="col-span-2"><label className="block text-xs text-zinc-400 mb-1">Notes *</label>
                                <input value={actForm.notes} onChange={e => setActForm({ ...actForm, notes: e.target.value })}
                                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500" placeholder="Activity notes" /></div>
                              <div><label className="block text-xs text-zinc-400 mb-1">Outcome</label>
                                <select value={actForm.outcome} onChange={e => setActForm({ ...actForm, outcome: e.target.value })}
                                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500">
                                  <option value="">None</option><option value="interested">Interested</option><option value="not-interested">Not Interested</option><option value="converted">Converted</option><option value="follow-up-needed">Follow Up Needed</option>
                                </select></div>
                              <div className="flex gap-2">
                                <button onClick={() => logActivity(entry.customerName)} disabled={saving || !actForm.notes.trim()}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-xs font-medium">Log</button>
                                <button onClick={() => setShowActivityForm(null)} className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-xs">Cancel</button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'activities' && (
        <div className="space-y-3">
          {list.activities.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">No activities logged yet.</div>
          ) : list.activities.map(act => {
            const Icon = ACTIVITY_ICONS[act.activityType] || StickyNote
            return (
              <div key={act.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0"><Icon className="w-4 h-4 text-zinc-400" /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium text-sm text-zinc-100">{act.customerName || 'Customer'}</span>
                    <span className="text-xs text-zinc-500 capitalize">{act.activityType.replace('-', ' ')}</span>
                    {act.subject && <span className="text-xs text-zinc-400">— {act.subject}</span>}
                  </div>
                  <p className="text-sm text-zinc-400">{act.notes}</p>
                  <div className="flex items-center gap-3 mt-2">
                    {act.outcome && <span className={`text-xs px-2 py-0.5 rounded border ${OUTCOME_COLORS[act.outcome] || 'bg-zinc-700 text-zinc-400 border-zinc-600'}`}>{act.outcome}</span>}
                    {act.recordedBy && <span className="text-xs text-zinc-600">by {act.recordedBy}</span>}
                    <span className="text-xs text-zinc-600 ml-auto">{new Date(act.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'settings' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4 max-w-lg">
          <h2 className="font-semibold text-lg">List Settings</h2>
          <div><label className="block text-xs text-zinc-400 mb-1">List Name</label>
            <input value={settings.name} onChange={e => setSettings({ ...settings, name: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" /></div>
          <div><label className="block text-xs text-zinc-400 mb-1">Description</label>
            <textarea value={settings.description} onChange={e => setSettings({ ...settings, description: e.target.value })} rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none" /></div>
          <div><label className="block text-xs text-zinc-400 mb-1">Assigned To</label>
            <input value={settings.assignedTo} onChange={e => setSettings({ ...settings, assignedTo: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" placeholder="Associate name" /></div>
          <div><label className="block text-xs text-zinc-400 mb-1">List Type</label>
            <select value={settings.listType} onChange={e => setSettings({ ...settings, listType: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
              {['general', 'vip', 'birthday', 'anniversary', 'lapsed', 'product-interest'].map(t => (
                <option key={t} value={t}>{t.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
              ))}
            </select></div>
          <button onClick={saveSettings} disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}
    </div>
  )
}
