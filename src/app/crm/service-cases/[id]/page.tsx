'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, MessageSquare, Phone, Mail, Globe, Users } from 'lucide-react'
import Link from 'next/link'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
}

interface Communication {
  id: string
  channel: string
  direction: string
  subject: string | null
  content: string | null
  status: string
  createdAt: string
}

interface ServiceCase {
  id: string
  caseNumber: string
  title: string
  description: string | null
  status: string
  priority: string
  assignedTo: string | null
  resolution: string | null
  resolvedAt: string | null
  closedAt: string | null
  createdAt: string
  updatedAt: string
  customer: Customer
  communications: Communication[]
}

const PRIORITY_BADGE: Record<string, string> = {
  urgent: 'bg-red-500/15 text-red-400 border border-red-500/30',
  high:   'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  normal: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  low:    'bg-zinc-500/15 text-zinc-400 border border-zinc-500/30',
}

const STATUS_BADGE: Record<string, string> = {
  open:        'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  in_progress: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  resolved:    'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  closed:      'bg-zinc-500/15 text-zinc-400 border border-zinc-500/30',
}

const CHANNEL_ICON: Record<string, React.ReactNode> = {
  phone:     <Phone className="w-3 h-3" />,
  email:     <Mail className="w-3 h-3" />,
  chat:      <MessageSquare className="w-3 h-3" />,
  in_person: <Users className="w-3 h-3" />,
}

const CHANNEL_BADGE: Record<string, string> = {
  phone:     'bg-violet-500/15 text-violet-400',
  email:     'bg-blue-500/15 text-blue-400',
  chat:      'bg-emerald-500/15 text-emerald-400',
  in_person: 'bg-amber-500/15 text-amber-400',
}

function formatDt(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

export default function ServiceCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router  = useRouter()

  const [caseData, setCaseData]   = useState<ServiceCase | null>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)

  // Status update form
  const [newStatus, setNewStatus]         = useState('')
  const [resolution, setResolution]       = useState('')
  const [statusSaving, setStatusSaving]   = useState(false)
  const [statusError, setStatusError]     = useState<string | null>(null)
  const [statusSuccess, setStatusSuccess] = useState(false)

  // Add communication form
  const [commChannel, setCommChannel]       = useState('phone')
  const [commDirection, setCommDirection]   = useState('inbound')
  const [commContent, setCommContent]       = useState('')
  const [commSaving, setCommSaving]         = useState(false)
  const [commError, setCommError]           = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/crm/service-cases/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found')
        return r.json() as Promise<ServiceCase>
      })
      .then(d => {
        setCaseData(d)
        setNewStatus(d.status)
        setResolution(d.resolution ?? '')
      })
      .catch(() => setError('Failed to load case'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleStatusUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!caseData) return
    setStatusSaving(true)
    setStatusError(null)
    setStatusSuccess(false)

    try {
      const payload: Record<string, unknown> = { status: newStatus, resolution }
      if (newStatus === 'resolved' && !caseData.resolvedAt) {
        payload.resolvedAt = new Date().toISOString()
      }

      const res = await fetch(`/api/crm/service-cases/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const d = await res.json() as { error?: string }
        setStatusError(d.error ?? 'Failed to update')
        return
      }

      const updated = await res.json() as ServiceCase
      setCaseData(updated)
      setStatusSuccess(true)
      setTimeout(() => setStatusSuccess(false), 2500)
    } catch {
      setStatusError('Network error')
    } finally {
      setStatusSaving(false)
    }
  }

  async function handleAddComm(e: React.FormEvent) {
    e.preventDefault()
    if (!caseData) return
    if (!commContent.trim()) { setCommError('Content is required'); return }
    setCommSaving(true)
    setCommError(null)

    try {
      const res = await fetch('/api/crm/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: caseData.customer.id,
          caseId: id,
          channel: commChannel,
          direction: commDirection,
          content: commContent.trim(),
        }),
      })

      if (!res.ok) {
        const d = await res.json() as { error?: string }
        setCommError(d.error ?? 'Failed to add note')
        return
      }

      const comm = await res.json() as Communication
      setCaseData(prev =>
        prev ? { ...prev, communications: [...prev.communications, comm] } : prev
      )
      setCommContent('')
    } catch {
      setCommError('Network error')
    } finally {
      setCommSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <TopBar title="Service Case" />
        <main className="flex-1 p-6 bg-[#0f0f1a] min-h-[100dvh] flex items-center justify-center">
          <p className="text-zinc-500 text-[13px]">Loading…</p>
        </main>
      </>
    )
  }

  if (error || !caseData) {
    return (
      <>
        <TopBar title="Service Case" />
        <main className="flex-1 p-6 bg-[#0f0f1a] min-h-[100dvh] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 text-[13px] mb-3">{error ?? 'Case not found'}</p>
            <button
              onClick={() => router.push('/crm/service-cases')}
              className="text-[13px] text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Back to cases
            </button>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <TopBar title={`Case ${caseData.caseNumber}`} />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-4xl mx-auto space-y-5">

          {/* Back link */}
          <Link
            href="/crm/service-cases"
            className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />Back to Service Cases
          </Link>

          {/* Case header */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="font-mono text-[11px] text-zinc-500 mb-1">{caseData.caseNumber}</p>
                <h1 className="text-lg font-semibold text-zinc-100">{caseData.title}</h1>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-medium capitalize ${PRIORITY_BADGE[caseData.priority] ?? 'bg-zinc-700 text-zinc-400'}`}>
                  {caseData.priority}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-medium capitalize ${STATUS_BADGE[caseData.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                  {caseData.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-zinc-800/60">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Customer</p>
                <Link href={`/customers/${caseData.customer.id}`} className="text-blue-400 hover:text-blue-300 text-[13px] transition-colors">
                  {caseData.customer.firstName} {caseData.customer.lastName}
                </Link>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Assigned To</p>
                <p className="text-[13px] text-zinc-200">{caseData.assignedTo ?? <span className="text-zinc-600">Unassigned</span>}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Opened</p>
                <p className="text-[13px] text-zinc-400">{formatDt(caseData.createdAt)}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">
                  {caseData.resolvedAt ? 'Resolved' : 'Last Updated'}
                </p>
                <p className="text-[13px] text-zinc-400">
                  {caseData.resolvedAt ? formatDt(caseData.resolvedAt) : formatDt(caseData.updatedAt)}
                </p>
              </div>
            </div>

            {/* Description */}
            {caseData.description && (
              <div className="mt-4 pt-4 border-t border-zinc-800/60">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Description</p>
                <p className="text-[13px] text-zinc-300 whitespace-pre-wrap">{caseData.description}</p>
              </div>
            )}
          </div>

          {/* Status update */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-4">Update Status</h2>
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                    className="w-full px-3 h-9 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
                  Resolution Notes
                </label>
                <textarea
                  value={resolution}
                  onChange={e => setResolution(e.target.value)}
                  rows={3}
                  placeholder="How was this resolved?"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
              {statusError && <p className="text-red-400 text-[12px]">{statusError}</p>}
              {statusSuccess && <p className="text-emerald-400 text-[12px]">Status updated.</p>}
              <button
                type="submit"
                disabled={statusSaving}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[13px] h-8 px-4 rounded transition-colors"
              >
                {statusSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Communications thread */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-4">
              Communications ({caseData.communications.length})
            </h2>

            {caseData.communications.length === 0 ? (
              <p className="text-[13px] text-zinc-600 mb-5">No communications yet. Add the first note below.</p>
            ) : (
              <div className="space-y-3 mb-5">
                {caseData.communications.map(comm => (
                  <div key={comm.id} className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${CHANNEL_BADGE[comm.channel] ?? 'bg-zinc-700 text-zinc-400'}`}>
                        {CHANNEL_ICON[comm.channel] ?? <Globe className="w-3 h-3" />}
                        {comm.channel.replace('_', ' ')}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${comm.direction === 'inbound' ? 'bg-blue-500/10 text-blue-400' : 'bg-violet-500/10 text-violet-400'}`}>
                        {comm.direction}
                      </span>
                      <span className="ml-auto text-[11px] text-zinc-600">{formatDt(comm.createdAt)}</span>
                    </div>
                    {comm.subject && (
                      <p className="text-[12px] font-medium text-zinc-300 mb-1">{comm.subject}</p>
                    )}
                    <p className="text-[13px] text-zinc-400 whitespace-pre-wrap">{comm.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add note form */}
            <div className="pt-4 border-t border-zinc-800/60">
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Add Note</h3>
              <form onSubmit={handleAddComm} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-500 block mb-1">Channel</label>
                    <select
                      value={commChannel}
                      onChange={e => setCommChannel(e.target.value)}
                      className="w-full px-3 h-8 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500"
                    >
                      <option value="phone">Phone</option>
                      <option value="email">Email</option>
                      <option value="chat">Chat</option>
                      <option value="in_person">In Person</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 block mb-1">Direction</label>
                    <select
                      value={commDirection}
                      onChange={e => setCommDirection(e.target.value)}
                      className="w-full px-3 h-8 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500"
                    >
                      <option value="inbound">Inbound</option>
                      <option value="outbound">Outbound</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 block mb-1">Content *</label>
                  <textarea
                    value={commContent}
                    onChange={e => setCommContent(e.target.value)}
                    rows={3}
                    placeholder="Note content…"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
                {commError && <p className="text-red-400 text-[12px]">{commError}</p>}
                <button
                  type="submit"
                  disabled={commSaving}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[13px] h-8 px-4 rounded transition-colors"
                >
                  {commSaving ? 'Adding…' : 'Add Note'}
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
