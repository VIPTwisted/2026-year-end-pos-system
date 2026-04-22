'use client'
import { useEffect, useState } from 'react'
import { CheckSquare, Plus, Phone, Mail, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Activity {
  id: string
  subject: string
  activityType: string
  status: string
  priority: string
  dueDate: string | null
  ownerName: string | null
  account: { id: string; name: string } | null
  contact: { id: string; firstName: string; lastName: string } | null
}

interface Account { id: string; name: string }

const TYPE_TABS = ['all', 'task', 'email', 'call', 'meeting']
const STATUS_TABS = ['all', 'open', 'completed']

const TYPE_BADGE: Record<string, string> = {
  task: 'bg-zinc-800 border-zinc-700 text-zinc-300',
  email: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
  call: 'bg-green-500/15 border-green-500/30 text-green-400',
  meeting: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
}

const TYPE_ICON: Record<string, React.ElementType> = { call: Phone, email: Mail, meeting: Calendar, task: CheckSquare }
const PRIORITY_COLOR: Record<string, string> = { high: 'text-red-400', normal: 'text-zinc-400', low: 'text-zinc-600' }

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [typeTab, setTypeTab] = useState('all')
  const [statusTab, setStatusTab] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ subject: '', activityType: 'task', priority: 'normal', dueDate: '', description: '', accountId: '', ownerName: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const q = new URLSearchParams()
    if (typeTab !== 'all') q.set('activityType', typeTab)
    if (statusTab !== 'all') q.set('status', statusTab)
    const [aRes, accRes] = await Promise.all([fetch(`/api/crm/activities?${q}`), fetch('/api/crm/accounts')])
    const [aData, accData] = await Promise.all([aRes.json(), accRes.json()])
    setActivities(Array.isArray(aData) ? aData : [])
    setAccounts(Array.isArray(accData) ? accData : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [typeTab, statusTab])

  async function completeActivity(id: string) {
    await fetch(`/api/crm/activities/${id}/complete`, { method: 'POST' })
    load()
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    const payload: Record<string, string | undefined> = { ...form }
    if (!payload.accountId) delete payload.accountId
    if (!payload.dueDate) delete payload.dueDate
    await fetch('/api/crm/activities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setSaving(false); setShowModal(false)
    setForm({ subject: '', activityType: 'task', priority: 'normal', dueDate: '', description: '', accountId: '', ownerName: '' })
    load()
  }

  const now = new Date()

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-green-400" />
          <h1 className="text-xl font-semibold text-white">Activities</h1>
          <span className="text-zinc-500 text-sm ml-1">({activities.length})</span>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Activity
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          {TYPE_TABS.map((t) => (
            <button key={t} onClick={() => setTypeTab(t)} className={cn('px-3 py-1 text-sm rounded-md capitalize transition-colors', typeTab === t ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white')}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          {STATUS_TABS.map((t) => (
            <button key={t} onClick={() => setStatusTab(t)} className={cn('px-3 py-1 text-sm rounded-md capitalize transition-colors', statusTab === t ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white')}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
              <th className="px-4 py-3 text-left">Subject</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Due Date</th>
              <th className="px-4 py-3 text-left">Account</th>
              <th className="px-4 py-3 text-left">Contact</th>
              <th className="px-4 py-3 text-left">Priority</th>
              <th className="px-4 py-3 text-left">Owner</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {loading && <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-500">Loading...</td></tr>}
            {!loading && activities.length === 0 && <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-500">No activities found</td></tr>}
            {activities.map((a) => {
              const Icon = TYPE_ICON[a.activityType] ?? CheckSquare
              const isOverdue = a.status === 'open' && a.dueDate && new Date(a.dueDate) < now
              return (
                <tr key={a.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${a.activityType === 'call' ? 'text-green-400' : a.activityType === 'email' ? 'text-blue-400' : a.activityType === 'meeting' ? 'text-purple-400' : 'text-zinc-400'}`} />
                      <span className="text-white">{a.subject}</span>
                      {isOverdue && <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full border capitalize', TYPE_BADGE[a.activityType] ?? 'bg-zinc-800 border-zinc-700 text-zinc-400')}>
                      {a.activityType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {a.dueDate ? (
                      <span className={cn('text-sm', isOverdue ? 'text-red-400 font-medium' : 'text-zinc-300')}>
                        {new Date(a.dueDate).toLocaleDateString()}
                      </span>
                    ) : <span className="text-zinc-600">—</span>}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{a.account?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-400">{a.contact ? `${a.contact.firstName} ${a.contact.lastName}` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs capitalize', PRIORITY_COLOR[a.priority] ?? 'text-zinc-400')}>{a.priority}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{a.ownerName ?? '—'}</td>
                  <td className="px-4 py-3">
                    {a.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <button onClick={() => completeActivity(a.id)} className="text-xs px-2 py-1 rounded-lg border border-zinc-700 text-zinc-400 hover:border-green-500/40 hover:text-green-400 transition-colors whitespace-nowrap">
                        Complete
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-white font-semibold">New Activity</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Subject *</label>
                <input required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Type</label>
                  <select value={form.activityType} onChange={e => setForm(f => ({ ...f, activityType: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                    {['task', 'call', 'email', 'meeting'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                    {['low', 'normal', 'high'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-zinc-400 mb-1 block">Due Date</label>
                  <input type="datetime-local" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-zinc-400 mb-1 block">Account</label>
                  <select value={form.accountId} onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                    <option value="">No Account</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Owner</label>
                  <input value={form.ownerName} onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Description</label>
                  <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm py-2 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm py-2 rounded-lg transition-colors">{saving ? 'Saving...' : 'Create Activity'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
