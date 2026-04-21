'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Employee = {
  id: string
  position: string
  department: string | null
  hourlyRate: number | null
  isActive: boolean
}

export function EmployeeActions({ employee }: { employee: Employee }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    position: employee.position,
    department: employee.department ?? '',
    hourlyRate: employee.hourlyRate != null ? String(employee.hourlyRate) : '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)

    const payload: Record<string, unknown> = {
      position: form.position.trim(),
      department: form.department.trim() || null,
      hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : null,
    }

    try {
      const res = await fetch(`/api/hr/employees/${employee.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const json = (await res.json()) as { error?: string }
        throw new Error(json.error ?? 'Update failed')
      }

      setEditing(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive() {
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/hr/employees/${employee.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !employee.isActive }),
      })

      if (!res.ok) {
        const json = (await res.json()) as { error?: string }
        throw new Error(json.error ?? 'Update failed')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  const inputCls =
    'w-full rounded-md bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm px-3 py-2 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500'
  const labelCls = 'block text-xs text-zinc-500 uppercase tracking-wide mb-1'

  return (
    <Card>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wide">
            Edit Employee
          </h3>
          <div className="flex items-center gap-2">
            {!editing && (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                Edit
              </Button>
            )}
            <Button
              size="sm"
              variant={employee.isActive ? 'destructive' : 'outline'}
              disabled={saving}
              onClick={handleToggleActive}
            >
              {employee.isActive ? 'Deactivate' : 'Reactivate'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-900/30 border border-red-700 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        {editing ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="ea-position" className={labelCls}>Position</label>
              <input
                id="ea-position"
                name="position"
                type="text"
                value={form.position}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="ea-department" className={labelCls}>Department</label>
              <input
                id="ea-department"
                name="department"
                type="text"
                value={form.department}
                onChange={handleChange}
                className={inputCls}
                placeholder="e.g. Sales"
              />
            </div>
            <div>
              <label htmlFor="ea-hourlyRate" className={labelCls}>Hourly Rate ($)</label>
              <input
                id="ea-hourlyRate"
                name="hourlyRate"
                type="number"
                step="0.01"
                min="0"
                value={form.hourlyRate}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button size="sm" disabled={saving} onClick={handleSave}>
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditing(false)
                  setError(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Position</p>
              <p className="text-zinc-200">{employee.position}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Department</p>
              <p className="text-zinc-200">{employee.department ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Status</p>
              <Badge variant={employee.isActive ? 'success' : 'destructive'}>
                {employee.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
