'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Toast {
  msg: string
  type: 'ok' | 'err'
}

export default function NewBankAccountPage() {
  const router = useRouter()
  const [toast, setToast] = useState<Toast | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountType: 'checking',
    currentBalance: '0',
    currency: 'USD',
    notes: '',
  })

  function notify(msg: string, type: 'ok' | 'err' = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.bankName || !form.accountNumber) {
      notify('Name, Bank Name, and Account Number are required', 'err')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/finance/bank-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          bankName: form.bankName,
          accountNumber: form.accountNumber,
          routingNumber: form.routingNumber || undefined,
          accountType: form.accountType,
          currentBalance: parseFloat(form.currentBalance) || 0,
          currency: form.currency,
          notes: form.notes || undefined,
        }),
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        notify(data.error ?? 'Failed to create account', 'err')
        return
      }

      notify('Bank account created')
      setTimeout(() => router.push('/finance/bank-accounts'), 600)
    } catch {
      notify('Network error', 'err')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      {/* Top Bar */}
      <header className="h-14 border-b border-zinc-800 bg-[#0f0f1a] flex items-center px-6 gap-4 sticky top-0 z-10">
        <Link
          href="/finance/bank-accounts"
          className="text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Finance / Bank Accounts</span>
          <h1 className="text-base font-semibold text-zinc-100 leading-tight">Add Bank Account</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 space-y-5">
          {/* Account Name */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
              Account Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Main Operating Account"
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Bank Name */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
              Bank Name *
            </label>
            <input
              type="text"
              value={form.bankName}
              onChange={(e) => set('bankName', e.target.value)}
              placeholder="e.g. Chase Bank"
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
              Account Number *
            </label>
            <input
              type="text"
              value={form.accountNumber}
              onChange={(e) => set('accountNumber', e.target.value)}
              placeholder="Full account number"
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
            />
            <p className="text-[11px] text-zinc-500 mt-1">Stored securely — only last 4 digits are displayed</p>
          </div>

          {/* Routing Number */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
              Routing Number <span className="text-zinc-600">(optional)</span>
            </label>
            <input
              type="text"
              value={form.routingNumber}
              onChange={(e) => set('routingNumber', e.target.value)}
              placeholder="9-digit ABA routing number"
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* Account Type + Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                Account Type
              </label>
              <select
                value={form.accountType}
                onChange={(e) => set('accountType', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="credit_line">Credit Line</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
                Currency
              </label>
              <select
                value={form.currency}
                onChange={(e) => set('currency', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
              >
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="CAD">CAD — Canadian Dollar</option>
                <option value="MXN">MXN — Mexican Peso</option>
              </select>
            </div>
          </div>

          {/* Opening Balance */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
              Opening Balance
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                value={form.currentBalance}
                onChange={(e) => set('currentBalance', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded pl-7 pr-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 tabular-nums"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
              Notes <span className="text-zinc-600">(optional)</span>
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={3}
              placeholder="Internal notes about this account..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded transition-colors"
            >
              {saving ? 'Creating...' : 'Create Bank Account'}
            </button>
            <Link
              href="/finance/bank-accounts"
              className="py-2.5 px-6 text-sm text-zinc-300 hover:text-zinc-100 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            toast.type === 'ok'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  )
}
