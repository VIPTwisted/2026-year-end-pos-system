'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Plus, AlertCircle, Clock, X, Search, ChevronRight,
  Phone, Mail, MessageCircle, ShoppingBag, Globe, Users,
} from 'lucide-react'

type Queue = { id: string; name: string }
type ServiceCase = {
  id: string
  caseNumber: string
  subject: string
  customerName: string | null
  customerEmail: string | null
  priority: string
  status: string
  channel: string | null
  assignedTo: string | null
  slaId: string | null
  slaDueAt: string | null
  slaBreached: boolean
  createdAt: string
  queue: Queue | null
}

const STATUS_TABS = ['all', 'open', 'in_progress', 'pending_customer', 'escalated', 'resolved', 'closed']
const STATUS_LABELS: Record<string, string> = {
  all: 'All', open: 'Open', in_progress: 'In Progress',
  pending_customer: 'Pending Customer', escalated: 'Escalated',
  resolved: 'Resolved', closed: 'Closed',
}
const PRIORITIES  = ['all', 'low', 'medium', 'high', 'critical']
const CHANNELS    = ['phone', 'email', 'chat', 'in_store', 'social']

const PRIORITY_COLORS: Record<string, string> = {
  low:      'bg-zinc-700 text-zinc-300 border-zinc-600',
  medium:   'bg-blue-500/20 text-blue-300 border-blue-500/30',
  high:     'bg-orange-500/20 text-orange-300 border-orange-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
}
const STATUS_COLORS: Record<string, string> = {
  open:             'bg-blue-500/15 text-blue-300',
  in_progress:      'bg-yellow-500/15 text-yellow-300',
  pending_customer: 'bg-orange-500/15 text-orange-300',
  escalated:        'bg-red-500/15 text-red-400',
  resolved:         'bg-green-500/15 text-green-300',
  closed:           'bg-zinc-700 text-zinc-400',
}
const CHANNEL_ICONS: Record<string, React.ReactNode> = {
  phone:    <Phone className="w-3 h-3" />,
  email:    <Mail className="w-3 h-3" />,
  chat:     <MessageCircle className="w-3 h-3" />,
  in_store: <ShoppingBag className="w-3 h-3" />,
  social:   <Globe className="w-3 h-3" />,
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function CasesPage() {
  const [cases, setCases]         = useState<ServiceCase[]>([])
  const [queues, setQueues]       = useState<Queue[]>([])
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [priority, setPriority]   = useState('all')
  const [queueId, setQueueId]     = useState('')
  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)

  // New case form
  const [form, setForm] = useState({
    subject: '', description: '', customerName: '', customerEmail: '',
    channel: 'email', priority: 'medium', queueId: '',
  })

  const fetchCases = useCallback(() => {
    const params = new URLSearchParams()
    if (activeTab !== 'all') params.set('status', activeTab)
    if (priority !== 'all')  params.set('priority', priority)
    if (queueId)             params.set('queueId', queueId)
    if (search)              params.set('search', search)

    setLoading(true)
    fetch(`/api/service/cases?${params}`)
      .then((r) => r.json())
      .then((data) => { setCases(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [activeTab, priority, queueId, search])

  useEffect(() => { fetchCases() }, [fetchCases])
  useEffect(() => {
    fetch('/api/service/queues').then((r) => r.json()).then(setQueues)
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/service/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        queueId: form.queueId || null,
      }),
    })
    if (res.ok) {
      setShowModal(false)
      setForm({ subject: '', description: '', customerName: '', customerEmail: '', channel: 'email', priority: 'medium', queueId: '' })
      fetchCases()
    }
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Service Cases</h1>
            <p className="text-xs text-zinc-500">{cases.length} case{cases.length !== 1 ? 's' : ''} shown</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/service/cases/new"
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium transition-colors text-zinc-200"
            >
              <Plus className="w-4 h-4" /> New Case
            </Link>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> Quick Create
            </button>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="border-b border-zinc-800 px-6">
        <div className="flex gap-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              )}
            >
              {STATUS_LABELS[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 px-6 py-3 bg-zinc-900 border-b border-zinc-800">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search case #, subject, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p === 'all' ? 'All Priorities' : p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>

        <select
          value={queueId}
          onChange={(e) => setQueueId(e.target.value)}
          className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Queues</option>
          {queues.map((q) => <option key={q.id} value={q.id}>{q.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wide">
              <th className="px-4 py-3 text-left">Case #</th>
              <th className="px-4 py-3 text-left">Subject</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Priority</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Queue</th>
              <th className="px-4 py-3 text-left">Assigned To</th>
              <th className="px-4 py-3 text-left">SLA Due</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 9 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-zinc-800 rounded w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : cases.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-zinc-500">No cases found</td>
              </tr>
            ) : cases.map((c) => (
              <tr key={c.id} className="hover:bg-zinc-900/50 transition-colors group">
                <td className="px-4 py-3">
                  <Link href={`/service/cases/${c.id}`} className="flex items-center gap-1.5">
                    {c.channel && (
                      <span className="text-zinc-500">{CHANNEL_ICONS[c.channel] ?? <Users className="w-3 h-3" />}</span>
                    )}
                    <span className="text-xs font-mono text-zinc-400 group-hover:text-indigo-300 transition-colors">{c.caseNumber.slice(-8)}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 max-w-[240px]">
                  <Link href={`/service/cases/${c.id}`} className="text-sm text-zinc-200 group-hover:text-indigo-300 transition-colors truncate block">{c.subject}</Link>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-zinc-300">{c.customerName ?? '—'}</div>
                  {c.customerEmail && <div className="text-xs text-zinc-500">{c.customerEmail}</div>}
                </td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs px-2 py-0.5 rounded border font-medium', PRIORITY_COLORS[c.priority] ?? 'bg-zinc-700 text-zinc-400 border-zinc-600')}>
                    {c.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs px-2 py-0.5 rounded font-medium', STATUS_COLORS[c.status] ?? 'bg-zinc-700 text-zinc-400')}>
                    {STATUS_LABELS[c.status] ?? c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400">{c.queue?.name ?? '—'}</td>
                <td className="px-4 py-3 text-sm text-zinc-400">{c.assignedTo ?? '—'}</td>
                <td className="px-4 py-3">
                  {c.slaDueAt ? (
                    <div className={cn('text-xs', c.slaBreached ? 'text-red-400 font-medium' : 'text-zinc-400')}>
                      {c.slaBreached && <AlertCircle className="w-3 h-3 inline mr-1" />}
                      {formatDate(c.slaDueAt)}
                    </div>
                  ) : <span className="text-zinc-600">—</span>}
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">{formatDate(c.createdAt)}</td>
                <td className="px-4 py-3">
                  <Link href={`/service/cases/${c.id}`} className="text-indigo-400 hover:text-indigo-300">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Case Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h2 className="text-base font-semibold">New Service Case</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Subject *</label>
                <input
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                  placeholder="Brief description of the issue"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 resize-none"
                  placeholder="Detailed description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Customer Name</label>
                  <input
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Customer Email</label>
                  <input
                    type="email"
                    value={form.customerEmail}
                    onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Channel</label>
                  <select
                    value={form.channel}
                    onChange={(e) => setForm({ ...form, channel: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
                  >
                    {CHANNELS.map((ch) => <option key={ch} value={ch}>{ch.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
                  >
                    {PRIORITIES.filter((p) => p !== 'all').map((p) => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Queue</label>
                  <select
                    value={form.queueId}
                    onChange={(e) => setForm({ ...form, queueId: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">No Queue</option>
                    {queues.map((q) => <option key={q.id} value={q.id}>{q.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors"
                >
                  Create Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
