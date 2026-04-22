'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

// TODO: wire to POST /api/hr/recruiting once JobRequisition model is in schema

const DEPARTMENTS = [
  'Sales', 'Operations', 'Warehouse', 'Human Resources', 'IT', 'Finance', 'Marketing', 'Customer Service',
]

const POSITION_TYPES = ['Full-Time', 'Part-Time', 'Contract', 'Temporary', 'Intern']

export default function NewRequisitionPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    department: '',
    positionType: 'Full-Time',
    salaryMin: '',
    salaryMax: '',
    hiringManager: '',
    targetHireDate: '',
    description: '',
    requirements: '',
  })

  function set(key: string, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    // TODO: POST to /api/hr/recruiting
    await new Promise(r => setTimeout(r, 600))
    router.push('/hr/recruiting')
  }

  return (
    <>
      <TopBar title="New Job Requisition" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a]">

        <div className="max-w-2xl mx-auto space-y-6">

          <div>
            <Link href="/hr/recruiting" className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-100 mb-3 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Recruiting
            </Link>
            <h1 className="text-[18px] font-semibold text-zinc-100">New Job Requisition</h1>
            <p className="text-[13px] text-zinc-500">Post a new open position</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Basic info */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
              <h2 className="text-[11px] uppercase tracking-widest text-zinc-500 font-medium">Position Details</h2>

              <div>
                <label className="block text-[12px] text-zinc-400 mb-1.5">Position Title <span className="text-red-400">*</span></label>
                <input
                  required
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Senior Retail Associate"
                  className="w-full bg-zinc-900/60 border border-zinc-700 rounded-md px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] text-zinc-400 mb-1.5">Department <span className="text-red-400">*</span></label>
                  <select
                    required
                    value={form.department}
                    onChange={e => set('department', e.target.value)}
                    className="w-full bg-zinc-900/60 border border-zinc-700 rounded-md px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="">Select department</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] text-zinc-400 mb-1.5">Position Type</label>
                  <select
                    value={form.positionType}
                    onChange={e => set('positionType', e.target.value)}
                    className="w-full bg-zinc-900/60 border border-zinc-700 rounded-md px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    {POSITION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] text-zinc-400 mb-1.5">Salary Min (Annual)</label>
                  <input
                    type="number"
                    value={form.salaryMin}
                    onChange={e => set('salaryMin', e.target.value)}
                    placeholder="38000"
                    className="w-full bg-zinc-900/60 border border-zinc-700 rounded-md px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-zinc-400 mb-1.5">Salary Max (Annual)</label>
                  <input
                    type="number"
                    value={form.salaryMax}
                    onChange={e => set('salaryMax', e.target.value)}
                    placeholder="52000"
                    className="w-full bg-zinc-900/60 border border-zinc-700 placeholder-zinc-600 rounded-md px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Hiring details */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
              <h2 className="text-[11px] uppercase tracking-widest text-zinc-500 font-medium">Hiring Details</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] text-zinc-400 mb-1.5">Hiring Manager <span className="text-red-400">*</span></label>
                  <input
                    required
                    value={form.hiringManager}
                    onChange={e => set('hiringManager', e.target.value)}
                    placeholder="Name or employee ID"
                    className="w-full bg-zinc-900/60 border border-zinc-700 rounded-md px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-zinc-400 mb-1.5">Target Hire Date</label>
                  <input
                    type="date"
                    value={form.targetHireDate}
                    onChange={e => set('targetHireDate', e.target.value)}
                    className="w-full bg-zinc-900/60 border border-zinc-700 rounded-md px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Description & requirements */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
              <h2 className="text-[11px] uppercase tracking-widest text-zinc-500 font-medium">Job Description</h2>

              <div>
                <label className="block text-[12px] text-zinc-400 mb-1.5">Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Describe the role, responsibilities, and team..."
                  className="w-full bg-zinc-900/60 border border-zinc-700 rounded-md px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-[12px] text-zinc-400 mb-1.5">Requirements <span className="text-zinc-600">(one per line)</span></label>
                <textarea
                  rows={4}
                  value={form.requirements}
                  onChange={e => set('requirements', e.target.value)}
                  placeholder="3+ years experience&#10;POS system proficiency&#10;Team leadership skills"
                  className="w-full bg-zinc-900/60 border border-zinc-700 rounded-md px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Link
                href="/hr/recruiting"
                className="px-4 py-2 rounded-md border border-zinc-700 text-zinc-300 hover:text-zinc-100 text-[13px] transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[13px] font-medium transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving...' : 'Post Requisition'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </>
  )
}
