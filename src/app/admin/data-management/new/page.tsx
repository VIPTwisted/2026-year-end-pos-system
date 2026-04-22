'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

const ENTITIES = ['Customers', 'Products', 'Orders', 'Inventory', 'Vendors', 'Employees', 'GLAccounts']
const FORMATS = ['csv', 'xlsx', 'json', 'xml']

export default function NewDataJobPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultType = searchParams.get('type') ?? 'import'

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    jobName: '',
    jobType: defaultType,
    entityName: 'Customers',
    fileFormat: 'csv',
    fileUrl: '',
    scheduleMode: 'now',
    scheduledFor: '',
  })

  function set(field: string, val: string) {
    setForm(prev => ({ ...prev, [field]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/data-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobName: form.jobName,
          jobType: form.jobType,
          entityName: form.entityName,
          fileFormat: form.fileFormat,
          fileUrl: form.fileUrl || null,
          scheduledFor: form.scheduleMode === 'scheduled' ? form.scheduledFor : null,
        }),
      })
      if (!res.ok) throw new Error('Failed to create job')
      const job = await res.json()
      router.push(`/admin/data-management/${job.id}`)
    } catch {
      setError('Failed to start job. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar
        title="New Data Job"
        breadcrumb={[
          { label: 'Admin', href: '/admin/users' },
          { label: 'Data Management', href: '/admin/data-management' },
        ]}
      />
      <main className="flex-1 p-6 bg-[#0f0f1a] min-h-screen">
        <div className="max-w-xl">
          <Link href="/admin/data-management" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 mb-6">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-zinc-200 mb-5">Job Setup</h2>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Job Type */}
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Job Type</Label>
                <div className="flex gap-2">
                  {['import', 'export'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set('jobType', t)}
                      className={`px-4 py-1.5 rounded text-xs font-medium capitalize transition-colors border ${
                        form.jobType === t
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-transparent border-zinc-700 text-zinc-400 hover:border-zinc-500'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job Name */}
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Job Name</Label>
                <Input
                  required
                  placeholder="e.g. Customer Import Q1 2026"
                  value={form.jobName}
                  onChange={e => set('jobName', e.target.value)}
                />
              </div>

              {/* Entity */}
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Entity</Label>
                <select
                  className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-200 text-sm px-3"
                  value={form.entityName}
                  onChange={e => set('entityName', e.target.value)}
                >
                  {ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>

              {/* File Format */}
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">File Format</Label>
                <div className="flex gap-2">
                  {FORMATS.map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => set('fileFormat', f)}
                      className={`px-3 py-1.5 rounded text-xs font-mono uppercase transition-colors border ${
                        form.fileFormat === f
                          ? 'bg-zinc-700 border-zinc-600 text-zinc-100'
                          : 'bg-transparent border-zinc-700 text-zinc-500 hover:border-zinc-500'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* File URL (import only) */}
              {form.jobType === 'import' && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">File URL / Path <span className="text-zinc-600">(optional)</span></Label>
                  <Input
                    placeholder="https://... or leave blank for manual upload"
                    value={form.fileUrl}
                    onChange={e => set('fileUrl', e.target.value)}
                  />
                </div>
              )}

              {/* Schedule */}
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Schedule</Label>
                <div className="flex gap-2">
                  {[['now', 'Run Now'], ['scheduled', 'Schedule']].map(([val, lbl]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => set('scheduleMode', val)}
                      className={`px-4 py-1.5 rounded text-xs font-medium transition-colors border ${
                        form.scheduleMode === val
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-transparent border-zinc-700 text-zinc-400 hover:border-zinc-500'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
                {form.scheduleMode === 'scheduled' && (
                  <Input
                    type="datetime-local"
                    value={form.scheduledFor}
                    onChange={e => set('scheduledFor', e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                  {saving ? 'Starting...' : 'Start Job'}
                </Button>
                <Link href="/admin/data-management">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
