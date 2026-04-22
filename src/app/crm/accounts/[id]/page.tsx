'use client'
import { use, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2, Users, CheckSquare, FileText, ArrowLeft,
  Phone, Mail, Globe, MapPin, Calendar, CheckCircle2,
  Plus, User, Briefcase
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Account {
  id: string
  accountNumber: string
  name: string
  industry: string | null
  revenue: number | null
  employees: number | null
  website: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string
  accountType: string
  ownerName: string | null
  rating: string | null
  description: string | null
  contacts: Contact[]
  activities: Activity[]
  notes: Note[]
}

interface Contact { id: string; firstName: string; lastName: string; title: string | null; email: string | null; phone: string | null; department: string | null }
interface Activity { id: string; subject: string; activityType: string; status: string; priority: string; dueDate: string | null; ownerName: string | null; contact: { firstName: string; lastName: string } | null }
interface Note { id: string; title: string | null; body: string; createdBy: string | null; createdAt: string }

const TABS = ['overview', 'contacts', 'activities', 'notes'] as const
type Tab = typeof TABS[number]

const ACT_ICON: Record<string, React.ElementType> = { call: Phone, email: Mail, meeting: Calendar, task: CheckSquare }
const ACT_COLOR: Record<string, string> = { call: 'text-green-400', email: 'text-blue-400', meeting: 'text-purple-400', task: 'text-zinc-400' }

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('overview')
  const [showContactModal, setShowContactModal] = useState(false)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [contactForm, setContactForm] = useState({ firstName: '', lastName: '', email: '', phone: '', title: '', department: '' })
  const [activityForm, setActivityForm] = useState({ subject: '', activityType: 'task', priority: 'normal', dueDate: '', description: '' })
  const [noteForm, setNoteForm] = useState({ title: '', body: '', createdBy: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/crm/accounts/${id}`)
    const data = await res.json()
    setAccount(data)
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  async function completeActivity(actId: string) {
    await fetch(`/api/crm/activities/${actId}/complete`, { method: 'POST' })
    load()
  }

  async function handleCreateContact(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    await fetch(`/api/crm/accounts/${id}/contacts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(contactForm) })
    setSaving(false); setShowContactModal(false)
    setContactForm({ firstName: '', lastName: '', email: '', phone: '', title: '', department: '' })
    load()
  }

  async function handleCreateActivity(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    await fetch(`/api/crm/accounts/${id}/activities`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(activityForm) })
    setSaving(false); setShowActivityModal(false)
    setActivityForm({ subject: '', activityType: 'task', priority: 'normal', dueDate: '', description: '' })
    load()
  }

  async function handleCreateNote(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    await fetch(`/api/crm/accounts/${id}/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(noteForm) })
    setSaving(false); setShowNoteModal(false)
    setNoteForm({ title: '', body: '', createdBy: '' })
    load()
  }

  if (loading) return <div className="p-6 text-zinc-500">Loading...</div>
  if (!account) return <div className="p-6 text-zinc-500">Account not found</div>

  const openActivities = account.activities.filter(a => a.status === 'open').length

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <span className="text-blue-400 font-bold">{account.name[0]?.toUpperCase()}</span>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-white">{account.name}</h1>
          <p className="text-zinc-500 text-xs">{account.accountNumber.slice(0, 12)} · <span className="capitalize">{account.accountType}</span></p>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn('px-3 py-1 text-sm rounded-md capitalize transition-colors', tab === t ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white')}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Account Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Industry', value: account.industry },
                { label: 'Revenue', value: account.revenue != null ? `$${account.revenue.toLocaleString()}` : null },
                { label: 'Employees', value: account.employees?.toString() },
                { label: 'Rating', value: account.rating },
                { label: 'Owner', value: account.ownerName },
                { label: 'Country', value: account.country },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-zinc-500 text-xs">{label}</p>
                  <p className="text-white mt-0.5">{value ?? '—'}</p>
                </div>
              ))}
            </div>
            {account.description && (
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <p className="text-zinc-500 text-xs mb-1">Description</p>
                <p className="text-zinc-300 text-sm">{account.description}</p>
              </div>
            )}
          </div>
          <div className="space-y-4">
            {/* Quick stats */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white">Quick Stats</h3>
              {[
                { label: 'Contacts', value: account.contacts.length, icon: Users, color: 'text-purple-400' },
                { label: 'Open Activities', value: openActivities, icon: CheckSquare, color: 'text-green-400' },
                { label: 'Notes', value: account.notes.length, icon: FileText, color: 'text-orange-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Icon className={`w-4 h-4 ${color}`} /> {label}
                  </div>
                  <span className="text-white font-semibold">{value}</span>
                </div>
              ))}
            </div>
            {/* Contact info */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
              {account.phone && (
                <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-zinc-500" /><span className="text-zinc-300">{account.phone}</span></div>
              )}
              {account.email && (
                <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-zinc-500" /><span className="text-zinc-300">{account.email}</span></div>
              )}
              {account.website && (
                <div className="flex items-center gap-2 text-sm"><Globe className="w-4 h-4 text-zinc-500" /><span className="text-zinc-300">{account.website}</span></div>
              )}
              {(account.city || account.state) && (
                <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-zinc-500" /><span className="text-zinc-300">{[account.city, account.state].filter(Boolean).join(', ')}</span></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contacts */}
      {tab === 'contacts' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowContactModal(true)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> New Contact
            </button>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Department</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {account.contacts.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-500">No contacts</td></tr>
                )}
                {account.contacts.map((c) => (
                  <tr key={c.id} onClick={() => router.push(`/crm/contacts/${c.id}`)} className="hover:bg-zinc-800/50 cursor-pointer transition-colors">
                    <td className="px-4 py-3 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <User className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                      <span className="text-white">{c.firstName} {c.lastName}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{c.title ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-400">{c.department ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-400">{c.email ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-400">{c.phone ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activities */}
      {tab === 'activities' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowActivityModal(true)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> New Activity
            </button>
          </div>
          <div className="space-y-2">
            {account.activities.length === 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-8 text-center text-zinc-500">No activities</div>
            )}
            {account.activities.map((a) => {
              const Icon = ACT_ICON[a.activityType] ?? CheckSquare
              const color = ACT_COLOR[a.activityType] ?? 'text-zinc-400'
              const isOverdue = a.dueDate && new Date(a.dueDate) < new Date() && a.status === 'open'
              return (
                <div key={a.id} className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', `bg-zinc-800`)}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{a.subject}</p>
                    <p className="text-zinc-500 text-xs">
                      {a.activityType} · {a.priority}
                      {a.dueDate && ` · Due ${new Date(a.dueDate).toLocaleDateString()}`}
                      {a.contact && ` · ${a.contact.firstName} ${a.contact.lastName}`}
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

      {/* Notes */}
      {tab === 'notes' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowNoteModal(true)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-4 h-4" /> Add Note
            </button>
          </div>
          <div className="space-y-3">
            {account.notes.length === 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-8 text-center text-zinc-500">No notes</div>
            )}
            {account.notes.map((n) => (
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

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-white font-semibold">New Contact</h2>
              <button onClick={() => setShowContactModal(false)} className="text-zinc-400 hover:text-white text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleCreateContact} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">First Name *</label>
                  <input required value={contactForm.firstName} onChange={e => setContactForm(f => ({ ...f, firstName: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Last Name *</label>
                  <input required value={contactForm.lastName} onChange={e => setContactForm(f => ({ ...f, lastName: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Email</label>
                  <input type="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Phone</label>
                  <input value={contactForm.phone} onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Title</label>
                  <input value={contactForm.title} onChange={e => setContactForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Department</label>
                  <input value={contactForm.department} onChange={e => setContactForm(f => ({ ...f, department: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowContactModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm py-2 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition-colors">{saving ? 'Saving...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Modal */}
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
                    {['task', 'call', 'email', 'meeting'].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Priority</label>
                  <select value={activityForm.priority} onChange={e => setActivityForm(f => ({ ...f, priority: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                    {['low', 'normal', 'high'].map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-zinc-400 mb-1 block">Due Date</label>
                  <input type="datetime-local" value={activityForm.dueDate} onChange={e => setActivityForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-zinc-400 mb-1 block">Description</label>
                  <textarea rows={2} value={activityForm.description} onChange={e => setActivityForm(f => ({ ...f, description: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none" />
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

      {/* Note Modal */}
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
