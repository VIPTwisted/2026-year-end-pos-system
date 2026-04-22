'use client'
import { useEffect, useState, useCallback } from 'react'
import { GraduationCap, Plus, Eye, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const API = '/api/hr/workforce/training'

interface TrainingCourse {
  id: string; name: string; category: string; description: string | null; duration: number; format: string; isRequired: boolean; expiresInDays: number | null; _count: { enrollments: number }
}

const CATEGORY_COLORS: Record<string, string> = {
  compliance: 'bg-red-600/20 text-red-400', product: 'bg-blue-600/20 text-blue-400',
  safety: 'bg-orange-600/20 text-orange-400', leadership: 'bg-purple-600/20 text-purple-400',
  'pos-system': 'bg-teal-600/20 text-teal-400', 'customer-service': 'bg-green-600/20 text-green-400',
}

const FORMAT_COLORS: Record<string, string> = {
  online: 'bg-blue-900/20 text-blue-400', 'in-person': 'bg-green-900/20 text-green-400',
  video: 'bg-purple-900/20 text-purple-400', document: 'bg-zinc-700 text-zinc-400',
}

type Cat = 'all' | 'compliance' | 'product' | 'safety' | 'leadership' | 'pos-system' | 'customer-service'
const TABS: Cat[] = ['all', 'compliance', 'product', 'safety', 'leadership', 'pos-system', 'customer-service']

export default function TrainingPage() {
  const [courses, setCourses] = useState<TrainingCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [cat, setCat] = useState<Cat>('all')
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', category: 'compliance', description: '', duration: '60', format: 'online', isRequired: false, expiresInDays: '' })

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (cat !== 'all') params.set('category', cat)
    const res = await fetch(`${API}?${params}`)
    const data = await res.json()
    setCourses(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [cat])

  useEffect(() => { load() }, [load])

  async function createCourse(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, duration: parseInt(form.duration), expiresInDays: form.expiresInDays ? parseInt(form.expiresInDays) : null }) })
    setSaving(false); setShowNew(false); setForm({ name: '', category: 'compliance', description: '', duration: '60', format: 'online', isRequired: false, expiresInDays: '' }); load()
  }

  const totalEnrolled = courses.reduce((s, c) => s + c._count.enrollments, 0)

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2"><GraduationCap className="w-6 h-6 text-teal-400" />Training Management</h1>
          <p className="text-zinc-500 mt-1">Courses, compliance, and employee development</p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"><Plus className="w-4 h-4" /> New Course</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"><div className="text-xs text-zinc-500 mb-1">Total Courses</div><div className="text-3xl font-bold text-zinc-100">{courses.length}</div></div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"><div className="text-xs text-zinc-500 mb-1">Total Enrollments</div><div className="text-3xl font-bold text-blue-400">{totalEnrolled}</div></div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"><div className="text-xs text-zinc-500 mb-1">Required Courses</div><div className="text-3xl font-bold text-red-400">{courses.filter(c => c.isRequired).length}</div></div>
      </div>

      <div className="flex flex-wrap gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setCat(t)} className={`px-3 py-1.5 text-xs rounded capitalize transition-colors ${cat === t ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}>
            {t === 'pos-system' ? 'POS System' : t === 'customer-service' ? 'Customer Service' : t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-zinc-100 mb-4">New Training Course</h2>
            <form onSubmit={createCourse} className="space-y-3">
              <div><label className="block text-xs text-zinc-500 mb-1">Course Name</label><input required className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-500" placeholder="Food Safety Certification" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-zinc-500 mb-1">Category</label><select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>{['compliance','product','safety','leadership','pos-system','customer-service'].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className="block text-xs text-zinc-500 mb-1">Format</label><select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none" value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))}>{['online','in-person','video','document'].map(f => <option key={f} value={f}>{f}</option>)}</select></div>
              </div>
              <div><label className="block text-xs text-zinc-500 mb-1">Description</label><textarea rows={2} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-zinc-500 mb-1">Duration (min)</label><input type="number" min="1" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} /></div>
                <div><label className="block text-xs text-zinc-500 mb-1">Expires In (days)</label><input type="number" min="1" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none" placeholder="365" value={form.expiresInDays} onChange={e => setForm(f => ({ ...f, expiresInDays: e.target.value }))} /></div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded accent-blue-500" checked={form.isRequired} onChange={e => setForm(f => ({ ...f, isRequired: e.target.checked }))} /><span className="text-sm text-zinc-300">Required for all employees</span></label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowNew(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg py-2 text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50">{saving ? 'Creating...' : 'Create Course'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div className="text-zinc-500 text-sm">Loading...</div> : courses.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center"><GraduationCap className="w-12 h-12 text-zinc-700 mx-auto mb-3" /><p className="text-zinc-500">No courses found. Create the first one.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => (
            <div key={course.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${CATEGORY_COLORS[course.category] ?? 'bg-zinc-700 text-zinc-400'}`}>{course.category}</span>
                  {course.isRequired && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-900/30 text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Required</span>}
                </div>
                <h3 className="font-semibold text-zinc-100 leading-tight">{course.name}</h3>
              </div>
              {course.description && <p className="text-xs text-zinc-500 line-clamp-2">{course.description}</p>}
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}m</span>
                <span className={`px-2 py-0.5 rounded-full capitalize ${FORMAT_COLORS[course.format] ?? 'bg-zinc-700 text-zinc-400'}`}>{course.format}</span>
                {course.expiresInDays && <span className="text-yellow-500">Expires {course.expiresInDays}d</span>}
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
                <span className="text-xs text-zinc-500">{course._count.enrollments} enrolled</span>
                <Link href={`/hr/training/${course.id}`} className="flex items-center gap-1.5 text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-3 py-1.5 rounded-lg transition-colors"><Eye className="w-3.5 h-3.5" /> View</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
