'use client'

import { useEffect, useState } from 'react'
import { Plus, Shield, Users, DollarSign, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type Benefit = {
  id: string
  planName: string
  planType: string
  provider?: string | null
  coverageType: string
  employeeCost: number
  employerCost: number
  isActive: boolean
  description?: string | null
  enrollments: { id: string }[]
}

const TYPE_COLORS: Record<string, string> = {
  medical: 'bg-blue-500/15 text-blue-400',
  dental: 'bg-cyan-500/15 text-cyan-400',
  vision: 'bg-violet-500/15 text-violet-400',
  life: 'bg-amber-500/15 text-amber-400',
  '401k': 'bg-emerald-500/15 text-emerald-400',
  other: 'bg-zinc-700/50 text-zinc-400',
}

export default function BenefitsPage() {
  const [benefits, setBenefits] = useState<Benefit[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Benefit | null>(null)
  const [form, setForm] = useState({
    planName: '',
    planType: 'medical',
    provider: '',
    coverageType: 'individual',
    employeeCost: '',
    employerCost: '',
    isActive: true,
    description: '',
  })

  async function load() {
    setLoading(true)
    const res = await fetch('/api/hr/benefits')
    setBenefits(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setEditing(null)
    setForm({ planName: '', planType: 'medical', provider: '', coverageType: 'individual', employeeCost: '', employerCost: '', isActive: true, description: '' })
    setShowModal(true)
  }

  function openEdit(b: Benefit) {
    setEditing(b)
    setForm({
      planName: b.planName,
      planType: b.planType,
      provider: b.provider ?? '',
      coverageType: b.coverageType,
      employeeCost: b.employeeCost.toString(),
      employerCost: b.employerCost.toString(),
      isActive: b.isActive,
      description: b.description ?? '',
    })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      ...form,
      employeeCost: parseFloat(form.employeeCost) || 0,
      employerCost: parseFloat(form.employerCost) || 0,
    }
    const method = editing ? 'PATCH' : 'POST'
    const url = editing ? `/api/hr/benefits/${editing.id}` : '/api/hr/benefits'
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setShowModal(false)
    load()
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-7 h-7 text-emerald-400" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Benefits</h1>
              <p className="text-zinc-400 text-sm mt-0.5">Manage benefit plans and enrollments</p>
            </div>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Plan
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-zinc-500">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.length === 0 && (
              <div className="col-span-3 text-center py-24 text-zinc-500">No benefit plans yet</div>
            )}
            {benefits.map((b) => (
              <div
                key={b.id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', TYPE_COLORS[b.planType] ?? TYPE_COLORS.other)}>
                      {b.planType}
                    </span>
                    <h3 className="font-semibold mt-2">{b.planName}</h3>
                    {b.provider && <p className="text-zinc-400 text-xs mt-0.5">{b.provider}</p>}
                  </div>
                  <button
                    onClick={() => openEdit(b)}
                    className="text-zinc-500 hover:text-zinc-200 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <p className="text-zinc-400 text-xs mb-1">Employee Cost</p>
                    <p className="font-medium text-zinc-100">${b.employeeCost.toLocaleString()}<span className="text-zinc-500 text-xs">/mo</span></p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <p className="text-zinc-400 text-xs mb-1">Employer Cost</p>
                    <p className="font-medium text-zinc-100">${b.employerCost.toLocaleString()}<span className="text-zinc-500 text-xs">/mo</span></p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                    <Users className="w-3.5 h-3.5" />
                    <span>{b.enrollments.length} enrolled</span>
                  </div>
                  <Link
                    href={`/hr/benefits/${b.id}`}
                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                  >
                    Manage Enrollments →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-5">{editing ? 'Edit Plan' : 'New Benefit Plan'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Plan Name *</label>
                <input
                  required
                  value={form.planName}
                  onChange={(e) => setForm({ ...form, planName: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Plan Type</label>
                  <select
                    value={form.planType}
                    onChange={(e) => setForm({ ...form, planType: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  >
                    {['medical', 'dental', 'vision', 'life', '401k', 'other'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Coverage Type</label>
                  <select
                    value={form.coverageType}
                    onChange={(e) => setForm({ ...form, coverageType: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  >
                    <option value="individual">Individual</option>
                    <option value="family">Family</option>
                    <option value="employee+spouse">Employee+Spouse</option>
                    <option value="employee+children">Employee+Children</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Provider</label>
                <input
                  value={form.provider}
                  onChange={(e) => setForm({ ...form, provider: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Employee Cost/mo</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.employeeCost}
                    onChange={(e) => setForm({ ...form, employeeCost: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Employer Cost/mo</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.employerCost}
                    onChange={(e) => setForm({ ...form, employerCost: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
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
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="benefitActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="accent-emerald-500"
                />
                <label htmlFor="benefitActive" className="text-sm text-zinc-300">Active</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">{editing ? 'Save' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
