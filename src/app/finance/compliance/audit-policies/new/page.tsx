'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { ArrowLeft, Shield } from 'lucide-react'

const inputCls = 'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-[13px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors'
const labelCls = 'block text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5'

const RULE_TYPES = [
  { value: 'amount_threshold', label: 'Amount Threshold', desc: 'Flag transactions exceeding a specified dollar amount' },
  { value: 'duplicate_detection', label: 'Duplicate Detection', desc: 'Detect duplicate invoices or payments' },
  { value: 'approval_bypass', label: 'Approval Bypass', desc: 'Alert when required approvals are skipped' },
  { value: 'unusual_pattern', label: 'Unusual Pattern', desc: 'Detect statistically unusual transaction patterns' },
]

const ENTITY_TYPES = [
  { value: 'expenses', label: 'Expenses' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'purchase_orders', label: 'Purchase Orders' },
  { value: 'journal_entries', label: 'Journal Entries' },
  { value: 'payments', label: 'Payments' },
]

const SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical']

export default function NewAuditPolicyPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    ruleType: 'amount_threshold',
    entityType: 'expenses',
    threshold: '',
    severity: 'medium',
    description: '',
    isActive: true,
  })

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const selectedRule = RULE_TYPES.find(r => r.value === form.ruleType)
  const needsThreshold = ['amount_threshold', 'unusual_pattern'].includes(form.ruleType)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Policy name is required'); return }
    if (needsThreshold && !form.threshold) { setError('Threshold value is required for this rule type'); return }
    setSaving(true)
    setError('')
    // Would POST to /api/finance/audit-policies
    await new Promise(r => setTimeout(r, 600))
    router.push('/finance/compliance/audit-policies')
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="New Audit Policy" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto space-y-6">

          <div className="flex items-center gap-3">
            <Link
              href="/finance/compliance/audit-policies"
              className="inline-flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Audit Policies
            </Link>
          </div>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-[14px] font-semibold text-zinc-100">New Audit Policy</span>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              <div>
                <label className={labelCls}>Policy Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="High-Value Expense Review"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Rule Type <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {RULE_TYPES.map(rt => (
                    <button
                      key={rt.value}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, ruleType: rt.value }))}
                      className={`text-left p-3 rounded-lg border transition-colors
                        ${form.ruleType === rt.value
                          ? 'border-blue-500 bg-blue-600/10'
                          : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50'}`}
                    >
                      <p className="text-[12px] font-semibold text-zinc-200">{rt.label}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{rt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Entity Type <span className="text-red-400">*</span></label>
                  <select value={form.entityType} onChange={set('entityType')} className={inputCls}>
                    {ENTITY_TYPES.map(et => (
                      <option key={et.value} value={et.value}>{et.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Severity</label>
                  <select value={form.severity} onChange={set('severity')} className={inputCls}>
                    {SEVERITY_LEVELS.map(s => (
                      <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {needsThreshold && (
                <div>
                  <label className={labelCls}>
                    Threshold Value <span className="text-red-400">*</span>
                    {selectedRule && <span className="ml-2 font-normal lowercase text-zinc-600">({selectedRule.desc})</span>}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[13px]">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.threshold}
                      onChange={set('threshold')}
                      placeholder="5000.00"
                      className={inputCls + ' pl-7'}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  value={form.description}
                  onChange={set('description')}
                  rows={3}
                  placeholder="Describe what this policy detects and why it matters…"
                  className={inputCls + ' resize-none'}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors
                    ${form.isActive ? 'bg-blue-600' : 'bg-zinc-700'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform
                    ${form.isActive ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-[13px] text-zinc-400">
                  {form.isActive ? 'Policy active — will run on schedule' : 'Policy inactive — disabled'}
                </span>
              </div>

              {error && (
                <div className="text-[12px] text-red-400 bg-red-950/30 border border-red-900/50 rounded px-3 py-2">{error}</div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Link
                  href="/finance/compliance/audit-policies"
                  className="px-4 py-2 text-[13px] text-zinc-400 hover:text-zinc-200 border border-zinc-700 rounded-lg transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-[13px] font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  {saving ? 'Creating…' : 'Create Policy'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
