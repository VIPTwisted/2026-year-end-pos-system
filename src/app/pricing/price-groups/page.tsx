'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Layers, Plus, ChevronLeft, Pencil, X, Check } from 'lucide-react'

interface PriceGroup {
  id: string
  code: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  _count: { discounts: number }
}

interface FormState {
  code: string
  name: string
  description: string
  isActive: boolean
}

const EMPTY_FORM: FormState = { code: '', name: '', description: '', isActive: true }

export default function PriceGroupsPage() {
  const [groups, setGroups] = useState<PriceGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/pricing/price-groups')
    const data = await res.json()
    setGroups(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setEditId(null)
    setForm(EMPTY_FORM)
    setError('')
    setShowForm(true)
  }

  function openEdit(g: PriceGroup) {
    setEditId(g.id)
    setForm({ code: g.code, name: g.name, description: g.description ?? '', isActive: g.isActive })
    setError('')
    setShowForm(true)
  }

  async function save() {
    if (!form.code.trim() || !form.name.trim()) {
      setError('Code and Name are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      if (editId) {
        await fetch(`/api/pricing/price-groups`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      } else {
        await fetch('/api/pricing/price-groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
      }
      setShowForm(false)
      await load()
    } catch {
      setError('Save failed. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="Price Groups" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/pricing" className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Price Groups</h2>
              <p className="text-sm text-zinc-500">{groups.length} group{groups.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <Button onClick={openNew}>
            <Plus className="w-4 h-4 mr-1" />New Price Group
          </Button>
        </div>

        {/* Create / Edit Form */}
        {showForm && (
          <Card className="border-blue-700/50">
            <CardContent className="pt-5 space-y-4">
              <h3 className="font-semibold text-zinc-100">{editId ? 'Edit Price Group' : 'New Price Group'}</h3>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Code *</label>
                  <Input
                    placeholder="RETAIL"
                    value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    disabled={!!editId}
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Name *</label>
                  <Input
                    placeholder="Retail Customers"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Description</label>
                <Input
                  placeholder="Optional description"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="grp-active"
                  checked={form.isActive}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="accent-blue-500"
                />
                <label htmlFor="grp-active" className="text-sm text-zinc-300">Active</label>
              </div>
              <div className="flex gap-2">
                <Button onClick={save} disabled={saving}>
                  <Check className="w-4 h-4 mr-1" />{saving ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="ghost" onClick={() => setShowForm(false)}>
                  <X className="w-4 h-4 mr-1" />Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        {loading ? (
          <p className="text-sm text-zinc-500">Loading...</p>
        ) : groups.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <Layers className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">No price groups yet. Create one to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left p-4 font-medium">Code</th>
                    <th className="text-left p-4 font-medium">Name</th>
                    <th className="text-left p-4 font-medium">Description</th>
                    <th className="text-right p-4 font-medium">Discounts</th>
                    <th className="text-center p-4 font-medium">Status</th>
                    <th className="text-center p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {groups.map(g => (
                    <tr key={g.id} className="hover:bg-zinc-900/50">
                      <td className="p-4 font-mono text-xs text-zinc-400">{g.code}</td>
                      <td className="p-4 font-semibold text-zinc-100">{g.name}</td>
                      <td className="p-4 text-zinc-500 max-w-xs truncate">{g.description || '—'}</td>
                      <td className="p-4 text-right">
                        <Link href={`/pricing/discounts?priceGroup=${g.id}`} className="text-blue-400 hover:text-blue-300 transition-colors">
                          {g._count.discounts}
                        </Link>
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant={g.isActive ? 'success' : 'secondary'}>{g.isActive ? 'Active' : 'Inactive'}</Badge>
                      </td>
                      <td className="p-4 text-center">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(g)}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}
