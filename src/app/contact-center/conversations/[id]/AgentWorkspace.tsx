'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Send, ArrowRightLeft, CheckCircle, User, Phone, Mail,
  MessageSquare, Clock, Star, ThumbsUp, ThumbsDown, Minus,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Message = {
  id: string
  sender: string
  senderName: string | null
  content: string
  contentType: string
  isRead: boolean
  sentiment: string | null
  createdAt: string | Date
}

type Transfer = {
  id: string
  fromAgentName: string | null
  toAgentName: string | null
  toQueueName: string | null
  reason: string | null
  transferredAt: string | Date
}

type Conversation = {
  id: string
  conversationNo: string
  status: string
  direction: string
  agentName: string | null
  assignedAgentId: string | null
  queueId: string | null
  subject: string | null
  channel_ref: string | null
  waitTimeSeconds: number
  handleTimeSeconds: number
  sentiment: string | null
  sentimentScore: number | null
  csat: number | null
  wrapUpCode: string | null
  notes: string | null
  linkedCaseId: string | null
  startedAt: string | Date
  acceptedAt: string | Date | null
  closedAt: string | Date | null
  channel: { id: string; name: string; type: string }
  customer: { id: string; firstName: string; lastName: string; email: string | null; phone: string | null } | null
  messages: Message[]
  transfers: Transfer[]
}

type WrapUpCode = { id: string; code: string; name: string; category: string | null; requiresNote: boolean }

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  waiting: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  wrap_up: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  closed: 'bg-zinc-600/20 text-zinc-500 border-zinc-600/30',
  abandoned: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const CHANNEL_COLORS: Record<string, string> = {
  voice: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  live_chat: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  email: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  whatsapp: 'bg-green-500/20 text-green-400 border-green-500/30',
  facebook: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  sms: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  custom: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
}

function fmtSecs(s: number) {
  const m = Math.floor(s / 60); const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

export default function AgentWorkspace({ conversation: initConv, wrapUpCodes }: { conversation: Conversation; wrapUpCodes: WrapUpCode[] }) {
  const router = useRouter()
  const [conv, setConv] = useState(initConv)
  const [messages, setMessages] = useState<Message[]>(initConv.messages)
  const [msgContent, setMsgContent] = useState('')
  const [msgSender, setMsgSender] = useState<'agent' | 'system'>('agent')
  const [sendingMsg, setSendingMsg] = useState(false)

  const [showTransfer, setShowTransfer] = useState(false)
  const [transferTo, setTransferTo] = useState({ toAgentName: '', toQueueName: '', reason: '' })
  const [transferring, setTransferring] = useState(false)

  const [showClose, setShowClose] = useState(false)
  const [closeForm, setCloseForm] = useState({ wrapUpCode: '', csat: 0, notes: '' })
  const [closing, setClosing] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!msgContent.trim()) return
    setSendingMsg(true)
    const res = await fetch(`/api/contact-center/conversations/${conv.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: msgSender, content: msgContent, senderName: msgSender === 'agent' ? conv.agentName : 'System' }),
    })
    if (res.ok) {
      const msg = await res.json()
      setMessages(m => [...m, msg])
      setMsgContent('')
    }
    setSendingMsg(false)
  }

  async function doTransfer() {
    setTransferring(true)
    const res = await fetch(`/api/contact-center/conversations/${conv.id}/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transferTo),
    })
    if (res.ok) {
      setShowTransfer(false)
      router.refresh()
    }
    setTransferring(false)
  }

  async function doClose() {
    setClosing(true)
    const res = await fetch(`/api/contact-center/conversations/${conv.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'closed', ...closeForm }),
    })
    if (res.ok) {
      const updated = await res.json()
      setConv(updated)
      setShowClose(false)
    }
    setClosing(false)
  }

  async function activateConv() {
    const res = await fetch(`/api/contact-center/conversations/${conv.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' }),
    })
    if (res.ok) setConv(await res.json())
  }

  const isClosedOrAbandoned = conv.status === 'closed' || conv.status === 'abandoned'

  return (
    <div className="flex h-[calc(100dvh-0px)] bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Left Panel — Conversation Info */}
      <div className="w-64 border-r border-zinc-800 flex flex-col bg-zinc-900 shrink-0">
        <div className="p-4 border-b border-zinc-800">
          <Link href="/contact-center/conversations" className="text-xs text-zinc-500 hover:text-zinc-400 mb-2 block">← Conversations</Link>
          <div className="font-mono text-sm font-bold text-zinc-100">{conv.conversationNo}</div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={cn('px-2 py-0.5 rounded text-xs font-medium border', CHANNEL_COLORS[conv.channel.type] ?? CHANNEL_COLORS.custom)}>
              {conv.channel.type.replace('_', ' ')}
            </span>
            <span className={cn('px-2 py-0.5 rounded text-xs font-medium border', STATUS_COLORS[conv.status] ?? STATUS_COLORS.open)}>
              {conv.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Customer */}
          {conv.customer ? (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">Customer</div>
              <Link href={`/customers/${conv.customer.id}`} className="block hover:bg-zinc-800 rounded-lg p-2 -mx-2 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">
                    {conv.customer.firstName[0]}{conv.customer.lastName[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-zinc-200">{conv.customer.firstName} {conv.customer.lastName}</div>
                    {conv.customer.email && <div className="text-xs text-zinc-500">{conv.customer.email}</div>}
                    {conv.customer.phone && <div className="text-xs text-zinc-500">{conv.customer.phone}</div>}
                  </div>
                </div>
              </Link>
            </div>
          ) : (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">Customer</div>
              <div className="text-sm text-zinc-600">No customer linked</div>
            </div>
          )}

          {/* Details */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">Details</div>
            <div className="space-y-1 text-xs text-zinc-400">
              <div className="flex justify-between"><span className="text-zinc-600">Agent</span><span>{conv.agentName ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-zinc-600">Direction</span><span className="capitalize">{conv.direction}</span></div>
              <div className="flex justify-between"><span className="text-zinc-600">Wait</span><span className="tabular-nums">{fmtSecs(conv.waitTimeSeconds)}</span></div>
              <div className="flex justify-between"><span className="text-zinc-600">Handle</span><span className="tabular-nums">{fmtSecs(conv.handleTimeSeconds)}</span></div>
              {conv.subject && <div className="flex justify-between"><span className="text-zinc-600">Subject</span><span className="truncate ml-2">{conv.subject}</span></div>}
              {conv.queueId && <div className="flex justify-between"><span className="text-zinc-600">Queue</span><span className="truncate ml-2">{conv.queueId}</span></div>}
              {conv.linkedCaseId && (
                <div className="flex justify-between">
                  <span className="text-zinc-600">Case</span>
                  <span className="text-blue-400">{conv.linkedCaseId}</span>
                </div>
              )}
              <div className="flex justify-between"><span className="text-zinc-600">Started</span><span>{new Date(conv.startedAt).toLocaleTimeString()}</span></div>
            </div>
          </div>

          {/* Notes */}
          {conv.notes && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">Notes</div>
              <p className="text-xs text-zinc-400 whitespace-pre-wrap">{conv.notes}</p>
            </div>
          )}

          {/* CSAT */}
          {conv.csat && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">CSAT</div>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} className={cn('w-4 h-4', n <= conv.csat! ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600')} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center Panel — Messages */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
          <div className="text-sm font-medium text-zinc-300">{conv.subject ?? 'Conversation'}</div>
          {conv.status === 'open' && (
            <button
              onClick={activateConv}
              className="px-3 py-1 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors"
            >
              Accept
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-zinc-600 text-sm mt-8">No messages yet</div>
          )}
          {messages.map(msg => {
            if (msg.contentType === 'system_event' || msg.sender === 'system') {
              return (
                <div key={msg.id} className="flex justify-center">
                  <span className="text-[11px] text-zinc-600 bg-zinc-800/50 px-3 py-1 rounded-full">{msg.content}</span>
                </div>
              )
            }
            const isAgent = msg.sender === 'agent'
            const isBot = msg.sender === 'bot'
            return (
              <div key={msg.id} className={cn('flex gap-2 max-w-[75%]', isAgent ? 'ml-auto flex-row-reverse' : '')}>
                <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5',
                  isAgent ? 'bg-blue-600' : isBot ? 'bg-violet-700' : 'bg-zinc-700')}>
                  {isAgent ? 'A' : isBot ? 'B' : 'C'}
                </div>
                <div>
                  <div className={cn('text-[10px] mb-0.5 text-zinc-600', isAgent ? 'text-right' : '')}>
                    {msg.senderName ?? msg.sender} · {new Date(msg.createdAt).toLocaleTimeString()}
                  </div>
                  <div className={cn('px-3 py-2 rounded-2xl text-sm leading-relaxed',
                    isAgent
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : isBot
                      ? 'bg-violet-900/60 text-violet-200 border border-violet-700/40 rounded-tl-sm'
                      : 'bg-zinc-800 text-zinc-200 rounded-tl-sm')}>
                    {msg.content}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Message Input */}
        {!isClosedOrAbandoned && (
          <form onSubmit={sendMessage} className="p-4 border-t border-zinc-800 bg-zinc-900">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <div className="flex gap-2 mb-2">
                  {(['agent', 'system'] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setMsgSender(s)}
                      className={cn('px-2 py-0.5 text-xs rounded font-medium transition-colors capitalize',
                        msgSender === s ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700')}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <textarea
                  value={msgContent}
                  onChange={e => setMsgContent(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e as unknown as React.FormEvent) } }}
                  placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
                  rows={2}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={sendingMsg || !msgContent.trim()}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Right Panel — Actions */}
      <div className="w-64 border-l border-zinc-800 flex flex-col bg-zinc-900 shrink-0 overflow-y-auto">
        <div className="p-4 border-b border-zinc-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Quick Actions</div>
        </div>
        <div className="p-4 space-y-3">
          {/* Sentiment */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-2">Sentiment</div>
            <div className="flex gap-2">
              <div className={cn('flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs font-medium',
                conv.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-600')}>
                <ThumbsUp className="w-3 h-3" /> Pos
              </div>
              <div className={cn('flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs font-medium',
                conv.sentiment === 'neutral' || !conv.sentiment ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-800 text-zinc-600')}>
                <Minus className="w-3 h-3" /> Neu
              </div>
              <div className={cn('flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs font-medium',
                conv.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-zinc-600')}>
                <ThumbsDown className="w-3 h-3" /> Neg
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!isClosedOrAbandoned && (
            <>
              <button
                onClick={() => setShowTransfer(true)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors"
              >
                <ArrowRightLeft className="w-4 h-4 text-zinc-500" />
                Transfer
              </button>
              <button
                onClick={() => setShowClose(true)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors"
              >
                <CheckCircle className="w-4 h-4 text-zinc-500" />
                Close Conversation
              </button>
            </>
          )}

          {/* Transfer History */}
          {conv.transfers && conv.transfers.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-2">Transfer History</div>
              <div className="space-y-2">
                {conv.transfers.map(t => (
                  <div key={t.id} className="text-xs text-zinc-500 bg-zinc-800 rounded-lg p-2">
                    <div className="text-zinc-400">
                      {t.fromAgentName ?? 'Queue'} → {t.toAgentName ?? t.toQueueName ?? '?'}
                    </div>
                    {t.reason && <div className="text-zinc-600 mt-0.5">{t.reason}</div>}
                    <div className="text-zinc-700 mt-0.5">{new Date(t.transferredAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransfer && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-zinc-100">Transfer Conversation</h2>
              <button onClick={() => setShowTransfer(false)} className="text-zinc-600 hover:text-zinc-400"><XCircle className="w-5 h-5" /></button>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">To Agent</label>
              <input
                type="text"
                placeholder="Agent name..."
                value={transferTo.toAgentName}
                onChange={e => setTransferTo(t => ({ ...t, toAgentName: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Or To Queue</label>
              <input
                type="text"
                placeholder="Queue name..."
                value={transferTo.toQueueName}
                onChange={e => setTransferTo(t => ({ ...t, toQueueName: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Reason</label>
              <input
                type="text"
                placeholder="Transfer reason..."
                value={transferTo.reason}
                onChange={e => setTransferTo(t => ({ ...t, reason: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={doTransfer}
                disabled={transferring}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {transferring ? 'Transferring...' : 'Transfer'}
              </button>
              <button
                onClick={() => setShowTransfer(false)}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Modal */}
      {showClose && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-zinc-100">Close Conversation</h2>
              <button onClick={() => setShowClose(false)} className="text-zinc-600 hover:text-zinc-400"><XCircle className="w-5 h-5" /></button>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Wrap-Up Code</label>
              <select
                value={closeForm.wrapUpCode}
                onChange={e => setCloseForm(f => ({ ...f, wrapUpCode: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select code...</option>
                {wrapUpCodes.map(c => (
                  <option key={c.id} value={c.code}>{c.code} — {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-2">CSAT Rating</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCloseForm(f => ({ ...f, csat: n }))}
                    className={cn('flex-1 py-1.5 rounded text-sm font-medium transition-colors', closeForm.csat === n ? 'bg-yellow-500 text-zinc-900' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700')}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Notes</label>
              <textarea
                value={closeForm.notes}
                onChange={e => setCloseForm(f => ({ ...f, notes: e.target.value }))}
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={doClose}
                disabled={closing}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {closing ? 'Closing...' : 'Close Conversation'}
              </button>
              <button
                onClick={() => setShowClose(false)}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
