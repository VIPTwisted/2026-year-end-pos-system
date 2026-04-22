'use client'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, CalendarDays, Users, Check, X, UserPlus, MapPin } from 'lucide-react'

interface Registration {
  id: string
  customerName: string
  email?: string
  phone?: string
  status: string
  registeredAt: string
}

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
  registrations: Registration[]
}

const STATUS_COLORS: Record<string, string> = {
  planned: 'bg-zinc-700 text-zinc-300',
  'registration-open': 'bg-green-500/20 text-green-400',
  active: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-purple-500/20 text-purple-400',
  cancelled: 'bg-red-500/20 text-red-400',
}
const REG_STATUS_COLORS: Record<string, string> = {
  registered: 'bg-zinc-700 text-zinc-300',
  confirmed: 'bg-blue-500/20 text-blue-400',
  attended: 'bg-green-500/20 text-green-400',
  'no-show': 'bg-red-500/20 text-red-400',
  cancelled: 'bg-zinc-800 text-zinc-500',
}

const EVENT_STATUS_TRANSITIONS: Record<string, string[]> = {
  planned: ['registration-open', 'cancelled'],
  'registration-open': ['active', 'cancelled'],
  active: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [event, setEvent] = useState<MarketingEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [regForm, setRegForm] = useState({ customerName: '', email: '', phone: '' })
  const [saving, setSaving] = useState(false)

  function load() {
    fetch(`/api/crm/events/${id}`).then(r => r.json()).then(d => { setEvent(d); setLoading(false) })
  }
  useEffect(() => { load() }, [id])

  async function changeStatus(newStatus: string) {
    await fetch(`/api/crm/events/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }),
    })
    load()
  }

  async function addReg() {
    if (!regForm.customerName.trim()) return
    setSaving(true)
    await fetch(`/api/crm/events/${id}/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(regForm),
    })
    setRegForm({ customerName: '', email: '', phone: '' })
    setSaving(false)
    load()
  }

  async function updateRegStatus(rid: string, status: string) {
    await fetch(`/api/crm/events/${id}/registrations/${rid}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    })
    load()
  }

  if (loading) return <div className="p-6 text-zinc-600">Loading...</div>
  if (!event) return <div className="p-6 text-red-400">Event not found</div>

  const capPct = event.capacity > 0 ? Math.min(100, (event.registered / event.capacity) * 100) : 0
  const confirmed = event.registrations.filter(r => r.status === 'confirmed').length
  const nextStatuses = EVENT_STATUS_TRANSITIONS[event.status] ?? []

  return (
    <div className="p-6 space-y-6 min-h-[100dvh] bg-zinc-950 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 text-sm mb-3">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-2xl font-bold text-zinc-100">{event.name}</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap text-sm text-zinc-500">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[event.status] ?? 'bg-zinc-700 text-zinc-300'}`}>{event.status}</span>
            <span className="capitalize">{event.eventType}</span>
            {event.venue && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.venue}</span>}
            {event.startDate && <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{new Date(event.startDate).toLocaleDateString()}</span>}
          </div>
        </div>
        {nextStatuses.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {nextStatuses.map(s => (
              <button key={s} onClick={() => changeStatus(s)}
                className={`px-3 py-2 rounded-lg text-sm border transition-colors capitalize ${s === 'cancelled' ? 'border-red-800 text-red-400 hover:bg-red-500/10' : 'border-blue-700 text-blue-400 hover:bg-blue-500/10'}`}>
                → {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Registered', value: event.registered, total: event.capacity, color: 'text-blue-400' },
          { label: 'Confirmed', value: confirmed, total: event.registered, color: 'text-green-400' },
          { label: 'Attended', value: event.attended, total: event.registered, color: 'text-purple-400' },
        ].map(k => (
          <div key={k.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">{k.label}</div>
            <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
            {k.total > 0 && <div className="text-xs text-zinc-600 mt-1">of {k.total} ({Math.round((k.value / k.total) * 100)}%)</div>}
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-zinc-100 flex items-center gap-2"><Users className="w-4 h-4 text-blue-400" /> Capacity</span>
          <span className="text-sm text-zinc-300">{event.registered} / {event.capacity} seats</span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-4 overflow-hidden">
          <div className={`h-4 rounded-full transition-all ${capPct >= 90 ? 'bg-red-500' : capPct >= 70 ? 'bg-yellow-500' : 'bg-blue-500'}`}
            style={{ width: `${capPct}%` }} />
        </div>
        <div className="text-xs text-zinc-500">{capPct.toFixed(0)}% full · {Math.max(0, event.capacity - event.registered)} spots remaining</div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-blue-400" /> Add Registration
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Customer Name *', key: 'customerName', type: 'text' },
            { label: 'Email', key: 'email', type: 'email' },
            { label: 'Phone', key: 'phone', type: 'tel' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs text-zinc-400 mb-1">{f.label}</label>
              <input type={f.type} value={regForm[f.key as keyof typeof regForm]}
                onChange={e => setRegForm(r => ({ ...r, [f.key]: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
            </div>
          ))}
        </div>
        <button onClick={addReg} disabled={!regForm.customerName.trim() || saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
          <UserPlus className="w-4 h-4" /> {saving ? 'Registering...' : 'Register'}
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-100">Registrations ({event.registrations.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Customer', 'Email', 'Phone', 'Status', 'Registered At', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {event.registrations.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-600">No registrations yet</td></tr>
              ) : event.registrations.map(r => (
                <tr key={r.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-100">{r.customerName}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{r.email ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{r.phone ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${REG_STATUS_COLORS[r.status] ?? 'bg-zinc-700 text-zinc-300'}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(r.registeredAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {r.status === 'registered' && (
                        <button onClick={() => updateRegStatus(r.id, 'confirmed')}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded text-xs transition-colors">
                          <Check className="w-3 h-3" /> Confirm
                        </button>
                      )}
                      {(r.status === 'confirmed' || r.status === 'registered') && (
                        <button onClick={() => updateRegStatus(r.id, 'attended')}
                          className="flex items-center gap-1 px-2 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded text-xs transition-colors">
                          <Check className="w-3 h-3" /> Attended
                        </button>
                      )}
                      {r.status !== 'attended' && r.status !== 'cancelled' && (
                        <button onClick={() => updateRegStatus(r.id, 'no-show')}
                          className="flex items-center gap-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded text-xs transition-colors">
                          <X className="w-3 h-3" /> No-show
                        </button>
                      )}
                      {r.status !== 'cancelled' && r.status !== 'attended' && (
                        <button onClick={() => updateRegStatus(r.id, 'cancelled')}
                          className="flex items-center gap-1 px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded text-xs transition-colors">
                          <X className="w-3 h-3" /> Cancel
                        </button>
                      )}
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
