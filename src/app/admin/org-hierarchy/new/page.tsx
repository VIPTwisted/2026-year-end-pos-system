'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

type OrgUnit = { id: string; name: string; code: string; unitType: string }

const UNIT_TYPES = ['company', 'division', 'department', 'team', 'store', 'warehouse']

export default function NewOrgUnitPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [units, setUnits] = useState<OrgUnit[]>([])
  const [form, setForm] = useState({
    name: '',
    unitType: 'department',
    code: '',
    parentId: '',
    managerId: '',
    description: '',
  })

  useEffect(() => {
    fetch('/api/admin/org-hierarchy')
      .then(r => r.json())
      .then(setUnits)
      .catch(() => {})
  }, [])

  function set(field: string, val: string) {
    setForm(prev => ({ ...prev, [field]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/org-hierarchy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          parentId: form.parentId || null,
          managerId: form.managerId || null,
          description: form.description || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create org unit')
      }
      router.push('/admin/org-hierarchy')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create org unit')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar
        title="Add Org Unit"
        breadcrumb={[
          { label: 'Admin', href: '/admin/users' },
          { label: 'Org Hierarchy', href: '/admin/org-hierarchy' },
        ]}
      />
      <main className="flex-1 p-6 bg-[#0f0f1a] min-h-screen">
        <div className="max-w-xl">
          <Link href="/admin/org-hierarchy" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 mb-6">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-zinc-200 mb-5">New Org Unit</h2>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Name</Label>
                  <Input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Sales Department" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Code</Label>
                  <Input required value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="e.g. SALES-01" className="font-mono" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Unit Type</Label>
                <select
                  className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-200 text-sm px-3 capitalize"
                  value={form.unitType}
                  onChange={e => set('unitType', e.target.value)}
                >
                  {UNIT_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Parent Unit <span className="text-zinc-600">(optional)</span></Label>
                <select
                  className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-200 text-sm px-3"
                  value={form.parentId}
                  onChange={e => set('parentId', e.target.value)}
                >
                  <option value="">— No parent (top level)</option>
                  {units.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.code})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Manager ID <span className="text-zinc-600">(optional)</span></Label>
                <Input value={form.managerId} onChange={e => set('managerId', e.target.value)} placeholder="Employee ID or name" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Description <span className="text-zinc-600">(optional)</span></Label>
                <Input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description" />
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                  {saving ? 'Creating...' : 'Create Unit'}
                </Button>
                <Link href="/admin/org-hierarchy">
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
