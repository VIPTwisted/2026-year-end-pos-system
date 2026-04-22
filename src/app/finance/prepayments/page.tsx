'use client'

import { useEffect, useState, useCallback } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { formatCurrency } from '@/lib/utils'
import { Plus, X, Check, ArrowRight } from 'lucide-react'

interface PrepaymentRow {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  customerEmail: string | null
  invoiceDate: string
  totalAmount: number
  appliedAmount: number
  remaining: number
  expiryDate: string
  status: string
  isExpired: boolean
  notes: string | null
}

interface Kpis {
  totalCount: number
  totalPrepaid: number
  totalApplied: number
  totalRemaining: number
}

interface ApplyModal {
  prepaymentId: string
  invoiceNumber: string
  customerName: string
  remaining: number
}

interface CreateForm {
  customerId: string
  amount: string
  notes: string
}

interface Toast {
  msg: string
  type: 'ok' | 'err'
}

interface CustomerOption {
  id: string
  name: string
}

function fmtDate(d: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(d))
}

export default function PrepaymentsPage() {
  const [rows, setRows] = useState<PrepaymentRow[]>([])
  const [kpis, setKpis] = useState<Kpis | null>(null)
  const [loading, setLoading] = useState(true)
  const [applyModal, setApplyModal] = useState<ApplyModal | null>(null)
  const [applyInvoiceId, setApplyInvoiceId] = useState('')
  const [applyAmount, setApplyAmount] = useState('')
  const [applying, setApplying] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState<CreateForm>({ customerId: '', amount: '', notes: '' })
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [creating, setCreating] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)

  const notify = useCallback((msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/finance/prepayments')
      .then((r) => { if (!r.ok) throw new Error('Failed'); return r.json() })
      .then((d: { prepayments: PrepaymentRow[]; kpis: Kpis }) => {
        setRows(d.prepayments)
        setKpis(d.kpis)
      })
      .catch(() => notify('Failed to load prepayments', 'err'))
      .finally(() => setLoading(false))
  }, [notify])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    // Load customers for create form
    fetch('/api/finance/credit')
      .then((r) => r.json())
      .then((d: { customers: { id: string; name: string }[] }) =>
        setCustomers(d.customers.map((c) => ({ id: c.id, name: c.name })))
      )
      .catch(() => {})
  }, [])

  const openApply = useCallback((row: PrepaymentRow) => {
    setApplyModal({ prepaymentId: row.id, invoiceNumber: row.invoiceNumber, customerName: row.customerName, remaining: row.remaining })
    setApplyInvoiceId('')
    setApplyAmount(row.remaining.toFixed(2))
  }, [])

  const handleApply = useCallback(async () => {
    if (!applyModal || !applyInvoiceId) return
    setApplying(true)
    try {
      const res = await fetch('/api/finance/prepayments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply',
          prepaymentId: applyModal.prepaymentId,
          targetInvoiceId: applyInvoiceId,
          applyAmount: parseFloat(applyAmount) || 0,
        }),
      })
      if (!res.ok) {
        const d = await res.json() as { error?: string }
        throw new Error(d.error ?? 'Apply failed')
      }
      notify('Prepayment applied successfully', 'ok')
      setApplyModal(null)
      load()
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Apply failed', 'err')
    } finally {
      setApplying(false)
    }
  }, [applyModal, applyInvoiceId, applyAmount, load, notify])

  const handleCreate = useCallback(async () => {
    if (!createForm.customerId || !createForm.amount) return
    setCreating(true)
    try {
      const res = await fetch('/api/finance/prepayments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: createForm.customerId,
          amount: parseFloat(createForm.amount) || 0,
          notes: createForm.notes || undefined,
        }),
      })
      if (!res.ok) throw new Error('Create failed')
      notify('Prepayment voucher created', 'ok')
      setShowCreate(false)
      setCreateForm({ customerId: '', amount: '', notes: '' })
      load()
    } catch {
      notify('Failed to create prepayment', 'err')
    } finally {
      setCreating(false)
    }
  }, [createForm, load, notify])

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar
        title="Prepayments"
        breadcrumb={[{ label: 'Finance', href: '/finance' }]}
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Prepayment
          </button>
        }
      />

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded shadow-lg text-sm font-medium ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Apply modal */}
      {applyModal && (
        <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-100">Apply Prepayment</h2>
              <button onClick={() => setApplyModal(null)}><X className="w-4 h-4 text-zinc-500" /></button>
            </div>
            <p className="text-xs text-zinc-400">
              Prepayment <span className="font-mono text-zinc-300">{applyModal.invoiceNumber}</span> · {applyModal.customerName}
            </p>
            <p className="text-xs text-zinc-500">
              Available: <span className="font-mono text-emerald-400 font-semibold">{formatCurrency(applyModal.remaining)}</span>
            </p>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">Target Invoice ID</label>
              <input
                value={applyInvoiceId}
                onChange={(e) => setApplyInvoiceId(e.target.value)}
                placeholder="Invoice ID to apply against"
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none font-mono"
              />
              <p className="text-[10px] text-zinc-600 mt-1">Enter the invoice ID from the invoices module.</p>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">Amount to Apply</label>
              <input
                type="number"
                min="0"
                max={applyModal.remaining}
                step="0.01"
                value={applyAmount}
                onChange={(e) => setApplyAmount(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleApply}
                disabled={applying || !applyInvoiceId}
                className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded px-4 py-2 transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                {applying ? 'Applying…' : 'Apply'}
              </button>
              <button onClick={() => setApplyModal(null)} className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm font-medium rounded px-4 py-2 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create prepayment modal */}
      {showCreate && (
        <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-100">New Prepayment Voucher</h2>
              <button onClick={() => setShowCreate(false)}><X className="w-4 h-4 text-zinc-500" /></button>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">Customer</label>
              <select
                value={createForm.customerId}
                onChange={(e) => setCreateForm((p) => ({ ...p, customerId: e.target.value }))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={createForm.amount}
                onChange={(e) => setCreateForm((p) => ({ ...p, amount: e.target.value }))}
                placeholder="0.00"
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1">Notes (optional)</label>
              <input
                value={createForm.notes}
                onChange={(e) => setCreateForm((p) => ({ ...p, notes: e.target.value }))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleCreate}
                disabled={creating || !createForm.customerId || !createForm.amount}
                className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded px-4 py-2 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                {creating ? 'Creating…' : 'Create Voucher'}
              </button>
              <button onClick={() => setShowCreate(false)} className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm font-medium rounded px-4 py-2 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* KPIs */}
        {kpis && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Prepayments</div>
              <div className="text-2xl font-bold text-zinc-100 tabular-nums">{kpis.totalCount}</div>
              <div className="text-xs text-zinc-500 mt-1">vouchers</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Total Received</div>
              <div className="text-2xl font-bold text-blue-400 font-mono tabular-nums">{formatCurrency(kpis.totalPrepaid)}</div>
              <div className="text-xs text-zinc-500 mt-1">prepaid amount</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Applied</div>
              <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">{formatCurrency(kpis.totalApplied)}</div>
              <div className="text-xs text-zinc-500 mt-1">against invoices</div>
            </div>
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">Remaining</div>
              <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">{formatCurrency(kpis.totalRemaining)}</div>
              <div className="text-xs text-zinc-500 mt-1">unapplied balance</div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100">Prepayment Invoices</h2>
            <span className="text-xs text-zinc-500">{rows.length} records</span>
          </div>

          {loading ? (
            <div className="py-20 text-center"><p className="text-sm text-zinc-500">Loading…</p></div>
          ) : rows.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm text-zinc-500">No prepayment invoices found.</p>
              <p className="text-xs text-zinc-600 mt-1">Invoices with type=&apos;prepayment&apos; will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/50">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Customer</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Voucher #</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Date</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Amount</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Applied</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Remaining</th>
                    <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Expiry</th>
                    <th className="text-center px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                    <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-5 py-3">
                        <div className="text-sm text-zinc-200 font-medium">{row.customerName}</div>
                        {row.customerEmail && <div className="text-xs text-zinc-500">{row.customerEmail}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-blue-400 bg-blue-400/5 px-2 py-0.5 rounded">{row.invoiceNumber}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-400">{fmtDate(row.invoiceDate)}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-zinc-300 tabular-nums">{formatCurrency(row.totalAmount)}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm text-emerald-400 tabular-nums">{formatCurrency(row.appliedAmount)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-mono text-sm font-bold tabular-nums ${row.remaining > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>
                          {formatCurrency(row.remaining)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs ${row.isExpired ? 'text-red-400 font-medium' : 'text-zinc-400'}`}>
                          {fmtDate(row.expiryDate)}
                          {row.isExpired && <span className="ml-1 text-[10px] text-red-500">EXPIRED</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          row.remaining <= 0 ? 'bg-zinc-700 text-zinc-500' :
                          row.isExpired ? 'bg-red-500/10 text-red-400' :
                          'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {row.remaining <= 0 ? 'fully applied' : row.isExpired ? 'expired' : 'available'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.remaining > 0 && !row.isExpired && (
                          <button
                            onClick={() => openApply(row)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors"
                          >
                            <ArrowRight className="w-3 h-3" />
                            Apply
                          </button>
                        )}
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
