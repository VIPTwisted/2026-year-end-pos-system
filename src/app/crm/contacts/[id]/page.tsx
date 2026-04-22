'use client'
import { use, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { User, ArrowLeft, Phone, Mail, Building2, CheckSquare, Calendar, Plus, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  mobilePhone: string | null
  title: string | null
  department: string | null
  ownerName: string | null
  description: string | null
  doNotEmail: boolean
  doNotCall: boolean
  account: { id: string; name: string; accountType: string } | null
  activities: Activity[]
  notes: Note[]
}

interface Activity { id: string; subject: string; activityType: string; status: string; priority: string; dueDate: string | null; account: { id: string; name: string } | null }
interface Note { id: string; title: string | null; body: string; createdBy: string | null; createdAt: string }

const TABS = ['overview', 'activities', 'notes'] as const
type Tab = typeof TABS[number]

const ACT_ICON: Record<string, React.ElementType> = { call: Phone, email: Mail, meeting: Calendar, task: CheckSquare }
const ACT_COLOR: Record<string, string> = { call: 'text-green-400', email: 'text-blue-400', meeting: 'text-purple-400', task: 'text-zinc-400' }

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('overview')
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [activityForm, setActivityForm] = useState({ subject: '', activityType: 'task', priority: 'normal', dueDate: '', description: '' })
  const [noteForm, setNoteForm] = useState({ title: '', body: '', createdBy: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/crm/contacts/${id}`)
    const data = await res.json()
    setContact(data)
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  async function completeActivity(actId: string) {
    await fetch(`/api/crm/activities/${actId}/complete`, { method: 'POST' })
    load()
  }

  async function handleCreateActivity(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    await fetch(`/api/crm/contacts/${id}/activities`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(activityForm) })
    setSaving(false); setShowActivityModal(false)
    setActivityForm({ subject: '', activityType: 'task', priority: 'normal', dueDate: '', description: '' })
    load()
  }

  async function handleCreateNote(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    await fetch(`/api/crm/contacts/${id}/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(noteForm) })
    setSaving(false); setShowNoteModal(false)
    setNoteForm({ title: '', body: '', createdBy: '' })
    load()
  }

  if (loading) return <div className="p-6 text-zinc-500">Loading...</div>
  if (!contact) return <div className="p-6 text-zinc-500">Contact not found</div>

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
          <User className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">{contact.firstName} {contact.lastName}</h1>
          <p className="text-zinc-500 text-xs">{contact.title ?? ''}{contact.title && contact.department ? ' · ' : ''}{contact.department ?? ''}</p>
        </div>
      </div>

      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn('px-3 py-1 text-sm rounded-md capitalize transition-colors', tab === t ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white')}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Email', value: contact.email },
                { label: 'Phone', value: contact.phone },
                { label: 'Mobile', value: contact.mobilePhone },
                { label: 'Owner', value: contact.ownerName },
                { label: 'Do Not Email', value: contact.doNotEmail ? 'Yes' : 'No' },
                { label: 'Do Not Call', value: contact.doNotCall ? 'Yes' : 'No' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-zinc-500 text-xs">{label}</p>
                  <p className="text-white mt-0.5">{value ?? '—'}</p>
                </div>
              ))}
            </div>
            {contact.description && (
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <p className="text-zinc-500 text-xs mb-1">Description</p>
                <p className="text-zinc-300 text-sm">{contact.description}</p>
              </div>
            )}
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Linked Account</h3>
            {contact.account ? (
              <button onClick={() => router.push(`/crm/accounts/${contact.account!.id}`)} className="flex items-center gap-2 text-sm hover:bg-zinc-800 rounded-lg p-2 -mx-2 w-full text-left transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{contact.account.name}</p>
                  <span className="text-xs text-zinc-500 capitalize">{contact.account.accountType}</span>
                </div>
              </button>
            ) : (
              <p className="text-zinc-500 text-sm">No account linked</p>
            )}
            <div className="mt-4 space-y-2 text-sm">
              {contact.email && (
                <div className="flex items-center gap-2 text-zinc-400"><Mail className="w-4 h-4" /> {contact.email}</div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2 text-zinc-400"><Phone className="w-4 h-4" /> {contact.phone}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'activities' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowActivityModal(true)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> New Activity
            </button>
          </div>
          <div className="space-y-2">
            {contact.activities.length === 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-8 text-center text-zinc-500">No activities</div>
            )}
            {contact.activities.map((a) => {
              const Icon = ACT_ICON[a.activityType] ?? CheckSquare
              const color = ACT_COLOR[a.activityType] ?? 'text-zinc-400'
              const isOverdue = a.dueDate && new Date(a.dueDate) < new Date() && a.status === 'open'
              return (
                <div key={a.id} className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{a.subject}</p>
                    <p className="text-zinc-500 text-xs">
                      {a.activityType} · {a.priority}
                      {a.dueDate && ` · Due ${new Date(a.dueDate).toLocaleDateString()}`}
                      {a.account && ` · ${a.account.name}`}
                    </p>
                  </div>
                  {a.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  ) : (
                    <button onClick={() => completeActivity(a.id)} className={cn('text-xs px-2 py-1 rounded-lg border transition-colors flex-shrink-0',
                      isOverdue ? 'border-red-500/40 text-red-400 hover:bg-red-500/10' : 'border-zinc-700 text-zinc-400 hover:border-green-500/40 hover:text-green-400'
                    )}>
                      {isOverdue ? 'Overdue' : 'Complete'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {tab === 'notes' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowNoteModal(true)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> Add Note
            </button>
          </div>
          <div className="space-y-3">
            {contact.notes.length === 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-8 text-center text-zinc-500">No notes</div>
            )}
            {contact.notes.map((n) => (
              <div key={n.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-white text-sm font-medium">{n.title ?? 'Note'}</p>
                  <span className="text-zinc-600 text-xs flex-shrink-0">{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-zinc-300 text-sm whitespace-pre-wrap">{n.body}</p>
                {n.createdBy && <p className="text-zinc-600 text-xs mt-2">By {n.createdBy}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {showActivityModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-white font-semibold">New Activity</h2>
              <button onClick={() => setShowActivityModal(false)} className="text-zinc-400 hover:text-white text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleCreateActivity} className="p-6 space-y-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Subject *</label>
                <input required value={activityForm.subject} onChange={e => setActivityForm(f => ({ ...f, subject: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Type</label>
                  <select value={activityForm.activityType} onChange={e => setActivityForm(f => ({ ...f, activityType: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                    {['task', 'call', 'email', 'meeting'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Priority</label>
                  <select value={activityForm.priority} onChange={e => setActivityForm(f => ({ ...f, priority: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                    {['low', 'normal', 'high'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-zinc-400 mb-1 block">Due Date</label>
                  <input type="datetime-local" value={activityForm.dueDate} onChange={e => setActivityForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowActivityModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm py-2 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition-colors">{saving ? 'Saving...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNoteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-white font-semibold">Add Note</h2>
              <button onClick={() => setShowNoteModal(false)} className="text-zinc-400 hover:text-white text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleCreateNote} className="p-6 space-y-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Title</label>
                <input value={noteForm.title} onChange={e => setNoteForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Note *</label>
                <textarea required rows={4} value={noteForm.body} onChange={e => setNoteForm(f => ({ ...f, body: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Created By</label>
                <input value={noteForm.createdBy} onChange={e => setNoteForm(f => ({ ...f, createdBy: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowNoteModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm py-2 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition-colors">{saving ? 'Saving...' : 'Save Note'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
