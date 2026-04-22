'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Users, Plus, Pencil, Trash2, X, Check, MessageSquare,
} from 'lucide-react'

type CaseQueue = {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  _count: { cases: number }
}

export default function QueuesPage() {
  const [queues, setQueues]       = useState<CaseQueue[]>([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId]       = useState<string | null>(null)
  const [deleteId, setDeleteId]   = useState<string | null>(null)
  const [form, setForm]           = useState({ name: '', description: '' })
  const [editForm, setEditForm]   = useState({ name: '', description: '' })
  const [error, setError]         = useState('')

  const fetchQueues = useCallback(() => {
    setLoading(true)
    fetch('/api/service/queues')
      .then((r) => r.json())
      .then((data) => { setQueues(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { fetchQueues() }, [fetchQueues])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    const res = await fetch('/api/service/queues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      setShowModal(false)
      setForm({ name: '', description: '' })
      fetchQueues()
    }
  }

  async function handleEdit(id: string) {
    const res = await fetch(`/api/service/queues/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    if (res.ok) { setEditId(null); fetchQueues() }
  }

  async function handleDelete(id: string) {
    setError('')
    const res = await fetch(`/api/service/queues/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setDeleteId(null)
      fetchQueues()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Cannot delete queue')
    }
  }

  function startEdit(q: CaseQueue) {
    setEditId(q.id)
    setEditForm({ name: q.name, description: q.description ?? '' })
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Queue Management</h1>
            <p className="text-xs text-zinc-500">{queues.length} queue{queues.length !== 1 ? 's' : ''} configured</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> New Queue
        </button>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse">
                <div className="h-5 bg-zinc-800 rounded w-32 mb-2" />
                <div className="h-4 bg-zinc-800 rounded w-48 mb-4" />
                <div className="h-8 bg-zinc-800 rounded w-20" />
              </div>
            ))}
          </div>
        ) : queues.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
            <p>No queues yet. Create one to organize cases.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {queues.map((q) => (
              <div key={q.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 group">
                {editId === q.id ? (
                  <div className="space-y-3">
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                      placeholder="Queue name"
                    />
                    <input
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
                      placeholder="Description (optional)"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(q.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg text-xs text-green-400 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" /> Save
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs text-zinc-400 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-zinc-100">{q.name}</h3>
                        {q.description && (
                          <p className="text-sm text-zinc-500 mt-0.5">{q.description}</p>
                        )}
                      </div>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded',
                        q.isActive ? 'bg-green-500/15 text-green-400' : 'bg-zinc-700 text-zinc-500'
                      )}>
                        {q.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="w-4 h-4 text-zinc-500" />
                      <span className="text-2xl font-bold text-zinc-100">{q._count.cases}</span>
                      <span className="text-sm text-zinc-500">cases</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/service/cases?queueId=${q.id}`}
                        className="flex-1 text-center py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-lg text-xs text-indigo-400 transition-colors"
                      >
                        View Cases
                      </Link>
                      <button
                        onClick={() => startEdit(q)}
                        className="p-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-zinc-400 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { setDeleteId(q.id); setError('') }}
                        className="p-1.5 bg-zinc-800 hover:bg-red-500/20 border border-zinc-700 hover:border-red-500/30 rounded-lg text-zinc-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Queue Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h2 className="text-base font-semibold">New Queue</h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Queue Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Billing Support"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
                  placeholder="Optional description"
                />
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
                  Create Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <Trash2 className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold mb-1">Delete Queue?</h3>
            <p className="text-sm text-zinc-400 mb-4">This queue will be permanently deleted.</p>
            {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteId(null); setError('') }}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
