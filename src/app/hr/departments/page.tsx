'use client'

import { useEffect, useState } from 'react'
import { Plus, Building2, Users, CheckCircle, XCircle, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'

type Department = {
  id: string
  deptCode: string
  deptName: string
  managerId?: string | null
  managerName?: string | null
  costCenter?: string | null
  headcount: number
  isActive: boolean
  notes?: string | null
}

const empty: Omit<Department, 'id' | 'headcount' | 'isActive'> = {
  deptCode: '',
  deptName: '',
  managerName: '',
  costCenter: '',
  notes: '',
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Department | null>(null)
  const [form, setForm] = useState({ ...empty, headcount: 0, isActive: true })

  async function load() {
    setLoading(true)
    const res = await fetch('/api/hr/departments')
    const data = await res.json()
    setDepartments(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setEditing(null)
    setForm({ ...empty, headcount: 0, isActive: true })
    setShowModal(true)
  }

  function openEdit(d: Department) {
    setEditing(d)
    setForm({
      deptCode: d.deptCode,
      deptName: d.deptName,
      managerName: d.managerName ?? '',
      costCenter: d.costCenter ?? '',
      notes: d.notes ?? '',
      headcount: d.headcount,
      isActive: d.isActive,
    })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const method = editing ? 'PATCH' : 'POST'
    const url = editing ? `/api/hr/departments/${editing.id}` : '/api/hr/departments'
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setShowModal(false)
    load()
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Building2 className="w-7 h-7 text-emerald-400" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Departments</h1>
              <p className="text-zinc-400 text-sm mt-0.5">Manage organizational departments</p>
            </div>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Department
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-zinc-500">Loading…</div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400">
                  <th className="text-left px-4 py-3 font-medium">Code</th>
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Manager</th>
                  <th className="text-left px-4 py-3 font-medium">Cost Center</th>
                  <th className="text-right px-4 py-3 font-medium">
                    <Users className="w-4 h-4 inline" />
                  </th>
                  <th className="text-center px-4 py-3 font-medium">Active</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {departments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-zinc-500">
                      No departments yet
                    </td>
                  </tr>
                )}
                {departments.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-emerald-400">{d.deptCode}</td>
                    <td className="px-4 py-3 font-medium">{d.deptName}</td>
                    <td className="px-4 py-3 text-zinc-300">{d.managerName || '—'}</td>
                    <td className="px-4 py-3 text-zinc-400">{d.costCenter || '—'}</td>
                    <td className="px-4 py-3 text-right text-zinc-300">{d.headcount}</td>
                    <td className="px-4 py-3 text-center">
                      {d.isActive ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 inline" />
                      ) : (
                        <XCircle className="w-4 h-4 text-zinc-600 inline" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openEdit(d)}
                        className="text-zinc-400 hover:text-zinc-100 transition-colors"
                      >
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
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-5">
              {editing ? 'Edit Department' : 'New Department'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Dept Code *</label>
                  <input
                    required
                    value={form.deptCode}
                    onChange={(e) => setForm({ ...form, deptCode: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Cost Center</label>
                  <input
                    value={form.costCenter}
                    onChange={(e) => setForm({ ...form, costCenter: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Dept Name *</label>
                <input
                  required
                  value={form.deptName}
                  onChange={(e) => setForm({ ...form, deptName: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Manager Name</label>
                <input
                  value={form.managerName}
                  onChange={(e) => setForm({ ...form, managerName: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Headcount</label>
                <input
                  type="number"
                  min={0}
                  value={form.headcount}
                  onChange={(e) => setForm({ ...form, headcount: parseInt(e.target.value) || 0 })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="accent-emerald-500"
                />
                <label htmlFor="isActive" className="text-sm text-zinc-300">Active</label>
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
