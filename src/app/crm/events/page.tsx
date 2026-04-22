'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { CalendarDays, Plus, Trash2, Pencil, Check } from 'lucide-react'

interface MarketingEvent {
  id: string
  name: string
  eventType: string
  venue?: string
  startDate?: string
  endDate?: string
  capacity: number
  registered: number
  attended: number
  status: string
  description?: string
  createdAt: string
}

const EVENT_TYPES = ['webinar', 'in-store-event', 'conference', 'pop-up', 'vip-event']
const EVENT_STATUSES = ['planned', 'registration-open', 'active', 'completed', 'cancelled']

const TYPE_COLORS: Record<string, string> = {
  webinar: 'bg-blue-500/20 text-blue-400',
  'in-store-event': 'bg-orange-500/20 text-orange-400',
  conference: 'bg-purple-500/20 text-purple-400',
  'pop-up': 'bg-pink-500/20 text-pink-400',
  'vip-event': 'bg-yellow-500/20 text-yellow-400',
}
const STATUS_COLORS: Record<string, string> = {
  planned: 'bg-zinc-700 text-zinc-300',
  'registration-open': 'bg-green-500/20 text-green-400',
  active: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-purple-500/20 text-purple-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

const BLANK_FORM = { name: '', eventType: 'webinar', venue: '', startDate: '', endDate: '', capacity: 50, description: '' }

export default function EventsPage() {
  const [events, setEvents] = useState<MarketingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(BLANK_FORM)

  const load = useCallback(() => {
    fetch('/api/crm/events').then(r => r.json()).then(d => { setEvents(Array.isArray(d) ? d : []); setLoading(false) })
  }, [])

  useEffect(() => { load() }, [load])

  function setF(k: string, v: string | number) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    const payload = {
      name: form.name,
      eventType: form.eventType,
      venue: form.venue || null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      capacity: form.capacity,
      description: form.description || null,
    }
    if (editId) {
      await fetch(`/api/crm/events/${editId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
    } else {
      await fetch('/api/crm/events', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      })
    }
    setShowForm(false)
    setEditId(null)
    setForm(BLANK_FORM)
    load()
  }

  async function del(id: string) {
    if (!confirm('Delete this event?')) return
    await fetch(`/api/crm/events/${id}`, { method: 'DELETE' })
    load()
  }

  function startEdit(e: MarketingEvent) {
    setForm({
      name: e.name, eventType: e.eventType, venue: e.venue ?? '',
      startDate: e.startDate ? e.startDate.slice(0, 16) : '',
      endDate: e.endDate ? e.endDate.slice(0, 16) : '',
      capacity: e.capacity, description: e.description ?? '',
    })
    setEditId(e.id)
    setShowForm(true)
  }

  void EVENT_STATUSES

  return (
    <div className="p-6 space-y-6 min-h-[100dvh] bg-zinc-950">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-blue-400" /> Marketing Events
          </h1>
          <p className="text-zinc-500 text-sm">{events.length} events</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(BLANK_FORM) }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Event
        </button>
      </div>

      {showForm && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-100">{editId ? 'Edit Event' : 'New Event'}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs text-zinc-400 mb-1">Event Name *</label>
              <input value={form.name} onChange={e => setF('name', e.target.value)} placeholder="Summer VIP Night"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Type</label>
              <select value={form.eventType} onChange={e => setF('eventType', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500">
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Capacity</label>
              <input type="number" value={form.capacity} onChange={e => setF('capacity', parseInt(e.target.value) || 50)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div className="col-span-2 md:col-span-3">
              <label className="block text-xs text-zinc-400 mb-1">Venue</label>
              <input value={form.venue} onChange={e => setF('venue', e.target.value)} placeholder="123 Main St, Downtown"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Start Date & Time</label>
              <input type="datetime-local" value={form.startDate} onChange={e => setF('startDate', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">End Date & Time</label>
              <input type="datetime-local" value={form.endDate} onChange={e => setF('endDate', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div className="col-span-2 md:col-span-3">
              <label className="block text-xs text-zinc-400 mb-1">Description</label>
              <textarea value={form.description} onChange={e => setF('description', e.target.value)} rows={2}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500 resize-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={save} disabled={!form.name.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              <Check className="w-4 h-4" /> {editId ? 'Save Changes' : 'Create Event'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null) }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Event Name', 'Type', 'Venue', 'Start Date', 'Registered / Cap', 'Attended', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-600">Loading...</td></tr>
              ) : events.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-zinc-600">No events yet</td></tr>
              ) : events.map(e => (
                <tr key={e.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/crm/events/${e.id}`} className="font-medium text-zinc-100 hover:text-blue-400">{e.name}</Link>
                    {e.description && <div className="text-xs text-zinc-600 mt-0.5 truncate max-w-[180px]">{e.description}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[e.eventType] ?? 'bg-zinc-700 text-zinc-300'}`}>{e.eventType}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{e.venue ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs whitespace-nowrap">
                    {e.startDate ? new Date(e.startDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-zinc-300">{e.registered} / {e.capacity}</div>
                    <div className="w-20 bg-zinc-800 rounded-full h-1.5 mt-1">
                      <div className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${e.capacity > 0 ? Math.min(100, (e.registered / e.capacity) * 100) : 0}%` }} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{e.attended}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[e.status] ?? 'bg-zinc-700 text-zinc-300'}`}>{e.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEdit(e)}
                        className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => del(e.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
