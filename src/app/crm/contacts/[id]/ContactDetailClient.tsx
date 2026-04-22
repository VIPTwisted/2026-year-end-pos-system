'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users, ChevronRight, Mail, Phone, Pencil, Save, X,
  MessageSquare, Target, CheckSquare, BarChart2
} from 'lucide-react'

interface BCContact {
  id: string; contactNo: string; name: string; contactType: string
  companyName: string | null; phone: string | null; email: string | null
  salesperson: string | null; territory: string | null; lastModified: string
  interactions: BCInteraction[]; opportunities: BCOpportunity[]; tasks: BCCrmTask[]
}
interface BCInteraction {
  id: string; entryNo: number; interactionDate: string; template: string | null
  description: string | null; cost: number; duration: number; initiatedBy: string
}
interface BCOpportunity {
  id: string; opportunityNo: string; description: string; status: string
  probability: number; estimatedValue: number; closeDate: string | null
}
interface BCCrmTask {
  id: string; taskNo: string; description: string; taskType: string
  taskDate: string | null; status: string; priority: string
}

type TabKey = 'General' | 'Interaction Log' | 'Opportunities' | 'Tasks'

const PRIORITY_COLOR: Record<string, string> = {
  High: 'text-red-400 bg-red-500/10',
  Normal: 'text-yellow-400 bg-yellow-500/10',
  Low: 'text-zinc-400 bg-zinc-700/50',
}

export default function ContactDetailClient({ id }: { id: string }) {
  const router = useRouter()
  const [contact, setContact] = useState<BCContact | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabKey>('General')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', contactType: '', companyName: '', phone: '', email: '', salesperson: '', territory: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetch(`/api/crm/contacts/${id}`)
      .then(r => r.json())
      .then(d => {
        setContact(d)
        setForm({
          name: d.name ?? '', contactType: d.contactType ?? 'Company',
          companyName: d.companyName ?? '', phone: d.phone ?? '',
          email: d.email ?? '', salesperson: d.salesperson ?? '', territory: d.territory ?? '',
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  useEffect(() => { load() }, [load])

  async function handleSave() {
    setSaving(true)
    await fetch(`/api/crm/contacts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name || undefined,
        contactType: form.contactType || undefined,
        companyName: form.companyName || null,
        phone: form.phone || null,
        email: form.email || null,
        salesperson: form.salesperson || null,
        territory: form.territory || null,
      }),
    })
    setSaving(false); setEditing(false); load()
  }

  if (loading) return <div className="p-6 text-zinc-500 text-sm">Loading...</div>
  if (!contact) return <div className="p-6 text-zinc-500 text-sm">Contact not found</div>

  const TABS: TabKey[] = ['General', 'Interaction Log', 'Opportunities', 'Tasks']

  return (
    <div className="flex flex-col min-h-[100dvh] bg-zinc-950">
      {/* Breadcrumb */}
      <div className="px-6 pt-4 pb-1 flex items-center gap-1.5 text-xs text-zinc-500">
        <Link href="/crm/contacts" className="hover:text-zinc-300 transition-colors">Contacts</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-300">{contact.name}</span>
      </div>

      {/* Header */}
      <div className="px-6 pt-2 pb-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Users className="w-4.5 h-4.5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">{contact.name}</h1>
            <p className="text-xs text-zinc-500">{contact.contactNo} · {contact.contactType}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-zinc-700 text-zinc-400 hover:text-white rounded transition-colors">
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded font-medium transition-colors">
                <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded transition-colors">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              <Link href={`/crm/interactions/new?contactId=${id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded transition-colors">
                <MessageSquare className="w-3.5 h-3.5" /> Log Interaction
              </Link>
            </>
          )}
        </div>
      </div>

      {/* FastTabs */}
      <div className="flex border-b border-zinc-800 px-6 gap-0">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 px-6 py-5 flex gap-6">
        {/* Main content */}
        <div className="flex-1">
          {tab === 'General' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 max-w-3xl">
              {editing ? (
                <>
                  {[
                    { label: 'Name *', key: 'name' as const },
                    { label: 'Company Name', key: 'companyName' as const },
                    { label: 'Salesperson Code', key: 'salesperson' as const },
                    { label: 'Territory Code', key: 'territory' as const },
                    { label: 'Phone No.', key: 'phone' as const },
                    { label: 'E-Mail', key: 'email' as const },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="text-[11px] text-zinc-400 mb-1 block">{label}</label>
                      <input value={form[key] ?? ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500" />
                    </div>
                  ))}
                  <div>
                    <label className="text-[11px] text-zinc-400 mb-1 block">Type</label>
                    <select value={form.contactType} onChange={e => setForm(f => ({ ...f, contactType: e.target.value }))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500">
                      <option>Company</option>
                      <option>Person</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  {[
                    { label: 'Contact No.', value: contact.contactNo },
                    { label: 'Type', value: contact.contactType },
                    { label: 'Company Name', value: contact.companyName },
                    { label: 'Salesperson', value: contact.salesperson },
                    { label: 'Territory', value: contact.territory },
                    { label: 'Last Modified', value: contact.lastModified ? new Date(contact.lastModified).toLocaleDateString() : '—' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[11px] text-zinc-500 mb-0.5">{label}</p>
                      <p className="text-sm text-white">{value ?? '—'}</p>
                    </div>
                  ))}
                  <div>
                    <p className="text-[11px] text-zinc-500 mb-0.5">Phone No.</p>
                    {contact.phone ? (
                      <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 text-sm text-indigo-400 hover:underline">
                        <Phone className="w-3.5 h-3.5" /> {contact.phone}
                      </a>
                    ) : <p className="text-sm text-zinc-600">—</p>}
                  </div>
                  <div>
                    <p className="text-[11px] text-zinc-500 mb-0.5">E-Mail</p>
                    {contact.email ? (
                      <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-sm text-indigo-400 hover:underline">
                        <Mail className="w-3.5 h-3.5" /> {contact.email}
                      </a>
                    ) : <p className="text-sm text-zinc-600">—</p>}
                  </div>
                </>
              )}
            </div>
          )}

          {tab === 'Interaction Log' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-zinc-400">{contact.interactions.length} entries</p>
                <Link href={`/crm/interactions/new?contactId=${id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors">
                  + Log Interaction
                </Link>
              </div>
              {contact.interactions.length === 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-8 text-center text-zinc-500 text-sm">No interactions logged</div>
              )}
              {contact.interactions.map(i => (
                <div key={i.id} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex items-center gap-4">
                  <div className="text-xs text-zinc-500 w-8 text-right font-mono">{i.entryNo}</div>
                  <div className="text-xs text-zinc-400 w-24 shrink-0">{i.interactionDate ?? '—'}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{i.description ?? i.template ?? '—'}</p>
                    <p className="text-xs text-zinc-500">{i.template ?? 'Manual'} · {i.initiatedBy}</p>
                  </div>
                  <div className="text-xs text-zinc-500 text-right">
                    <p>${(i.cost ?? 0).toFixed(2)}</p>
                    <p>{i.duration}m</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'Opportunities' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-zinc-400">{contact.opportunities.length} opportunities</p>
                <Link href={`/crm/opportunities/new?contactId=${id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors">
                  + New Opportunity
                </Link>
              </div>
              {contact.opportunities.length === 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-8 text-center text-zinc-500 text-sm">No opportunities</div>
              )}
              {contact.opportunities.map(o => (
                <Link key={o.id} href={`/crm/opportunities/${o.id}`}
                  className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg px-4 py-3 flex items-center gap-4 transition-colors block">
                  <Target className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{o.description}</p>
                    <p className="text-xs text-zinc-500">{o.opportunityNo} · {o.status} · {o.probability}%</p>
                  </div>
                  <p className="text-sm text-zinc-300 shrink-0">${(o.estimatedValue ?? 0).toLocaleString()}</p>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                </Link>
              ))}
            </div>
          )}

          {tab === 'Tasks' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-zinc-400">{contact.tasks.length} tasks</p>
                <Link href={`/crm/tasks/new?contactId=${id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors">
                  + New Task
                </Link>
              </div>
              {contact.tasks.length === 0 && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-8 text-center text-zinc-500 text-sm">No tasks</div>
              )}
              {contact.tasks.map(t => (
                <div key={t.id} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex items-center gap-4">
                  <CheckSquare className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{t.description}</p>
                    <p className="text-xs text-zinc-500">{t.taskNo} · {t.taskType} · {t.taskDate ?? '—'}</p>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PRIORITY_COLOR[t.priority] ?? 'text-zinc-400 bg-zinc-700/50'}`}>{t.priority}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${t.status === 'Open' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>{t.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FactBox sidebar */}
        {!editing && (
          <div className="w-64 shrink-0 space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wide flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5" /> Contact Statistics
              </p>
              {[
                { label: 'Interactions', value: contact.interactions.length },
                { label: 'Opportunities', value: contact.opportunities.length },
                { label: 'Open Tasks', value: contact.tasks.filter(t => t.status === 'Open').length },
                { label: 'Est. Value', value: `$${contact.opportunities.reduce((s, o) => s + (o.estimatedValue ?? 0), 0).toLocaleString()}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-1.5 border-b border-zinc-800 last:border-0">
                  <span className="text-xs text-zinc-500">{label}</span>
                  <span className="text-xs text-white font-medium">{value}</span>
                </div>
              ))}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <p className="text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wide flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Recent Interactions
              </p>
              {contact.interactions.slice(0, 3).length === 0 && (
                <p className="text-xs text-zinc-600">None yet</p>
              )}
              {contact.interactions.slice(0, 3).map(i => (
                <div key={i.id} className="py-1.5 border-b border-zinc-800 last:border-0">
                  <p className="text-xs text-white truncate">{i.description ?? i.template ?? 'Interaction'}</p>
                  <p className="text-[10px] text-zinc-500">{i.interactionDate}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
