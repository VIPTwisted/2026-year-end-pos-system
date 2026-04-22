'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown, ChevronRight, Trash2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

type Intent = {
  id: string
  name: string
  keywords: string
  response: string
  action: string | null
  sortOrder: number
}

type Bot = {
  id: string
  name: string
  type: string
  channelType: string
  isActive: boolean
  handoffCondition: string
  greetingMessage: string | null
  escalationMessage: string | null
  intents: Intent[]
}

export default function BotDetailClient({ bot: initBot }: { bot: Bot }) {
  const router = useRouter()
  const [bot, setBot] = useState(initBot)
  const [intents, setIntents] = useState<Intent[]>(initBot.intents)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [toggling, setToggling] = useState(false)
  const [newIntent, setNewIntent] = useState({ name: '', keywords: '', response: '', action: '' })
  const [addingIntent, setAddingIntent] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function toggleActive() {
    setToggling(true)
    const res = await fetch(`/api/contact-center/bots/${bot.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !bot.isActive }),
    })
    if (res.ok) {
      const updated = await res.json()
      setBot(updated)
    }
    setToggling(false)
  }

  async function addIntent() {
    if (!newIntent.name || !newIntent.keywords) return
    setAddingIntent(true)
    const res = await fetch(`/api/contact-center/bots/${bot.id}/intents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newIntent, sortOrder: intents.length }),
    })
    if (res.ok) {
      const intent = await res.json()
      setIntents(i => [...i, intent])
      setNewIntent({ name: '', keywords: '', response: '', action: '' })
      setShowAdd(false)
    }
    setAddingIntent(false)
  }

  async function deleteIntent(intentId: string) {
    setDeletingId(intentId)
    const res = await fetch(`/api/contact-center/bots/${bot.id}/intents?intentId=${intentId}`, { method: 'DELETE' })
    if (res.ok) setIntents(i => i.filter(x => x.id !== intentId))
    setDeletingId(null)
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto min-h-[100dvh] bg-zinc-950 text-zinc-100">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/contact-center/bots" className="text-xs text-zinc-500 hover:text-zinc-400 block mb-1">← Bots</Link>
          <h1 className="text-xl font-bold text-zinc-100">{bot.name}</h1>
        </div>
        <button
          onClick={toggleActive}
          disabled={toggling}
          className={cn('px-4 py-2 text-sm font-medium rounded-lg transition-colors', bot.isActive
            ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white')}
        >
          {toggling ? '...' : bot.isActive ? 'Deactivate' : 'Activate'}
        </button>
      </div>

      {/* Bot Info */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">Type</div>
          <span className={cn('px-2 py-0.5 rounded text-xs font-medium', bot.type === 'ai_powered' ? 'bg-violet-500/20 text-violet-400' : 'bg-zinc-700/20 text-zinc-400')}>
            {bot.type.replace('_', ' ')}
          </span>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">Channel</div>
          <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded text-xs">{bot.channelType}</span>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">Handoff</div>
          <span className="text-zinc-400 text-xs">{bot.handoffCondition.replace(/_/g, ' ')}</span>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">Status</div>
          <span className={cn('px-2 py-0.5 rounded text-xs font-medium', bot.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700/20 text-zinc-500')}>
            {bot.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        {bot.greetingMessage && (
          <div className="col-span-2">
            <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">Greeting</div>
            <p className="text-zinc-400 text-xs bg-zinc-800/50 rounded p-2">{bot.greetingMessage}</p>
          </div>
        )}
        {bot.escalationMessage && (
          <div className="col-span-2">
            <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">Escalation</div>
            <p className="text-zinc-400 text-xs bg-zinc-800/50 rounded p-2">{bot.escalationMessage}</p>
          </div>
        )}
      </div>

      {/* Intents */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-zinc-100">Intents ({intents.length})</h2>
          <button
            onClick={() => setShowAdd(s => !s)}
            className="px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Intent
          </button>
        </div>

        {showAdd && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 mb-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Intent Name *</label>
                <input type="text" value={newIntent.name} onChange={e => setNewIntent(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Action</label>
                <select value={newIntent.action} onChange={e => setNewIntent(f => ({ ...f, action: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="">None</option>
                  <option value="handoff_to_agent">Handoff to Agent</option>
                  <option value="create_case">Create Case</option>
                  <option value="lookup_order">Lookup Order</option>
                  <option value="faq">FAQ</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-zinc-500 mb-1">Keywords (comma-separated) *</label>
                <input type="text" value={newIntent.keywords} onChange={e => setNewIntent(f => ({ ...f, keywords: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-zinc-500 mb-1">Response</label>
                <textarea value={newIntent.response} onChange={e => setNewIntent(f => ({ ...f, response: e.target.value }))}
                  rows={2}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-zinc-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={addIntent} disabled={addingIntent || !newIntent.name || !newIntent.keywords}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium rounded transition-colors">
                {addingIntent ? 'Adding...' : 'Add'}
              </button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {intents.length === 0 && (
            <div className="text-sm text-zinc-600 bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center">
              No intents — add one to start automating responses
            </div>
          )}
          {intents.map(intent => (
            <div key={intent.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(e => ({ ...e, [intent.id]: !e[intent.id] }))}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {expanded[intent.id] ? <ChevronDown className="w-4 h-4 text-zinc-600" /> : <ChevronRight className="w-4 h-4 text-zinc-600" />}
                  <span className="font-medium text-zinc-200 text-sm">{intent.name}</span>
                  {intent.action && (
                    <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-500 rounded text-[10px]">{intent.action.replace('_', ' ')}</span>
                  )}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); deleteIntent(intent.id) }}
                  disabled={deletingId === intent.id}
                  className="text-zinc-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </button>
              {expanded[intent.id] && (
                <div className="px-4 pb-4 space-y-2 border-t border-zinc-800/50 pt-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">Keywords</div>
                    <div className="flex flex-wrap gap-1">
                      {intent.keywords.split(',').map(kw => kw.trim()).filter(Boolean).map(kw => (
                        <span key={kw} className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded text-xs">{kw}</span>
                      ))}
                    </div>
                  </div>
                  {intent.response && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-zinc-600 mb-1">Response</div>
                      <p className="text-sm text-zinc-400 bg-zinc-800/50 rounded p-2">{intent.response}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
