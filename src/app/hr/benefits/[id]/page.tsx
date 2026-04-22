'use client'

import { use, useEffect, useState } from 'react'
import { Shield, Plus, ArrowLeft, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type Enrollment = {
  id: string
  employeeName?: string | null
  coverageType: string
  startDate: string
  endDate?: string | null
  status: string
}

type Benefit = {
  id: string
  planName: string
  planType: string
  provider?: string | null
  coverageType: string
  employeeCost: number
  employerCost: number
  isActive: boolean
  enrollments: Enrollment[]
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400',
  cancelled: 'bg-red-500/15 text-red-400',
  pending: 'bg-amber-500/15 text-amber-400',
}

export default function BenefitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [benefit, setBenefit] = useState<Benefit | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEnroll, setShowEnroll] = useState(false)
  const [enrollForm, setEnrollForm] = useState({
    employeeName: '',
    employeeId: '',
    coverageType: 'individual',
    startDate: new Date().toISOString().slice(0, 10),
  })

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/hr/benefits/${id}`)
    setBenefit(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault()
    await fetch(`/api/hr/benefits/${id}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enrollForm),
    })
    setShowEnroll(false)
    load()
  }

  async function cancelEnrollment(enrollmentId: string) {
    await fetch(`/api/hr/benefits/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    load()
  }

  if (loading) return <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center text-zinc-500">Loading…</div>
  if (!benefit) return <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center text-zinc-500">Not found</div>

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/hr/benefits" className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-100 text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Benefits
        </Link>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-emerald-400" />
              <div>
                <h1 className="text-xl font-semibold">{benefit.planName}</h1>
                <p className="text-zinc-400 text-sm">{benefit.planType} · {benefit.provider || 'No provider'}</p>
              </div>
            </div>
            <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium', benefit.isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-zinc-700 text-zinc-400')}>
              {benefit.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-5">
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-xs text-zinc-400 mb-1">Employee Cost</p>
              <p className="font-semibold">${benefit.employeeCost.toLocaleString()}<span className="text-zinc-500 text-xs font-normal">/mo</span></p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-xs text-zinc-400 mb-1">Employer Cost</p>
              <p className="font-semibold">${benefit.employerCost.toLocaleString()}<span className="text-zinc-500 text-xs font-normal">/mo</span></p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <p className="text-xs text-zinc-400 mb-1">Total Enrolled</p>
              <p className="font-semibold">{benefit.enrollments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <h2 className="font-medium">Enrollments</h2>
            <button
              onClick={() => setShowEnroll(true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Enroll Employee
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-400 border-b border-zinc-800">
                <th className="text-left px-4 py-3 font-medium">Employee</th>
                <th className="text-left px-4 py-3 font-medium">Coverage Type</th>
                <th className="text-left px-4 py-3 font-medium">Start Date</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {benefit.enrollments.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-zinc-500">No enrollments</td></tr>
              )}
              {benefit.enrollments.map((en) => (
                <tr key={en.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{en.employeeName || '—'}</td>
                  <td className="px-4 py-3 text-zinc-300">{en.coverageType}</td>
                  <td className="px-4 py-3 text-zinc-400">{new Date(en.startDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_COLORS[en.status] ?? 'bg-zinc-700 text-zinc-400')}>
                      {en.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {en.status === 'active' && (
                      <button
                        onClick={() => cancelEnrollment(en.id)}
                        className="text-zinc-500 hover:text-red-400 transition-colors"
                        title="Cancel enrollment"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showEnroll && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-5">Enroll Employee</h2>
            <form onSubmit={handleEnroll} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Employee Name</label>
                <input
                  required
                  value={enrollForm.employeeName}
                  onChange={(e) => setEnrollForm({ ...enrollForm, employeeName: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Employee ID</label>
                <input
                  value={enrollForm.employeeId}
                  onChange={(e) => setEnrollForm({ ...enrollForm, employeeId: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Coverage Type</label>
                <select
                  value={enrollForm.coverageType}
                  onChange={(e) => setEnrollForm({ ...enrollForm, coverageType: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="individual">Individual</option>
                  <option value="family">Family</option>
                  <option value="employee+spouse">Employee+Spouse</option>
                  <option value="employee+children">Employee+Children</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={enrollForm.startDate}
                  onChange={(e) => setEnrollForm({ ...enrollForm, startDate: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEnroll(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Enroll</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
