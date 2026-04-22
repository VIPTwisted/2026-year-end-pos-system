'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, Tag } from 'lucide-react'

function generateCode(): string {
  return `SAVE${Math.random().toString(36).substring(2, 7).toUpperCase()}`
}

export default function NewCouponPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const [code, setCode] = useState(generateCode())
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount'>('percentage')
  const [discountValue, setDiscountValue] = useState('')
  const [minOrderAmount, setMinOrderAmount] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [description, setDescription] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!code.trim()) { setError('Code is required'); return }
    if (!discountValue || parseFloat(discountValue) <= 0) { setError('Discount value must be > 0'); return }
    if (discountType === 'percentage' && parseFloat(discountValue) > 100) { setError('Percentage cannot exceed 100'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discountType,
          discountValue: parseFloat(discountValue),
          minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : undefined,
          maxUses: maxUses ? parseInt(maxUses, 10) : undefined,
          expiresAt: expiresAt || undefined,
          description: description || undefined,
        }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Failed to create coupon')
        return
      }
      showToast('Coupon created')
      router.push('/coupons')
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  const numVal = parseFloat(discountValue) || 0
  const minAmt = parseFloat(minOrderAmount) || 0
  const preview = discountType === 'percentage'
    ? `This coupon gives ${numVal}% off${minAmt > 0 ? ` orders over $${minAmt.toFixed(2)}` : ''}`
    : `This coupon gives $${numVal.toFixed(2)} off${minAmt > 0 ? ` orders over $${minAmt.toFixed(2)}` : ''}`

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a]">
      {/* Header */}
      <header className="h-14 border-b border-zinc-800 bg-[#0f0f1a] flex items-center px-6 gap-4 sticky top-0 z-10">
        <Link href="/coupons" className="text-zinc-400 hover:text-zinc-200 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <Tag className="w-4 h-4 text-blue-400" />
        <h1 className="text-base font-semibold text-zinc-100">Create Coupon Code</h1>
      </header>

      <div className="max-w-2xl mx-auto p-6">
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {toast && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm shadow-lg">
            {toast}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6 space-y-5">
          {/* Code */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
              Coupon Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SAVE10"
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                required
              />
              <button
                type="button"
                onClick={() => setCode(generateCode())}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-zinc-300 transition-colors flex items-center gap-1.5 text-sm"
                title="Generate random code"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Generate
              </button>
            </div>
          </div>

          {/* Discount Type */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
              Discount Type
            </label>
            <select
              value={discountType}
              onChange={e => setDiscountType(e.target.value as 'percentage' | 'fixed_amount')}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed_amount">Fixed Amount ($)</option>
            </select>
          </div>

          {/* Discount Value */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
              Discount Value {discountType === 'percentage' ? '(%)' : '($)'}
            </label>
            <input
              type="number"
              value={discountValue}
              onChange={e => setDiscountValue(e.target.value)}
              min="0"
              step={discountType === 'percentage' ? '1' : '0.01'}
              max={discountType === 'percentage' ? '100' : undefined}
              placeholder={discountType === 'percentage' ? '10' : '5.00'}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Min Order Amount */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
              Minimum Order Amount <span className="text-zinc-600 normal-case">(optional)</span>
            </label>
            <input
              type="number"
              value={minOrderAmount}
              onChange={e => setMinOrderAmount(e.target.value)}
              min="0"
              step="0.01"
              placeholder="50.00"
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Max Uses */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
              Max Uses <span className="text-zinc-600 normal-case">(optional — blank = unlimited)</span>
            </label>
            <input
              type="number"
              value={maxUses}
              onChange={e => setMaxUses(e.target.value)}
              min="1"
              step="1"
              placeholder="100"
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Expires At */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
              Expires At <span className="text-zinc-600 normal-case">(optional)</span>
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 block mb-1.5">
              Description <span className="text-zinc-600 normal-case">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Summer sale — 10% off"
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Preview */}
          {discountValue && (
            <div className="px-4 py-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-blue-400 mb-1">Preview</div>
              <p className="text-sm text-zinc-300">{preview}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded transition-colors"
            >
              {loading ? 'Creating…' : 'Create Coupon'}
            </button>
            <Link
              href="/coupons"
              className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
