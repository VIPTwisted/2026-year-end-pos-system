'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Loader2, Network, ChevronRight } from 'lucide-react'
import Link from 'next/link'

type OrgUnit = {
  id: string
  name: string
  unitType: string
  code: string
  parentId: string | null
  managerId: string | null
  description: string | null
  isActive: boolean
  sortOrder: number
  children: OrgUnit[]
}

const UNIT_TYPES = ['company', 'division', 'department', 'team', 'store', 'warehouse']

export default function EditOrgUnitPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [allUnits, setAllUnits] = useState<OrgUnit[]>([])
  const [unit, setUnit] = useState<OrgUnit | null>(null)
  const [form, setForm] = useState({
    name: '',
    unitType: 'department',
    code: '',
    parentId: '',
    managerId: '',
    description: '',
    isActive: true,
  })

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/org-hierarchy/${params.id}`).then(r => r.json()),
      fetch('/api/admin/org-hierarchy').then(r => r.json()),
    ]).then(([u, all]) => {
      setUnit(u)
      setAllUnits(all)
      setForm({
        name: u.name,
        unitType: u.unitType,
        code: u.code,
        parentId: u.parentId ?? '',
        managerId: u.managerId ?? '',
        description: u.description ?? '',
        isActive: u.isActive,
      })
    }).catch(() => setError('Failed to load'))
  }, [params.id])

  function set(field: string, val: string | boolean) {
    setForm(prev => ({ ...prev, [field]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/org-hierarchy/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          parentId: form.parentId || null,
          managerId: form.managerId || null,
          description: form.description || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to update')
      router.push('/admin/org-hierarchy')
    } catch {
      setError('Failed to update org unit')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this org unit? Children will be unparented.')) return
    setDeleting(true)
    await fetch(`/api/admin/org-hierarchy/${params.id}`, { method: 'DELETE' })
    router.push('/admin/org-hierarchy')
  }

  if (!unit) {
    return (
      <>
        <TopBar title="Edit Org Unit" />
        <main className="flex-1 p-6 bg-[#0f0f1a] min-h-screen">
          <p className="text-xs text-zinc-600">Loading...</p>
        </main>
      </>
    )
  }

  return (
    <>
      <TopBar
        title={`Edit: ${unit.name}`}
        breadcrumb={[
          { label: 'Admin', href: '/admin/users' },
          { label: 'Org Hierarchy', href: '/admin/org-hierarchy' },
        ]}
      />
      <main className="flex-1 p-6 bg-[#0f0f1a] min-h-screen space-y-6">
        <Link href="/admin/org-hierarchy" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>

        <div className="max-w-xl">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
            <h2 className="text-sm font-semibold text-zinc-200 mb-5">Edit Org Unit</h2>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Name</Label>
                  <Input required value={form.name} onChange={e => set('name', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Code</Label>
                  <Input required value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} className="font-mono" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Unit Type</Label>
                <select
                  className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-200 text-sm px-3"
                  value={form.unitType}
                  onChange={e => set('unitType', e.target.value)}
                >
                  {UNIT_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Parent Unit</Label>
                <select
                  className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 text-zinc-200 text-sm px-3"
                  value={form.parentId}
                  onChange={e => set('parentId', e.target.value)}
                >
                  <option value="">— No parent</option>
                  {allUnits.filter(u => u.id !== params.id).map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Manager ID</Label>
                  <Input value={form.managerId} onChange={e => set('managerId', e.target.value)} />
                </div>
                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={e => set('isActive', e.target.checked)}
                      className="accent-blue-600"
                    />
                    <span className="text-xs text-zinc-400">Active</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Description</Label>
                <Input value={form.description} onChange={e => set('description', e.target.value)} />
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Delete'}
                </Button>
              </div>
            </form>
          </div>

          {/* Children list */}
          {unit.children?.length > 0 && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg mt-4 overflow-hidden">
              <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
                <Network className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-200">Child Units ({unit.children.length})</h3>
              </div>
              {unit.children.map(child => (
                <Link key={child.id} href={`/admin/org-hierarchy/${child.id}`}>
                  <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/30 border-b border-zinc-800/30 last:border-0 transition-colors">
                    <span className="text-sm text-zinc-300">{child.name}</span>
                    <span className="text-xs text-zinc-600 font-mono">{child.code}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-600 ml-auto" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}
