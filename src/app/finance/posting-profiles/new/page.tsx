'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'

interface Account {
  id: string
  code: string
  name: string
  type: string
}

interface RuleRow {
  id: string
  transactionType: string
  debitAccountId: string
  creditAccountId: string
  applicableTo: string
}

const MODULES = ['AP', 'AR', 'INVENTORY', 'BANK', 'PAYROLL'] as const
type Module = typeof MODULES[number]

const TRANSACTION_TYPES: Record<Module, string[]> = {
  AP: ['VendorInvoice', 'VendorPayment', 'VendorCreditMemo', 'PrepaymentInvoice'],
  AR: ['CustomerInvoice', 'CustomerPayment', 'CustomerCreditMemo', 'FinanceCharge'],
  INVENTORY: ['PositiveAdjustment', 'NegativeAdjustment', 'Transfer', 'PurchaseReceipt', 'SalesShipment'],
  BANK: ['BankDeposit', 'BankWithdrawal', 'BankFee', 'BankInterest', 'BankTransfer'],
  PAYROLL: ['PayrollWages', 'PayrollTax', 'PayrollBenefit', 'PayrollNetPay'],
}

function newRow(): RuleRow {
  return { id: crypto.randomUUID(), transactionType: '', debitAccountId: '', creditAccountId: '', applicableTo: '' }
}

export default function NewPostingProfilePage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [module, setModule] = useState<Module>('AP')
  const [description, setDescription] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [rules, setRules] = useState<RuleRow[]>([newRow()])

  useEffect(() => {
    fetch('/api/finance/accounts')
      .then((r) => r.json())
      .then((data) => setAccounts(data.accounts ?? []))
      .catch(() => setAccounts([]))
      .finally(() => setLoadingAccounts(false))
  }, [])

  function addRule() {
    setRules((prev) => [...prev, newRow()])
  }

  function removeRule(id: string) {
    setRules((prev) => prev.filter((r) => r.id !== id))
  }

  function updateRule(id: string, field: keyof RuleRow, value: string) {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!code.trim() || !name.trim()) {
      setError('Code and Name are required.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/finance/posting-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          module,
          description: description.trim() || null,
          isDefault,
          rules: rules
            .filter((r) => r.transactionType.trim())
            .map((r) => ({
              transactionType: r.transactionType.trim(),
              debitAccountId: r.debitAccountId || null,
              creditAccountId: r.creditAccountId || null,
              applicableTo: r.applicableTo.trim() || null,
            })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save profile')
      router.push('/finance/posting-profiles')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  const txTypes = TRANSACTION_TYPES[module]

  const inputCls =
    'w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors'
  const labelCls = 'block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide'

  return (
    <div className="flex flex-col min-h-[100dvh] bg-zinc-950">
      <TopBar title="New Posting Profile" />

      <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <div className="mb-6">
          <button
            onClick={() => router.push('/finance/posting-profiles')}
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Posting Profiles
          </button>
          <h2 className="text-xl font-semibold text-zinc-100">Create Posting Profile</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Define which GL accounts are debited and credited for each transaction type.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Info */}
          <div className="border border-zinc-800 rounded-xl p-6 space-y-5 bg-zinc-900/20">
            <h3 className="text-sm font-semibold text-zinc-200 border-b border-zinc-800 pb-3">
              Profile Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Code *</label>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="e.g. AP-STD"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  maxLength={20}
                />
              </div>
              <div>
                <label className={labelCls}>Module *</label>
                <select
                  className={inputCls}
                  value={module}
                  onChange={(e) => setModule(e.target.value as Module)}
                >
                  {MODULES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Name *</label>
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. AP Standard Posting"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={2}
                placeholder="Optional description of this profile's purpose..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="isDefault"
                type="checkbox"
                className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-blue-500/30 accent-blue-500"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
              />
              <label htmlFor="isDefault" className="text-sm text-zinc-300 cursor-pointer">
                Set as default profile for this module
              </label>
            </div>
          </div>

          {/* Rules */}
          <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-900/20">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">Posting Rules</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Map each transaction type to debit and credit accounts.
                </p>
              </div>
              <Button
                type="button"
                onClick={addRule}
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs h-8 gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Rule
              </Button>
            </div>

            {loadingAccounts ? (
              <div className="flex items-center justify-center py-12 gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                <span className="text-sm text-zinc-500">Loading accounts...</span>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/50">
                        <th className="text-left px-5 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">
                          Transaction Type
                        </th>
                        <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">
                          Debit Account
                        </th>
                        <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium">
                          Credit Account
                        </th>
                        <th className="text-left px-4 py-3 text-zinc-500 text-xs uppercase tracking-wide font-medium w-32">
                          Applies To
                        </th>
                        <th className="px-4 py-3 w-12" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {rules.map((rule) => (
                        <tr key={rule.id} className="hover:bg-zinc-900/30">
                          <td className="px-5 py-3">
                            <select
                              className={`${inputCls} min-w-[180px]`}
                              value={rule.transactionType}
                              onChange={(e) => updateRule(rule.id, 'transactionType', e.target.value)}
                            >
                              <option value="">— Select type —</option>
                              {txTypes.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                              <option value="__custom__" disabled>── Custom ──</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              className={`${inputCls} min-w-[200px]`}
                              value={rule.debitAccountId}
                              onChange={(e) => updateRule(rule.id, 'debitAccountId', e.target.value)}
                            >
                              <option value="">— None —</option>
                              {accounts.map((a) => (
                                <option key={a.id} value={a.id}>
                                  {a.code} — {a.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              className={`${inputCls} min-w-[200px]`}
                              value={rule.creditAccountId}
                              onChange={(e) => updateRule(rule.id, 'creditAccountId', e.target.value)}
                            >
                              <option value="">— None —</option>
                              {accounts.map((a) => (
                                <option key={a.id} value={a.id}>
                                  {a.code} — {a.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              className={`${inputCls} min-w-[100px]`}
                              placeholder="ALL"
                              value={rule.applicableTo}
                              onChange={(e) => updateRule(rule.id, 'applicableTo', e.target.value)}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => removeRule(rule.id)}
                              className="text-zinc-600 hover:text-red-400 transition-colors p-1 rounded"
                              title="Remove rule"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {rules.length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-sm text-zinc-600 italic">No rules added yet. Click &quot;Add Rule&quot; to start.</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
            <Button
              type="button"
              variant="outline"
              className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-sm"
              onClick={() => router.push('/finance/posting-profiles')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm gap-2 min-w-[120px]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
