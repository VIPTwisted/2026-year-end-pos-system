'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, Cpu } from 'lucide-react'

interface WorkCenter { id: string; code: string; name: string }

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors'
const labelCls = 'block text-[11px] font-medium text-zinc-500 mb-1 uppercase tracking-wide'
const sectionCls = 'bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden'
const tabHeaderCls = 'px-4 py-2.5 bg-zinc-900/40 border-b border-zinc-800/50 text-xs font-semibold text-zinc-300 flex items-center gap-2'

export default function NewMachineCenterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([])

  const [form, setForm] = useState({
    code: '',
    name: '',
    workCenterId: '',
    capacity: '1',
    costPerHour: '0',
    efficiency: '100',
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  useEffect(() => {
    fetch('/api/manufacturing/work-centers').then(r => r.json()).then(data => {
      setWorkCenters(Array.isArray(data) ? data : [])
    }).catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code.trim() || !form.name.trim() || !form.workCenterId) {
      setError('Code, name, and work center are required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/manufacturing/machine-centers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          name: form.name.trim(),
          workCenterId: form.workCenterId,
          capacity: parseFloat(form.capacity) || 1,
          costPerHour: parseFloat(form.costPerHour) || 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push('/manufacturing/machine-centers')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="New Machine Center" />
      <main className="flex-1 p-5 overflow-auto">
        <div className="max-w-xl mx-auto space-y-5">

          <Link
            href="/manufacturing/machine-centers"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Machine Centers
          </Link>

          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-zinc-400" />
            <h1 className="text-sm font-semibold text-zinc-200">New Machine Center</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className={sectionCls}>
              <div className={tabHeaderCls}>
                <Cpu className="w-3.5 h-3.5 text-zinc-500" />
                General
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>No. <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={set('code')}
                    placeholder="MC-001"
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    placeholder="Laser Cutter #1"
                    className={inputCls}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Work Center <span className="text-red-400">*</span></label>
                  <select value={form.workCenterId} onChange={set('workCenterId')} className={inputCls} required>
                    <option value="">Select work center…</option>
                    {workCenters.map(wc => (
                      <option key={wc.id} value={wc.id}>{wc.code} — {wc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Capacity</label>
                  <input
                    type="number"
                    min="0.001"
                    step="any"
                    value={form.capacity}
                    onChange={set('capacity')}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Cost per Hour ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.costPerHour}
                    onChange={set('costPerHour')}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
            )}

            <div className="flex items-center justify-end gap-3">
              <Link
                href="/manufacturing/machine-centers"
                className="px-3 py-1.5 rounded text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 rounded text-xs font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors"
              >
                {loading ? 'Creating…' : 'Create Machine Center'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
