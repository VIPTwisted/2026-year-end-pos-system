'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import {
  ArrowLeft, FileText, CheckCircle, XCircle, RefreshCw,
  AlertTriangle, User, Building2, Calendar, DollarSign,
  Clock, FileSignature, Trash2,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ContractLine {
  id: string
  description: string
  lineType: string
  quantity: number | string
  unitPrice: number | string
  lineTotal: number | string
  sortOrder: number
}

interface ContractDetail {
  id: string
  contractNo: string
  title: string
  type: string
  status: string
  startDate: string
  endDate: string | null
  value: number | string
  currency: string
  autoRenew: boolean
  renewDays: number
  terms: string | null
  notes: string | null
  signedAt: string | null
  terminatedAt: string | null
  createdAt: string
  updatedAt: string
  customer: { id: string; firstName: string; lastName: string; email: string | null; phone: string | null } | null
  supplier: { id: string; name: string; email: string | null; phone: string | null } | null
  lines: ContractLine[]
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function statusBadge(status: string) {
  const map: Record<string, string> = {
    draft: 'bg-zinc-700/60 text-zinc-400',
    active: 'bg-emerald-500/10 text-emerald-400',
    expired: 'bg-amber-500/10 text-amber-400',
    terminated: 'bg-red-500/10 text-red-400',
    renewed: 'bg-blue-500/10 text-blue-400',
  }
  return map[status] ?? 'bg-zinc-700/60 text-zinc-400'
}

function typeBadge(type: string) {
  const map: Record<string, string> = {
    customer: 'bg-blue-500/10 text-blue-400',
    vendor: 'bg-violet-500/10 text-violet-400',
    service: 'bg-cyan-500/10 text-cyan-400',
    lease: 'bg-orange-500/10 text-orange-400',
  }
  return map[type] ?? 'bg-zinc-700/60 text-zinc-400'
}

function fmtDate(d: string | null): string {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function daysUntil(d: string | null): number | null {
  if (!d) return null
  const diff = new Date(d).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">{label}</p>
      <p className="text-sm text-zinc-100">{value ?? '—'}</p>
    </div>
  )
}

// ── Modal ──────────────────────────────────────────────────────────────────────

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
}

function Modal({ title, onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#16213e] border border-zinc-700/60 rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="px-5 py-4 border-b border-zinc-800/50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors text-xl leading-none">&times;</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// ── Delete confirm modal ───────────────────────────────────────────────────────

function DeleteModal({
  onClose,
  onConfirm,
  loading,
}: {
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}) {
  return (
    <Modal title="Delete Draft Contract" onClose={onClose}>
      <p className="text-sm text-zinc-300 mb-5">
        This will permanently delete this draft contract and all its lines. This cannot be undone.
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded text-sm font-medium border border-zinc-700 text-zinc-300 hover:border-zinc-500 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 rounded text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
        >
          {loading ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </Modal>
  )
}

// ── Terminate modal ────────────────────────────────────────────────────────────

function TerminateModal({
  onClose,
  onConfirm,
  loading,
}: {
  onClose: () => void
  onConfirm: (reason: string) => void
  loading: boolean
}) {
  const [reason, setReason] = useState('')

  return (
    <Modal title="Terminate Contract" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          Please provide a reason for terminating this contract.
        </p>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
            Reason <span className="text-red-400">*</span>
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Reason for termination…"
            rows={3}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-sm font-medium border border-zinc-700 text-zinc-300 hover:border-zinc-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading || !reason.trim()}
            className="px-4 py-2 rounded text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Terminating…' : 'Terminate Contract'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Activate (sign) modal ──────────────────────────────────────────────────────

function ActivateModal({
  onClose,
  onConfirm,
  loading,
}: {
  onClose: () => void
  onConfirm: (signDate: string) => void
  loading: boolean
}) {
  const today = new Date().toISOString().split('T')[0]
  const [signDate, setSignDate] = useState(today)

  return (
    <Modal title="Activate Contract" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          Set the signature date to activate this contract. Status will change to <strong className="text-emerald-400">Active</strong>.
        </p>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
            Signed Date
          </label>
          <input
            type="date"
            value={signDate}
            onChange={e => setSignDate(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-sm font-medium border border-zinc-700 text-zinc-300 hover:border-zinc-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(signDate)}
            disabled={loading || !signDate}
            className="px-4 py-2 rounded text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50"
          >
            {loading ? 'Activating…' : 'Activate Contract'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ContractDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const router = useRouter()

  const [contract, setContract] = useState<ContractDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const [modal, setModal] = useState<'activate' | 'terminate' | 'delete' | null>(null)

  const notify = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 2800)
  }, [])

  useEffect(() => {
    fetch(`/api/contracts/${id}`)
      .then(r => r.json())
      .then((d: ContractDetail) => setContract(d))
      .catch(() => notify('Failed to load contract', false))
      .finally(() => setLoading(false))
  }, [id, notify])

  const patch = useCallback(async (body: Record<string, unknown>) => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/contracts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Update failed')
      setContract(data as ContractDetail)
      return true
    } catch (e: unknown) {
      notify(e instanceof Error ? e.message : 'Update failed', false)
      return false
    } finally {
      setActionLoading(false)
    }
  }, [id, notify])

  const handleActivate = async (signDate: string) => {
    const ok = await patch({ status: 'active', signedAt: signDate })
    if (ok) { notify('Contract activated'); setModal(null) }
  }

  const handleTerminate = async (reason: string) => {
    const ok = await patch({ status: 'terminated', notes: reason })
    if (ok) { notify('Contract terminated'); setModal(null) }
  }

  const handleRenew = async () => {
    if (!contract) return
    setActionLoading(true)
    try {
      // Create a new contract as a copy with extended dates and "draft" status
      const newEnd = contract.endDate
        ? new Date(new Date(contract.endDate).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : undefined
      const newStart = contract.endDate
        ? new Date(contract.endDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]

      const body = {
        title: `${contract.title} (Renewed)`,
        type: contract.type,
        customerId: contract.customer?.id,
        supplierId: contract.supplier?.id,
        startDate: newStart,
        endDate: newEnd,
        value: Number(contract.value),
        currency: contract.currency,
        autoRenew: contract.autoRenew,
        renewDays: contract.renewDays,
        terms: contract.terms,
        notes: `Renewed from ${contract.contractNo}`,
        lines: contract.lines.map((l, idx) => ({
          description: l.description,
          lineType: l.lineType,
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
          lineTotal: Number(l.lineTotal),
          sortOrder: idx,
        })),
      }
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Renew failed')
      // Mark original as renewed
      await patch({ status: 'renewed' })
      notify('Contract renewed — redirecting to new draft')
      setTimeout(() => router.push(`/contracts/${(data as { id: string }).id}`), 1200)
    } catch (e: unknown) {
      notify(e instanceof Error ? e.message : 'Renew failed', false)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/contracts/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Delete failed')
      notify('Contract deleted')
      setModal(null)
      setTimeout(() => router.push('/contracts'), 800)
    } catch (e: unknown) {
      notify(e instanceof Error ? e.message : 'Delete failed', false)
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#0f0f1a] flex flex-col">
        <TopBar title="Contract" showBack />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="min-h-[100dvh] bg-[#0f0f1a] flex flex-col">
        <TopBar title="Contract Not Found" showBack />
        <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
          Contract not found.{' '}
          <Link href="/contracts" className="text-blue-400 ml-1 hover:text-blue-300">Back to list</Link>
        </div>
      </div>
    )
  }

  const daysLeft = daysUntil(contract.endDate)
  const isExpiringSoon = contract.status === 'active' && daysLeft !== null && daysLeft >= 0 && daysLeft <= contract.renewDays
  const isExpired = contract.status === 'active' && contract.endDate && new Date(contract.endDate) < new Date()
  const partyName = contract.customer
    ? `${contract.customer.firstName} ${contract.customer.lastName}`
    : contract.supplier?.name ?? '—'
  const partyEmail = contract.customer?.email ?? contract.supplier?.email ?? null
  const partyPhone = contract.customer?.phone ?? contract.supplier?.phone ?? null

  const linesTotal = contract.lines.reduce((s, l) => s + Number(l.lineTotal), 0)

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] flex flex-col">
      <TopBar
        title={contract.contractNo}
        breadcrumb={[{ label: 'Contracts', href: '/contracts' }]}
        showBack
      />

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg text-sm font-medium shadow-xl transition-all ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Modals */}
      {modal === 'activate' && (
        <ActivateModal
          onClose={() => setModal(null)}
          onConfirm={handleActivate}
          loading={actionLoading}
        />
      )}
      {modal === 'terminate' && (
        <TerminateModal
          onClose={() => setModal(null)}
          onConfirm={handleTerminate}
          loading={actionLoading}
        />
      )}
      {modal === 'delete' && (
        <DeleteModal
          onClose={() => setModal(null)}
          onConfirm={handleDelete}
          loading={actionLoading}
        />
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-5">
        <Link
          href="/contracts"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Contracts
        </Link>

        {/* Expiry warning banner */}
        {isExpiringSoon && !isExpired && (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-sm text-amber-300">
              This contract expires in <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong>.
              {contract.autoRenew && ' Auto-renewal is enabled.'}
            </span>
            <button
              onClick={handleRenew}
              disabled={actionLoading}
              className="ml-auto px-3 py-1.5 rounded text-xs font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors disabled:opacity-50"
            >
              Renew Now
            </button>
          </div>
        )}
        {isExpired && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-sm text-red-300">
              This contract expired on <strong>{fmtDate(contract.endDate)}</strong>. Please renew or terminate it.
            </span>
            <button
              onClick={handleRenew}
              disabled={actionLoading}
              className="ml-auto px-3 py-1.5 rounded text-xs font-medium bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors disabled:opacity-50"
            >
              Renew
            </button>
          </div>
        )}

        {/* Header card */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold text-zinc-100">{contract.title}</h1>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${statusBadge(contract.status)}`}>
                    {contract.status}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${typeBadge(contract.type)}`}>
                    {contract.type}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5 font-mono">{contract.contractNo}</p>
              </div>
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-2 flex-wrap">
              {contract.status === 'draft' && (
                <>
                  <button
                    onClick={() => setModal('activate')}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50"
                  >
                    <FileSignature className="w-3.5 h-3.5" />
                    Activate
                  </button>
                  <button
                    onClick={() => setModal('delete')}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border border-red-700/50 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Draft
                  </button>
                </>
              )}
              {contract.status === 'active' && (
                <>
                  <button
                    onClick={handleRenew}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Renew
                  </button>
                  <button
                    onClick={() => setModal('terminate')}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border border-red-700/50 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Terminate
                  </button>
                </>
              )}
              {(contract.status === 'expired' || contract.status === 'terminated') && (
                <button
                  onClick={handleRenew}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-100 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Create Renewal
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Party */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800/40 pb-3">
              {contract.customer ? <User className="w-4 h-4 text-zinc-500" /> : <Building2 className="w-4 h-4 text-zinc-500" />}
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                {contract.customer ? 'Customer' : 'Supplier / Vendor'}
              </span>
            </div>
            <Field label="Name" value={partyName} />
            <Field label="Email" value={partyEmail ?? '—'} />
            <Field label="Phone" value={partyPhone ?? '—'} />
            {contract.customer && (
              <Link
                href={`/customers/${contract.customer.id}`}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                View customer profile →
              </Link>
            )}
            {contract.supplier && (
              <Link
                href={`/vendors/${contract.supplier.id}`}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                View supplier profile →
              </Link>
            )}
          </div>

          {/* Dates */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800/40 pb-3">
              <Calendar className="w-4 h-4 text-zinc-500" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Dates</span>
            </div>
            <Field label="Start Date" value={fmtDate(contract.startDate)} />
            <Field
              label="End Date"
              value={
                contract.endDate
                  ? <span className={isExpiringSoon || isExpired ? 'text-amber-400' : ''}>{fmtDate(contract.endDate)}</span>
                  : <span className="text-zinc-500">Open-ended</span>
              }
            />
            <Field label="Signed" value={contract.signedAt ? fmtDate(contract.signedAt) : '—'} />
            {contract.terminatedAt && <Field label="Terminated" value={fmtDate(contract.terminatedAt)} />}
            <Field label="Created" value={fmtDate(contract.createdAt)} />
          </div>

          {/* Value & renew */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800/40 pb-3">
              <DollarSign className="w-4 h-4 text-zinc-500" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Value</span>
            </div>
            <Field
              label="Contract Value"
              value={
                <span className="text-xl font-bold text-zinc-100 tabular-nums">
                  {formatCurrency(Number(contract.value), contract.currency)}
                </span>
              }
            />
            <Field label="Currency" value={contract.currency} />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-0.5">Auto-Renew</p>
              <div className="flex items-center gap-2">
                {contract.autoRenew ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400">Enabled — {contract.renewDays}d reminder</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 text-zinc-600" />
                    <span className="text-sm text-zinc-500">Disabled</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contract Lines */}
        {contract.lines.length > 0 && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800/40 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-100">Contract Lines</h2>
              <span className="text-xs text-zinc-500">{contract.lines.length} line{contract.lines.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800/40">
                    {['Description', 'Type', 'Qty', 'Unit Price', 'Total'].map(h => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 ${['Qty', 'Unit Price', 'Total'].includes(h) ? 'text-right' : 'text-left'}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {contract.lines.map(l => (
                    <tr key={l.id} className="border-b border-zinc-800/20 hover:bg-zinc-800/10">
                      <td className="px-4 py-3 text-sm text-zinc-100">{l.description}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-700/50 text-zinc-400 capitalize">
                          {l.lineType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-300 text-right tabular-nums">{Number(l.quantity).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-zinc-300 text-right tabular-nums">{formatCurrency(Number(l.unitPrice), contract.currency)}</td>
                      <td className="px-4 py-3 text-sm text-zinc-100 text-right tabular-nums font-semibold">{formatCurrency(Number(l.lineTotal), contract.currency)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-zinc-700/50 bg-zinc-800/20">
                    <td colSpan={4} className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-zinc-500">
                      Lines Total
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-zinc-100 tabular-nums">
                      {formatCurrency(linesTotal, contract.currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Terms */}
        {(contract.terms || contract.notes) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {contract.terms && (
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Contract Terms</h2>
                <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{contract.terms}</p>
              </div>
            )}
            {contract.notes && (
              <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
                <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-3">Internal Notes</h2>
                <p className="text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed">{contract.notes}</p>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  )
}
