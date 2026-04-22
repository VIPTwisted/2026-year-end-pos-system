'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Save, X } from 'lucide-react'

type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'

const TYPE_OPTIONS: { value: AccountType; label: string }[] = [
  { value: 'asset',     label: 'Asset' },
  { value: 'liability', label: 'Liability' },
  { value: 'equity',    label: 'Equity' },
  { value: 'revenue',   label: 'Revenue' },
  { value: 'expense',   label: 'Expense' },
]

function suggestMainAccountType(type: AccountType): string {
  return ['asset', 'liability', 'equity'].includes(type) ? 'balance_sheet' : 'profit_loss'
}

export default function NewGLAccountPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const [form, setForm] = useState({
    code: '',
    name: '',
    type: 'expense' as AccountType,
    subtype: '',
    directPosting: true,
    blocked: false,
  })

  function notify(msg: string, type: 'ok' | 'err' = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  function set(field: string, value: unknown) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSave() {
    if (!form.code.trim() || !form.name.trim()) {
      notify('No. and Name are required', 'err')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/finance/chart-of-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.trim(),
          name: form.name.trim(),
          type: form.type,
          subtype: form.subtype.trim() || null,
          mainAccountType: suggestMainAccountType(form.type),
          isActive: form.directPosting,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        notify(d.error ?? 'Save failed', 'err')
        return
      }
      const acct = await res.json()
      notify('Account created')
      router.push(`/finance/chart-of-accounts/${acct.id}`)
    } catch {
      notify('Network error', 'err')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar
        title="New G/L Account"
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Chart of Accounts', href: '/finance/chart-of-accounts' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-[12px] font-medium rounded transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => router.push('/finance/chart-of-accounts')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[12px] font-medium rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        }
      />

      <div className="min-h-[100dvh] bg-[#0f0f1a] p-6">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded shadow-lg text-[13px] font-medium ${
            toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {toast.msg}
          </div>
        )}

        <div className="max-w-3xl space-y-4">
          {/* General FastTab */}
          <details open className="group bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <summary className="flex items-center justify-between px-5 py-3 cursor-pointer select-none bg-zinc-900/30 list-none">
              <span className="text-[13px] font-semibold text-zinc-100">General</span>
            </summary>
            <div className="px-5 py-5 grid grid-cols-2 gap-x-8 gap-y-5">
              <FormField label="No. *">
                <input
                  value={form.code}
                  onChange={e => set('code', e.target.value)}
                  placeholder="e.g. 6100"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </FormField>
              <FormField label="Name *">
                <input
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Account name"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </FormField>
              <FormField label="Account Type">
                <select
                  value={form.type}
                  onChange={e => set('type', e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500"
                >
                  {TYPE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Subtype">
                <input
                  value={form.subtype}
                  onChange={e => set('subtype', e.target.value)}
                  placeholder="e.g. operating"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                />
              </FormField>
              <FormField label="Direct Posting">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.directPosting}
                    onChange={e => set('directPosting', e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-blue-600"
                  />
                  <span className="text-[13px] text-zinc-300">Allow direct posting</span>
                </label>
              </FormField>
              <FormField label="Blocked">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.blocked}
                    onChange={e => set('blocked', e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-600 bg-zinc-800"
                  />
                  <span className="text-[13px] text-zinc-300">Blocked</span>
                </label>
              </FormField>
            </div>
          </details>

          {/* Posting FastTab */}
          <details className="group bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <summary className="flex items-center justify-between px-5 py-3 cursor-pointer select-none bg-zinc-900/30 list-none">
              <span className="text-[13px] font-semibold text-zinc-100">Posting</span>
            </summary>
            <div className="px-5 py-5 grid grid-cols-2 gap-x-8 gap-y-5">
              <FormField label="Gen. Posting Type">
                <select className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-200 focus:outline-none focus:border-blue-500">
                  <option value="">(blank)</option>
                  <option value="sale">Sale</option>
                  <option value="purchase">Purchase</option>
                </select>
              </FormField>
              <FormField label="Gen. Bus. Posting Group">
                <input placeholder="—" className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-400 focus:outline-none focus:border-blue-500" />
              </FormField>
              <FormField label="Gen. Prod. Posting Group">
                <input placeholder="—" className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-400 focus:outline-none focus:border-blue-500" />
              </FormField>
              <FormField label="VAT Bus. Posting Group">
                <input placeholder="—" className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-400 focus:outline-none focus:border-blue-500" />
              </FormField>
              <FormField label="VAT Prod. Posting Group">
                <input placeholder="—" className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-[13px] text-zinc-400 focus:outline-none focus:border-blue-500" />
              </FormField>
            </div>
          </details>
        </div>
      </div>
    </>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
