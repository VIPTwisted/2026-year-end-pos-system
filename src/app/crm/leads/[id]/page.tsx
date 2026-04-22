'use client'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Phone, Mail, Building, User, Clock, MessageSquare, PhoneCall, Video, FileText, CheckCircle, ArrowRight } from 'lucide-react'

interface LeadActivity {
  id: string
  activityType: string
  subject?: string
  notes?: string
  outcome?: string
  recordedBy?: string
  createdAt: string
}

interface Lead {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  company?: string
  source: string
  status: string
  score: number
  assignedTo?: string
  notes?: string
  activities: LeadActivity[]
  convertedAt?: string
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-zinc-700 text-zinc-300',
  contacted: 'bg-blue-500/20 text-blue-400',
  qualified: 'bg-green-500/20 text-green-400',
  unqualified: 'bg-zinc-700 text-zinc-400',
  converted: 'bg-purple-500/20 text-purple-400',
  lost: 'bg-red-500/20 text-red-400',
}

const ACTIVITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  note: FileText, call: PhoneCall, email: Mail, meeting: Video, demo: CheckCircle,
}

const ACTIVITY_TYPES = ['note', 'call', 'email', 'meeting', 'demo']

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState(0)
  const [actForm, setActForm] = useState({ activityType: 'note', subject: '', notes: '', outcome: '', recordedBy: '' })
  const [savingActivity, setSavingActivity] = useState(false)

  function load() {
    fetch(`/api/crm/leads/${id}`).then(r => r.json()).then(d => {
      setLead(d); setScore(d.score ?? 0); setLoading(false)
    })
  }
  useEffect(() => { load() }, [id])

  async function saveScore() {
    await fetch(`/api/crm/leads/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ score }),
    })
    load()
  }

  async function addActivity() {
    setSavingActivity(true)
    await fetch(`/api/crm/leads/${id}/activities`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(actForm),
    })
    setActForm({ activityType: 'note', subject: '', notes: '', outcome: '', recordedBy: '' })
    setSavingActivity(false)
    load()
  }

  async function convert() {
    if (!confirm('Convert this lead to a customer?')) return
    await fetch(`/api/crm/leads/${id}/convert`, { method: 'POST' })
    load()
  }

  if (loading) return <div className="p-6 text-zinc-600">Loading...</div>
  if (!lead) return <div className="p-6 text-red-400">Lead not found</div>

  const fullName = [lead.firstName, lead.lastName].filter(Boolean).join(' ') || 'Unnamed Lead'

  return (
    <div className="p-6 space-y-6 min-h-[100dvh] bg-zinc-950 max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300 text-sm mb-3">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-2xl font-bold text-zinc-100">{fullName}</h1>
          {lead.company && <div className="text-zinc-500 text-sm mt-1">{lead.company}</div>}
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[lead.status] ?? 'bg-zinc-700 text-zinc-300'}`}>{lead.status}</span>
            <span className="text-xs text-zinc-600">Score: {lead.score}/100</span>
          </div>
        </div>
        {lead.status !== 'converted' && lead.status !== 'lost' && (
          <button onClick={convert}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 border border-purple-500/30 rounded-lg text-sm transition-colors">
            <ArrowRight className="w-4 h-4" /> Convert to Customer
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-100">Contact Info</h2>
            {lead.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-zinc-500 shrink-0" />
                <span className="text-zinc-300">{lead.email}</span>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-zinc-500 shrink-0" />
                <span className="text-zinc-300">{lead.phone}</span>
              </div>
            )}
            {lead.company && (
              <div className="flex items-center gap-2 text-sm">
                <Building className="w-4 h-4 text-zinc-500 shrink-0" />
                <span className="text-zinc-300">{lead.company}</span>
              </div>
            )}
            {lead.assignedTo && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-zinc-500 shrink-0" />
                <span className="text-zinc-300">{lead.assignedTo}</span>
              </div>
            )}
            {lead.notes && (
              <div className="text-xs text-zinc-500 border-t border-zinc-800 pt-3">{lead.notes}</div>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-100">Lead Score</h2>
            <div className="text-3xl font-bold text-zinc-100">{score}<span className="text-lg text-zinc-600">/100</span></div>
            <div className="w-full bg-zinc-800 rounded-full h-2">
              <div className={`h-2 rounded-full transition-all ${score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${score}%` }} />
            </div>
            <input type="range" min={0} max={100} value={score} onChange={e => setScore(parseInt(e.target.value))}
              className="w-full accent-blue-500" />
            <button onClick={saveScore}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
              Save Score
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-100">Add Activity</h2>
            <div className="flex gap-2 flex-wrap">
              {ACTIVITY_TYPES.map(t => (
                <button key={t} onClick={() => setActForm(f => ({ ...f, activityType: t }))}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors border ${actForm.activityType === t ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'}`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Subject</label>
                <input value={actForm.subject} onChange={e => setActForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="Activity subject"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Recorded By</label>
                <input value={actForm.recordedBy} onChange={e => setActForm(f => ({ ...f, recordedBy: e.target.value }))}
                  placeholder="Your name"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Notes</label>
                <textarea value={actForm.notes} onChange={e => setActForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Outcome</label>
                <textarea value={actForm.outcome} onChange={e => setActForm(f => ({ ...f, outcome: e.target.value }))} rows={2}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500 resize-none" />
              </div>
            </div>
            <button onClick={addActivity} disabled={savingActivity}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {savingActivity ? 'Saving...' : 'Log Activity'}
            </button>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" /> Activities Timeline
            </h2>
            {lead.activities.length === 0 ? (
              <div className="text-zinc-600 text-sm text-center py-4">No activities logged yet</div>
            ) : (
              <div className="space-y-3">
                {lead.activities.map(a => {
                  const Icon = ACTIVITY_ICONS[a.activityType] ?? MessageSquare
                  return (
                    <div key={a.id} className="flex gap-3">
                      <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div className="flex-1 bg-zinc-800 rounded-lg p-3 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-zinc-300 capitalize">{a.activityType}</span>
                          <span className="text-xs text-zinc-600">{new Date(a.createdAt).toLocaleString()}</span>
                        </div>
                        {a.subject && <div className="text-sm font-medium text-zinc-100">{a.subject}</div>}
                        {a.notes && <div className="text-xs text-zinc-400">{a.notes}</div>}
                        {a.outcome && <div className="text-xs text-green-400">Outcome: {a.outcome}</div>}
                        {a.recordedBy && <div className="text-xs text-zinc-600">By {a.recordedBy}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
