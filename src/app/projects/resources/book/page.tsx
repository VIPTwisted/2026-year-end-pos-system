'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, BookOpen } from 'lucide-react'

type Resource = { id: string; resourceNo: string; name: string; capacity: number }
type Project = { id: string; projectNo: string; description: string }

export default function BookResourcePage() {
  const router = useRouter()

  const [resources, setResources] = useState<Resource[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    resourceId: '',
    projectId: '',
    startDate: '',
    endDate: '',
    hours: '',
    status: 'soft',
    notes: '',
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/resources').then(r => r.ok ? r.json() : []),
      fetch('/api/projects').then(r => r.ok ? r.json() : []),
    ])
      .then(([res, proj]: [Resource[], Project[]]) => {
        setResources(res)
        setProjects(proj)
        if (res.length > 0) setForm(p => ({ ...p, resourceId: res[0].id }))
        if (proj.length > 0) setForm(p => ({ ...p, projectId: proj[0].id }))
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.resourceId || !form.startDate || !form.endDate || !form.hours) {
      setError('Resource, dates, and hours are required.')
      return
    }
    const startMs = new Date(form.startDate).getTime()
    const endMs = new Date(form.endDate).getTime()
    if (endMs < startMs) {
      setError('End date must be on or after start date.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/resources/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId: form.resourceId,
          projectId: form.projectId || null,
          startDate: form.startDate,
          endDate: form.endDate,
          hours: parseFloat(form.hours),
          status: form.status,
          notes: form.notes || null,
        }),
      })
      if (!res.ok) {
        const err: { error?: string } = await res.json()
        setError(err.error ?? 'Booking failed')
        return
      }
      router.push('/projects/resources')
    } catch {
      setError('Network error — booking failed.')
    } finally {
      setSaving(false)
    }
  }

  const field = (label: string, content: React.ReactNode) => (
    <div>
      <label className="text-xs text-zinc-500 block mb-1">{label}</label>
      {content}
    </div>
  )

  return (
    <>
      <TopBar title="Book Resource" />
      <main className="flex-1 p-6 overflow-auto">
        <Link href="/projects/resources" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Resources
        </Link>

        <Card className="max-w-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-zinc-400" />
              New Resource Booking
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-xs text-zinc-600">Loading…</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {field('Resource *',
                    <select
                      value={form.resourceId}
                      onChange={e => setForm(p => ({ ...p, resourceId: e.target.value }))}
                      required
                      className="w-full h-9 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 px-2 focus:outline-none focus:border-blue-500"
                    >
                      {resources.map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.resourceNo})</option>
                      ))}
                    </select>
                  )}
                  {field('Project',
                    <select
                      value={form.projectId}
                      onChange={e => setForm(p => ({ ...p, projectId: e.target.value }))}
                      className="w-full h-9 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 px-2 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">— No Project —</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.projectNo} — {p.description}</option>
                      ))}
                    </select>
                  )}
                  {field('Start Date *',
                    <Input
                      type="date"
                      value={form.startDate}
                      onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                      required
                      className="h-9 text-xs"
                    />
                  )}
                  {field('End Date *',
                    <Input
                      type="date"
                      value={form.endDate}
                      onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                      required
                      className="h-9 text-xs"
                    />
                  )}
                  {field('Effort Hours *',
                    <Input
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={form.hours}
                      onChange={e => setForm(p => ({ ...p, hours: e.target.value }))}
                      placeholder="8"
                      required
                      className="h-9 text-xs"
                    />
                  )}
                  {field('Booking Status',
                    <select
                      value={form.status}
                      onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                      className="w-full h-9 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 px-2 focus:outline-none focus:border-blue-500"
                    >
                      <option value="soft">Soft (Tentative)</option>
                      <option value="hard">Hard (Confirmed)</option>
                    </select>
                  )}
                </div>
                {field('Notes',
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                    rows={3}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 px-3 py-2 focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Optional notes…"
                  />
                )}

                {error && (
                  <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded px-3 py-2">{error}</p>
                )}

                <div className="flex gap-2 pt-1">
                  <Button type="submit" disabled={saving} className="text-xs">
                    {saving ? 'Booking…' : 'Confirm Booking'}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => router.back()} className="text-xs">
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  )
}
