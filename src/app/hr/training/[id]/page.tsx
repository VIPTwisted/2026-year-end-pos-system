'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { GraduationCap, ArrowLeft, Plus, AlertCircle, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const API_BASE = '/api/hr/workforce/training'
const ENROLL_API = '/api/hr/workforce/training/enrollments'

interface TrainingCourse {
  id: string; name: string; category: string; description: string | null; duration: number; format: string; isRequired: boolean; expiresInDays: number | null; enrollments: Enrollment[]
}
interface Enrollment {
  id: string; employeeName: string; status: string; progress: number; score: number | null; completedAt: string | null; expiresAt: string | null
}

const STATUS_COLORS: Record<string, string> = {
  enrolled: 'bg-blue-600/20 text-blue-400', 'in-progress': 'bg-yellow-600/20 text-yellow-400',
  completed: 'bg-green-600/20 text-green-400', failed: 'bg-red-600/20 text-red-400', expired: 'bg-orange-600/20 text-orange-400',
}

const CATEGORY_COLORS: Record<string, string> = {
  compliance: 'bg-red-600/20 text-red-400', product: 'bg-blue-600/20 text-blue-400',
  safety: 'bg-orange-600/20 text-orange-400', leadership: 'bg-purple-600/20 text-purple-400',
  'pos-system': 'bg-teal-600/20 text-teal-400', 'customer-service': 'bg-green-600/20 text-green-400',
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [course, setCourse] = useState<TrainingCourse | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEnroll, setShowEnroll] = useState(false)
  const [enrollName, setEnrollName] = useState('')
  const [saving, setSaving] = useState(false)
  const [updateModal, setUpdateModal] = useState<{ enrollment: Enrollment } | null>(null)
  const [updateForm, setUpdateForm] = useState({ progress: 0, status: 'in-progress', score: '' })

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`${API_BASE}/${id}`)
    setCourse(await res.json())
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  async function enroll(e: React.FormEvent) {
    e.preventDefault(); if (!enrollName.trim()) return; setSaving(true)
    await fetch(`${API_BASE}/${id}/enroll`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeName: enrollName }) })
    setSaving(false); setShowEnroll(false); setEnrollName(''); load()
  }

  async function updateProgress() {
    if (!updateModal) return; setSaving(true)
    await fetch(`${ENROLL_API}/${updateModal.enrollment.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ progress: updateForm.progress, status: updateForm.status, score: updateForm.score ? parseFloat(updateForm.score) : undefined }) })
    setSaving(false); setUpdateModal(null); load()
  }

  if (loading) return <div className="p-8 text-zinc-500">Loading...</div>
  if (!course) return <div className="p-8 text-zinc-500">Course not found.</div>

  const completedCount = course.enrollments.filter(e => e.status === 'completed').length
  const completionRate = course.enrollments.length > 0 ? Math.round((completedCount / course.enrollments.length) * 100) : 0

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Link href="/hr/training" className="text-zinc-500 hover:text-zinc-300"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${CATEGORY_COLORS[course.category] ?? 'bg-zinc-700 text-zinc-400'}`}>{course.category}</span>
              {course.isRequired && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-900/30 text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Required</span>}
              <span className="text-xs text-zinc-500 flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration} min · {course.format}</span>
            </div>
            <h1 className="text-2xl font-bold text-zinc-100">{course.name}</h1>
            {course.description && <p className="text-zinc-500 text-sm mt-1 max-w-2xl">{course.description}</p>}
          </div>
        </div>
        <button onClick={() => setShowEnroll(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"><Plus className="w-4 h-4" /> Enroll Employee</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"><div className="text-xs text-zinc-500 mb-1">Enrolled</div><div className="text-2xl font-bold text-blue-400">{course.enrollments.length}</div></div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"><div className="text-xs text-zinc-500 mb-1">Completed</div><div className="text-2xl font-bold text-green-400">{completedCount}</div></div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"><div className="text-xs text-zinc-500 mb-1">Completion Rate</div><div className="text-2xl font-bold text-teal-400">{completionRate}%</div></div>
      </div>

      {showEnroll && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-zinc-100 mb-4">Enroll Employee</h2>
            <form onSubmit={enroll} className="space-y-3">
              <div><label className="block text-xs text-zinc-500 mb-1">Employee Name</label><input required autoFocus className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" placeholder="Jane Smith" value={enrollName} onChange={e => setEnrollName(e.target.value)} /></div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowEnroll(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg py-2 text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50">{saving ? 'Enrolling...' : 'Enroll'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {updateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-zinc-100 mb-1">Update Progress</h2>
            <p className="text-sm text-zinc-500 mb-4">{updateModal.enrollment.employeeName}</p>
            <div className="space-y-3">
              <div><label className="block text-xs text-zinc-500 mb-1">Progress: {updateForm.progress}%</label><input type="range" min="0" max="100" step="5" className="w-full accent-blue-500" value={updateForm.progress} onChange={e => setUpdateForm(f => ({ ...f, progress: parseInt(e.target.value) }))} /></div>
              <div><label className="block text-xs text-zinc-500 mb-1">Status</label><select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none" value={updateForm.status} onChange={e => setUpdateForm(f => ({ ...f, status: e.target.value }))}>{['enrolled','in-progress','completed','failed','expired'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              <div><label className="block text-xs text-zinc-500 mb-1">Score</label><input type="number" min="0" max="100" step="0.1" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none" placeholder="85.5" value={updateForm.score} onChange={e => setUpdateForm(f => ({ ...f, score: e.target.value }))} /></div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setUpdateModal(null)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg py-2 text-sm transition-colors">Cancel</button>
              <button onClick={updateProgress} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50">{saving ? 'Saving...' : 'Update'}</button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">Enrollments</h2>
        {course.enrollments.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center"><GraduationCap className="w-10 h-10 text-zinc-700 mx-auto mb-3" /><p className="text-zinc-500 text-sm">No employees enrolled yet.</p></div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-zinc-800">{['Employee','Status','Progress','Score','Completed','Expires','Actions'].map(h => <th key={h} className={`text-xs text-zinc-500 font-medium px-4 py-3 ${['Status','Actions'].includes(h) ? 'text-center' : h === 'Score' ? 'text-right' : 'text-left'} ${h === 'Progress' ? 'min-w-[140px]' : ''}`}>{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-zinc-800/50">
                {course.enrollments.map(en => (
                  <tr key={en.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-zinc-100">{en.employeeName}</td>
                    <td className="px-4 py-3 text-center"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[en.status] ?? 'bg-zinc-700 text-zinc-400'}`}>{en.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${en.progress}%` }} /></div>
                        <span className="text-xs text-zinc-400 w-8 text-right">{en.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-300">{en.score != null ? `${en.score.toFixed(1)}%` : '—'}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{en.completedAt ? <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-400" />{new Date(en.completedAt).toLocaleDateString()}</span> : '—'}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{en.expiresAt ? <span className={new Date(en.expiresAt) < new Date() ? 'text-red-400' : ''}>{new Date(en.expiresAt).toLocaleDateString()}</span> : '—'}</td>
                    <td className="px-4 py-3 text-center"><button onClick={() => { setUpdateModal({ enrollment: en }); setUpdateForm({ progress: en.progress, status: en.status, score: en.score != null ? String(en.score) : '' }) }} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded transition-colors">Update</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
