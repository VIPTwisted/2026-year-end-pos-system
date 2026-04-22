'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const LINE_TYPES = ['Resource', 'Item', 'G/L Account']

interface Line {
  id: string
  dayOfWeek: string
  lineType: string
  projectNo: string
  taskNo: string
  description: string
  hours: string
}

function makeLines(): Line[] {
  return DAYS.map((day, i) => ({
    id: String(i),
    dayOfWeek: day,
    lineType: 'Resource',
    projectNo: '',
    taskNo: '',
    description: '',
    hours: '0',
  }))
}

export default function NewTimesheetPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - today.getDay() + 1)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const fmt = (d: Date) => d.toISOString().split('T')[0]

  const [resourceNo, setResourceNo] = useState('')
  const [startDate, setStartDate] = useState(fmt(monday))
  const [endDate, setEndDate] = useState(fmt(sunday))
  const [lines, setLines] = useState<Line[]>(makeLines())

  const updateLine = (id: string, field: keyof Line, value: string) => {
    setLines(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))
  }

  const addLine = () => {
    setLines(prev => [...prev, {
      id: String(Date.now()),
      dayOfWeek: 'Mon',
      lineType: 'Resource',
      projectNo: '',
      taskNo: '',
      description: '',
      hours: '0',
    }])
  }

  const removeLine = (id: string) => {
    setLines(prev => prev.filter(l => l.id !== id))
  }

  const totalHours = lines.reduce((s, l) => s + (parseFloat(l.hours) || 0), 0)

  const handleSubmit = async () => {
    if (!resourceNo.trim()) { setError('Resource No. is required'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/projects/timesheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceNo,
          startDate,
          endDate,
          lines: lines.map(l => ({
            dayOfWeek: l.dayOfWeek,
            lineType: l.lineType,
            projectNo: l.projectNo || null,
            taskNo: l.taskNo || null,
            description: l.description || null,
            hours: parseFloat(l.hours) || 0,
          })),
        }),
      })
      if (!res.ok) throw new Error('Failed to create timesheet')
      const data = await res.json()
      router.push(`/projects/timesheets/${data.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error')
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="New Timesheet" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5 max-w-5xl">

          {/* Back */}
          <Link href="/projects/timesheets" className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300">
            <ArrowLeft className="w-3 h-3" /> Back to Timesheets
          </Link>

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Projects</p>
              <h2 className="text-[18px] font-semibold text-zinc-100">New Timesheet</h2>
            </div>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-medium"
            >
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Submit'}
            </button>
          </div>

          {error && <div className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">{error}</div>}

          {/* General FastTab */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-zinc-800/40 border-b border-zinc-800/60">
              <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-widest">General</span>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Resource No. *</label>
                <input
                  value={resourceNo}
                  onChange={e => setResourceNo(e.target.value)}
                  placeholder="RES-001"
                  className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-md px-3 py-2 text-[13px] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500/60"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-md px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500/60"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">End Date (auto 7-day)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-zinc-700/50 rounded-md px-3 py-2 text-[13px] text-zinc-100 focus:outline-none focus:border-blue-500/60"
                />
              </div>
            </div>
          </div>

          {/* Lines FastTab */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-zinc-800/40 border-b border-zinc-800/60 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-widest">Timesheet Lines</span>
              <button onClick={addLine} className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300">
                <Plus className="w-3 h-3" /> Add Line
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-zinc-800/60">
                  <tr>
                    {['Day', 'Type', 'Project No.', 'Task No.', 'Description', 'Hours', ''].map(h => (
                      <th key={h} className={`px-3 py-2 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${h === 'Hours' ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {lines.map(line => (
                    <tr key={line.id} className="hover:bg-zinc-800/20">
                      <td className="px-3 py-2">
                        <select
                          value={line.dayOfWeek}
                          onChange={e => updateLine(line.id, 'dayOfWeek', e.target.value)}
                          className="bg-zinc-900/60 border border-zinc-700/50 rounded px-2 py-1 text-[12px] text-zinc-100 focus:outline-none focus:border-blue-500/60 w-20"
                        >
                          {DAYS.map(d => <option key={d}>{d}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={line.lineType}
                          onChange={e => updateLine(line.id, 'lineType', e.target.value)}
                          className="bg-zinc-900/60 border border-zinc-700/50 rounded px-2 py-1 text-[12px] text-zinc-100 focus:outline-none focus:border-blue-500/60"
                        >
                          {LINE_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input value={line.projectNo} onChange={e => updateLine(line.id, 'projectNo', e.target.value)} placeholder="PROJ-001" className="w-24 bg-zinc-900/60 border border-zinc-700/50 rounded px-2 py-1 text-[12px] text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-blue-500/60" />
                      </td>
                      <td className="px-3 py-2">
                        <input value={line.taskNo} onChange={e => updateLine(line.id, 'taskNo', e.target.value)} placeholder="TASK-01" className="w-20 bg-zinc-900/60 border border-zinc-700/50 rounded px-2 py-1 text-[12px] text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-blue-500/60" />
                      </td>
                      <td className="px-3 py-2">
                        <input value={line.description} onChange={e => updateLine(line.id, 'description', e.target.value)} placeholder="Description" className="w-40 bg-zinc-900/60 border border-zinc-700/50 rounded px-2 py-1 text-[12px] text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-blue-500/60" />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input type="number" min="0" step="0.5" value={line.hours} onChange={e => updateLine(line.id, 'hours', e.target.value)} className="w-16 text-right bg-zinc-900/60 border border-zinc-700/50 rounded px-2 py-1 text-[12px] text-zinc-100 focus:outline-none focus:border-blue-500/60" />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button onClick={() => removeLine(line.id)} className="text-zinc-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-zinc-800/60">
                  <tr>
                    <td colSpan={5} className="px-3 py-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-widest text-right">Total</td>
                    <td className="px-3 py-2 text-right text-[13px] font-bold text-zinc-100 tabular-nums">{totalHours.toFixed(2)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
