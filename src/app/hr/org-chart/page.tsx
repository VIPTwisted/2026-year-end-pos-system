'use client'

import { useEffect, useState } from 'react'
import { GitBranch, Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type OrgNodeData = {
  id: string
  employeeId?: string | null
  employeeName: string
  title?: string | null
  departmentName?: string | null
  parentId?: string | null
  level: number
  isActive: boolean
  children?: OrgNodeData[]
}

function OrgCard({ node, depth = 0 }: { node: OrgNodeData; depth?: number }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0
  const isManager = node.level === 0 || hasChildren

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex flex-col items-center">
        {depth > 0 && (
          <div className="w-px h-6 bg-zinc-700" />
        )}
        <div
          className={cn(
            'relative bg-zinc-900 border rounded-xl px-4 py-3 min-w-[160px] max-w-[200px] shadow-lg',
            isManager
              ? 'border-l-4 border-l-emerald-500 border-zinc-700'
              : 'border-zinc-800',
            !node.isActive && 'opacity-50',
          )}
        >
          <p className="font-semibold text-sm text-zinc-100 truncate">{node.employeeName}</p>
          {node.title && <p className="text-xs text-zinc-400 truncate mt-0.5">{node.title}</p>}
          {node.departmentName && (
            <span className="inline-block mt-1.5 text-xs bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded truncate max-w-full">
              {node.departmentName}
            </span>
          )}
          {hasChildren && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-zinc-700 hover:bg-zinc-600 rounded-full w-6 h-6 flex items-center justify-center transition-colors z-10"
            >
              {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="flex flex-col items-center mt-3">
          <div className="w-px h-3 bg-zinc-700" />
          <div className="relative flex gap-6 items-start">
            {node.children!.length > 1 && (
              <div
                className="absolute top-0 left-[calc(50%_-_50%)] h-px bg-zinc-700"
                style={{ width: `calc(100% - 2rem)`, left: '1rem' }}
              />
            )}
            {node.children!.map((child) => (
              <OrgCard key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function OrgChartPage() {
  const [tree, setTree] = useState<OrgNodeData[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [allNodes, setAllNodes] = useState<OrgNodeData[]>([])
  const [form, setForm] = useState({
    employeeName: '',
    employeeId: '',
    title: '',
    departmentName: '',
    parentId: '',
    level: 0,
    sortOrder: 0,
  })

  async function load() {
    setLoading(true)
    const res = await fetch('/api/hr/org-chart')
    const data = await res.json()
    setTree(data.tree ?? [])
    setAllNodes(data.nodes ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      ...form,
      parentId: form.parentId || null,
      employeeId: form.employeeId || null,
      level: parseInt(String(form.level)) || 0,
      sortOrder: parseInt(String(form.sortOrder)) || 0,
    }
    await fetch('/api/hr/org-chart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setShowModal(false)
    load()
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-full mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <GitBranch className="w-7 h-7 text-emerald-400" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Org Chart</h1>
              <p className="text-zinc-400 text-sm mt-0.5">Organizational hierarchy</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Node
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32 text-zinc-500">Loading…</div>
        ) : tree.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <GitBranch className="w-12 h-12 text-zinc-700" />
            <p className="text-zinc-500">No org nodes yet. Add one to start building the chart.</p>
          </div>
        ) : (
          <div className="overflow-x-auto pb-8">
            <div className="flex gap-8 justify-center min-w-max pt-4">
              {tree.map((root) => (
                <OrgCard key={root.id} node={root} depth={0} />
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-5">Add Org Node</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Name *</label>
                <input required value={form.employeeName} onChange={(e) => setForm({ ...form, employeeName: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Department</label>
                <input value={form.departmentName} onChange={(e) => setForm({ ...form, departmentName: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Parent Node</label>
                <select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500">
                  <option value="">— Root (no parent) —</option>
                  {allNodes.map((n) => (
                    <option key={n.id} value={n.id}>{n.employeeName} {n.title ? `(${n.title})` : ''}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Level</label>
                  <input type="number" min="0" value={form.level} onChange={(e) => setForm({ ...form, level: parseInt(e.target.value) })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Sort Order</label>
                  <input type="number" min="0" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
