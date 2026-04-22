'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, Settings2 } from 'lucide-react'

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors'
const labelCls = 'block text-[11px] font-medium text-zinc-500 mb-1 uppercase tracking-wide'
const sectionCls = 'bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden'
const tabHeaderCls = 'px-4 py-2.5 bg-zinc-900/40 border-b border-zinc-800/50 text-xs font-semibold text-zinc-300 flex items-center gap-2'

export default function NewWorkCenterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'general' | 'posting' | 'scheduling' | 'capacity'>('general')

  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    type: 'machine',
    workCenterGroup: '',
    capacity: '1',
    unitOfMeasure: 'hours',
    costPerHour: '0',
    efficiency: '100',
    queueTime: '0',
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code.trim() || !form.name.trim()) {
      setError('Code and name are required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/manufacturing/work-centers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          type: form.type,
          capacity: parseFloat(form.capacity) || 1,
          unitOfMeasure: form.unitOfMeasure.trim() || 'hours',
          costPerHour: parseFloat(form.costPerHour) || 0,
          efficiency: parseFloat(form.efficiency) || 100,
          queueTime: parseFloat(form.queueTime) || 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push(`/manufacturing/work-centers/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const TABS = [
    { id: 'general', label: 'General' },
    { id: 'posting', label: 'Posting' },
    { id: 'scheduling', label: 'Scheduling' },
    { id: 'capacity', label: 'Capacity' },
  ] as const

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="New Work Center" />
      <main className="flex-1 p-5 overflow-auto">
        <div className="max-w-2xl mx-auto space-y-5">

          <Link
            href="/manufacturing/work-centers"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Work Centers
          </Link>

          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-zinc-400" />
            <h1 className="text-sm font-semibold text-zinc-200">New Work Center</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* FastTab Navigation */}
            <div className="flex items-center gap-0 border-b border-zinc-800">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* General */}
            {activeTab === 'general' && (
              <div className={sectionCls}>
                <div className={tabHeaderCls}>
                  <Settings2 className="w-3.5 h-3.5 text-zinc-500" />
                  General
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>No. <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={form.code}
                      onChange={set('code')}
                      placeholder="WC-WELD"
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
                      placeholder="Welding Station"
                      className={inputCls}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Type</label>
                    <select value={form.type} onChange={set('type')} className={inputCls}>
                      <option value="machine">Machine</option>
                      <option value="labor">Labor</option>
                      <option value="subcontract">Subcontract</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Work Center Group</label>
                    <input
                      type="text"
                      value={form.workCenterGroup}
                      onChange={set('workCenterGroup')}
                      placeholder="Assembly"
                      className={inputCls}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={labelCls}>Description</label>
                    <textarea
                      value={form.description}
                      onChange={set('description')}
                      rows={2}
                      className={inputCls + ' resize-none'}
                      placeholder="MIG welding station for steel frames…"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Posting */}
            {activeTab === 'posting' && (
              <div className={sectionCls}>
                <div className={tabHeaderCls}>Posting</div>
                <div className="p-4 grid grid-cols-2 gap-4">
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
            )}

            {/* Scheduling */}
            {activeTab === 'scheduling' && (
              <div className={sectionCls}>
                <div className={tabHeaderCls}>Scheduling</div>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Queue Time (hours)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.queueTime}
                      onChange={set('queueTime')}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Capacity */}
            {activeTab === 'capacity' && (
              <div className={sectionCls}>
                <div className={tabHeaderCls}>Capacity</div>
                <div className="p-4 grid grid-cols-2 gap-4">
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
                    <label className={labelCls}>Unit of Measure</label>
                    <input
                      type="text"
                      value={form.unitOfMeasure}
                      onChange={set('unitOfMeasure')}
                      placeholder="hours"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Efficiency (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      step="0.1"
                      value={form.efficiency}
                      onChange={set('efficiency')}
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
            )}

            <div className="flex items-center justify-end gap-3">
              <Link
                href="/manufacturing/work-centers"
                className="px-3 py-1.5 rounded text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 rounded text-xs font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-colors"
              >
                {loading ? 'Creating…' : 'Create Work Center'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
