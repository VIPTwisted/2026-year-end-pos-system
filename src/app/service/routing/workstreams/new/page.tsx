'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, GitBranch, X } from 'lucide-react'

export const dynamic = 'force-dynamic'

const CHANNELS      = ['chat', 'email', 'voice', 'social']
const ROUTING_MODES = [
  { value: 'round_robin',  label: 'Round Robin' },
  { value: 'least_active', label: 'Least Active' },
  { value: 'skill_match',  label: 'Skill Match' },
  { value: 'priority',     label: 'Priority' },
]

export default function NewWorkstreamPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name:           '',
    channel:        'chat',
    capacity:       5,
    routingMode:    'round_robin',
    sessionTimeout: 30,
    isActive:       true,
    queueId:        '',
  })
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')

  function addSkill() {
    const s = skillInput.trim()
    if (s && !skills.includes(s)) {
      setSkills([...skills, s])
      setSkillInput('')
    }
  }
  function removeSkill(s: string) { setSkills(skills.filter((x) => x !== s)) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/service/routing/workstreams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          skillsRequired: skills.join(',') || null,
          queueId: form.queueId || null,
        }),
      })
      if (res.ok) router.push('/service/routing/workstreams')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      <TopBar title="New Workstream" subtitle="Configure a new routing channel" />

      <div className="max-w-2xl mx-auto px-6 py-8">
        <Link href="/service/routing/workstreams" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Workstreams
        </Link>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <GitBranch className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold">Basic Configuration</h2>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Workstream Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Premium Chat Support"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Channel *</label>
                <select
                  value={form.channel}
                  onChange={(e) => setForm({ ...form, channel: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
                >
                  {CHANNELS.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Routing Mode *</label>
                <select
                  value={form.routingMode}
                  onChange={(e) => setForm({ ...form, routingMode: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
                >
                  {ROUTING_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-zinc-400">Capacity (max concurrent)</label>
                  <span className="text-xs text-indigo-400 font-mono">{form.capacity}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5">Session Timeout (minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={form.sessionTimeout}
                  onChange={(e) => setForm({ ...form, sessionTimeout: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Skills Required */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold">Skills Required</h2>
            <div className="flex gap-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="e.g. billing, technical, returns (press Enter)"
                className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm font-medium transition-colors"
              >
                Add
              </button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600/20 border border-indigo-500/30 rounded-full text-xs text-indigo-300">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)} className="hover:text-red-400 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Queue + Active */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold">Queue & Status</h2>
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">Queue ID (optional)</label>
              <input
                value={form.queueId}
                onChange={(e) => setForm({ ...form, queueId: e.target.value })}
                placeholder="Linked queue ID"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setForm({ ...form, isActive: !form.isActive })}
                className={`w-10 h-6 rounded-full transition-colors ${form.isActive ? 'bg-indigo-600' : 'bg-zinc-700'} relative`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
              <span className="text-sm text-zinc-300">{form.isActive ? 'Active' : 'Inactive'}</span>
            </label>
          </div>

          <div className="flex gap-3">
            <Link
              href="/service/routing/workstreams"
              className="flex-1 text-center py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? 'Creating...' : 'Create Workstream'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
