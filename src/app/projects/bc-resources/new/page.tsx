'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Users, DollarSign, FileText, Clock } from 'lucide-react'

const RESOURCE_TYPES = ['Person', 'Machine']
const BASE_UNITS = ['hour', 'day', 'piece', 'km']

type Tab = 'general' | 'invoicing' | 'personal' | 'timesheet'

export default function NewBCResourcePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('general')

  const [form, setForm] = useState({
    resourceNo: '', name: '', resourceType: 'Person', baseUnit: 'hour',
    unitPrice: '', unitCost: '', useTimeSheet: true, blocked: false,
    email: '', phone: '', employeeNo: '', timeSheetOwner: '',
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const val = e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value
      setForm(prev => ({ ...prev, [k]: val }))
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/projects/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceNo: form.resourceNo || undefined,
          name: form.name.trim(),
          resourceType: form.resourceType,
          baseUnit: form.baseUnit,
          unitPrice: form.unitPrice || 0,
          unitCost: form.unitCost || 0,
          useTimeSheet: form.useTimeSheet,
          blocked: form.blocked,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push('/projects/bc-resources')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors'
  const labelCls = 'block text-[10px] font-medium text-zinc-500 mb-1 uppercase tracking-wide'

  const TABS = [
    { id: 'general' as Tab, label: 'General', icon: Users },
    { id: 'invoicing' as Tab, label: 'Invoicing', icon: DollarSign },
    { id: 'personal' as Tab, label: 'Personal Data', icon: FileText },
    { id: 'timesheet' as Tab, label: 'Time Sheet', icon: Clock },
  ]

  return (
    <>
      <TopBar title="New Resource" />
      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a]">
        <div className="max-w-3xl mx-auto">
          <Link href="/projects/bc-resources" className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors mb-5">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Resources
          </Link>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800/60 flex items-center gap-3">
              <Users className="w-5 h-5 text-zinc-400" />
              <div>
                <h2 className="text-[15px] font-semibold text-zinc-100">New Resource</h2>
                <p className="text-[11px] text-zinc-500">Person or machine for job planning</p>
              </div>
            </div>

            <div className="flex border-b border-zinc-800/60">
              {TABS.map(tab => (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-5 py-3 text-[11px] font-medium transition-colors border-b-2 ${activeTab === tab.id ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {activeTab === 'general' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Resource No.</label>
                        <input type="text" value={form.resourceNo} onChange={set('resourceNo')} placeholder="Auto-generated" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Name <span className="text-red-400">*</span></label>
                        <input type="text" value={form.name} onChange={set('name')} placeholder="John Smith" className={inputCls} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Type</label>
                        <select value={form.resourceType} onChange={set('resourceType')} className={inputCls}>
                          {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Base Unit of Measure</label>
                        <select value={form.baseUnit} onChange={set('baseUnit')} className={inputCls}>
                          {BASE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.blocked} onChange={set('blocked')} className="rounded border-zinc-700 bg-zinc-900 text-blue-500" />
                        <span className="text-[12px] text-zinc-400">Blocked</span>
                      </label>
                    </div>
                  </div>
                )}
                {activeTab === 'invoicing' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Unit Price</label>
                        <input type="number" min="0" step="0.01" value={form.unitPrice} onChange={set('unitPrice')} placeholder="0.00" className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Unit Cost</label>
                        <input type="number" min="0" step="0.01" value={form.unitCost} onChange={set('unitCost')} placeholder="0.00" className={inputCls} />
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'personal' && (
                  <div className="space-y-4">
                    <div>
                      <label className={labelCls}>Email</label>
                      <input type="email" value={form.email} onChange={set('email')} placeholder="john@example.com" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Phone</label>
                      <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+1 (555) 000-0000" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Employee No.</label>
                      <input type="text" value={form.employeeNo} onChange={set('employeeNo')} placeholder="EMP-0001" className={inputCls} />
                    </div>
                  </div>
                )}
                {activeTab === 'timesheet' && (
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={form.useTimeSheet} onChange={set('useTimeSheet')} className="rounded border-zinc-700 bg-zinc-900 text-blue-500 w-4 h-4" />
                      <div>
                        <span className="text-[13px] text-zinc-200">Use Time Sheet</span>
                        <p className="text-[11px] text-zinc-500 mt-0.5">Enable time sheet tracking for this resource</p>
                      </div>
                    </label>
                    <div>
                      <label className={labelCls}>Time Sheet Owner</label>
                      <input type="text" value={form.timeSheetOwner} onChange={set('timeSheetOwner')} placeholder="User or manager ID" className={inputCls} />
                    </div>
                  </div>
                )}
                {error && <div className="text-[11px] text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>}
              </div>
              <div className="px-6 py-4 border-t border-zinc-800/60 flex items-center justify-end gap-3">
                <Link href="/projects/bc-resources">
                  <Button type="button" variant="outline" size="sm">Cancel</Button>
                </Link>
                <Button type="submit" size="sm" disabled={loading} className="bg-blue-600 hover:bg-blue-500">
                  {loading ? 'Creating…' : 'Create Resource'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
