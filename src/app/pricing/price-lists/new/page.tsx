'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Tag, Calendar, Users, User } from 'lucide-react'

interface CustomerGroup {
  id: string
  name: string
  isActive: boolean
}

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string | null
}

type AssignType = 'none' | 'group' | 'customer'

export default function NewPriceListPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [groups, setGroups] = useState<CustomerGroup[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [assignType, setAssignType] = useState<AssignType>('none')

  const [form, setForm] = useState({
    code: '',
    name: '',
    currency: 'USD',
    customerGroupId: '',
    customerId: '',
    startDate: '',
    endDate: '',
    notes: '',
    isActive: true,
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/customers/groups').then(r => r.json()),
      fetch('/api/customers?limit=200').then(r => r.json()),
    ]).then(([g, c]) => {
      setGroups(Array.isArray(g) ? g : (g.groups ?? []))
      const custList = Array.isArray(c) ? c : (c.customers ?? c.items ?? [])
      setCustomers(custList)
    }).catch(() => {
      // non-fatal
    })
  }, [])

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code.trim()) { setError('Code is required'); return }
    if (!form.name.trim()) { setError('Name is required'); return }
    if (assignType === 'group' && !form.customerGroupId) { setError('Select a customer group'); return }
    if (assignType === 'customer' && !form.customerId) { setError('Select a customer'); return }

    setLoading(true)
    setError('')
    try {
      const body = {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        currency: form.currency,
        customerGroupId: assignType === 'group' ? form.customerGroupId : null,
        customerId: assignType === 'customer' ? form.customerId : null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        notes: form.notes.trim() || null,
        isActive: form.isActive,
      }

      const res = await fetch('/api/pricing/price-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json() as { id?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Create failed')
      router.push(`/pricing/price-lists/${data.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(false)
    }
  }

  const labelClass = 'text-[10px] font-semibold uppercase tracking-widest text-zinc-500'
  const inputClass = 'w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500'

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="New Price List"
        showBack
        breadcrumb={[
          { label: 'Pricing', href: '/pricing/price-lists' },
          { label: 'Price Lists', href: '/pricing/price-lists' },
        ]}
      />

      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800/50 flex items-center gap-3">
            <Tag className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Price List Details</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Code + Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Code *</label>
                <input
                  className={inputClass}
                  value={form.code}
                  onChange={set('code')}
                  placeholder="e.g. RETAIL-2026"
                  maxLength={30}
                />
                <p className="text-[11px] text-zinc-600">Uppercase letters and hyphens</p>
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Name *</label>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={set('name')}
                  placeholder="e.g. Standard Retail 2026"
                />
              </div>
            </div>

            {/* Currency */}
            <div className="space-y-1.5">
              <label className={labelClass}>Currency</label>
              <select className={inputClass} value={form.currency} onChange={set('currency')}>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="CAD">CAD — Canadian Dollar</option>
                <option value="AUD">AUD — Australian Dollar</option>
                <option value="MXN">MXN — Mexican Peso</option>
              </select>
            </div>

            {/* Assignment */}
            <div className="space-y-3">
              <label className={labelClass}>Assign To</label>
              <div className="flex gap-3">
                {(['none', 'group', 'customer'] as AssignType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAssignType(type)}
                    className={`flex items-center gap-2 px-3 py-2 rounded border text-xs font-medium transition-colors ${
                      assignType === type
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
                    }`}
                  >
                    {type === 'none' && <Tag className="w-3.5 h-3.5" />}
                    {type === 'group' && <Users className="w-3.5 h-3.5" />}
                    {type === 'customer' && <User className="w-3.5 h-3.5" />}
                    {type === 'none' ? 'No Assignment' : type === 'group' ? 'Customer Group' : 'Specific Customer'}
                  </button>
                ))}
              </div>

              {assignType === 'group' && (
                <div className="space-y-1.5">
                  <label className={labelClass}>Customer Group *</label>
                  <select className={inputClass} value={form.customerGroupId} onChange={set('customerGroupId')}>
                    <option value="">— Select group —</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {assignType === 'customer' && (
                <div className="space-y-1.5">
                  <label className={labelClass}>Customer *</label>
                  <select className={inputClass} value={form.customerId} onChange={set('customerId')}>
                    <option value="">— Select customer —</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName}{c.email ? ` (${c.email})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Date Range */}
            <div className="space-y-1.5">
              <label className={labelClass}>
                <Calendar className="w-3 h-3 inline mr-1" />
                Date Range (optional)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-[11px] text-zinc-600">Start Date</p>
                  <input type="date" className={inputClass} value={form.startDate} onChange={set('startDate')} />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] text-zinc-600">End Date</p>
                  <input type="date" className={inputClass} value={form.endDate} onChange={set('endDate')} />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className={labelClass}>Notes</label>
              <textarea
                className={`${inputClass} resize-none`}
                rows={3}
                value={form.notes}
                onChange={set('notes')}
                placeholder="Internal notes about this price list…"
              />
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                  form.isActive ? 'bg-blue-600' : 'bg-zinc-700'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  form.isActive ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
              <span className="text-sm text-zinc-300">Active</span>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2.5 rounded transition-colors"
              >
                {loading ? 'Creating…' : 'Create Price List'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2.5 border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 text-sm rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
