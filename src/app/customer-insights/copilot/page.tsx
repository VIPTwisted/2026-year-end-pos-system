'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Bot, Send, Loader2, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'ai'
  content: string
  time: string
}

const SUGGESTED_QUERIES = [
  'Top churning segments',
  'CLV by tier',
  'Best performing segments',
  'Profile overlap analysis',
]

function formatAiText(text: string) {
  // Bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-zinc-100 font-semibold">{part.slice(2, -2)}</strong>
    }
    return <span key={i}>{part}</span>
  })
}

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  const loadHistory = useCallback(() => {
    fetch('/api/customer-insights/copilot')
      .then(r => r.json())
      .then(sessions => {
        if (Array.isArray(sessions) && sessions.length > 0) {
          const msgs: Message[] = []
          const reversed = [...sessions].reverse()
          reversed.forEach(s => {
            msgs.push({ role: 'user', content: s.userQuery, time: new Date(s.createdAt).toLocaleTimeString() })
            msgs.push({ role: 'ai', content: s.aiResponse, time: new Date(s.createdAt).toLocaleTimeString() })
          })
          setMessages(msgs)
        }
        setInitialLoading(false)
      })
  }, [])

  useEffect(() => { loadHistory() }, [loadHistory])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function sendMessage(query: string) {
    if (!query.trim() || loading) return
    const userMsg: Message = { role: 'user', content: query, time: new Date().toLocaleTimeString() }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)

    const res = await fetch('/api/customer-insights/copilot', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }),
    })
    const data = await res.json()
    const aiMsg: Message = { role: 'ai', content: data.aiResponse ?? 'Unable to generate a response.', time: new Date().toLocaleTimeString() }
    setMessages(m => [...m, aiMsg])
    setLoading(false)
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-4 flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h1 className="text-base font-bold">AI Copilot</h1>
          <div className="text-xs text-zinc-400">Ask questions about your customer data in natural language</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-zinc-400">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {initialLoading ? (
          <div className="flex items-center justify-center py-20 text-zinc-500 text-sm">Loading session history...</div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Bot className="w-8 h-8 text-violet-400" />
            </div>
            <div className="text-center">
              <div className="text-zinc-200 font-semibold">Start a conversation</div>
              <div className="text-zinc-500 text-sm mt-1">Ask anything about your customer segments, CLV, churn, or profile data</div>
            </div>

            {/* Suggested Queries */}
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {SUGGESTED_QUERIES.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-sm px-3 py-1.5 rounded-full transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                <div className={cn('w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1',
                  msg.role === 'user' ? 'bg-blue-600' : 'bg-violet-500/20 border border-violet-500/30'
                )}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-violet-400" />}
                </div>
                <div className={cn('max-w-[75%] space-y-1', msg.role === 'user' ? 'items-end' : 'items-start')}>
                  <div className={cn('rounded-2xl px-4 py-3 text-sm leading-relaxed',
                    msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-zinc-800 text-zinc-200 rounded-tl-sm'
                  )}>
                    {msg.role === 'ai' ? formatAiText(msg.content) : msg.content}
                  </div>
                  <div className={cn('text-xs text-zinc-500', msg.role === 'user' ? 'text-right' : 'text-left')}>{msg.time}</div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-violet-400" />
                </div>
                <div className="bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3">
                  <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                </div>
              </div>
            )}

            {/* Suggested chips after initial messages */}
            {messages.length > 0 && messages.length <= 4 && !loading && (
              <div className="flex flex-wrap gap-2 pl-10">
                {SUGGESTED_QUERIES.map(q => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs px-3 py-1 rounded-full transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-800 px-6 py-4 flex-shrink-0">
        <div className="flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
            placeholder="Ask about customer segments, CLV, churn risk..."
            disabled={loading}
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-violet-500 disabled:opacity-50 transition-colors"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl transition-colors flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
