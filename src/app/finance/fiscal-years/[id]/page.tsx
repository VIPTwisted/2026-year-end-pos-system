'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { TopBar } from '@/components/layout/TopBar'

interface FiscalPeriod {
  id: string
  fiscalYearId: string
  periodNumber: number
  name: string
  startDate: string
  endDate: string
  status: string
  closedAt: string | null
}

interface FiscalYear {
  id: string
  name: string
  startDate: string
  endDate: string
  status: string
  closedAt: string | null
  periods: FiscalPeriod[]
}

interface ConfirmModal {
  title: string
  message: string
  confirmLabel: string
  danger?: boolean
  onConfirm: () => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function FiscalYearDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const [year, setYear] = useState<FiscalYear | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)
  const [modal, setModal] = useState<ConfirmModal | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  const loadYear = useCallback(async () => {
    try {
      const res = await fetch(`/api/finance/fiscal-years/${id}`)
      const data = await res.json() as { fiscalYear?: FiscalYear; error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Failed to load')
        return
      }
      setYear(data.fiscalYear!)
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void loadYear()
  }, [loadYear])

  async function updatePeriodStatus(periodId: string, status: 'open' | 'closed') {
    setActionLoading(periodId)
    try {
      const res = await fetch(`/api/finance/fiscal-years/${id}/periods/${periodId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) {
        notify(data.error ?? 'Failed to update period', 'err')
        return
      }
      notify(status === 'closed' ? 'Period closed' : 'Period reopened')
      await loadYear()
    } catch {
      notify('Network error', 'err')
    } finally {
      setActionLoading(null)
      setModal(null)
    }
  }

  async function closeYear() {
    setActionLoading('year')
    try {
      const res = await fetch(`/api/finance/fiscal-years/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) {
        notify(data.error ?? 'Failed to close fiscal year', 'err')
        return
      }
      notify('Fiscal year closed')
      await loadYear()
    } catch {
      notify('Network error', 'err')
    } finally {
      setActionLoading(null)
      setModal(null)
    }
  }

  function confirmClosePeriod(period: FiscalPeriod) {
    setModal({
      title: 'Close Period',
      message: `Closing "${period.name}" prevents new journal entries from being posted to it. This action can be reversed while the fiscal year remains open. Continue?`,
      confirmLabel: 'Close Period',
      danger: false,
      onConfirm: () => void updatePeriodStatus(period.id, 'closed'),
    })
  }

  function confirmReopenPeriod(period: FiscalPeriod) {
    setModal({
      title: 'Reopen Period',
      message: `Reopen "${period.name}"? This will allow journal entries to be posted to this period again.`,
      confirmLabel: 'Reopen Period',
      danger: false,
      onConfirm: () => void updatePeriodStatus(period.id, 'open'),
    })
  }

  function confirmCloseYear() {
    setModal({
      title: 'Close Fiscal Year',
      message: `Closing "${year?.name}" is a significant action. All periods are closed and no further journal entries can be posted. Are you absolutely sure?`,
      confirmLabel: 'Close Fiscal Year',
      danger: true,
      onConfirm: () => void closeYear(),
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
        <TopBar title="Fiscal Year" showBack />
        <div className="flex items-center justify-center flex-1">
          <p className="text-zinc-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !year) {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
        <TopBar title="Fiscal Year" showBack />
        <div className="flex items-center justify-center flex-1">
          <p className="text-red-400 text-sm">{error ?? 'Not found'}</p>
        </div>
      </div>
    )
  }

  const closedCount = year.periods.filter((p) => p.status === 'closed').length
  const allClosed = closedCount === year.periods.length && year.periods.length > 0
  const yearOpen = year.status === 'open'

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title={year.name}
        breadcrumb={[
          { label: 'Finance', href: '/finance' },
          { label: 'Fiscal Periods', href: '/finance/fiscal-years' },
        ]}
        showBack
      />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-16 right-4 z-50 px-4 py-2.5 rounded shadow-lg text-sm font-medium transition-all ${
            toast.type === 'ok'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Confirmation Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#16213e] border border-zinc-800/60 rounded-lg shadow-2xl w-full max-w-md mx-4 p-6 space-y-4">
            <h3 className="text-base font-semibold text-zinc-100">{modal.title}</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{modal.message}</p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100 bg-zinc-800/50 hover:bg-zinc-800 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={modal.onConfirm}
                disabled={actionLoading !== null}
                className={`px-4 py-2 text-sm font-medium text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  modal.danger
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {actionLoading !== null ? 'Working...' : modal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-5xl mx-auto w-full p-6 space-y-6">
        {/* Year Header Card */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-zinc-100">{year.name}</h2>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                    year.status === 'open'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-zinc-700/60 text-zinc-400'
                  }`}
                >
                  {year.status}
                </span>
              </div>
              <p className="text-sm text-zinc-500 mt-1">
                {formatDate(year.startDate)} — {formatDate(year.endDate)}
              </p>
              {year.closedAt && (
                <p className="text-xs text-zinc-600 mt-0.5">
                  Closed: {formatDate(year.closedAt)}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-zinc-100 tabular-nums">
                {closedCount}/{year.periods.length}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Periods Closed
              </p>
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-500/8 border border-amber-500/20 rounded-lg">
          <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-amber-400/90 leading-relaxed">
            Closing a period prevents journal entries from being posted to it. Periods can be reopened while the fiscal year remains open.
          </p>
        </div>

        {/* Periods Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/50">
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Accounting Periods
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-5 py-3">#</th>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-5 py-3">Period</th>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-5 py-3">Start Date</th>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-5 py-3">End Date</th>
                  <th className="text-left text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-5 py-3">Status</th>
                  <th className="text-right text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {year.periods.map((period) => (
                  <tr key={period.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                    <td className="px-5 py-3 font-mono text-zinc-500 text-[12px]">
                      {String(period.periodNumber).padStart(2, '0')}
                    </td>
                    <td className="px-5 py-3 text-zinc-200 font-medium">{period.name}</td>
                    <td className="px-5 py-3 text-zinc-400 font-mono text-[12px]">
                      {formatDate(period.startDate)}
                    </td>
                    <td className="px-5 py-3 text-zinc-400 font-mono text-[12px]">
                      {formatDate(period.endDate)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          period.status === 'open'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-zinc-700/60 text-zinc-400'
                        }`}
                      >
                        {period.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {period.status === 'open' && yearOpen && (
                        <button
                          onClick={() => confirmClosePeriod(period)}
                          disabled={actionLoading === period.id}
                          className="px-3 py-1 text-[11px] font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded transition-colors disabled:opacity-50"
                        >
                          Close
                        </button>
                      )}
                      {period.status === 'closed' && yearOpen && (
                        <button
                          onClick={() => confirmReopenPeriod(period)}
                          disabled={actionLoading === period.id}
                          className="px-3 py-1 text-[11px] font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded transition-colors disabled:opacity-50"
                        >
                          Reopen
                        </button>
                      )}
                      {year.status === 'closed' && (
                        <span className="text-[11px] text-zinc-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Close Year button — only visible when all periods are closed and year is still open */}
        {allClosed && yearOpen && (
          <div className="bg-[#16213e] border border-red-500/20 rounded-lg p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-200">Close Fiscal Year</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  All {year.periods.length} periods are closed. You may now close the entire fiscal year. This action cannot be reversed.
                </p>
              </div>
              <button
                onClick={confirmCloseYear}
                disabled={actionLoading === 'year'}
                className="shrink-0 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              >
                {actionLoading === 'year' ? 'Closing...' : 'Close Year'}
              </button>
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="pt-2">
          <button
            onClick={() => router.push('/finance/fiscal-years')}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← Back to Fiscal Years
          </button>
        </div>
      </main>
    </div>
  )
}
