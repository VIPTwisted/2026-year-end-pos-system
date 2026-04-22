'use client'
import { useEffect, useState } from 'react'
import { FileText, Plus, Pencil, Trash2, Check, X } from 'lucide-react'

type Script = {
  id: string
  name: string
  trigger: string
  content: string
  isActive: boolean
  createdAt: string
}

const TRIGGERS = ['greeting', 'objection', 'upsell', 'closing', 'hold', 'return']

const TRIGGER_LABELS: Record<string, string> = {
  greeting: 'Greeting',
  objection: 'Objection Handling',
  upsell: 'Upsell',
  closing: 'Closing',
  hold: 'Hold Explanation',
  return: 'Return Process',
}

const BLANK_FORM = { name: '', trigger: 'greeting', content: '' }

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ ...BLANK_FORM })
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', trigger: 'greeting', content: '' })
  const [creating, setCreating] = useState(false)

  const load = async () => {
    const res = await fetch('/api/call-center/scripts')
    const data = await res.json()
    setScripts(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function createScript() {
    if (!form.name || !form.content) return
    setCreating(true)
    await fetch('/api/call-center/scripts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, isActive: true }),
    })
    await load()
    setForm({ ...BLANK_FORM })
    setShowCreate(false)
    setCreating(false)
  }

  async function saveEdit(id: string) {
    await fetch(`/api/call-center/scripts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    await load()
    setEditId(null)
  }

  async function deleteScript(id: string) {
    if (!confirm('Delete this script?')) return
    await fetch(`/api/call-center/scripts/${id}`, { method: 'DELETE' })
    setScripts((prev) => prev.filter((s) => s.id !== id))
  }

  const byTrigger = TRIGGERS.reduce<Record<string, Script[]>>((acc, t) => {
    acc[t] = scripts.filter((s) => s.trigger === t)
    return acc
  }, {})

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-yellow-400" />
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Agent Scripts</h1>
            <p className="text-zinc-500 text-sm">Call scripts grouped by trigger type</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate((p) => !p)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Script
        </button>
      </div>

      {showCreate && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 space-y-3">
          <h2 className="font-semibold text-zinc-100 text-sm">New Script</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Script Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Opening Greeting"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Trigger</label>
              <select
                value={form.trigger}
                onChange={(e) => setForm((p) => ({ ...p, trigger: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none"
              >
                {TRIGGERS.map((t) => <option key={t} value={t}>{TRIGGER_LABELS[t]}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Script Content</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              rows={5}
              placeholder="Script text..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowCreate(false)} className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-4 py-2 rounded-lg text-sm">Cancel</button>
            <button onClick={createScript} disabled={!form.name || !form.content || creating} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm disabled:opacity-50">Save Script</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-zinc-600 py-8 text-center">Loading...</div>
      ) : (
        TRIGGERS.map((trigger) => {
          const triggerScripts = byTrigger[trigger] ?? []
          return (
            <div key={trigger} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-800/30">
                <h2 className="font-semibold text-zinc-100 text-sm">{TRIGGER_LABELS[trigger]}</h2>
                <p className="text-xs text-zinc-600 mt-0.5">{triggerScripts.length} script{triggerScripts.length !== 1 ? 's' : ''}</p>
              </div>
              {triggerScripts.length === 0 ? (
                <div className="px-5 py-4 text-xs text-zinc-700">No scripts for this trigger.</div>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {triggerScripts.map((script) => (
                    <div key={script.id} className="p-5">
                      {editId === script.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              value={editForm.name}
                              onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none"
                            />
                            <select
                              value={editForm.trigger}
                              onChange={(e) => setEditForm((p) => ({ ...p, trigger: e.target.value }))}
                              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none"
                            >
                              {TRIGGERS.map((t) => <option key={t} value={t}>{TRIGGER_LABELS[t]}</option>)}
                            </select>
                          </div>
                          <textarea
                            value={editForm.content}
                            onChange={(e) => setEditForm((p) => ({ ...p, content: e.target.value }))}
                            rows={4}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none resize-none"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => saveEdit(script.id)} className="text-green-400 hover:text-green-300 p-1">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditId(null)} className="text-zinc-500 hover:text-zinc-300 p-1">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-zinc-200 text-sm">{script.name}</h3>
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setEditId(script.id); setEditForm({ name: script.name, trigger: script.trigger, content: script.content }) }}
                                className="text-zinc-500 hover:text-zinc-300"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deleteScript(script.id)} className="text-zinc-600 hover:text-red-400">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">{script.content}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
