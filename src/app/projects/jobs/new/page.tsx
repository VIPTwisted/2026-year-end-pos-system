'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Briefcase, DollarSign, Settings2 } from 'lucide-react'

type Customer = { id: string; firstName: string; lastName: string }

const STATUSES = ['Planning', 'Open', 'Completed', 'Blocked']
const WIP_METHODS = [
  'Completed Contract', 'Cost of Sales', 'Percentage of Completion', 'Sales Value',
]

export default function NewJobPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [activeTab, setActiveTab] = useState<'general' | 'invoice' | 'posting'>('general')

  const [form, setForm] = useState({
    description: '',
    customerId: '',
    responsible: '',
    status: 'Planning',
    totalContractPrice: '',
    totalScheduleCost: '',
    wipMethod: 'Completed Contract',
    invoiceMethod: 'Contract',
    currencyCode: 'USD',
    jobPostingGroup: '',
  })

  useEffect(() => {
    fetch('/api/customers').then(r => r.json()).then(d => setCustomers(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.description.trim()) { setError('Description is required'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/projects/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: form.description.trim(),
          customerId: form.customerId || undefined,
          responsible: form.responsible || undefined,
          status: form.status,
          totalContractPrice: form.totalContractPrice || 0,
          totalScheduleCost: form.totalScheduleCost || 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push(`/projects/jobs/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors'
  const labelCls = 'block text-[10px] font-medium text-zinc-500 mb-1 uppercase tracking-wide'

  const TABS = [
    { id: 'general', label: 'General', icon: Briefcase },
    { id: 'invoice', label: 'Invoice & Pricing', icon: DollarSign },
    { id: 'posting', label: 'Posting', icon: Settings2 },
  ] as const

  return (
    <>
      <TopBar title="New Job" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a]">
        <div className="max-w-3xl mx-auto">
          <Link href="/projects/jobs" className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors mb-5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Jobs
          </Link>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800/60 flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-zinc-400" />
              <div>
                <h2 className="text-[15px] font-semibold text-zinc-100">New Job</h2>
                <p className="text-[11px] text-zinc-500">Create a new job / project</p>
              </div>
            </div>

            <div className="flex border-b border-zinc-800/60">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-5 py-3 text-[11px] font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {activeTab === 'general' && (
                  <div className="space-y-4">
                    <div>
                      <label className={labelCls}>Description <span className="text-red-400">*</span></label>
                      <input type="text" value={form.description} onChange={set('description')} placeholder="Job description…" className={inputCls} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Bill-to Customer</label>
                        <select value={form.customerId} onChange={set('customerId')} className={inputCls}>
                          <option value="">— No customer —</option>
                          {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Person Responsible</label>
                        <input type="text" value={form.responsible} onChange={set('responsible')} placeholder="Name…" className={inputCls} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Status</label>
                      <select value={form.status} onChange={set('status')} className={inputCls}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                )}
                {activeTab === 'invoice' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Contract (Total Price)</label>
                        <input type="number" min="0" step="0.01" value={form.totalContractPrice} onChange={set('totalContractPrice')} placeholder="0.00" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Schedule (Total Cost)</label>
                        <input type="number" min="0" step="0.01" value={form.totalScheduleCost} onChange={set('totalScheduleCost')} placeholder="0.00" className={inputCls} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Invoice Method</label>
                      <select value={form.invoiceMethod} onChange={set('invoiceMethod')} className={inputCls}>
                        <option value="Contract">Contract</option>
                        <option value="Usage">Usage</option>
                        <option value="Fixed Price">Fixed Price</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Currency Code</label>
                      <input type="text" value={form.currencyCode} onChange={set('currencyCode')} placeholder="USD" className={inputCls} />
                    </div>
                  </div>
                )}
                {activeTab === 'posting' && (
                  <div className="space-y-4">
                    <div>
                      <label className={labelCls}>WIP Method</label>
                      <select value={form.wipMethod} onChange={set('wipMethod')} className={inputCls}>
                        {WIP_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Job Posting Group</label>
                      <input type="text" value={form.jobPostingGroup} onChange={set('jobPostingGroup')} placeholder="e.g. JOBS" className={inputCls} />
                    </div>
                  </div>
                )}
                {error && (
                  <div className="text-[11px] text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-zinc-800/60 flex items-center justify-end gap-3">
                <Link href="/projects/jobs">
                  <Button type="button" variant="outline" size="sm">Cancel</Button>
                </Link>
                <Button type="submit" size="sm" disabled={loading} className="bg-blue-600 hover:bg-blue-500">
                  {loading ? 'Creating…' : 'Create Job'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
