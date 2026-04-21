'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Account {
  id: string
  code: string
  name: string
  type: string
  subtype: string | null
  balance: number
}

interface BudgetEntry {
  accountId: string
  budgeted: string
}

export default function BudgetNewPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [budgets, setBudgets] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/accounts')
      .then(r => r.json())
      .then((data: Account[]) => {
        setAccounts(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load accounts.')
        setLoading(false)
      })
  }, [])

  function handleChange(accountId: string, value: string) {
    setBudgets(prev => ({ ...prev, [accountId]: value }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)

    const entries: BudgetEntry[] = Object.entries(budgets)
      .filter(([, v]) => v !== '' && !isNaN(Number(v)))
      .map(([accountId, budgeted]) => ({ accountId, budgeted }))

    // Log to console — no Budget model yet
    console.log('[Budget Plan] Saving entries:', entries)
    console.log('[Budget Plan] Total accounts with budget:', entries.length)

    // Simulate save (POST stub — no schema yet)
    await new Promise(r => setTimeout(r, 600))

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 4000)
  }

  // Group accounts by type
  const typeOrder = ['expense', 'revenue', 'asset', 'liability', 'equity'] as const
  const grouped: Record<string, Account[]> = {}
  for (const acct of accounts) {
    if (!grouped[acct.type]) grouped[acct.type] = []
    grouped[acct.type].push(acct)
  }

  const totalBudgeted = Object.values(budgets).reduce((sum, v) => {
    const n = parseFloat(v)
    return sum + (isNaN(n) ? 0 : n)
  }, 0)

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100">
      {/* Sticky header */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-950 flex items-center px-6 gap-4 sticky top-0 z-10">
        <Link href="/budget" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Budget
        </Link>
        <span className="text-zinc-700">|</span>
        <h1 className="text-base font-semibold text-zinc-100">Configure Budget Plan — FY2026</h1>
        <div className="ml-auto flex items-center gap-3">
          {totalBudgeted > 0 && (
            <span className="text-sm text-zinc-400">
              Total budgeted:{' '}
              <span className="text-blue-400 font-semibold">
                ${totalBudgeted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </span>
          )}
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? (
              <>
                <span className="animate-spin mr-1.5">⟳</span> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1" />
                Save Budget Plan
              </>
            )}
          </Button>
        </div>
      </header>

      <main className="p-6 max-w-5xl mx-auto space-y-6">

        {/* Info banner */}
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <p className="text-sm text-zinc-400">
                Budget entries will be tracked against actual GL balances from posted journal lines.
                Enter target amounts for each account. Leave blank to exclude from budget tracking.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Success banner */}
        {saved && (
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-sm text-emerald-300">
                  Budget plan saved. (Logged to console — awaiting Budget schema migration.)
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error banner */}
        {error && (
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-20 text-zinc-500">
              <p className="text-sm">Loading accounts...</p>
            </CardContent>
          </Card>
        ) : (
          typeOrder.filter(t => grouped[t]?.length > 0).map(type => (
            <section key={type}>
              <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3 capitalize">
                {type} Accounts
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                      <th className="text-left pb-3 font-medium">Code</th>
                      <th className="text-left pb-3 font-medium">Account Name</th>
                      <th className="text-right pb-3 font-medium">Current Balance</th>
                      <th className="text-right pb-3 font-medium w-52">Budget Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {grouped[type].map(acct => (
                      <tr key={acct.id} className="hover:bg-zinc-900/30">
                        <td className="py-3 pr-4 font-mono text-xs text-zinc-500">{acct.code}</td>
                        <td className="py-3 pr-4 text-zinc-200">
                          {acct.name}
                          {acct.subtype && (
                            <span className="text-xs text-zinc-600 ml-2">({acct.subtype})</span>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-right text-zinc-400 font-medium">
                          ${acct.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-zinc-600 text-xs">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              value={budgets[acct.id] ?? ''}
                              onChange={e => handleChange(acct.id, e.target.value)}
                              className="w-40 bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-right text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))
        )}

        {/* Save footer */}
        {!loading && accounts.length > 0 && (
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <p className="text-xs text-zinc-600">
              {Object.values(budgets).filter(v => v !== '' && !isNaN(Number(v))).length} accounts with budget entries
            </p>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Save Budget Plan
                </>
              )}
            </Button>
          </div>
        )}

      </main>
    </div>
  )
}
