'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, ArrowLeft, Trash2 } from 'lucide-react'

type Cause = { id: string; code: string; description: string; unitOfMeasure: string; createdAt: string }

const INPUT_CLS = 'w-full rounded-md bg-zinc-900/60 border border-zinc-800/50 text-zinc-100 text-[12px] px-3 py-2 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/60'
const LABEL_CLS = 'block text-[10px] uppercase tracking-wide text-zinc-500 mb-1'

export default function CausesOfAbsencePage() {
  const [causes, setCauses] = useState<Cause[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({ code: '', description: '', unitOfMeasure: 'Day' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/hr/setup/causes-of-absence')
      const data = await res.json()
      setCauses(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load causes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/hr/setup/causes-of-absence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const json = (await res.json()) as { error?: string }
        throw new Error(json.error ?? 'Failed to save')
      }
      setForm({ code: '', description: '', unitOfMeasure: 'Day' })
      setShowForm(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar title="Causes of Absence" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-4 max-w-3xl">

          <div className="flex items-center gap-3">
            <Link href="/hr/employees" className="inline-flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> HR
            </Link>
            <span className="text-zinc-700">/</span>
            <span className="text-[12px] text-zinc-400">Causes of Absence</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">HR Setup</p>
              <h2 className="text-[18px] font-semibold text-zinc-100">Causes of Absence</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">{causes.length} codes defined</p>
            </div>
            <button
              onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>

          {error && (
            <div className="rounded-md bg-red-900/30 border border-red-700/50 px-4 py-3 text-[12px] text-red-400">{error}</div>
          )}

          {/* Inline add form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-5 py-4 space-y-3">
              <h3 className="text-[13px] font-semibold text-zinc-200">New Cause of Absence</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={LABEL_CLS}>Code *</label>
                  <input name="code" required value={form.code} onChange={handleChange} className={INPUT_CLS} placeholder="SICK" />
                </div>
                <div>
                  <label className={LABEL_CLS}>Description *</label>
                  <input name="description" required value={form.description} onChange={handleChange} className={INPUT_CLS} placeholder="Sick Leave" />
                </div>
                <div>
                  <label className={LABEL_CLS}>Unit of Measure</label>
                  <select name="unitOfMeasure" value={form.unitOfMeasure} onChange={handleChange} className={INPUT_CLS}>
                    <option>Day</option>
                    <option>Hour</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="px-4 py-1.5 text-[11px] bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-md font-medium transition-colors">
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-1.5 text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md font-medium transition-colors">Cancel</button>
              </div>
            </form>
          )}

          {/* Table */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-zinc-800/60">
                  <tr>
                    {['Code', 'Description', 'Unit of Measure', 'Created', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {loading ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-[12px] text-zinc-500">Loading…</td></tr>
                  ) : causes.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-[12px] text-zinc-500">No causes defined. Add one above.</td></tr>
                  ) : causes.map(c => (
                    <tr key={c.id} className="hover:bg-[rgba(99,102,241,0.05)] transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] font-semibold text-indigo-300">{c.code}</td>
                      <td className="px-4 py-3 text-[13px] text-zinc-100">{c.description}</td>
                      <td className="px-4 py-3 text-[12px] text-zinc-400">{c.unitOfMeasure}</td>
                      <td className="px-4 py-3 text-[11px] text-zinc-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-zinc-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
