'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, Tag, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Category { id: string; code: string; description: string | null; indentationLevel: number }

const inputCls = 'w-full bg-zinc-900 border border-zinc-700/60 rounded px-3 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors'
const labelCls = 'block text-[11px] font-medium text-zinc-500 mb-1 uppercase tracking-wide'

function FastTab({ title, open = true, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
      <summary className="px-4 py-3 text-sm font-semibold text-zinc-200 cursor-pointer hover:bg-zinc-900/30 list-none flex items-center justify-between select-none">
        <span>{title}</span>
        <span className="text-zinc-600 text-[10px]">▼</span>
      </summary>
      <div className="px-4 pb-4 pt-3 border-t border-zinc-800/40">
        {children}
      </div>
    </details>
  )
}

export default function NewItemCategoryPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<Category[]>([])

  const [form, setForm] = useState({
    code: '',
    description: '',
    parentId: '',
    defCostingMethod: 'FIFO',
    imageUrl: '',
  })

  useEffect(() => {
    fetch('/api/inventory/item-categories')
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [])

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSave() {
    setError('')
    if (!form.code.trim()) { setError('Code is required'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/inventory/item-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          description: form.description.trim() || null,
          parentId: form.parentId || null,
          defCostingMethod: form.defCostingMethod,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Save failed'); setSaving(false); return }
      router.push(`/inventory/item-categories/${data.id}`)
    } catch {
      setError('Network error')
      setSaving(false)
    }
  }

  const indentLabel = (cat: Category) =>
    '\u00a0'.repeat(cat.indentationLevel * 4) + cat.code + (cat.description ? ` – ${cat.description}` : '')

  return (
    <>
      <TopBar title="New Item Category" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Header Band */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/inventory/item-categories"
              className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Item Categories
            </Link>
            <span className="text-zinc-700">›</span>
            <Tag className="w-4 h-4 text-zinc-400" />
            <span className="font-bold text-base text-zinc-100">New Item Category</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/inventory/item-categories"
              className="h-7 px-3 text-[12px] font-medium text-zinc-300 border border-zinc-700 hover:border-zinc-500 rounded transition-colors">
              Discard
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="h-7 px-3 text-[12px] font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded transition-colors inline-flex items-center gap-1.5">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-4 px-4 py-2.5 rounded bg-red-500/10 border border-red-500/30 text-[13px] text-red-400">
            {error}
          </div>
        )}

        <div className="px-6 py-4 max-w-2xl space-y-3">

          <FastTab title="General">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className={labelCls}>Code <span className="text-red-400">*</span></label>
                <input
                  value={form.code}
                  onChange={set('code')}
                  placeholder="e.g. ELECTRONICS"
                  className={inputCls}
                  autoFocus
                />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <input
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Category description"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Parent Category</label>
                <select value={form.parentId} onChange={set('parentId')} className={inputCls}>
                  <option value="">(No Parent — Top Level)</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{indentLabel(cat)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Def. Costing Method</label>
                <select value={form.defCostingMethod} onChange={set('defCostingMethod')} className={inputCls}>
                  <option value="FIFO">FIFO</option>
                  <option value="LIFO">LIFO</option>
                  <option value="Average">Average</option>
                  <option value="Standard">Standard</option>
                  <option value="Specific">Specific</option>
                </select>
              </div>
            </div>
          </FastTab>

        </div>
      </main>
    </>
  )
}
