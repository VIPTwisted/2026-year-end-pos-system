'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import {
  CheckCircle,
  XCircle,
  ChevronRight,
  Loader2,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BookOpen,
} from 'lucide-react'

interface FiscalPeriod {
  id: string
  periodNumber: number
  name: string
  startDate: string
  endDate: string
  status: string
}

interface FiscalYear {
  id: string
  name: string
  startDate: string
  endDate: string
  status: string
  periods: FiscalPeriod[]
  yearEndClose: {
    id: string
    status: string
    totalRevenue: number
    totalExpenses: number
    netIncome: number
    closingVoucherId: string | null
    openingVoucherId: string | null
    completedAt: string | null
  } | null
}

interface Account {
  id: string
  code: string
  name: string
  type: string
  balance: number
}

interface YearEndWizardProps {
  openFiscalYears: FiscalYear[]
  equityAccounts: Account[]
  revenueAccounts: Account[]
  expenseAccounts: Account[]
  totalDebits: number
  totalCredits: number
}

const STEPS = [
  { number: 1, label: 'Select Fiscal Year' },
  { number: 2, label: 'Validate' },
  { number: 3, label: 'Close' },
  { number: 4, label: 'Complete' },
]

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, idx) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                step.number < current
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : step.number === current
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-500'
              }`}
            >
              {step.number < current ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                step.number
              )}
            </div>
            <span
              className={`text-[10px] mt-1.5 font-medium whitespace-nowrap ${
                step.number === current ? 'text-blue-400' : 'text-zinc-500'
              }`}
            >
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div
              className={`h-0.5 w-16 mx-2 mb-5 transition-colors ${
                step.number < current ? 'bg-emerald-600' : 'bg-zinc-800'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function CheckRow({ label, passed, detail }: { label: string; passed: boolean; detail?: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-zinc-800 last:border-0">
      <div className="mt-0.5">
        {passed ? (
          <CheckCircle className="w-5 h-5 text-emerald-400" />
        ) : (
          <XCircle className="w-5 h-5 text-red-400" />
        )}
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${passed ? 'text-zinc-100' : 'text-red-300'}`}>{label}</p>
        {detail && <p className="text-xs text-zinc-500 mt-0.5">{detail}</p>}
      </div>
    </div>
  )
}

export function YearEndWizard({
  openFiscalYears,
  equityAccounts,
  revenueAccounts,
  expenseAccounts,
  totalDebits,
  totalCredits,
}: YearEndWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedFY, setSelectedFY] = useState<FiscalYear | null>(null)
  const [retainedEarningsId, setRetainedEarningsId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [closeResult, setCloseResult] = useState<{
    yearEndClose: {
      id: string
      totalRevenue: number
      totalExpenses: number
      netIncome: number
    }
    summary: {
      closingRef: string
      openingRef: string
      revenueAccountsZeroed: number
      expenseAccountsZeroed: number
    }
  } | null>(null)

  const formatDateOnly = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  // Validation for selected FY
  const allPeriodsClosed =
    selectedFY?.periods.every(p => p.status === 'closed') ?? false
  const glBalanced = Math.abs(totalDebits - totalCredits) < 0.01
  const hasEquityAccount = equityAccounts.length > 0

  const totalRevenue = revenueAccounts.reduce((s, a) => s + a.balance, 0)
  const totalExpenses = expenseAccounts.reduce((s, a) => s + a.balance, 0)
  const netIncome = totalRevenue - totalExpenses

  const canProceedToStep3 = allPeriodsClosed && hasEquityAccount

  async function executeClose() {
    if (!selectedFY || !retainedEarningsId) {
      setError('Select a retained earnings account to continue.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/year-end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fiscalYearId: selectedFY.id,
          retainedEarningsAccountId: retainedEarningsId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Year-end close failed')
        return
      }

      setCloseResult(data)
      setStep(4)
      router.refresh()
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <StepIndicator current={step} />

      {/* Step 1: Select Fiscal Year */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-zinc-100">Select Fiscal Year</h2>
            <p className="text-sm text-zinc-500 mt-1">
              Choose the fiscal year you want to close. All periods must be closed before proceeding.
            </p>
          </div>

          {openFiscalYears.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <Calendar className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-sm">No open fiscal years available for close</p>
                <p className="text-xs mt-1">All fiscal years are already closed or no years exist</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {openFiscalYears.map(fy => {
                const openPeriods = fy.periods.filter(p => p.status !== 'closed').length
                const isSelected = selectedFY?.id === fy.id

                return (
                  <button
                    key={fy.id}
                    onClick={() => setSelectedFY(fy)}
                    className={`w-full text-left rounded-xl border p-5 transition-colors ${
                      isSelected
                        ? 'border-blue-600 bg-blue-950/20'
                        : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-900/70'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-base font-semibold text-zinc-100">{fy.name}</p>
                        <p className="text-sm text-zinc-500 mt-0.5">
                          {formatDateOnly(fy.startDate)} — {formatDateOnly(fy.endDate)}
                        </p>
                        <div className="flex gap-3 mt-2 text-xs">
                          <span className="text-zinc-400">{fy.periods.length} total periods</span>
                          {openPeriods > 0 ? (
                            <span className="text-amber-400">{openPeriods} period(s) still open</span>
                          ) : (
                            <span className="text-emerald-400">All periods closed</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={fy.status === 'closing' ? 'warning' : 'default'}>
                          {fy.status}
                        </Badge>
                        {isSelected && <CheckCircle className="w-5 h-5 text-blue-400" />}
                      </div>
                    </div>

                    {/* Revenue/Expense summary */}
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="rounded-lg bg-zinc-800/50 px-3 py-2">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Revenue</p>
                        <p className="text-sm font-semibold text-emerald-400">
                          {formatCurrency(totalRevenue)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-zinc-800/50 px-3 py-2">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Expenses</p>
                        <p className="text-sm font-semibold text-red-400">
                          {formatCurrency(totalExpenses)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-zinc-800/50 px-3 py-2">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Net Income</p>
                        <p className={`text-sm font-semibold ${netIncome >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatCurrency(netIncome)}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button
              onClick={() => setStep(2)}
              disabled={!selectedFY}
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Validate */}
      {step === 2 && selectedFY && (
        <div className="space-y-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-zinc-100">Validate — {selectedFY.name}</h2>
            <p className="text-sm text-zinc-500 mt-1">
              All checks must pass before the year-end close can proceed.
            </p>
          </div>

          {/* Validation checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">System Validation Checks</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CheckRow
                label="All fiscal periods closed"
                passed={allPeriodsClosed}
                detail={
                  allPeriodsClosed
                    ? `${selectedFY.periods.length} periods closed`
                    : `${selectedFY.periods.filter(p => p.status !== 'closed').length} period(s) still open — close them in Fiscal Calendar first`
                }
              />
              <CheckRow
                label="GL debits = credits (balanced)"
                passed={glBalanced}
                detail={
                  glBalanced
                    ? `Debits: ${formatCurrency(totalDebits)} | Credits: ${formatCurrency(totalCredits)}`
                    : `Imbalance: ${formatCurrency(Math.abs(totalDebits - totalCredits))} — check journal entries`
                }
              />
              <CheckRow
                label="Equity account exists for retained earnings"
                passed={hasEquityAccount}
                detail={
                  hasEquityAccount
                    ? `${equityAccounts.length} equity account(s) available`
                    : 'No equity accounts found — create a retained earnings account in Chart of Accounts'
                }
              />
            </CardContent>
          </Card>

          {/* Revenue accounts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Revenue Accounts</CardTitle>
                <span className="text-sm font-semibold text-emerald-400">{formatCurrency(totalRevenue)}</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {revenueAccounts.length === 0 ? (
                <p className="text-sm text-zinc-500">No revenue accounts with balances</p>
              ) : (
                <div className="space-y-2">
                  {revenueAccounts.map(acc => (
                    <div key={acc.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-mono text-xs text-zinc-500">{acc.code}</span>
                        <span className="text-zinc-300">{acc.name}</span>
                      </div>
                      <span className="text-emerald-400 font-semibold">{formatCurrency(acc.balance)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expense accounts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Expense Accounts</CardTitle>
                <span className="text-sm font-semibold text-red-400">{formatCurrency(totalExpenses)}</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {expenseAccounts.length === 0 ? (
                <p className="text-sm text-zinc-500">No expense accounts with balances</p>
              ) : (
                <div className="space-y-2">
                  {expenseAccounts.map(acc => (
                    <div key={acc.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                        <span className="font-mono text-xs text-zinc-500">{acc.code}</span>
                        <span className="text-zinc-300">{acc.name}</span>
                      </div>
                      <span className="text-red-400 font-semibold">{formatCurrency(acc.balance)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Net income */}
          <Card className={`border-2 ${netIncome >= 0 ? 'border-emerald-700/40 bg-emerald-950/10' : 'border-red-700/40 bg-red-950/10'}`}>
            <CardContent className="py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Calculated Net Income</p>
                  <p className="text-xs text-zinc-600">Revenue ({formatCurrency(totalRevenue)}) — Expenses ({formatCurrency(totalExpenses)})</p>
                </div>
                <p className={`text-3xl font-bold ${netIncome >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(netIncome)}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => setStep(3)} disabled={!canProceedToStep3}>
              {canProceedToStep3 ? 'Proceed to Close' : 'Fix Issues First'}
              {canProceedToStep3 && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Close */}
      {step === 3 && selectedFY && (
        <div className="space-y-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-zinc-100">Execute Year-End Close — {selectedFY.name}</h2>
            <p className="text-sm text-zinc-500 mt-1">
              Review the summary and select the retained earnings account. This action is irreversible.
            </p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="py-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-950/40">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Total Revenue</p>
                    <p className="text-lg font-bold text-emerald-400">{formatCurrency(totalRevenue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-950/40">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Total Expenses</p>
                    <p className="text-lg font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={`border-2 ${netIncome >= 0 ? 'border-emerald-700/40' : 'border-red-700/40'}`}>
              <CardContent className="py-5">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${netIncome >= 0 ? 'bg-emerald-950/40' : 'bg-red-950/40'}`}>
                    <DollarSign className={`w-4 h-4 ${netIncome >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Net Income</p>
                    <p className={`text-lg font-bold ${netIncome >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(netIncome)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Retained Earnings selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Retained Earnings Account</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-zinc-500 mb-3">
                Net income of {formatCurrency(netIncome)} will be posted to this equity account.
              </p>
              <select
                value={retainedEarningsId}
                onChange={e => setRetainedEarningsId(e.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">— Select retained earnings account —</option>
                {equityAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.code} — {acc.name} ({formatCurrency(acc.balance)})
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Warning */}
          <Card className="border-amber-700/40 bg-amber-950/10">
            <CardContent className="py-4">
              <p className="text-xs text-amber-300">
                <strong>Warning:</strong> Executing the year-end close will zero all revenue and expense account balances,
                post a closing journal entry, and mark fiscal year {selectedFY.name} as closed.
                This action cannot be undone without a manual reversal.
              </p>
            </CardContent>
          </Card>

          {error && (
            <div className="rounded-md border border-red-700/40 bg-red-950/20 px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setStep(2)} disabled={loading}>
              Back
            </Button>
            <Button
              variant="destructive"
              onClick={executeClose}
              disabled={loading || !retainedEarningsId}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executing Close…
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Execute Year-End Close
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Complete */}
      {step === 4 && closeResult && selectedFY && (
        <div className="space-y-6">
          <Card className="border-emerald-700/40 bg-emerald-950/10">
            <CardContent className="py-8 text-center">
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-zinc-100 mb-2">Year-End Close Complete</h2>
              <p className="text-sm text-zinc-500">
                Fiscal year <strong className="text-zinc-300">{selectedFY.name}</strong> has been successfully closed.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="py-5 text-center">
                <p className="text-xs text-zinc-500 mb-1">Total Revenue</p>
                <p className="text-lg font-bold text-emerald-400">
                  {formatCurrency(closeResult.yearEndClose.totalRevenue)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-5 text-center">
                <p className="text-xs text-zinc-500 mb-1">Total Expenses</p>
                <p className="text-lg font-bold text-red-400">
                  {formatCurrency(closeResult.yearEndClose.totalExpenses)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-5 text-center">
                <p className="text-xs text-zinc-500 mb-1">Net Income</p>
                <p className={`text-lg font-bold ${closeResult.yearEndClose.netIncome >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(closeResult.yearEndClose.netIncome)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Journal Entry References</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-zinc-800">
                <div>
                  <p className="text-sm text-zinc-300">Closing Voucher</p>
                  <p className="text-xs text-zinc-500">Zeros revenue and expense balances</p>
                </div>
                <code className="font-mono text-xs text-blue-300 bg-zinc-800 px-2 py-1 rounded">
                  {closeResult.summary.closingRef}
                </code>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-zinc-300">Opening Balance Reference</p>
                  <p className="text-xs text-zinc-500">Carry-forward reference for new fiscal year</p>
                </div>
                <code className="font-mono text-xs text-blue-300 bg-zinc-800 px-2 py-1 rounded">
                  {closeResult.summary.openingRef}
                </code>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4">
              <div className="flex gap-6 text-sm text-zinc-400">
                <span>
                  Revenue accounts zeroed:{' '}
                  <strong className="text-zinc-100">{closeResult.summary.revenueAccountsZeroed}</strong>
                </span>
                <span>
                  Expense accounts zeroed:{' '}
                  <strong className="text-zinc-100">{closeResult.summary.expenseAccountsZeroed}</strong>
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center pt-2">
            <Button variant="outline" onClick={() => window.location.href = '/fiscal'}>
              View Fiscal Calendar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
