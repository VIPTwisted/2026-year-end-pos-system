'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { ArrowLeft, SlidersHorizontal } from 'lucide-react'

const inputCls = 'w-full bg-zinc-900 border border-zinc-700/60 rounded px-3 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors'
const labelCls = 'block text-[11px] font-medium text-zinc-500 mb-1 uppercase tracking-wide'

const ATTR_TYPES = ['Text', 'Integer', 'Decimal', 'Option']

export default function NewItemAttributePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    attributeType: 'Text',
    unitOfMeasure: '',
    blocked: false,
  })

  const set = (field: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Name is required.')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/inventory/item-attributes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          attributeType: form.attributeType,
          unitOfMeasure: form.unitOfMeasure || undefined,
          blocked: form.blocked,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Failed to create attribute.')
        return
      }
      router.push('/inventory/item-attributes')
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <TopBar title="New Item Attribute" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        <div className="bg-[#16213e] border-b border-zinc-800/50 px-4 py-2 flex items-center gap-2">
          <Link href="/inventory/item-attributes"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 py-8">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 space-y-5">

            <div className="flex items-center gap-2 mb-2">
              <SlidersHorizontal className="w-5 h-5 text-blue-400" />
              <h2 className="text-[15px] font-semibold text-zinc-100">Item Attribute</h2>
            </div>

            <div>
              <label className={labelCls}>Name <span className="text-red-400">*</span></label>
              <input value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="e.g. Color, Size, Material…"
                className={inputCls} autoFocus />
            </div>

            <div>
              <label className={labelCls}>Type</label>
              <select value={form.attributeType} onChange={e => set('attributeType', e.target.value)}
                className={inputCls}>
                {ATTR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <p className="text-[11px] text-zinc-600 mt-1">
                {form.attributeType === 'Text' && 'Free-text values (e.g. "Red", "Large")'}
                {form.attributeType === 'Integer' && 'Whole numbers only'}
                {form.attributeType === 'Decimal' && 'Decimal numbers (e.g. 2.5)'}
                {form.attributeType === 'Option' && 'Predefined option list'}
              </p>
            </div>

            <div>
              <label className={labelCls}>Unit of Measure</label>
              <input value={form.unitOfMeasure} onChange={e => set('unitOfMeasure', e.target.value)}
                placeholder="e.g. kg, cm, oz (optional)"
                className={inputCls} />
            </div>

            <div className="flex items-center gap-3">
              <button type="button"
                onClick={() => set('blocked', !form.blocked)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.blocked ? 'bg-red-500' : 'bg-zinc-700'}`}>
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${form.blocked ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
              </button>
              <label className="text-[13px] text-zinc-400">Blocked</label>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-[13px]">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-[13px] font-medium rounded transition-colors">
                {loading ? 'Saving…' : 'Create Attribute'}
              </button>
              <Link href="/inventory/item-attributes"
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-[13px] rounded transition-colors">
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </main>
    </>
  )
}
