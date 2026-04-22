'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

const OVERFLOW_ACTIONS = ['voicemail', 'disconnect', 'transfer']
const WAIT_MUSIC_OPTIONS = ['Default Hold Music', 'Custom Audio File', 'None']

export default function NewQueuePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [maxLength, setMaxLength] = useState(20)
  const [waitMusic, setWaitMusic] = useState('Default Hold Music')
  const [overflowQueue, setOverflowQueue] = useState('')
  const [timeoutSeconds, setTimeoutSeconds] = useState(300)
  const [overflowAction, setOverflowAction] = useState('voicemail')
  const [priorityRules, setPriorityRules] = useState('')

  const handleSave = async () => {
    if (!name.trim()) { setError('Queue name is required'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/contact-center/queues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, maxLength, waitMusic: waitMusic || null,
          overflowQueueId: overflowQueue || null,
          timeoutSeconds, overflowAction,
          priorityRules: priorityRules || null,
          isActive: true,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      router.push('/contact-center/queues')
    } catch (e) {
      setError(String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white">
      {/* TopBar */}
      <div className="bg-[#16213e] border-b border-slate-700/50 px-6 py-3 flex items-center gap-2 text-sm text-slate-400">
        <Link href="/contact-center" className="hover:text-white">Contact Center</Link>
        <span>/</span>
        <Link href="/contact-center/queues" className="hover:text-white">Call Queues</Link>
        <span>/</span>
        <span className="text-white font-medium">New Queue</span>
      </div>

      {/* Action Ribbon */}
      <div className="bg-[#16213e] border-b border-slate-700/50 px-6 py-2 flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs px-4 py-1.5 rounded font-medium"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <Link href="/contact-center/queues">
          <button className="text-xs px-3 py-1.5 rounded border border-slate-600 text-slate-300 hover:bg-slate-700">
            Discard
          </button>
        </Link>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded text-sm">{error}</div>
      )}

      <div className="p-6 max-w-3xl space-y-6">
        {/* Queue Configuration */}
        <div className="bg-[#16213e] rounded-lg border border-slate-700/50">
          <div className="px-5 py-3 border-b border-slate-700/50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <h3 className="font-semibold text-sm text-white">Queue Configuration</h3>
          </div>
          <div className="p-5 grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Queue Name <span className="text-red-400">*</span></label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. Tier 1 Support"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Max Queue Length</label>
              <input
                type="number"
                value={maxLength}
                onChange={e => setMaxLength(Number(e.target.value))}
                className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                min={1}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Timeout (seconds)</label>
              <input
                type="number"
                value={timeoutSeconds}
                onChange={e => setTimeoutSeconds(Number(e.target.value))}
                className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                min={0}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Wait Music</label>
              <select
                value={waitMusic}
                onChange={e => setWaitMusic(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {WAIT_MUSIC_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Overflow Action</label>
              <select
                value={overflowAction}
                onChange={e => setOverflowAction(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {OVERFLOW_ACTIONS.map(a => <option key={a} value={a} className="capitalize">{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Overflow Queue ID</label>
              <input
                value={overflowQueue}
                onChange={e => setOverflowQueue(e.target.value)}
                className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="Optional — queue ID to overflow to"
              />
            </div>
          </div>
        </div>

        {/* Priority Rules */}
        <div className="bg-[#16213e] rounded-lg border border-slate-700/50">
          <div className="px-5 py-3 border-b border-slate-700/50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            <h3 className="font-semibold text-sm text-white">Priority Rules</h3>
          </div>
          <div className="p-5">
            <textarea
              value={priorityRules}
              onChange={e => setPriorityRules(e.target.value)}
              rows={4}
              className="w-full bg-[#0f0f1a] border border-slate-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none font-mono"
              placeholder='e.g. {"vip": 10, "standard": 1, "escalated": 5}'
            />
            <p className="text-xs text-slate-500 mt-2">Enter priority rules as JSON. Higher numbers = higher priority.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
