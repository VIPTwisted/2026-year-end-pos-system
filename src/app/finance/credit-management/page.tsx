'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import { ShieldAlert, ShieldCheck, ShieldX, TrendingUp } from 'lucide-react'

interface CreditRow {
  id: string
  name: string
  email: string | null
  creditLimit: number
  balance: number
  available: number
  utilization: number
  riskClass: 'low' | 'medium' | 'high'
  creditStatus: string
}

interface BlockModal {
  customerId: string
  name: string
  currentStatus: string
}

interface Toast {
  msg: string
  type: 'ok' | 'err'
}

const RISK_BADGE: Record<string, string> = {
  low: 'bg-emerald-500/10 text-emerald-400',
  medium: 'bg-amber-500/10 text-amber-400',
  high: 'bg-red-500/10 text-red-400',
}

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400',
  blocked: 'bg-red-500/10 text-red-400',
  'on-hold': 'bg-amber-500/10 text-amber-400',
  hold: 'bg-amber-500/10 text-amber-400',
  ok: 'bg-emerald-500/10 text-emerald-400',
}

const BLOCK_REASONS = [
  'Non-payment',
  'Exceeded credit limit',
  'Disputed invoices',
  'Credit review pending',
  'Fraud suspicion',
  'Customer request',
  'Other',
]

function UtilBar({ pct }: { pct: number }) {
  const color =
    pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : pct >= 60 ? 'bg-amber-400' : 'bg-emerald-500'
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <span className="font-mono text-xs text-zinc-400 tabular-nums">{pct}%</span>
    </div>
  )
}

function normalizeStatus(s: string): string {
  if (s === 'ok' || s === 'good') return 'active'
  if (s === 'hold') return 'on-hold'
  if (s === 'blocked') return 'blocked'
  return s
}

export default function CreditManagementPage() {
  const [rows, setRows] = useState<CreditRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)
  const [blockModal, setBlockModal] = useState<BlockModal | null>(null)
  const [blockReason, setBlockReason] = useState(BLOCK_REASONS[0])
  const [blockSaving, setBlockSaving] = useState(false)

  const notify = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/finance/credit')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load')
        return r.json()
      })
      .then((d: { customers: CreditRow[] }) => setRows(d.customers))
      .catch(() => setError('Failed to load credit data'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const openBlockModal = useCallback((row: CreditRow) => {
    setBlockModal({ customerId: row.id, name: row.name, currentStatus: normalizeStatus(row.creditStatus) })
    setBlockReason(BLOCK_REASONS[0])
  }, [])

  const handleBlockToggle = useCallback(async () => {
    if (!blockModal) return
    setBlockSaving(true)
    const isBlocked = blockModal.currentStatus === 'blocked'
    const newStatus = isBlocked ? 'active' : 'blocked'
    try {
      const res = await fetch(`/api/finance/credit/${blockModal.customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creditStatus: newStatus, reason: blockReason }),
      })
      if (!res.ok) throw new Error('Update failed')
      notify(`${blockModal.name} ${isBlocked ? 'unblocked' : 'blocked'}`, 'ok')
      setBlockModal(null)
      load()
    } catch {
      notify('Failed to update status', 'err')
    } finally {
      setBlockSaving(false)
    }
  }, [blockModal, blockReason, load, notify])

  const withLimit = rows.filter((r) => r.creditLimit > 0)
  const blocked = rows.filter((r) => normalizeStatus(r.creditStatus) === 'blocked').length
  const overLimit = rows.filter((r) => r.creditLimit > 0 && r.balance > r.creditLimit).length
  const avgUtil = withLimit.length > 0
    ? Math.round(withLimit.reduce((s, r) => s + r.utilization, 0) / withLimit.length)
    : 0

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Credit Management"
        breadcrumb={[{ label: 'Finance', href: '/finance' }]}
      />

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded shadow-lg text-sm font-medium ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {blockModal && (
        <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              {blockModal.currentStatus === 'blocked'
                ? <ShieldCheck className="w-4 h-4 text-emerald-400" />
                : <ShieldX className="w-4 h-4 text-red-400" />}
              <h2 className="text-sm font-semibold text-zinc-100">
                {blockModal.currentStatus === 'blocked' ? 'Unblock' : 'Block'} Credit — {blockModal.name}
              </h2>
            </div>
            {blockModal.currentStatus !== 'blocked' && (
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">
                  Reason Code
                </label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                >
                  {BLOCK_REASONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            )}
            <p className="text-xs text-zinc-400">
              {blockModal.currentStatus === 'blocked'
                ? 'This will restore credit access for this customer.'
                : 'This will block all credit transactions for this customer.'}
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleBlockToggle}
                disabled={blockSaving}
                className={`flex-1 text-white text-sm font-medium rounded px-4 py-2 transition-colors disabled:opacity-50 ${blockModal.currentStatus === 'blocked' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {blockSaving ? 'Saving…' : blockModal.currentStatus === 'blocked' ? 'Unblock' : 'Block'}
              </button>
              <button
                onClick={() => setBlockModal(null)}
                className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm font-medium rounded px-4 py-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">With Credit Limits</div>
            <div className="text-2xl font-bold text-zinc-100 tabular-nums">{withLimit.length}</div>
            <div className="text-xs text-zinc-500 mt-1">of {rows.length} customers</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Blocked Accounts</div>
            <div className="text-2xl font-bold text-red-400 tabular-nums">{blocked}</div>
            <div className="text-xs text-zinc-500 mt-1">credit access suspended</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Over Limit</div>
            <div className="text-2xl font-bold text-amber-400 tabular-nums">{overLimit}</div>
            <div className="text-xs text-zinc-500 mt-1">exceeded credit limit</div>
          </div>
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Avg Utilization
            </div>
            <div className="text-2xl font-bold text-blue-400 tabular-nums">{avgUtil}%</div>
            <div className="text-xs text-zinc-500 mt-1">across {withLimit.length} accounts</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">Customer Credit List</h2>
            <span className="text-xs text-zinc-500">{rows.length} customers</span>
          </div>

          {loading ? (
            <div className="py-20 text-center"><p className="text-sm text-zinc-500">Loading…</p></div>
          ) : error ? (
            <div className="py-20 text-center"><p className="text-sm text-red-400">{error}</p></div>
          ) : rows.length === 0 ? (
            <div className="py-20 text-center"><p className="text-sm text-zinc-500">No customers found.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Customer</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Credit Limit</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Balance</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Available</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Utilization</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Risk</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {rows.map((row) => {
                    const status = normalizeStatus(row.creditStatus)
                    const isBlocked = status === 'blocked'
                    return (
                      <tr key={row.id} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="px-5 py-3">
                          <Link href={`/finance/credit-management/${row.id}`} className="text-sm text-zinc-200 font-medium hover:text-blue-400 transition-colors">
                            {row.name}
                          </Link>
                          {row.email && <div className="text-xs text-zinc-500">{row.email}</div>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono text-sm text-zinc-300 tabular-nums">
                            {row.creditLimit > 0 ? formatCurrency(row.creditLimit) : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-mono text-sm font-semibold tabular-nums ${row.creditLimit > 0 && row.balance > row.creditLimit ? 'text-red-400' : 'text-zinc-200'}`}>
                            {formatCurrency(row.balance)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono text-sm text-emerald-400 tabular-nums">
                            {row.creditLimit > 0 ? formatCurrency(row.available) : '∞'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {row.creditLimit > 0
                            ? <UtilBar pct={row.utilization} />
                            : <span className="text-xs text-zinc-600">—</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${RISK_BADGE[row.riskClass] ?? 'bg-zinc-700 text-zinc-400'}`}>
                            {row.riskClass}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_BADGE[status] ?? 'bg-zinc-700 text-zinc-400'}`}>
                            {isBlocked
                              ? <ShieldX className="w-3 h-3" />
                              : <ShieldAlert className="w-3 h-3" />}
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/finance/credit-management/${row.id}`}
                              className="px-2.5 py-1 rounded text-[11px] font-medium bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
                            >
                              Detail
                            </Link>
                            <button
                              onClick={() => openBlockModal(row)}
                              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${isBlocked ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                            >
                              {isBlocked ? 'Unblock' : 'Block'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
