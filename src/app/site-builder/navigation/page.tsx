'use client'
import { useState, useEffect } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react'

type NavItem = {
  id: string
  label: string
  href: string | null
  pageId: string | null
  parentId: string | null
  sortOrder: number
  isExternal: boolean
  navZone: string
  children: NavItem[]
}

const BLANK: Partial<NavItem> = { label: '', href: '', navZone: 'primary', sortOrder: 0, isExternal: false }

export default function SiteNavigationPage() {
  const [items, setItems] = useState<NavItem[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<Partial<NavItem>>(BLANK)
  const [editing, setEditing] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [zone, setZone] = useState('primary')

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/site/nav?zone=${zone}`)
    setItems(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [zone])

  async function save() {
    setSaving(true)
    if (editing) {
      await fetch(`/api/site/nav/${editing}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    } else {
      await fetch('/api/site/nav', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, navZone: zone }) })
    }
    setSaving(false); setShowForm(false); setEditing(null); setForm(BLANK); load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this nav item?')) return
    await fetch(`/api/site/nav/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <TopBar title="Navigation" />
      <div className="flex-1 overflow-auto p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {['primary', 'footer', 'utility'].map(z => (
              <Button key={z} size="sm" variant={zone === z ? 'default' : 'outline'}
                className={zone === z ? 'bg-blue-600 hover:bg-blue-700' : 'border-zinc-700 text-zinc-300'}
                onClick={() => setZone(z)}>
                {z.charAt(0).toUpperCase() + z.slice(1)}
              </Button>
            ))}
          </div>
          <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700" onClick={() => { setForm(BLANK); setEditing(null); setShowForm(true) }}>
            <Plus className="w-3 h-3" /> Add Item
          </Button>
        </div>

        {showForm && (
          <Card className="bg-zinc-900 border-blue-600/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm text-zinc-100">{editing ? 'Edit Nav Item' : 'New Nav Item'}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Label</label>
                  <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    value={form.label ?? ''} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">URL / Path</label>
                  <input className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
                    value={form.href ?? ''} onChange={e => setForm(f => ({ ...f, href: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Sort Order</label>
                  <input type="number" className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                    value={form.sortOrder ?? 0} onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input type="checkbox" className="accent-blue-600" checked={!!form.isExternal} onChange={e => setForm(f => ({ ...f, isExternal: e.target.checked }))} />
                Opens in new tab (external link)
              </label>
              <div className="flex gap-2 pt-1">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
                <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300" onClick={() => { setShowForm(false); setEditing(null); setForm(BLANK) }}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4">
            {loading ? (
              <div className="text-sm text-zinc-500 py-8 text-center">Loading…</div>
            ) : items.length === 0 ? (
              <div className="text-sm text-zinc-500 py-8 text-center">No {zone} nav items yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                    <th className="text-left py-2 font-medium w-6"></th>
                    <th className="text-left py-2 font-medium">Label</th>
                    <th className="text-left py-2 font-medium">URL</th>
                    <th className="text-left py-2 font-medium">Order</th>
                    <th className="text-left py-2 font-medium">External</th>
                    <th className="text-right py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-2 text-zinc-600"><GripVertical className="w-4 h-4" /></td>
                      <td className="py-2 text-zinc-200 font-medium">{item.label}</td>
                      <td className="py-2 text-zinc-400 font-mono text-xs">{item.href}</td>
                      <td className="py-2 text-zinc-400">{item.sortOrder}</td>
                      <td className="py-2">{item.isExternal && <Badge variant="outline" className="text-xs">External</Badge>}</td>
                      <td className="py-2 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-zinc-400 hover:text-zinc-100" onClick={() => { setForm(item); setEditing(item.id); setShowForm(true) }}><Pencil className="w-3 h-3" /></Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-red-400 hover:text-red-300" onClick={() => remove(item.id)}><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
