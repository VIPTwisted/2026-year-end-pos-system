'use client'

import { useEffect, useState, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'

interface CreditRow {
  id: string
  name: string
  email: string | null
  creditLimit: number
  creditBalance: number
  available: number | null
  utilization: number | null
  creditStatus: string
}

interface EditState {
  customerId: string
  creditLimit: string
  creditStatus: string
}

interface Toast {
  msg: string
  type: 'ok' | 'err'
}

const STATUS_BADGE: Record<string, string> = {
  ok: 'bg-emerald-500/10 text-emerald-400',
  watch: 'bg-amber-500/10 text-amber-400',
  hold: 'bg-red-500/10 text-red-400',
  blocked: 'bg-red-800/30 text-red-300',
}

const STATUS_LABEL: Record<string, string> = {
  ok: 'OK',
  watch: 'Watch',
  hold: 'Hold',
  blocked: 'Blocked',
}

function UtilizationBar({ pct }: { pct: number }) {
  const color =
    pct >= 100
      ? 'bg-red-500'
      : pct >= 80
        ? 'bg-amber-500'
        : pct >= 60
          ? 'bg-amber-400'
          : 'bg-emerald-500'
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <span className="font-mono text-xs text-zinc-400 tabular-nums">
        {pct}%
      </span>
    </div>
  )
}

export default function CreditControlPage() {
  const [rows, setRows] = useState<CreditRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)
  const [editing, setEditing] = useState<EditState | null>(null)
  const [saving, setSaving] = useState(false)

  const notify = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/customers/credit')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load')
        return r.json()
      })
      .then((d: { customers: CreditRow[] }) => setRows(d.customers))
      .catch(() => setError('Failed to load credit data'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const onHoldToggle = useCallback(
    async (row: CreditRow) => {
      const newStatus = row.creditStatus === 'hold' ? 'ok' : 'hold'
      try {
        const res = await fetch(`/api/customers/${row.id}/credit`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creditStatus: newStatus }),
        })
        if (!res.ok) throw new Error('Failed to update')
        notify(
          `${row.name} ${newStatus === 'hold' ? 'placed on hold' : 'released'}`,
          'ok'
        )
        load()
      } catch {
        notify('Failed to update credit status', 'err')
      }
    },
    [load, notify]
  )

  const openEdit = useCallback((row: CreditRow) => {
    setEditing({
      customerId: row.id,
      creditLimit: row.creditLimit.toString(),
      creditStatus: row.creditStatus,
    })
  }, [])

  const saveEdit = useCallback(async () => {
    if (!editing) return
    setSaving(true)
    try {
      const res = await fetch(`/api/customers/${editing.customerId}/credit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creditLimit: parseFloat(editing.creditLimit) || 0,
          creditStatus: editing.creditStatus,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      notify('Credit limit updated', 'ok')
      setEditing(null)
      load()
    } catch {
      notify('Failed to save changes', 'err')
    } finally {
      setSaving(false)
    }
  }, [editing, load, notify])

  const onHold = rows.filter((r) => r.creditStatus === 'hold').length
  const overLimit = rows.filter(
    (r) => r.creditLimit > 0 && r.creditBalance > r.creditLimit
  ).length
  const totalExposure = rows.reduce((s, r) => s + r.creditBalance, 0)
  const withLimit = rows.filter((r) => r.creditLimit > 0)
  const avgUtil =
    withLimit.length > 0
      ? Math.round(
          withLimit.reduce((s, r) => s + (r.utilization ?? 0), 0) /
            withLimit.length
        )
      : 0

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Credit Control"
        breadcrumb={[{ label: 'Finance', href: '/finance' }]}
      />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded shadow-lg text-sm font-medium transition-all ${
            toast.type === 'ok'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg w-full max-w-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Set Credit Limit
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">
                  Credit Limit ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={editing.creditLimit}
                  onChange={(e) =>
                    setEditing((prev) =>
                      prev ? { ...prev, creditLimit: e.target.value } : prev
                    )
                  }
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">
                  Status
                </label>
                <select
                  value={editing.creditStatus}
                  onChange={(e) =>
                    setEditing((prev) =>
                      prev ? { ...prev, creditStatus: e.target.value } : prev
                    )
                  }
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                >
                  <option value="ok">OK</option>
                  <option value="watch">Watch</option>
                  <option value="hold">Hold</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={saveEdit}
                disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded px-4 py-2 transition-colors"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => setEditing(null)}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm font-medium rounded px-4 py-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
              On Hold
            </div>
            <div className="text-2xl font-bold text-red-400 tabular-nums">
              {onHold}
            </div>
            <div className="text-xs text-zinc-500 mt-1">customers blocked</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
              Over Limit
            </div>
            <div className="text-2xl font-bold text-amber-400 tabular-nums">
              {overLimit}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              exceeded credit limit
            </div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
              Total Exposure
            </div>
            <div className="text-2xl font-bold text-zinc-100 tabular-nums font-mono">
              {formatCurrency(totalExposure)}
            </div>
            <div className="text-xs text-zinc-500 mt-1">open AR balance</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
              Avg Utilization
            </div>
            <div className="text-2xl font-bold text-blue-400 tabular-nums">
              {avgUtil}%
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              avg across {withLimit.length} with limits
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">
              Customer Credit Exposure
            </h2>
            <span className="text-xs text-zinc-500">{rows.length} customers</span>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <p className="text-sm text-zinc-500">Loading…</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm text-zinc-500">No customers found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Customer
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Credit Limit
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Balance
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Available
                    </th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Utilization
                    </th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-zinc-800/20 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="text-sm text-zinc-200 font-medium">
                          {row.name}
                        </div>
                        {row.email && (
                          <div className="text-xs text-zinc-500">{row.email}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-sm text-zinc-300 tabular-nums">
                          {row.creditLimit > 0
                            ? formatCurrency(row.creditLimit)
                            : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`font-mono text-sm font-semibold tabular-nums ${
                            row.creditLimit > 0 &&
                            row.creditBalance > row.creditLimit
                              ? 'text-red-400'
                              : 'text-zinc-200'
                          }`}
                        >
                          {formatCurrency(row.creditBalance)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-sm text-emerald-400 tabular-nums">
                          {row.available !== null
                            ? formatCurrency(row.available)
                            : '∞'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {row.utilization !== null ? (
                          <UtilizationBar pct={row.utilization} />
                        ) : (
                          <span className="text-xs text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                            STATUS_BADGE[row.creditStatus] ??
                            'bg-zinc-700 text-zinc-400'
                          }`}
                        >
                          {STATUS_LABEL[row.creditStatus] ?? row.creditStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(row)}
                            className="px-2.5 py-1 rounded text-[11px] font-medium bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
                          >
                            Set Limit
                          </button>
                          <button
                            onClick={() => onHoldToggle(row)}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                              row.creditStatus === 'hold'
                                ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                            }`}
                          >
                            {row.creditStatus === 'hold' ? 'Release' : 'Hold'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
