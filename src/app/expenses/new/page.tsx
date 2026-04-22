'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Receipt } from 'lucide-react'

type Project  = { id: string; projectNo: string; description: string }
type Category = { id: string; name: string }

export default function NewExpenseReportPage() {
  const router = useRouter()
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [projects, setProjects]   = useState<Project[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const [form, setForm] = useState({
    title:      '',
    employeeId: '',
    projectId:  '',
    categoryId: '',
    notes:      '',
  })

  useEffect(() => {
    fetch('/api/projects').then(r => r.json()).then(setProjects).catch(() => {})
    fetch('/api/expenses/categories').then(r => r.json()).then(setCategories).catch(() => {})
  }, [])

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/expenses/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:      form.title.trim(),
          employeeId: form.employeeId.trim() || undefined,
          projectId:  form.projectId  || undefined,
          categoryId: form.categoryId || undefined,
          notes:      form.notes.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push(`/expenses/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const inputCls  = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
  const labelCls  = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'

  return (
    <>
      <TopBar title="New Expense Report" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-lg mx-auto">
          <Link href="/expenses" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Expense Reports
          </Link>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="w-4 h-4 text-zinc-400" />
                Create Expense Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                  <label className={labelCls}>Title <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={set('title')}
                    placeholder="e.g. Q2 Travel Expenses"
                    className={inputCls}
                    required
                  />
                </div>

                <div>
                  <label className={labelCls}>Employee ID</label>
                  <input
                    type="text"
                    value={form.employeeId}
                    onChange={set('employeeId')}
                    placeholder="Optional employee reference"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Project (optional)</label>
                  <select value={form.projectId} onChange={set('projectId')} className={inputCls}>
                    <option value="">— No project —</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.projectNo} — {p.description}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Category (optional)</label>
                  <select value={form.categoryId} onChange={set('categoryId')} className={inputCls}>
                    <option value="">— Select category —</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={set('notes')}
                    placeholder="Optional notes…"
                    rows={3}
                    className={inputCls}
                  />
                </div>

                {error && (
                  <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
                )}

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Link href="/expenses">
                    <Button type="button" variant="outline" size="sm">Cancel</Button>
                  </Link>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? 'Creating…' : 'Create Report'}
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
