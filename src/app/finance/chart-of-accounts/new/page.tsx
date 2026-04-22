'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'

type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'

const TYPE_OPTIONS: { value: AccountType; label: string }[] = [
  { value: 'asset',     label: 'Asset' },
  { value: 'liability', label: 'Liability' },
  { value: 'equity',    label: 'Equity' },
  { value: 'revenue',   label: 'Revenue' },
  { value: 'expense',   label: 'Expense' },
]

// Accounting convention: assets/expenses have debit normal balance
function suggestNormalBalance(type: AccountType): 'debit' | 'credit' {
  return type === 'asset' || type === 'expense' ? 'debit' : 'credit'
}

// mainAccountType mapping
function suggestMainAccountType(type: AccountType): string {
  return type === 'asset' || type === 'liability' || type === 'equity'
    ? 'balance_sheet'
    : 'profit_loss'
}

export default function NewGLAccountPage() {
  const router = useRouter()

  const [code, setCode]                   = useState('')
  const [name, setName]                   = useState('')
  const [type, setType]                   = useState<AccountType>('asset')
  const [subtype, setSubtype]             = useState('')
  const [normalBalance, setNormalBalance] = useState<'debit' | 'credit'>('debit')
  const [saving, setSaving]               = useState(false)
  const [error, setError]                 = useState<string | null>(null)

  // Auto-suggest normal balance when type changes
  function handleTypeChange(newType: AccountType) {
    setType(newType)
    setNormalBalance(suggestNormalBalance(newType))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!code.trim()) { setError('Account code is required'); return }
    if (!name.trim()) { setError('Account name is required'); return }

    setSaving(true)
    try {
      const res = await fetch('/api/finance/gl-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code:            code.trim(),
          name:            name.trim(),
          type,
          subtype:         subtype.trim() || undefined,
          mainAccountType: suggestMainAccountType(type),
        }),
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setError(data.error ?? 'Failed to create account')
        return
      }

      router.push('/finance/chart-of-accounts')
    } catch {
      setError('Network error — please try again')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <TopBar
        title="New GL Account"
        breadcrumb={[
          { label: 'Finance',           href: '/finance' },
          { label: 'Chart of Accounts', href: '/finance/chart-of-accounts' },
        ]}
        showBack
      />

      <main className="flex-1 p-6 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">
        <div className="max-w-xl mx-auto">

          <div className="mb-6">
            <h1 className="text-xl font-bold text-zinc-100 tracking-tight">New GL Account</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">Add a new account to the Chart of Accounts</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 space-y-5">

            {/* Account Code */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                Account Code *
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="e.g. 1000"
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 font-mono"
                required
              />
              <p className="text-[11px] text-zinc-600 mt-1">Must be unique. Use standard account numbering (e.g. 1000–1999 for Assets).</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                Account Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Cash and Cash Equivalents"
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                Account Type *
              </label>
              <select
                value={type}
                onChange={e => handleTypeChange(e.target.value as AccountType)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                required
              >
                {TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Subtype */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                Subtype <span className="text-zinc-700 normal-case font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={subtype}
                onChange={e => setSubtype(e.target.value)}
                placeholder="e.g. current, fixed, operating"
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Normal Balance */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                Normal Balance
              </label>
              <select
                value={normalBalance}
                onChange={e => setNormalBalance(e.target.value as 'debit' | 'credit')}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              >
                <option value="debit">Debit (DR)</option>
                <option value="credit">Credit (CR)</option>
              </select>
              <p className="text-[11px] text-zinc-600 mt-1">
                Auto-suggested based on type.
                {type === 'asset' || type === 'expense'
                  ? ' Assets and Expenses normally carry a debit balance.'
                  : ' Liabilities, Equity, and Revenue normally carry a credit balance.'}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded px-3 py-2 text-[13px] text-red-400">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded transition-colors"
              >
                {saving ? 'Creating…' : 'Create Account'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 border border-zinc-700 hover:border-zinc-500 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}
