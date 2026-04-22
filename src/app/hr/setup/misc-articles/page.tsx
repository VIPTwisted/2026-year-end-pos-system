'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Plus, ArrowLeft, Package, Trash2 } from 'lucide-react'

type MiscArticle = { id: string; code: string; description: string; articleType: string; createdAt: string }

const INPUT_CLS = 'w-full rounded-md bg-zinc-900/60 border border-zinc-800/50 text-zinc-100 text-[12px] px-3 py-2 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/60'
const LABEL_CLS = 'block text-[10px] uppercase tracking-wide text-zinc-500 mb-1'

export default function MiscArticlesPage() {
  const [articles, setArticles] = useState<MiscArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({ code: '', description: '', articleType: 'Equipment' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/hr/setup/misc-articles')
      const data = await res.json()
      setArticles(Array.isArray(data) ? data : [])
    } catch {
      setError('Failed to load misc. articles')
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
      const res = await fetch('/api/hr/setup/misc-articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const json = (await res.json()) as { error?: string }
        throw new Error(json.error ?? 'Failed to save')
      }
      setForm({ code: '', description: '', articleType: 'Equipment' })
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
      <TopBar title="Misc. Articles" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-4 max-w-3xl">

          <div className="flex items-center gap-3">
            <Link href="/hr/employees" className="inline-flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> HR
            </Link>
            <span className="text-zinc-700">/</span>
            <span className="text-[12px] text-zinc-400">Misc. Articles</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">HR Setup</p>
              <h2 className="text-[18px] font-semibold text-zinc-100">Misc. Articles</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">Company equipment tracked per employee · {articles.length} articles defined</p>
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

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-[#16213e] border border-zinc-800/50 rounded-lg px-5 py-4 space-y-3">
              <h3 className="text-[13px] font-semibold text-zinc-200">New Misc. Article</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={LABEL_CLS}>Code *</label>
                  <input name="code" required value={form.code} onChange={handleChange} className={INPUT_CLS} placeholder="LAPTOP" />
                </div>
                <div>
                  <label className={LABEL_CLS}>Description *</label>
                  <input name="description" required value={form.description} onChange={handleChange} className={INPUT_CLS} placeholder="Company Laptop" />
                </div>
                <div>
                  <label className={LABEL_CLS}>Article Type</label>
                  <select name="articleType" value={form.articleType} onChange={handleChange} className={INPUT_CLS}>
                    <option>Equipment</option>
                    <option>Uniform</option>
                    <option>Key / Access</option>
                    <option>Vehicle</option>
                    <option>Other</option>
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

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-zinc-800/60">
                  <tr>
                    {['Code', 'Description', 'Article Type', 'Created', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {loading ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-[12px] text-zinc-500">Loading…</td></tr>
                  ) : articles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Package className="w-8 h-8 text-zinc-700 opacity-50" />
                          <p className="text-[12px] text-zinc-500">No misc. articles defined.</p>
                        </div>
                      </td>
                    </tr>
                  ) : articles.map(a => (
                    <tr key={a.id} className="hover:bg-[rgba(99,102,241,0.05)] transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] font-semibold text-indigo-300">{a.code}</td>
                      <td className="px-4 py-3 text-[13px] text-zinc-100">{a.description}</td>
                      <td className="px-4 py-3 text-[12px] text-zinc-400">{a.articleType}</td>
                      <td className="px-4 py-3 text-[11px] text-zinc-500">{new Date(a.createdAt).toLocaleDateString()}</td>
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
