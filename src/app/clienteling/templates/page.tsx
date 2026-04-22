'use client'
import { useEffect, useState } from 'react'
import { Plus, X, Mail, MessageSquare, StickyNote, Pencil, Trash2 } from 'lucide-react'

interface OutreachTemplate {
  id: string
  name: string
  channel: string
  subject: string | null
  body: string
  occasion: string | null
  isActive: boolean
  createdAt: string
}

const CHANNEL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  email: Mail,
  sms: MessageSquare,
  'in-store-note': StickyNote,
}

const OCCASION_COLORS: Record<string, string> = {
  birthday: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  anniversary: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'win-back': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'new-arrival': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'vip-event': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
}

const CHANNELS = ['email', 'sms', 'in-store-note']

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<OutreachTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', channel: 'email', subject: '', body: '', occasion: '' })
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/clienteling/templates')
    setTemplates(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function startEdit(t: OutreachTemplate) {
    setEditId(t.id)
    setForm({ name: t.name, channel: t.channel, subject: t.subject || '', body: t.body, occasion: t.occasion || '' })
    setShowForm(true)
  }

  function resetForm() {
    setEditId(null)
    setForm({ name: '', channel: 'email', subject: '', body: '', occasion: '' })
    setShowForm(false)
  }

  async function saveTemplate() {
    if (!form.name.trim() || !form.body.trim()) return
    setSaving(true)
    if (editId) {
      await fetch(`/api/clienteling/templates/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      await fetch('/api/clienteling/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }
    resetForm()
    setSaving(false)
    load()
  }

  async function deleteTemplate(id: string) {
    await fetch(`/api/clienteling/templates/${id}`, { method: 'DELETE' })
    load()
  }

  const grouped = CHANNELS.reduce((acc, ch) => {
    acc[ch] = templates.filter(t => t.channel === ch)
    return acc
  }, {} as Record<string, OutreachTemplate[]>)

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Outreach Templates</h1>
          <p className="text-sm text-zinc-500 mt-1">Email, SMS, and in-store note templates for associate outreach</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{editId ? 'Edit Template' : 'New Outreach Template'}</h2>
            <button onClick={resetForm}><X className="w-4 h-4 text-zinc-400" /></button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Template Name *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" placeholder="Template name" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Channel</label>
              <select value={form.channel} onChange={e => setForm({ ...form, channel: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="in-store-note">In-Store Note</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Occasion</label>
              <select value={form.occasion} onChange={e => setForm({ ...form, occasion: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                <option value="">None</option>
                <option value="birthday">Birthday</option>
                <option value="anniversary">Anniversary</option>
                <option value="win-back">Win-Back</option>
                <option value="new-arrival">New Arrival</option>
                <option value="vip-event">VIP Event</option>
              </select>
            </div>
            {form.channel === 'email' && (
              <div className="col-span-3">
                <label className="block text-xs text-zinc-400 mb-1">Subject</label>
                <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" placeholder="Email subject line" />
              </div>
            )}
            <div className="col-span-3">
              <label className="block text-xs text-zinc-400 mb-1">Body *</label>
              <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })}
                rows={5}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none font-mono"
                placeholder="Template body. Use {{customer_name}}, {{associate_name}}, {{store_name}} as variables." />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={saveTemplate} disabled={saving || !form.name.trim() || !form.body.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-medium">
              {saving ? 'Saving...' : editId ? 'Update Template' : 'Create Template'}
            </button>
            <button onClick={resetForm} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm">Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-zinc-500">Loading...</div>
      ) : (
        <div className="space-y-8">
          {CHANNELS.map(channel => {
            const channelTemplates = grouped[channel] || []
            const Icon = CHANNEL_ICONS[channel] || Mail
            const label = channel === 'in-store-note' ? 'In-Store Note' : channel.charAt(0).toUpperCase() + channel.slice(1)
            return (
              <div key={channel}>
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="w-4 h-4 text-zinc-400" />
                  <h2 className="font-semibold text-zinc-200">{label}</h2>
                  <span className="text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">{channelTemplates.length}</span>
                </div>
                {channelTemplates.length === 0 ? (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center text-zinc-600 text-sm">
                    No {label.toLowerCase()} templates yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {channelTemplates.map(t => (
                      <div key={t.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-sm text-zinc-100">{t.name}</h3>
                          <div className="flex gap-1 shrink-0 ml-2">
                            <button onClick={() => startEdit(t)} className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteTemplate(t.id)} className="p-1 text-zinc-500 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        {t.occasion && (
                          <span className={`text-xs px-2 py-0.5 rounded border ${OCCASION_COLORS[t.occasion] || 'bg-zinc-700/50 text-zinc-400 border-zinc-600'} mb-2 inline-block`}>
                            {t.occasion.replace('-', ' ')}
                          </span>
                        )}
                        {t.subject && <p className="text-xs text-zinc-400 mb-1 font-medium">{t.subject}</p>}
                        <p className="text-xs text-zinc-500 line-clamp-3 leading-relaxed">{t.body}</p>
                        <div className="mt-3 pt-3 border-t border-zinc-800 text-xs text-zinc-600">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
