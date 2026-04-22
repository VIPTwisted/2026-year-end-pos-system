'use client'

import { useEffect, useState } from 'react'
import { Plus, Briefcase, Pencil, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type Position = {
  id: string
  positionId: string
  title: string
  departmentId?: string | null
  departmentName?: string | null
  salaryGrade?: string | null
  minSalary?: number | null
  maxSalary?: number | null
  fteCount: number
  status: string
  isManagement: boolean
  description?: string | null
}

type Department = { id: string; deptCode: string; deptName: string }

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400',
  inactive: 'bg-zinc-700/50 text-zinc-400',
  open: 'bg-blue-500/15 text-blue-400',
  filled: 'bg-purple-500/15 text-purple-400',
}

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Position | null>(null)
  const [filterDept, setFilterDept] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [form, setForm] = useState({
    positionId: '',
    title: '',
    departmentId: '',
    departmentName: '',
    salaryGrade: '',
    minSalary: '',
    maxSalary: '',
    fteCount: 1,
    status: 'active',
    isManagement: false,
    description: '',
  })

  async function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterDept) params.set('departmentId', filterDept)
    if (filterStatus) params.set('status', filterStatus)
    const [posRes, deptRes] = await Promise.all([
      fetch(`/api/hr/positions?${params}`),
      fetch('/api/hr/departments'),
    ])
    setPositions(await posRes.json())
    setDepartments(await deptRes.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [filterDept, filterStatus])

  function openNew() {
    setEditing(null)
    setForm({
      positionId: '',
      title: '',
      departmentId: '',
      departmentName: '',
      salaryGrade: '',
      minSalary: '',
      maxSalary: '',
      fteCount: 1,
      status: 'active',
      isManagement: false,
      description: '',
    })
    setShowModal(true)
  }

  function openEdit(p: Position) {
    setEditing(p)
    setForm({
      positionId: p.positionId,
      title: p.title,
      departmentId: p.departmentId ?? '',
      departmentName: p.departmentName ?? '',
      salaryGrade: p.salaryGrade ?? '',
      minSalary: p.minSalary?.toString() ?? '',
      maxSalary: p.maxSalary?.toString() ?? '',
      fteCount: p.fteCount,
      status: p.status,
      isManagement: p.isManagement,
      description: p.description ?? '',
    })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      ...form,
      minSalary: form.minSalary ? parseFloat(form.minSalary) : null,
      maxSalary: form.maxSalary ? parseFloat(form.maxSalary) : null,
      fteCount: parseFloat(String(form.fteCount)),
    }
    const method = editing ? 'PATCH' : 'POST'
    const url = editing ? `/api/hr/positions/${editing.id}` : '/api/hr/positions'
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setShowModal(false)
    load()
  }

  const fmt = (v?: number | null) =>
    v != null ? `$${v.toLocaleString()}` : '—'

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-emerald-400" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Positions</h1>
              <p className="text-zinc-400 text-sm mt-0.5">Job position catalog</p>
            </div>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Position
          </button>
        </div>

        <div className="flex gap-3 mb-5">
          <div className="relative">
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-emerald-500 appearance-none"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.deptName}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-zinc-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-emerald-500 appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="open">Open</option>
              <option value="filled">Filled</option>
            </select>
            <ChevronDown className="absolute right-2 top-2.5 w-4 h-4 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-zinc-500">Loading…</div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="text-left px-4 py-3 font-medium">Position ID</th>
                  <th className="text-left px-4 py-3 font-medium">Title</th>
                  <th className="text-left px-4 py-3 font-medium">Department</th>
                  <th className="text-left px-4 py-3 font-medium">Salary Grade</th>
                  <th className="text-left px-4 py-3 font-medium">Salary Range</th>
                  <th className="text-center px-4 py-3 font-medium">FTE</th>
                  <th className="text-center px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {positions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-zinc-500">No positions found</td>
                  </tr>
                )}
                {positions.map((p) => (
                  <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-emerald-400 text-xs">{p.positionId}</td>
                    <td className="px-4 py-3 font-medium">
                      {p.title}
                      {p.isManagement && (
                        <span className="ml-2 text-xs bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded">MGR</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{p.departmentName || '—'}</td>
                    <td className="px-4 py-3 text-zinc-400">{p.salaryGrade || '—'}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">
                      {fmt(p.minSalary)} – {fmt(p.maxSalary)}
                    </td>
                    <td className="px-4 py-3 text-center text-zinc-300">{p.fteCount}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_COLORS[p.status] ?? 'bg-zinc-700 text-zinc-400')}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(p)} className="text-zinc-400 hover:text-zinc-100 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-5">{editing ? 'Edit Position' : 'New Position'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Position ID *</label>
                  <input
                    required
                    value={form.positionId}
                    onChange={(e) => setForm({ ...form, positionId: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Salary Grade</label>
                  <input
                    value={form.salaryGrade}
                    onChange={(e) => setForm({ ...form, salaryGrade: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Department</label>
                <select
                  value={form.departmentId}
                  onChange={(e) => {
                    const d = departments.find((x) => x.id === e.target.value)
                    setForm({ ...form, departmentId: e.target.value, departmentName: d?.deptName ?? '' })
                  }}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="">— None —</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.deptName}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Min Salary</label>
                  <input
                    type="number"
                    value={form.minSalary}
                    onChange={(e) => setForm({ ...form, minSalary: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Max Salary</label>
                  <input
                    type="number"
                    value={form.maxSalary}
                    onChange={(e) => setForm({ ...form, maxSalary: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">FTE Count</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={form.fteCount}
                    onChange={(e) => setForm({ ...form, fteCount: parseFloat(e.target.value) })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="open">Open</option>
                    <option value="filled">Filled</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isMgmt"
                  checked={form.isManagement}
                  onChange={(e) => setForm({ ...form, isManagement: e.target.checked })}
                  className="accent-emerald-500"
                />
                <label htmlFor="isMgmt" className="text-sm text-zinc-300">Management role</label>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {editing ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
