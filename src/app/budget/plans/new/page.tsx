'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Save, Loader2 } from 'lucide-react'

interface Account {
  id: string
  code: string
  name: string
  type: string
}

export default function NewBudgetPlanPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [budgetAmounts, setBudgetAmounts] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    code: 'BP-FY2026',
    name: '',
    fiscalYear: 'FY2026',
    description: '',
  })

  useEffect(() => {
    fetch('/api/budget/plans')
      .then(r => r.json())
      .then(() => {})
      .catch(() => {})

    fetch('/api/finance/tax/codes')
      .then(r => r.json())
      .catch(() => {})

    // Fetch accounts for budget entry grid
    fetch('/api/budget/plans?accounts=1')
      .then(async r => {
        if (!r.ok) return
        const data = await r.json()
        if (data.accounts) setAccounts(data.accounts)
      })
      .catch(() => {})
  }, [])

  // Separate fetch for accounts list (dedicated endpoint doesn't exist so use the plans API trick)
  useEffect(() => {
    async function loadAccounts() {
      try {
        const res = await fetch('/api/budget/plans/accounts')
        if (!res.ok) return
        const data = await res.json()
        setAccounts(data)
      } catch {
        // fallback: no accounts shown
      }
    }
    loadAccounts()
  }, [])

  function handleFormChange(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleAmountChange(accountId: string, value: string) {
    setBudgetAmounts(prev => ({ ...prev, [accountId]: value }))
  }

  async function handleSave() {
    if (!form.code.trim() || !form.name.trim()) {
      setError('Code and Name are required.')
      return
    }
    setSaving(true)
    setError(null)

    const entries = Object.entries(budgetAmounts)
      .filter(([, val]) => val && Number(val) > 0)
      .map(([accountId, val]) => ({
        accountId,
        budgetAmount: Number(val),
      }))

    try {
      const res = await fetch('/api/budget/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, entries }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Failed to create budget plan.')
        setSaving(false)
        return
      }

      router.push('/budget/plans')
    } catch {
      setError('Network error. Please try again.')
      setSaving(false)
    }
  }

  const revenueAccounts = accounts.filter(a => a.type === 'revenue')
  const expenseAccounts = accounts.filter(a => a.type === 'expense')

  return (
    <>
      <TopBar title="New Budget Plan" />
      <main className="flex-1 p-6 overflow-auto space-y-8 max-w-4xl">

        {/* Basic Info */}
        <Card>
          <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-900/60 rounded-t-lg">
            <h3 className="text-sm font-semibold text-zinc-200">Plan Details</h3>
          </div>
          <CardContent className="pt-5 pb-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1.5">Code *</label>
                <Input
                  value={form.code}
                  onChange={e => handleFormChange('code', e.target.value)}
                  placeholder="BP-FY2026"
                  className="bg-zinc-900 border-zinc-700 text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1.5">Fiscal Year *</label>
                <Input
                  value={form.fiscalYear}
                  onChange={e => handleFormChange('fiscalYear', e.target.value)}
                  placeholder="FY2026"
                  className="bg-zinc-900 border-zinc-700 text-zinc-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1.5">Name *</label>
              <Input
                value={form.name}
                onChange={e => handleFormChange('name', e.target.value)}
                placeholder="FY2026 Operating Budget"
                className="bg-zinc-900 border-zinc-700 text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wide mb-1.5">Description</label>
              <Input
                value={form.description}
                onChange={e => handleFormChange('description', e.target.value)}
                placeholder="Annual operating budget for fiscal year 2026"
                className="bg-zinc-900 border-zinc-700 text-zinc-100"
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Budget Grid */}
        {accounts.length > 0 && (
          <Card>
            <div className="px-5 py-3 border-b border-zinc-800 bg-zinc-900/60 rounded-t-lg">
              <h3 className="text-sm font-semibold text-zinc-200">Budget Amounts by Account</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Leave blank to exclude an account from this plan</p>
            </div>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left px-5 pb-3 pt-4 font-medium">Code</th>
                    <th className="text-left pb-3 pt-4 font-medium">Account Name</th>
                    <th className="text-left pb-3 pt-4 font-medium">Type</th>
                    <th className="text-right px-5 pb-3 pt-4 font-medium">Budget Amount ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {revenueAccounts.length > 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-2 bg-zinc-900/40">
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Revenue</span>
                      </td>
                    </tr>
                  )}
                  {revenueAccounts.map(acct => (
                    <tr key={acct.id} className="hover:bg-zinc-900/40">
                      <td className="px-5 py-2.5 font-mono text-xs text-zinc-500">{acct.code}</td>
                      <td className="py-2.5 pr-4 text-zinc-300">{acct.name}</td>
                      <td className="py-2.5 pr-4">
                        <Badge variant="default" className="text-xs">Revenue</Badge>
                      </td>
                      <td className="px-5 py-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={budgetAmounts[acct.id] ?? ''}
                          onChange={e => handleAmountChange(acct.id, e.target.value)}
                          placeholder="0.00"
                          className="bg-zinc-900 border-zinc-700 text-zinc-100 text-right w-36 ml-auto"
                        />
                      </td>
                    </tr>
                  ))}
                  {expenseAccounts.length > 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-2 bg-zinc-900/40">
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Expenses</span>
                      </td>
                    </tr>
                  )}
                  {expenseAccounts.map(acct => (
                    <tr key={acct.id} className="hover:bg-zinc-900/40">
                      <td className="px-5 py-2.5 font-mono text-xs text-zinc-500">{acct.code}</td>
                      <td className="py-2.5 pr-4 text-zinc-300">{acct.name}</td>
                      <td className="py-2.5 pr-4">
                        <Badge variant="warning" className="text-xs">Expense</Badge>
                      </td>
                      <td className="px-5 py-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={budgetAmounts[acct.id] ?? ''}
                          onChange={e => handleAmountChange(acct.id, e.target.value)}
                          placeholder="0.00"
                          className="bg-zinc-900 border-zinc-700 text-zinc-100 text-right w-36 ml-auto"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Saving…</>
            ) : (
              <><Save className="w-4 h-4 mr-1" />Save as Draft</>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/budget/plans')}
            disabled={saving}
          >
            Cancel
          </Button>
        </div>
      </main>
    </>
  )
}
