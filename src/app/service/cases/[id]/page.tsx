'use client'
import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  ArrowLeft, Phone, Mail, MessageCircle, Star,
  AlertCircle, Clock, CheckCircle, User, Send,
  ShoppingBag, Globe, Tag, MessageSquare, Headphones,
} from 'lucide-react'

type CaseNote = {
  id: string
  noteType: string
  body: string
  authorName: string | null
  createdAt: string
}
type CaseSatisfaction = {
  rating: number
  comment: string | null
  submittedAt: string
}
type Queue = { id: string; name: string }
type SLA = { name: string; firstResponseHours: number; resolutionHours: number }
type ServiceCase = {
  id: string
  caseNumber: string
  subject: string
  description: string | null
  status: string
  priority: string
  channel: string | null
  customerName: string | null
  customerEmail: string | null
  customerId: string | null
  assignedTo: string | null
  orderId: string | null
  tags: string | null
  slaDueAt: string | null
  slaBreached: boolean
  resolvedAt: string | null
  closedAt: string | null
  createdAt: string
  notes: CaseNote[]
  satisfaction: CaseSatisfaction | null
  queue: Queue | null
  sla: SLA | null
}

const PRIORITY_COLORS: Record<string, string> = {
  low:      'bg-zinc-700 text-zinc-300',
  medium:   'bg-blue-500/20 text-blue-300',
  high:     'bg-orange-500/20 text-orange-300',
  critical: 'bg-red-500/20 text-red-400',
}
const STATUS_COLORS: Record<string, string> = {
  open:             'bg-blue-500/15 text-blue-300',
  in_progress:      'bg-yellow-500/15 text-yellow-300',
  pending_customer: 'bg-orange-500/15 text-orange-300',
  escalated:        'bg-red-500/15 text-red-400',
  resolved:         'bg-green-500/15 text-green-300',
  closed:           'bg-zinc-700 text-zinc-400',
}
const STATUS_LABELS: Record<string, string> = {
  open: 'Open', in_progress: 'In Progress', pending_customer: 'Pending Customer',
  escalated: 'Escalated', resolved: 'Resolved', closed: 'Closed',
}
const NOTE_COLORS: Record<string, string> = {
  internal:       'border-zinc-700 bg-zinc-800/50',
  customer_reply: 'border-blue-500/30 bg-blue-500/5',
  system:         'border-green-500/30 bg-green-500/5',
}
const NOTE_LABELS: Record<string, string> = {
  internal: 'Internal', customer_reply: 'Customer Reply', system: 'System',
}
const NOTE_TEXT: Record<string, string> = {
  internal: 'text-zinc-400', customer_reply: 'text-blue-400', system: 'text-green-400',
}
const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  phone: <Phone className="w-3.5 h-3.5" />, email: <Mail className="w-3.5 h-3.5" />,
  chat: <MessageCircle className="w-3.5 h-3.5" />, in_store: <ShoppingBag className="w-3.5 h-3.5" />,
  social: <Globe className="w-3.5 h-3.5" />,
}

function fmt(s: string) {
  return new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function StarRating({ rating, interactive, onChange }: { rating: number; interactive?: boolean; onChange?: (r: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => interactive && onChange?.(s)}
          onMouseEnter={() => interactive && setHover(s)}
          onMouseLeave={() => interactive && setHover(0)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star className={cn(
            'w-5 h-5',
            (hover ? s <= hover : s <= rating)
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-zinc-600'
          )} />
        </button>
      ))}
    </div>
  )
}

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [c, setC]               = useState<ServiceCase | null>(null)
  const [loading, setLoading]   = useState(true)
  const [noteTab, setNoteTab]   = useState<'internal' | 'customer_reply'>('internal')
  const [noteBody, setNoteBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // CSAT form
  const [csatRating, setCsatRating]   = useState(0)
  const [csatComment, setCsatComment] = useState('')
  const [showCsatForm, setShowCsatForm] = useState(false)

  const fetch_ = useCallback(() => {
    fetch(`/api/service/cases/${id}`)
      .then((r) => r.json())
      .then((data) => { setC(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  useEffect(() => { fetch_() }, [fetch_])

  async function patchCase(payload: Record<string, unknown>) {
    const res = await fetch(`/api/service/cases/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) fetch_()
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault()
    if (!noteBody.trim()) return
    setSubmitting(true)
    await fetch(`/api/service/cases/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noteType: noteTab, body: noteBody, authorName: 'Agent' }),
    })
    setNoteBody('')
    setSubmitting(false)
    fetch_()
  }

  async function doAction(action: 'resolve' | 'close' | 'escalate') {
    await fetch(`/api/service/cases/${id}/${action}`, { method: 'POST' })
    fetch_()
  }

  async function submitCsat(e: React.FormEvent) {
    e.preventDefault()
    if (!csatRating) return
    await fetch(`/api/service/cases/${id}/satisfaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: csatRating, comment: csatComment }),
    })
    setShowCsatForm(false)
    fetch_()
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400 animate-pulse">Loading case...</div>
      </div>
    )
  }

  if (!c) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Case not found.</div>
      </div>
    )
  }

  const isTerminal = c.status === 'resolved' || c.status === 'closed'

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-3 flex items-center gap-3">
        <button onClick={() => router.push('/service/cases')} className="text-zinc-400 hover:text-zinc-200">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-500">{c.caseNumber.slice(-8)}</span>
          <span className={cn('text-xs px-2 py-0.5 rounded', STATUS_COLORS[c.status])}>
            {STATUS_LABELS[c.status] ?? c.status}
          </span>
          {c.slaBreached && (
            <span className="flex items-center gap-1 text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
              <AlertCircle className="w-3 h-3" /> SLA Breached
            </span>
          )}
        </div>
        <h1 className="text-base font-semibold truncate flex-1">{c.subject}</h1>
      </div>

      {/* 3-column layout */}
      <div className="flex h-[calc(100dvh-57px)]">

        {/* LEFT: Metadata (300px) */}
        <div className="w-[300px] shrink-0 border-r border-zinc-800 overflow-y-auto">
          <div className="p-4 space-y-5">
            {/* Case Info */}
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Case Info</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Created</span>
                  <span className="text-zinc-300 text-xs">{fmt(c.createdAt)}</span>
                </div>
                {c.channel && (
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Channel</span>
                    <div className="flex items-center gap-1 text-zinc-300">
                      {CHANNEL_ICONS[c.channel]}
                      <span className="text-xs capitalize">{c.channel.replace('_', ' ')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Customer */}
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Customer</div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-zinc-300">{c.customerName ?? '—'}</span>
                </div>
                {c.customerEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-zinc-400 text-xs break-all">{c.customerEmail}</span>
                  </div>
                )}
                {c.orderId && (
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-zinc-400 text-xs">Order: {c.orderId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Priority */}
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Priority</div>
              <select
                value={c.priority}
                onChange={(e) => patchCase({ priority: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
              >
                {['low', 'medium', 'high', 'critical'].map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Status Actions */}
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Status</div>
              <select
                value={c.status}
                onChange={(e) => patchCase({ status: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 mb-2"
              >
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              {!isTerminal && (
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => doAction('resolve')}
                    className="flex flex-col items-center gap-1 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg text-xs text-green-400 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Resolve
                  </button>
                  <button
                    onClick={() => doAction('close')}
                    className="flex flex-col items-center gap-1 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs text-zinc-400 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Close
                  </button>
                  <button
                    onClick={() => doAction('escalate')}
                    className="flex flex-col items-center gap-1 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg text-xs text-red-400 transition-colors"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    Escalate
                  </button>
                </div>
              )}
            </div>

            {/* Queue */}
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Queue</div>
              <input
                defaultValue={c.queue?.name ?? ''}
                readOnly
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-400 cursor-default"
                placeholder="No queue"
              />
            </div>

            {/* Agent */}
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Assigned To</div>
              <input
                defaultValue={c.assignedTo ?? ''}
                onBlur={(e) => patchCase({ assignedTo: e.target.value || null })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
                placeholder="Assign agent..."
              />
            </div>

            {/* SLA */}
            {c.sla && (
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">SLA Policy</div>
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 space-y-1 text-xs">
                  <div className="text-zinc-200 font-medium">{c.sla.name}</div>
                  <div className="text-zinc-500">First Response: {c.sla.firstResponseHours}h</div>
                  <div className="text-zinc-500">Resolution: {c.sla.resolutionHours}h</div>
                  {c.slaDueAt && (
                    <div className={cn('mt-1 font-medium', c.slaBreached ? 'text-red-400' : 'text-zinc-300')}>
                      Due: {fmt(c.slaDueAt)}
                    </div>
                  )}
                  {c.slaBreached && (
                    <div className="flex items-center gap-1 text-red-400 mt-1">
                      <AlertCircle className="w-3 h-3" /> Breached
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            <div>
              <div className="flex items-center gap-1 text-xs text-zinc-500 uppercase tracking-wide mb-2">
                <Tag className="w-3 h-3" /> Tags
              </div>
              <input
                defaultValue={c.tags ?? ''}
                onBlur={(e) => patchCase({ tags: e.target.value || null })}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
                placeholder="comma, separated, tags"
              />
            </div>
          </div>
        </div>

        {/* CENTER: Notes Feed (flex-1) */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Description */}
          {c.description && (
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/30">
              <div className="text-xs text-zinc-500 mb-1">Description</div>
              <p className="text-sm text-zinc-300 leading-relaxed">{c.description}</p>
            </div>
          )}

          {/* Notes list */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
            {c.notes.length === 0 ? (
              <div className="text-center text-zinc-600 text-sm py-8">No notes yet. Add the first note below.</div>
            ) : c.notes.map((note) => (
              <div
                key={note.id}
                className={cn('border rounded-lg p-3', NOTE_COLORS[note.noteType] ?? NOTE_COLORS.internal)}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={cn('text-xs font-medium', NOTE_TEXT[note.noteType] ?? 'text-zinc-400')}>
                    {NOTE_LABELS[note.noteType] ?? note.noteType}
                  </span>
                  <span className="text-xs text-zinc-600">·</span>
                  <span className="text-xs text-zinc-500">{note.authorName ?? 'Unknown'}</span>
                  <span className="text-xs text-zinc-600 ml-auto">{fmt(note.createdAt)}</span>
                </div>
                <p className="text-sm text-zinc-300 whitespace-pre-wrap">{note.body}</p>
              </div>
            ))}
          </div>

          {/* Add Note Form */}
          <div className="border-t border-zinc-800 p-4">
            <div className="flex gap-1 mb-3">
              {(['internal', 'customer_reply'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setNoteTab(tab)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    noteTab === tab
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  )}
                >
                  {tab === 'internal' ? 'Internal Note' : 'Customer Reply'}
                </button>
              ))}
            </div>
            <form onSubmit={addNote} className="flex gap-2">
              <textarea
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                placeholder={noteTab === 'internal' ? 'Add internal note...' : 'Reply to customer...'}
                rows={3}
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
              <button
                type="submit"
                disabled={submitting || !noteBody.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors self-end"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: Related Info (250px) */}
        <div className="w-[250px] shrink-0 border-l border-zinc-800 overflow-y-auto">
          <div className="p-4 space-y-5">
            {/* CSAT Panel */}
            <div>
              <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wide mb-2">
                <Star className="w-3 h-3" /> Customer Satisfaction
              </div>

              {c.satisfaction ? (
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 space-y-2">
                  <StarRating rating={c.satisfaction.rating} />
                  <div className="text-sm text-zinc-200 font-medium">{c.satisfaction.rating}/5 stars</div>
                  {c.satisfaction.comment && (
                    <p className="text-xs text-zinc-400 italic">"{c.satisfaction.comment}"</p>
                  )}
                  <div className="text-xs text-zinc-600">{fmt(c.satisfaction.submittedAt)}</div>
                </div>
              ) : isTerminal ? (
                showCsatForm ? (
                  <form onSubmit={submitCsat} className="space-y-3">
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Rating</div>
                      <StarRating rating={csatRating} interactive onChange={setCsatRating} />
                    </div>
                    <div>
                      <textarea
                        value={csatComment}
                        onChange={(e) => setCsatComment(e.target.value)}
                        placeholder="Customer comment (optional)"
                        rows={2}
                        className="w-full px-2 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCsatForm(false)}
                        className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-xs transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!csatRating}
                        className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded text-xs transition-colors"
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowCsatForm(true)}
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    Send CSAT Survey
                  </button>
                )
              ) : (
                <div className="text-xs text-zinc-600 bg-zinc-800/50 border border-zinc-800 rounded-lg p-3">
                  CSAT available after case is resolved or closed.
                </div>
              )}
            </div>

            {/* Case Timeline */}
            <div>
              <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wide mb-2">
                <Clock className="w-3 h-3" /> Timeline
              </div>
              <div className="space-y-2">
                {/* Created */}
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div>
                    <div className="text-xs text-zinc-400">Case created</div>
                    <div className="text-xs text-zinc-600">{fmt(c.createdAt)}</div>
                  </div>
                </div>
                {/* System notes as timeline events */}
                {c.notes.filter((n) => n.noteType === 'system').map((n) => (
                  <div key={n.id} className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                    <div>
                      <div className="text-xs text-zinc-400">{n.body}</div>
                      <div className="text-xs text-zinc-600">{fmt(n.createdAt)}</div>
                    </div>
                  </div>
                ))}
                {c.resolvedAt && (
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                    <div>
                      <div className="text-xs text-zinc-400">Resolved</div>
                      <div className="text-xs text-zinc-600">{fmt(c.resolvedAt)}</div>
                    </div>
                  </div>
                )}
                {c.closedAt && (
                  <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 mt-1.5 shrink-0" />
                    <div>
                      <div className="text-xs text-zinc-400">Closed</div>
                      <div className="text-xs text-zinc-600">{fmt(c.closedAt)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
