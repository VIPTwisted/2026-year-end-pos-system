'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PowerOff, Power } from 'lucide-react'

interface Props {
  id: string
  isActive: boolean
  status: string
}

export function CouponActions({ id, isActive, status }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  function showToast(msg: string, type: 'ok' | 'err' = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  async function toggleActive() {
    setLoading(true)
    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })
      if (!res.ok) {
        const d = await res.json() as { error?: string }
        showToast(d.error ?? 'Failed to update coupon', 'err')
        return
      }
      showToast(isActive ? 'Coupon deactivated' : 'Coupon activated')
      router.refresh()
    } catch {
      showToast('Network error', 'err')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg border text-sm shadow-lg
          ${toast.type === 'ok'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {toast.msg}
        </div>
      )}

      {status !== 'expired' && status !== 'depleted' && (
        <button
          onClick={toggleActive}
          disabled={loading}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded transition-colors disabled:opacity-50
            ${isActive
              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'}`}
        >
          {isActive
            ? <><PowerOff className="w-3.5 h-3.5" /> Deactivate</>
            : <><Power className="w-3.5 h-3.5" /> Activate</>}
        </button>
      )}
    </>
  )
}
