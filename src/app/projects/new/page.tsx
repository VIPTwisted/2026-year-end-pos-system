'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Briefcase } from 'lucide-react'

type Customer = { id: string; firstName: string; lastName: string }

const WIP_METHODS = [
  { value: 'completed_contract', label: 'Completed Contract' },
  { value: 'cost_of_sales', label: 'Cost of Sales' },
  { value: 'percentage_of_completion', label: 'Percentage of Completion' },
  { value: 'sales_value', label: 'Sales Value' },
]

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])

  const [form, setForm] = useState({
    description: '',
    customerId: '',
    startDate: '',
    endDate: '',
    dueDate: '',
    contractAmount: '',
    budgetAmount: '',
    wipMethod: 'completed_contract',
    notes: '',
  })

  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(setCustomers).catch(() => {})
  }, [])

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.description.trim()) { setError('Description is required'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: form.description.trim(),
          customerId: form.customerId || undefined,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
          dueDate: form.dueDate || undefined,
          contractAmount: form.contractAmount || undefined,
          budgetAmount: form.budgetAmount || undefined,
          wipMethod: form.wipMethod,
          notes: form.notes || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push(`/projects/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-colors'
  const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'

  return (
    <>
      <TopBar title="New Project" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <Link href="/projects" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-5">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Projects
          </Link>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-zinc-400" />
                Create Project
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                  <label className={labelCls}>Description <span className="text-red-400">*</span></label>
                  <input type="text" value={form.description} onChange={set('description')} placeholder="Website Redesign for ACME Corp" className={inputCls} required />
                </div>

                <div>
                  <label className={labelCls}>Customer</label>
                  <select value={form.customerId} onChange={set('customerId')} className={inputCls}>
                    <option value="">— No customer —</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Start Date</label>
                    <input type="date" value={form.startDate} onChange={set('startDate')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>End Date</label>
                    <input type="date" value={form.endDate} onChange={set('endDate')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Due Date</label>
                    <input type="date" value={form.dueDate} onChange={set('dueDate')} className={inputCls} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Contract Amount ($)</label>
                    <input type="number" min="0" step="0.01" value={form.contractAmount} onChange={set('contractAmount')} placeholder="0.00" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Budget Amount ($)</label>
                    <input type="number" min="0" step="0.01" value={form.budgetAmount} onChange={set('budgetAmount')} placeholder="0.00" className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>WIP Method</label>
                  <select value={form.wipMethod} onChange={set('wipMethod')} className={inputCls}>
                    {WIP_METHODS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Notes</label>
                  <textarea value={form.notes} onChange={set('notes')} placeholder="Internal notes…" rows={3} className={inputCls + ' resize-none'} />
                </div>

                {error && (
                  <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
                )}

                <div className="flex items-center justify-end gap-3 pt-1">
                  <Link href="/projects">
                    <Button type="button" variant="outline" size="sm">Cancel</Button>
                  </Link>
                  <Button type="submit" size="sm" disabled={loading}>
                    {loading ? 'Creating…' : 'Create Project'}
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
