'use client'

import { useEffect, useState } from 'react'
import { Plus, Zap, User, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type Skill = {
  id: string
  skillName: string
  skillCategory: string
  description?: string | null
  isActive: boolean
}

type EmployeeSkill = {
  id: string
  employeeId: string
  employeeName?: string | null
  skillId: string
  skillName?: string | null
  proficiency: string
  certifiedAt?: string | null
  expiresAt?: string | null
}

const PROFICIENCY_COLORS: Record<string, string> = {
  beginner: 'bg-zinc-700/60 text-zinc-400',
  intermediate: 'bg-blue-500/15 text-blue-400',
  advanced: 'bg-purple-500/15 text-purple-400',
  expert: 'bg-emerald-500/15 text-emerald-400',
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [employeeSkills, setEmployeeSkills] = useState<EmployeeSkill[]>([])
  const [loading, setLoading] = useState(true)
  const [empFilter, setEmpFilter] = useState('')
  const [showSkillModal, setShowSkillModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [skillForm, setSkillForm] = useState({ skillName: '', skillCategory: '', description: '', isActive: true })
  const [assignForm, setAssignForm] = useState({ employeeId: '', employeeName: '', skillId: '', skillName: '', proficiency: 'beginner' })

  async function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (empFilter) params.set('employeeId', empFilter)
    const [sRes, esRes] = await Promise.all([
      fetch('/api/hr/skills'),
      fetch(`/api/hr/skills?type=employee${empFilter ? `&employeeId=${empFilter}` : ''}`),
    ])
    setSkills(await sRes.json())
    setEmployeeSkills(await esRes.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [empFilter])

  async function handleSkillSubmit(e: React.FormEvent) {
    e.preventDefault()
    await fetch('/api/hr/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(skillForm),
    })
    setShowSkillModal(false)
    load()
  }

  async function handleAssignSubmit(e: React.FormEvent) {
    e.preventDefault()
    const skill = skills.find((s) => s.id === assignForm.skillId)
    await fetch('/api/hr/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'employee', ...assignForm, skillName: skill?.skillName ?? assignForm.skillName }),
    })
    setShowAssignModal(false)
    load()
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Zap className="w-7 h-7 text-emerald-400" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Skills & Competencies</h1>
            <p className="text-zinc-400 text-sm mt-0.5">Library and employee skill assignments</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left — Skills Library */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <h2 className="font-medium text-sm">Skills Library</h2>
              <button
                onClick={() => { setSkillForm({ skillName: '', skillCategory: '', description: '', isActive: true }); setShowSkillModal(true) }}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Skill
              </button>
            </div>
            {loading ? (
              <div className="flex-1 flex items-center justify-center py-12 text-zinc-500">Loading…</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-zinc-400 border-b border-zinc-800">
                    <th className="text-left px-4 py-3 font-medium">Skill</th>
                    <th className="text-left px-4 py-3 font-medium">Category</th>
                    <th className="text-center px-4 py-3 font-medium">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {skills.length === 0 && (
                    <tr><td colSpan={3} className="text-center py-10 text-zinc-500">No skills yet</td></tr>
                  )}
                  {skills.map((s) => (
                    <tr key={s.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-2.5 font-medium">{s.skillName}</td>
                      <td className="px-4 py-2.5 text-zinc-400 text-xs">{s.skillCategory}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={cn('w-2 h-2 rounded-full inline-block', s.isActive ? 'bg-emerald-400' : 'bg-zinc-600')} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Right — Employee Skills */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <h2 className="font-medium text-sm">Employee Skills</h2>
              <div className="flex items-center gap-2">
                <input
                  placeholder="Filter by Employee ID"
                  value={empFilter}
                  onChange={(e) => setEmpFilter(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-500 w-40"
                />
                <button
                  onClick={() => { setAssignForm({ employeeId: '', employeeName: '', skillId: '', skillName: '', proficiency: 'beginner' }); setShowAssignModal(true) }}
                  className="flex items-center gap-1.5 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  Assign
                </button>
              </div>
            </div>
            {loading ? (
              <div className="flex-1 flex items-center justify-center py-12 text-zinc-500">Loading…</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-zinc-400 border-b border-zinc-800">
                    <th className="text-left px-4 py-3 font-medium">Employee</th>
                    <th className="text-left px-4 py-3 font-medium">Skill</th>
                    <th className="text-center px-4 py-3 font-medium">Level</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeSkills.length === 0 && (
                    <tr><td colSpan={3} className="text-center py-10 text-zinc-500">No assignments yet</td></tr>
                  )}
                  {employeeSkills.map((es) => (
                    <tr key={es.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-2.5 text-zinc-300">{es.employeeName || es.employeeId}</td>
                      <td className="px-4 py-2.5 font-medium">{es.skillName}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', PROFICIENCY_COLORS[es.proficiency] ?? 'bg-zinc-700 text-zinc-400')}>
                          {es.proficiency}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add Skill Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-5">Add Skill to Library</h2>
            <form onSubmit={handleSkillSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Skill Name *</label>
                <input required value={skillForm.skillName} onChange={(e) => setSkillForm({ ...skillForm, skillName: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Category *</label>
                <input required value={skillForm.skillCategory} onChange={(e) => setSkillForm({ ...skillForm, skillCategory: e.target.value })} placeholder="e.g. Technical, Leadership" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Description</label>
                <textarea rows={2} value={skillForm.description} onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowSkillModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Skill Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-5">Assign Skill to Employee</h2>
            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Employee Name</label>
                <input value={assignForm.employeeName} onChange={(e) => setAssignForm({ ...assignForm, employeeName: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Employee ID *</label>
                <input required value={assignForm.employeeId} onChange={(e) => setAssignForm({ ...assignForm, employeeId: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Skill *</label>
                <select required value={assignForm.skillId} onChange={(e) => setAssignForm({ ...assignForm, skillId: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500">
                  <option value="">— Select skill —</option>
                  {skills.filter((s) => s.isActive).map((s) => (
                    <option key={s.id} value={s.id}>{s.skillName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Proficiency</label>
                <select value={assignForm.proficiency} onChange={(e) => setAssignForm({ ...assignForm, proficiency: e.target.value })} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAssignModal(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
