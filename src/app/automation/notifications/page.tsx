'use client'
import { useEffect, useState } from 'react'
import { Bell, CheckCircle, Plus, Trash2, Pencil, Mail, MessageSquare, Globe, Smartphone, ExternalLink } from 'lucide-react'

interface Notification {
  id: string; userId: string | null; userName: string | null; title: string; body: string
  channel: string; priority: string; isRead: boolean; readAt: string | null
  actionUrl: string | null; sourceType: string | null; createdAt: string
}
interface NotificationTemplate {
  id: string; name: string; channel: string; subject: string | null; body: string; variables: string; isActive: boolean; createdAt: string
}
type ActiveTab = 'feed' | 'templates'
type FeedFilter = 'all' | 'unread' | 'critical'

const PRIORITY_BADGE: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border border-red-500/30',
  high: 'bg-amber-500/15 text-amber-400', normal: 'bg-zinc-700/40 text-zinc-400', low: 'bg-zinc-800/60 text-zinc-600',
}
const CHANNEL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'in-app': Bell, 'email': Mail, 'sms': MessageSquare, 'push': Smartphone, 'webhook': Globe,
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return `${Math.floor(diff)}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

const emptyTF = () => ({ name: '', channel: 'in-app', subject: '', body: '', variables: '' })

export default function NotificationsPage() {
  const [tab, setTab] = useState<ActiveTab>('feed')
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('all')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showTF, setShowTF] = useState(false)
  const [editingTF, setEditingTF] = useState<string | null>(null)
  const [tf, setTf] = useState(emptyTF())
  const [savingTF, setSavingTF] = useState(false)

  useEffect(() => {
    fetch('/api/automation/notifications?limit=100').then(r => r.json()).then(d => { setNotifications(d); setLoading(false) })
    fetch('/api/automation/notifications/templates').then(r => r.json()).then(setTemplates)
  }, [])

  async function markRead(id: string) {
    await fetch(`/api/automation/notifications/${id}/read`, { method: 'POST' })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
  }

  async function markAllRead() {
    await fetch('/api/automation/notifications/mark-all-read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: n.readAt ?? new Date().toISOString() })))
  }

  async function saveTF() {
    setSavingTF(true)
    const varsArray = tf.variables.split(',').map(s => s.trim()).filter(Boolean)
    const url = editingTF ? `/api/automation/notifications/templates/${editingTF}` : '/api/automation/notifications/templates'
    await fetch(url, { method: editingTF ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...tf, variables: varsArray }) })
    const res = await fetch('/api/automation/notifications/templates')
    setTemplates(await res.json())
    setShowTF(false); setEditingTF(null); setTf(emptyTF()); setSavingTF(false)
  }

  async function deleteTF(id: string) {
    if (!confirm('Delete this template?')) return
    await fetch(`/api/automation/notifications/templates/${id}`, { method: 'DELETE' })
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  async function toggleTF(id: string, current: boolean) {
    await fetch(`/api/automation/notifications/templates/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !current }) })
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, isActive: !current } : t))
  }

  function startEditTF(t: NotificationTemplate) {
    let vars: string[] = []
    try { vars = JSON.parse(t.variables) } catch {}
    setTf({ name: t.name, channel: t.channel, subject: t.subject ?? '', body: t.body, variables: vars.join(', ') })
    setEditingTF(t.id); setShowTF(true)
  }

  const filteredNotifs = notifications.filter(n => feedFilter === 'all' ? true : feedFilter === 'unread' ? !n.isRead : n.priority === 'critical')
  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <Bell className="w-6 h-6 text-blue-400" /> Notification Center
          {unreadCount > 0 && <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full font-medium">{unreadCount}</span>}
        </h1>
        <p className="text-sm text-zinc-400 mt-0.5">Manage alerts, messages, and notification templates</p>
      </div>

      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
        <button onClick={() => setTab('feed')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'feed' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-100'}`}>
          Notification Feed {unreadCount > 0 && `(${unreadCount} unread)`}
        </button>
        <button onClick={() => setTab('templates')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'templates' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-100'}`}>
          Templates ({templates.length})
        </button>
      </div>

      {tab === 'feed' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 w-fit">
              {(['all', 'unread', 'critical'] as FeedFilter[]).map(f => (
                <button key={f} onClick={() => setFeedFilter(f)} className={`px-3 py-1 rounded text-xs font-medium capitalize transition-colors ${feedFilter === f ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-100'}`}>{f}</button>
              ))}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Mark All Read
              </button>
            )}
          </div>
          <div className="space-y-2">
            {loading ? <div className="text-center py-10 text-zinc-600">Loading...</div>
              : filteredNotifs.length === 0 ? <div className="text-center py-10 text-zinc-600">No notifications</div>
              : filteredNotifs.map(n => {
                const ChannelIcon = CHANNEL_ICONS[n.channel] ?? Bell
                return (
                  <div key={n.id} className={`flex items-start gap-3 bg-zinc-900 border rounded-xl p-4 transition-colors ${n.isRead ? 'border-zinc-800/50 opacity-60' : 'border-zinc-700'}`}>
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.isRead ? 'bg-zinc-700' : 'bg-blue-500'}`} />
                    <ChannelIcon className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <span className="font-medium text-sm text-zinc-200">{n.title}</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${PRIORITY_BADGE[n.priority] ?? PRIORITY_BADGE.normal}`}>{n.priority}</span>
                        {n.sourceType && <span className="text-xs text-zinc-600">{n.sourceType}</span>}
                      </div>
                      <p className="text-sm text-zinc-400 mt-0.5">{n.body}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-zinc-600">{timeAgo(n.createdAt)}</span>
                        {n.userName && <span className="text-xs text-zinc-600">→ {n.userName}</span>}
                        {n.actionUrl && <a href={n.actionUrl} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-0.5 transition-colors">View <ExternalLink className="w-3 h-3" /></a>}
                      </div>
                    </div>
                    {!n.isRead && <button onClick={() => markRead(n.id)} className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors shrink-0 mt-0.5">Mark Read</button>}
                  </div>
                )
              })
            }
          </div>
        </div>
      )}

      {tab === 'templates' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => { setShowTF(true); setEditingTF(null); setTf(emptyTF()) }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> New Template
            </button>
          </div>
          {showTF && (
            <div className="bg-zinc-900 border border-blue-500/30 rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-zinc-100">{editingTF ? 'Edit Template' : 'New Template'}</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Template Name *</label>
                  <input value={tf.name} onChange={e => setTf(p => ({ ...p, name: e.target.value }))} placeholder="e.g. order-confirmation" className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Channel</label>
                  <select value={tf.channel} onChange={e => setTf(p => ({ ...p, channel: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                    {['in-app', 'email', 'sms', 'push', 'webhook'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {tf.channel === 'email' && (
                  <div className="col-span-2">
                    <label className="block text-xs text-zinc-400 mb-1">Subject</label>
                    <input value={tf.subject} onChange={e => setTf(p => ({ ...p, subject: e.target.value }))} placeholder="Your order {{orderId}} has been confirmed" className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
                  </div>
                )}
                <div className="col-span-2">
                  <label className="block text-xs text-zinc-400 mb-1">Body — use {'{{variable}}'} for dynamic values</label>
                  <textarea value={tf.body} onChange={e => setTf(p => ({ ...p, body: e.target.value }))} rows={4} placeholder="Hi {{customerName}}, your order {{orderId}} has been confirmed." className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-blue-500 resize-none font-mono" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-zinc-400 mb-1">Variables (comma-separated)</label>
                  <input value={tf.variables} onChange={e => setTf(p => ({ ...p, variables: e.target.value }))} placeholder="customerName, orderId, orderTotal" className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => { setShowTF(false); setEditingTF(null) }} className="px-3 py-1.5 border border-zinc-700 text-zinc-400 hover:text-zinc-100 rounded text-sm transition-colors">Cancel</button>
                <button onClick={saveTF} disabled={savingTF || !tf.name || !tf.body} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded text-sm font-medium transition-colors">
                  {savingTF ? 'Saving...' : editingTF ? 'Update' : 'Create Template'}
                </button>
              </div>
            </div>
          )}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Channel</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Subject</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Body Preview</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Active</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {templates.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-zinc-600">No templates. Create one above.</td></tr>
                ) : templates.map(t => {
                  const Icon = CHANNEL_ICONS[t.channel] ?? Bell
                  return (
                    <tr key={t.id} className="hover:bg-zinc-800/30">
                      <td className="px-5 py-3 font-medium text-zinc-200">{t.name}</td>
                      <td className="px-5 py-3"><span className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded text-xs"><Icon className="w-3 h-3" />{t.channel}</span></td>
                      <td className="px-5 py-3 text-zinc-400 text-xs max-w-[150px] truncate">{t.subject ?? <span className="text-zinc-600 italic">—</span>}</td>
                      <td className="px-5 py-3 text-zinc-500 text-xs max-w-[250px] truncate font-mono">{t.body}</td>
                      <td className="px-5 py-3">
                        <button onClick={() => toggleTF(t.id, t.isActive)} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors ${t.isActive ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25' : 'bg-zinc-700/40 text-zinc-500'}`}>
                          {t.isActive ? <><CheckCircle className="w-3 h-3" />Yes</> : 'No'}
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => startEditTF(t)} className="p-1.5 rounded text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => deleteTF(t.id)} className="p-1.5 rounded text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
