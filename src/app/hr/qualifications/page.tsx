'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, ArrowLeft, GraduationCap } from 'lucide-react'

type Qualification = {
  id: string
  employeeId: string
  employeeName?: string
  qualificationCode: string
  description?: string
  fromDate?: string
  toDate?: string
  type: string
  institution?: string
  createdAt: string
}

const INPUT_CLS = 'w-full rounded-md bg-zinc-900/60 border border-zinc-800/50 text-zinc-100 text-[12px] px-3 py-2 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/60'
const LABEL_CLS = 'block text-[10px] uppercase tracking-wide text-zinc-500 mb-1'

const TYPE_COLOR: Record<string, string> = {
  Education:    'bg-blue-500/20 text-blue-400',
  Certificate:  'bg-emerald-500/20 text-emerald-400',
  License:      'bg-amber-500/20 text-amber-400',
  Skill:        'bg-indigo-500/20 text-indigo-300',
  Other:        'bg-zinc-700/40 text-zinc-400',
}

type Employee = { id: string; firstName: string; lastName: string }

export default function QualificationsPage() {
  const [quals, setQuals] = useState<Qualification[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    employeeId: '',
    qualificationCode: '',
    description: '',
    type: 'Education',
    institution: '',
    fromDate: '',
    toDate: '',
  })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [qRes, eRes] = await Promise.all([
        fetch('/api/hr/qualifications'),
        fetch('/api/hr/employees'),
      ])
      const [qData, eData] = await Promise.all([qRes.json(), eRes.json()])
      setQuals(Array.isArray(qData) ? qData : [])
      setEmployees(Array.isArray(eData) ? eData : [])
    } catch {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const selected = employees.find(e => e.id === form.employeeId)
      const payload = {
        ...form,
        employeeName: selected ? `${selected.firstName} ${selected.lastName}` : '',
        fromDate: form.fromDate || undefined,
        toDate: form.toDate || undefined,
      }
      const res = await fetch('/api/hr/qualifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const json = (await res.json()) as { error?: string }
        throw new Error(json.error ?? 'Failed to save')
      }
      setForm({ employeeId: '', qualificationCode: '', description: '', type: 'Education', institution: '', fromDate: '', toDate: '' })
      setShowForm(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="Employee Qualifications" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-4">

          <div className="flex items-center gap-3">
            <Link href="/hr/employees" className="inline-flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> HR
            </Link>
            <span className="text-zinc-700">/</span>
            <span className="text-[12px] text-zinc-400">Qualifications</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Human Resources</p>
              <h2 className="text-[18px] font-semibold text-zinc-100">Employee Qualifications</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">{quals.length} records</p>
            </div>
            <button
              onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>

          {error && (
            <div className="rounded-md bg-red-900/30 border border-red-700/50 px-4 py-3 text-[12px] text-red-400">{error}</div>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-5 py-4 space-y-3">
              <h3 className="text-[13px] font-semibold text-zinc-200">New Qualification</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className={LABEL_CLS}>Employee *</label>
                  <select name="employeeId" required value={form.employeeId} onChange={handleChange} className={INPUT_CLS}>
                    <option value="">Select…</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.lastName}, {e.firstName}</option>)}
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLS}>Qualification Code *</label>
                  <input name="qualificationCode" required value={form.qualificationCode} onChange={handleChange} className={INPUT_CLS} placeholder="CERT-AWS" />
                </div>
                <div>
                  <label className={LABEL_CLS}>Description</label>
                  <input name="description" value={form.description} onChange={handleChange} className={INPUT_CLS} placeholder="AWS Certified Solutions Architect" />
                </div>
                <div>
                  <label className={LABEL_CLS}>Type</label>
                  <select name="type" value={form.type} onChange={handleChange} className={INPUT_CLS}>
                    <option>Education</option>
                    <option>Certificate</option>
                    <option>License</option>
                    <option>Skill</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL_CLS}>Institution</label>
                  <input name="institution" value={form.institution} onChange={handleChange} className={INPUT_CLS} placeholder="University / Issuer" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={LABEL_CLS}>From Date</label>
                    <input name="fromDate" type="date" value={form.fromDate} onChange={handleChange} className={INPUT_CLS} />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>To Date</label>
                    <input name="toDate" type="date" value={form.toDate} onChange={handleChange} className={INPUT_CLS} />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="px-4 py-1.5 text-[11px] bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-md font-medium transition-colors">
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-1.5 text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md font-medium transition-colors">Cancel</button>
              </div>
            </form>
          )}

          {/* Table */}
          {loading ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg py-10 text-center text-[12px] text-zinc-500">Loading…</div>
          ) : quals.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-12">
              <GraduationCap className="w-10 h-10 mb-3 text-zinc-700 opacity-50" />
              <p className="text-[13px] text-zinc-500 mb-4">No qualifications recorded.</p>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['Employee', 'Code', 'Description', 'Type', 'Institution', 'From', 'To'].map(h => (
                        <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {quals.map(q => (
                      <tr key={q.id} className="hover:bg-[rgba(99,102,241,0.05)] transition-colors">
                        <td className="px-4 py-3 text-[13px] text-zinc-100">{q.employeeName ?? q.employeeId}</td>
                        <td className="px-4 py-3 font-mono text-[11px] font-semibold text-indigo-300">{q.qualificationCode}</td>
                        <td className="px-4 py-3 text-[12px] text-zinc-300">{q.description ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${TYPE_COLOR[q.type] ?? 'bg-zinc-700/40 text-zinc-400'}`}>
                            {q.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-zinc-400">{q.institution ?? '—'}</td>
                        <td className="px-4 py-3 text-[11px] text-zinc-400 whitespace-nowrap">{q.fromDate ? new Date(q.fromDate).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3 text-[11px] text-zinc-400 whitespace-nowrap">{q.toDate ? new Date(q.toDate).toLocaleDateString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
