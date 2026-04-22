'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, Layers } from 'lucide-react'

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors'
const labelCls = 'block text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5'

const DIMENSION_TYPES = [
  { value: 'department', label: 'Department', desc: 'Organize by org department (Sales, Marketing, Ops)' },
  { value: 'cost_center', label: 'Cost Center', desc: 'Track spending by cost center' },
  { value: 'project', label: 'Project', desc: 'Allocate costs and revenue to projects' },
  { value: 'custom', label: 'Custom', desc: 'User-defined dimension type' },
]

export default function NewDimensionPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    code: '',
    name: '',
    type: 'department',
    description: '',
    defaultValue: '',
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code.trim()) { setError('Code is required'); return }
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/finance/dimensions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.toUpperCase(),
          name: form.name,
          description: form.description || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create')
      router.push('/finance/dimensions')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="New Financial Dimension" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-xl mx-auto space-y-6">

          <div className="flex items-center gap-3">
            <Link
              href="/finance/dimensions"
              className="inline-flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Dimensions
            </Link>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span className="text-[14px] font-semibold text-zinc-100">New Financial Dimension</span>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Code <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={e => setForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="DEPT"
                    maxLength={20}
                    className={inputCls + ' font-mono'}
                  />
                  <p className="text-[11px] text-zinc-600 mt-1">Short code, e.g. DEPT, CC, PROJ</p>
                </div>
                <div>
                  <label className={labelCls}>Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    placeholder="Department"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Dimension Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {DIMENSION_TYPES.map(dt => (
                    <button
                      key={dt.value}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, type: dt.value }))}
                      className={`text-left p-3 rounded-lg border transition-colors
                        ${form.type === dt.value
                          ? 'border-blue-500 bg-blue-600/10'
                          : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50'}`}
                    >
                      <p className="text-[12px] font-semibold text-zinc-200">{dt.label}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{dt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  value={form.description}
                  onChange={set('description')}
                  rows={2}
                  placeholder="Optional description for this dimension…"
                  className={inputCls + ' resize-none'}
                />
              </div>

              <div>
                <label className={labelCls}>Default Value</label>
                <input
                  type="text"
                  value={form.defaultValue}
                  onChange={set('defaultValue')}
                  placeholder="e.g. GENERAL"
                  className={inputCls + ' font-mono'}
                />
                <p className="text-[11px] text-zinc-600 mt-1">Used when no value is specified on a transaction</p>
              </div>

              {error && (
                <div className="text-[12px] text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Link
                  href="/finance/dimensions"
                  className="px-4 py-2 text-[13px] text-zinc-400 hover:text-zinc-200 border border-zinc-700 rounded-lg transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-[13px] font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  {saving ? 'Creating…' : 'Create Dimension'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
