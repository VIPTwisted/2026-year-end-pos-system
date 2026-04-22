'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Clock } from 'lucide-react'

type Resource = { id: string; resourceNo: string; name: string }
type Project = { id: string; projectNo: string; description: string }

export default function NewTimesheetPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resources, setResources] = useState<Resource[]>([])
  const [projects, setProjects] = useState<Project[]>([])

  const [form, setForm] = useState({
    resourceId: '',
    employeeId: '',
    startDate: '',
    endDate: '',
    projectId: '',
  })

  useEffect(() => {
    fetch('/api/resources').then(r => r.json()).then(setResources).catch(() => {})
    fetch('/api/projects').then(r => r.json()).then(setProjects).catch(() => {})
  }, [])

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.resourceId || !form.startDate || !form.endDate) {
      setError('Resource, start date, and end date are required')
      return
    }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/timesheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId: form.resourceId,
          employeeId: form.employeeId || undefined,
          startDate: form.startDate,
          endDate: form.endDate,
          projectId: form.projectId || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push(`/timesheets/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
  const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'

  return (
    <>
      <TopBar title="New Timesheet" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-lg mx-auto">
          <Link href="/timesheets" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Timesheets
          </Link>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-400" />
                Create Timesheet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className={labelCls}>Resource <span className="text-red-400">*</span></label>
                  <select value={form.resourceId} onChange={set('resourceId')} className={inputCls} required>
                    <option value="">— Select resource —</option>
                    {resources.map(r => (
                      <option key={r.id} value={r.id}>{r.resourceNo} — {r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Employee ID</label>
                  <input type="text" value={form.employeeId} onChange={set('employeeId')} placeholder="Optional employee reference" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Start Date <span className="text-red-400">*</span></label>
                    <input type="date" value={form.startDate} onChange={set('startDate')} className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>End Date <span className="text-red-400">*</span></label>
                    <input type="date" value={form.endDate} onChange={set('endDate')} className={inputCls} required />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Project (optional)</label>
                  <select value={form.projectId} onChange={set('projectId')} className={inputCls}>
                    <option value="">— No project —</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.projectNo} — {p.description}</option>
                    ))}
                  </select>
                </div>
                {error && (
                  <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
                )}
                <div className="flex items-center justify-end gap-3 pt-1">
                  <Link href="/timesheets">
                    <Button type="button" variant="outline" size="sm">Cancel</Button>
                  </Link>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? 'Creating…' : 'Create Timesheet'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
