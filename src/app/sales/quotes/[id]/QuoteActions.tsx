'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, CheckCircle, XCircle, ArrowRight, Loader2, X } from 'lucide-react'

interface Props {
  quoteId: string
  status: string
  convertedOrderId: string | null
}

interface ConfirmModal {
  title: string
  message: string
  confirmLabel: string
  confirmClass: string
  onConfirm: () => void
}

export function QuoteActions({ quoteId, status, convertedOrderId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [modal, setModal] = useState<ConfirmModal | null>(null)

  const openModal = (cfg: ConfirmModal) => setModal(cfg)
  const closeModal = () => setModal(null)

  const patch = async (action: string, payload: Record<string, unknown>) => {
    setLoading(action)
    setError('')
    try {
      const res = await fetch(`/api/sales/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json() as { error?: string }
        throw new Error(d.error ?? 'Action failed')
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(null)
    }
  }

  const send = async () => {
    setLoading('send')
    setError('')
    try {
      const res = await fetch(`/api/sales/quotes/${quoteId}/send`, { method: 'POST' })
      if (!res.ok) {
        const d = await res.json() as { error?: string }
        throw new Error(d.error ?? 'Send failed')
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(null)
    }
  }

  const convert = async () => {
    setLoading('convert')
    setError('')
    try {
      const res = await fetch(`/api/sales/quotes/${quoteId}/convert`, { method: 'POST' })
      if (!res.ok) {
        const d = await res.json() as { error?: string }
        throw new Error(d.error ?? 'Conversion failed')
      }
      const data = await res.json() as { orderId: string }
      router.push(`/orders/${data.orderId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setLoading(null)
    }
  }

  type ActionBtn = {
    action: string
    label: string
    icon: React.ElementType
    colorClass: string
    onClick: () => void
  }

  function ActionBtn({ action, label, icon: Icon, colorClass, onClick }: ActionBtn) {
    return (
      <button
        onClick={onClick}
        disabled={loading !== null}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${colorClass}`}
      >
        {loading === action ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
        {label}
      </button>
    )
  }

  return (
    <>
      {/* Confirmation modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#16213e] border border-zinc-700 rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold text-zinc-100">{modal.title}</h3>
              <button onClick={closeModal} className="text-zinc-500 hover:text-zinc-300 transition-colors mt-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-zinc-400">{modal.message}</p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { closeModal(); modal.onConfirm() }}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${modal.confirmClass}`}
              >
                {modal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {error && (
          <p className="text-xs text-red-400 bg-red-900/20 border border-red-700/50 rounded px-3 py-1.5">{error}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {status === 'draft' && (
            <ActionBtn
              action="send"
              label="Send Quote"
              icon={Send}
              colorClass="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-600/30"
              onClick={() => openModal({
                title: 'Send Quote',
                message: 'Mark this quote as sent and notify the customer?',
                confirmLabel: 'Send',
                confirmClass: 'bg-blue-600 hover:bg-blue-500',
                onConfirm: send,
              })}
            />
          )}
          {(status === 'draft' || status === 'sent') && (
            <ActionBtn
              action="accept"
              label="Mark Accepted"
              icon={CheckCircle}
              colorClass="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-600/30"
              onClick={() => openModal({
                title: 'Accept Quote',
                message: 'Mark this quote as accepted by the customer?',
                confirmLabel: 'Accept',
                confirmClass: 'bg-emerald-600 hover:bg-emerald-500',
                onConfirm: () => patch('accept', { status: 'accepted' }),
              })}
            />
          )}
          {(status === 'draft' || status === 'sent') && (
            <ActionBtn
              action="reject"
              label="Mark Rejected"
              icon={XCircle}
              colorClass="bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-600/30"
              onClick={() => openModal({
                title: 'Reject Quote',
                message: 'Mark this quote as rejected? This cannot be undone.',
                confirmLabel: 'Reject',
                confirmClass: 'bg-red-600 hover:bg-red-500',
                onConfirm: () => patch('reject', { status: 'rejected' }),
              })}
            />
          )}
          {status === 'accepted' && !convertedOrderId && (
            <ActionBtn
              action="convert"
              label="Convert to Order"
              icon={ArrowRight}
              colorClass="bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 border border-amber-600/30"
              onClick={() => openModal({
                title: 'Convert to Order',
                message: 'Create a sales order from this quote? The quote will be marked as converted.',
                confirmLabel: 'Convert',
                confirmClass: 'bg-amber-600 hover:bg-amber-500',
                onConfirm: convert,
              })}
            />
          )}
        </div>
      </div>
    </>
  )
}
