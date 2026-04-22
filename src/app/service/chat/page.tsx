'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { MessageCircle, Plus, Send } from 'lucide-react'

type ChatMessage = { id: string; senderType: string; senderName: string | null; body: string; createdAt: string }
type ChatSession = {
  id: string; sessionNumber: string; customerName: string | null; customerEmail: string | null
  agentName: string | null; status: string; waitTime: number; createdAt: string; messages: ChatMessage[]
}

const STATUS_TABS = ['all', 'waiting', 'active', 'resolved']
const STATUS_COLOR: Record<string, string> = {
  waiting:  'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  active:   'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  resolved: 'bg-zinc-700 text-zinc-400',
  abandoned:'bg-red-500/20 text-red-400 border border-red-500/30',
}

function waitLabel(secs: number, createdAt: string) {
  const elapsed = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000)
  const w = secs || elapsed
  if (w < 60) return `${w}s`
  if (w < 3600) return `${Math.floor(w / 60)}m`
  return `${Math.floor(w / 3600)}h`
}

export default function ChatConsolePage() {
  const [sessions, setSessions]   = useState<ChatSession[]>([])
  const [statusTab, setStatusTab] = useState('all')
  const [selected, setSelected]   = useState<ChatSession | null>(null)
  const [msgBody, setMsgBody]     = useState('')
  const [showNew, setShowNew]     = useState(false)
  const [newForm, setNewForm]     = useState({ customerName: '', customerEmail: '' })
  const bottomRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    const params = new URLSearchParams()
    if (statusTab !== 'all') params.set('status', statusTab)
    const res = await fetch(`/api/service/chat?${params}`)
    const data: ChatSession[] = await res.json()
    data.sort((a, b) => {
      if (a.status === 'waiting' && b.status !== 'waiting') return -1
      if (b.status === 'waiting' && a.status !== 'waiting') return 1
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
    setSessions(data)
    if (selected) {
      const refreshed = data.find(s => s.id === selected.id)
      if (refreshed) setSelected(refreshed)
    }
  }, [statusTab, selected?.id]) // eslint-disable-line

  useEffect(() => { load() }, [load])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [selected?.messages.length])
  useEffect(() => { const t = setInterval(load, 5000); return () => clearInterval(t) }, [load])

  async function sendMessage() {
    if (!msgBody.trim() || !selected) return
    await fetch(`/api/service/chat/${selected.id}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ senderType: 'agent', senderName: 'Agent', body: msgBody }) })
    setMsgBody(''); load()
  }

  async function createSession(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/service/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newForm) })
    const session: ChatSession = await res.json()
    setShowNew(false); setNewForm({ customerName: '', customerEmail: '' })
    await load(); setSelected(session)
  }

  return (
    <>
      <TopBar title="Chat Console" />
      <main className="flex-1 overflow-hidden flex">
        <div className="w-72 border-r border-zinc-800 flex flex-col shrink-0">
          <div className="p-3 border-b border-zinc-800 space-y-2">
            <div className="flex gap-1">
              {STATUS_TABS.map(t => <button key={t} onClick={() => setStatusTab(t)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${statusTab === t ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>{t}</button>)}
            </div>
            <button onClick={() => setShowNew(true)} className="w-full flex items-center justify-center gap-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg transition-colors"><Plus className="w-3.5 h-3.5" /> New Session</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-zinc-600"><MessageCircle className="w-8 h-8 mb-2 opacity-30" /><p className="text-sm">No sessions</p></div>
            ) : sessions.map(s => (
              <button key={s.id} onClick={() => setSelected(s)} className={`w-full text-left px-4 py-3 border-b border-zinc-800/60 hover:bg-zinc-800/40 transition-colors ${selected?.id === s.id ? 'bg-zinc-800/60 border-l-2 border-l-blue-500' : ''}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-zinc-200 truncate">{s.customerName ?? 'Anonymous'}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${STATUS_COLOR[s.status] ?? 'bg-zinc-700 text-zinc-400'}`}>{s.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-mono">{s.sessionNumber}</span>
                  <span className="text-xs text-zinc-500">wait {waitLabel(s.waitTime, s.createdAt)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-600"><MessageCircle className="w-12 h-12 mb-3 opacity-20" /><p className="text-base">Select a session to start chatting</p></div>
          ) : (
            <>
              <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-200">{selected.customerName ?? 'Anonymous'}</p>
                  {selected.customerEmail && <p className="text-xs text-zinc-500">{selected.customerEmail}</p>}
                </div>
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[selected.status] ?? ''}`}>{selected.status}</span>
                <span className="ml-auto font-mono text-xs text-zinc-600">{selected.sessionNumber}</span>
                {selected.status !== 'resolved' && (
                  <button onClick={async () => { await fetch(`/api/service/chat/${selected.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'resolved' }) }); load() }}
                    className="text-xs px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/40 text-emerald-400 rounded-lg transition-colors">Resolve</button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {selected.messages.length === 0 && <p className="text-center text-zinc-600 text-sm py-8">No messages yet</p>}
                {selected.messages.map(m => (
                  <div key={m.id} className={`flex ${m.senderType === 'agent' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${m.senderType === 'agent' ? 'bg-blue-600 text-white rounded-br-sm' : m.senderType === 'bot' ? 'bg-purple-600/20 text-purple-300 border border-purple-600/30 rounded-bl-sm' : 'bg-zinc-800 text-zinc-200 rounded-bl-sm'}`}>
                      {m.senderName && m.senderType !== 'agent' && <p className="text-xs opacity-60 mb-0.5">{m.senderName}</p>}
                      <p>{m.body}</p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              {selected.status !== 'resolved' && (
                <div className="border-t border-zinc-800 p-4 flex gap-3">
                  <input value={msgBody} onChange={e => setMsgBody(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }} placeholder="Type a message..."
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600" />
                  <button onClick={sendMessage} disabled={!msgBody.trim()} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm rounded-xl transition-colors"><Send className="w-4 h-4" /></button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {showNew && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-zinc-100 mb-4">New Chat Session</h3>
            <form onSubmit={createSession} className="space-y-3">
              <div><label className="block text-xs text-zinc-400 mb-1">Customer Name</label><input value={newForm.customerName} onChange={e => setNewForm(f => ({ ...f, customerName: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200" /></div>
              <div><label className="block text-xs text-zinc-400 mb-1">Customer Email</label><input type="email" value={newForm.customerEmail} onChange={e => setNewForm(f => ({ ...f, customerEmail: e.target.value }))} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
