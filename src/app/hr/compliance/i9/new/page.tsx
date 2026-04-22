'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'

const LIST_A_DOCS = [
  'U.S. Passport', 'U.S. Passport Card', 'Permanent Resident Card (I-551)',
  'Foreign Passport with I-94', 'Employment Auth. Document (I-766)',
]
const LIST_B_DOCS = [
  "Driver's License", "State ID Card", "School ID with Photo",
  "Voter's Registration Card", "U.S. Military Card",
]
const LIST_C_DOCS = [
  'Social Security Card', 'Birth Certificate', 'U.S. Citizen ID Card (I-197)',
  'Native American Tribal Document', 'U.S. Employment Auth. (DHS)',
]

export default function NewI9Page() {
  const router = useRouter()
  const [employees, setEmployees] = useState<{ id: string; firstName: string; lastName: string }[]>([])
  const [form, setForm] = useState({
    employeeId: '',
    hireDate: '',
    section1Date: '',
    section2Date: '',
    listADoc: '',
    listBDoc: '',
    listCDoc: '',
    expirationDate: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/hr/employees').then(r => r.json()).then(d => setEmployees(d.employees ?? d)).catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/hr/compliance/i9', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Failed to save') }
      router.push('/hr/compliance/i9')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white">
      <TopBar title="New I-9 Verification" />
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-6">
          <h2 className="font-semibold text-zinc-200 mb-6">I-9 Employment Eligibility Verification</h2>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Employee *</label>
              <select required value={form.employeeId}
                onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                <option value="">Select employee...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Hire Date *</label>
                <input required type="date" value={form.hireDate}
                  onChange={e => setForm(f => ({ ...f, hireDate: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Section 1 Date (Employee)</label>
                <input type="date" value={form.section1Date}
                  onChange={e => setForm(f => ({ ...f, section1Date: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Section 2 Date (Employer)</label>
                <input type="date" value={form.section2Date}
                  onChange={e => setForm(f => ({ ...f, section2Date: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Document Expiration</label>
                <input type="date" value={form.expirationDate}
                  onChange={e => setForm(f => ({ ...f, expirationDate: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
            </div>

            <p className="text-xs text-zinc-500 pt-2">Document Verification — provide List A OR List B + C</p>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">List A Document</label>
              <select value={form.listADoc}
                onChange={e => setForm(f => ({ ...f, listADoc: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                <option value="">None / Use List B+C</option>
                {LIST_A_DOCS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">List B Document</label>
                <select value={form.listBDoc}
                  onChange={e => setForm(f => ({ ...f, listBDoc: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                  <option value="">Select...</option>
                  {LIST_B_DOCS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">List C Document</label>
                <select value={form.listCDoc}
                  onChange={e => setForm(f => ({ ...f, listCDoc: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                  <option value="">Select...</option>
                  {LIST_C_DOCS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">Notes</label>
              <textarea rows={2} value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                {saving ? 'Saving...' : 'Save I-9 Record'}
              </button>
              <button type="button" onClick={() => router.back()}
                className="bg-zinc-700 hover:bg-zinc-600 px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
