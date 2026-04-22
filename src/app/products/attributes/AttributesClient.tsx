'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tag, Plus, ChevronDown, ChevronRight, X } from 'lucide-react'

interface AttributeValue { id: string; value: string }
interface AttributeWithUsage {
  id: string
  name: string
  values: AttributeValue[]
  usageCount: number
}

interface Props {
  initialAttributes: AttributeWithUsage[]
}

export function AttributesClient({ initialAttributes }: Props) {
  const router = useRouter()
  const [attributes, setAttributes] = useState<AttributeWithUsage[]>(initialAttributes)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  // New attribute form state
  const [newName, setNewName] = useState('')
  const [newValues, setNewValues] = useState('')
  const [creating, setCreating] = useState(false)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      const values = newValues
        .split(',')
        .map(v => v.trim())
        .filter(v => v.length > 0)

      const res = await fetch('/api/products/attributes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), values }),
      })
      if (!res.ok) {
        const d = await res.json() as { error?: string }
        throw new Error(d.error ?? 'Create failed')
      }
      const created = await res.json() as AttributeWithUsage
      setAttributes(prev => [...prev, { ...created, usageCount: 0 }].sort((a, b) => a.name.localeCompare(b.name)))
      setNewName('')
      setNewValues('')
      notify('Attribute created')
      router.refresh()
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Create failed', 'err')
    } finally {
      setCreating(false)
    }
  }

  const inputCls =
    'bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors'

  return (
    <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-xl border transition-all ${
            toast.type === 'ok'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-800'
              : 'bg-red-500/10 text-red-400 border-red-800'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* New Attribute Form */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-4">New Attribute</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Attribute Name</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Size, Color, Weight"
                className={inputCls + ' w-full'}
                required
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">Values (comma-separated)</label>
              <input
                type="text"
                value={newValues}
                onChange={e => setNewValues(e.target.value)}
                placeholder="e.g. Small, Medium, Large"
                className={inputCls + ' w-full'}
              />
            </div>
            <button
              type="submit"
              disabled={creating || !newName.trim()}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              {creating ? 'Creating…' : 'Add Attribute'}
            </button>
          </form>
        </div>

        {/* Attributes Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="border-b border-zinc-800/50 px-5 py-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-zinc-500" />
            <span className="text-sm font-semibold text-zinc-200">Attributes</span>
            <span className="ml-auto text-[11px] text-zinc-600">{attributes.length} total</span>
          </div>

          {attributes.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Tag className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-600">No attributes yet.</p>
              <p className="text-xs text-zinc-700 mt-1">Use the form above to create your first attribute.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/50">
              {attributes.map(attr => {
                const isOpen = expanded.has(attr.id)
                return (
                  <div key={attr.id}>
                    {/* Attribute Row */}
                    <button
                      onClick={() => toggleExpand(attr.id)}
                      className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-zinc-800/30 transition-colors text-left"
                    >
                      {isOpen
                        ? <ChevronDown className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                        : <ChevronRight className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                      }
                      <span className="text-sm font-medium text-zinc-200 w-40 flex-shrink-0">{attr.name}</span>
                      <span className="text-xs text-zinc-500 flex-1 truncate">
                        {attr.values.length > 0
                          ? attr.values.map(v => v.value).join(', ')
                          : <span className="text-zinc-700">No values</span>
                        }
                      </span>
                      <span className="text-[11px] text-zinc-600 flex-shrink-0 ml-4">
                        {attr.values.length} value{attr.values.length !== 1 ? 's' : ''}
                      </span>
                      <span
                        className={`text-[11px] flex-shrink-0 ml-3 px-2 py-0.5 rounded ${
                          attr.usageCount > 0
                            ? 'bg-blue-500/10 text-blue-400'
                            : 'text-zinc-700'
                        }`}
                      >
                        {attr.usageCount} variant{attr.usageCount !== 1 ? 's' : ''}
                      </span>
                    </button>

                    {/* Expanded Value Pills */}
                    {isOpen && (
                      <div className="px-12 pb-4 pt-1 bg-zinc-900/30">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-2">Values</p>
                        {attr.values.length === 0 ? (
                          <p className="text-xs text-zinc-700">No values defined.</p>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {attr.values.map(v => (
                              <span
                                key={v.id}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 border border-zinc-700 text-xs text-zinc-300"
                              >
                                {v.value}
                              </span>
                            ))}
                          </div>
                        )}
                        <AddValueInline
                          attributeId={attr.id}
                          onAdded={(val) => {
                            setAttributes(prev =>
                              prev.map(a =>
                                a.id === attr.id
                                  ? { ...a, values: [...a.values, val].sort((x, y) => x.value.localeCompare(y.value)) }
                                  : a
                              )
                            )
                          }}
                          notify={notify}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

// Inline add-value subcomponent
function AddValueInline({
  attributeId,
  onAdded,
  notify,
}: {
  attributeId: string
  onAdded: (val: AttributeValue) => void
  notify: (msg: string, type?: 'ok' | 'err') => void
}) {
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/products/attributes/${attributeId}/values`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: value.trim() }),
      })
      if (!res.ok) {
        const d = await res.json() as { error?: string }
        throw new Error(d.error ?? 'Add failed')
      }
      const created = await res.json() as AttributeValue
      onAdded(created)
      setValue('')
      notify('Value added')
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Add failed', 'err')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleAdd} className="flex items-center gap-2 mt-3">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Add value…"
        className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors w-48"
      />
      <button
        type="submit"
        disabled={saving || !value.trim()}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed text-xs text-zinc-200 transition-colors"
      >
        <Plus className="w-3 h-3" />
        Add
      </button>
    </form>
  )
}
