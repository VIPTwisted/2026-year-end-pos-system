'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

type AssetClass = { id: string; code: string; name: string }

type Props = {
  classes: AssetClass[]
}

export default function AddClassForm({ classes }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<'class' | 'subclass'>('class')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Class form
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')

  // Subclass form
  const [subCode, setSubCode] = useState('')
  const [subName, setSubName] = useState('')
  const [parentClassId, setParentClassId] = useState('')

  async function handleAddClass(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const res = await fetch('/api/fixed-assets/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), name: name.trim(), description: desc.trim() || null }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); return }
      setSuccess(`Class "${data.code}" created.`)
      setCode('')
      setName('')
      setDesc('')
      router.refresh()
    } catch { setError('Network error') } finally { setSaving(false) }
  }

  async function handleAddSubclass(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const res = await fetch('/api/fixed-assets/subclasses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: subCode.trim(),
          name: subName.trim(),
          classId: parentClassId || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed'); return }
      setSuccess(`Subclass "${data.code}" created.`)
      setSubCode('')
      setSubName('')
      setParentClassId('')
      router.refresh()
    } catch { setError('Network error') } finally { setSaving(false) }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors'
  const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5'

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center gap-1 mb-5 bg-zinc-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => { setTab('class'); setError(''); setSuccess('') }}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === 'class' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-100'}`}
        >
          Add Class
        </button>
        <button
          onClick={() => { setTab('subclass'); setError(''); setSuccess('') }}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${tab === 'subclass' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-100'}`}
        >
          Add Subclass
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mb-4 text-sm text-red-400">{error}</div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2 mb-4 text-sm text-emerald-400">{success}</div>
      )}

      {tab === 'class' && (
        <form onSubmit={handleAddClass} className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Code <span className="text-red-400">*</span></label>
            <input className={inputCls} value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. EQUIP" required />
          </div>
          <div>
            <label className={labelCls}>Name <span className="text-red-400">*</span></label>
            <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Equipment" required />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <input className={inputCls} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Optional" />
          </div>
          <div className="col-span-3 flex justify-end">
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white gap-2 h-9">
              <Plus className="w-4 h-4" />
              {saving ? 'Adding…' : 'Add Class'}
            </Button>
          </div>
        </form>
      )}

      {tab === 'subclass' && (
        <form onSubmit={handleAddSubclass} className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Code <span className="text-red-400">*</span></label>
            <input className={inputCls} value={subCode} onChange={e => setSubCode(e.target.value)} placeholder="e.g. COMP" required />
          </div>
          <div>
            <label className={labelCls}>Name <span className="text-red-400">*</span></label>
            <input className={inputCls} value={subName} onChange={e => setSubName(e.target.value)} placeholder="e.g. Computers" required />
          </div>
          <div>
            <label className={labelCls}>Parent Class</label>
            <select className={inputCls} value={parentClassId} onChange={e => setParentClassId(e.target.value)}>
              <option value="">None</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
              ))}
            </select>
          </div>
          <div className="col-span-3 flex justify-end">
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white gap-2 h-9">
              <Plus className="w-4 h-4" />
              {saving ? 'Adding…' : 'Add Subclass'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
