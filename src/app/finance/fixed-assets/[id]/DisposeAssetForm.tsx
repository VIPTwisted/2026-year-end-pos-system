'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

export default function DisposeAssetForm({
  assetId,
  assetName,
}: {
  assetId: string
  assetName: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [disposalDate, setDisposalDate] = useState(new Date().toISOString().split('T')[0])
  const [disposalAmount, setDisposalAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleDispose(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const res = await fetch(`/api/finance/fixed-assets/${assetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'disposed',
          disposedAt: new Date(disposalDate).toISOString(),
          disposalAmount: disposalAmount ? parseFloat(disposalAmount) : 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to dispose asset'); return }
      router.refresh()
    } catch {
      setError('Network error — please try again')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-colors'

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-1">Dispose Asset</h2>
      <p className="text-xs text-zinc-600 mb-4">
        Mark <span className="text-zinc-400 font-medium">{assetName}</span> as disposed. This action cannot be undone.
      </p>

      {!open ? (
        <Button
          variant="outline"
          className="border-red-800/50 text-red-400 hover:bg-red-500/10 hover:border-red-600 gap-2 text-sm"
          onClick={() => setOpen(true)}
        >
          <Trash2 className="w-4 h-4" />
          Dispose Asset
        </Button>
      ) : (
        <form onSubmit={handleDispose} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
            <p className="text-xs text-red-400 font-medium mb-3">Confirm Disposal</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Disposal Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  className={inputCls}
                  value={disposalDate}
                  onChange={e => setDisposalDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Disposal / Sale Amount ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputCls}
                  value={disposalAmount}
                  onChange={e => setDisposalAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-zinc-700 text-zinc-400 hover:bg-zinc-800"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-red-600 hover:bg-red-500 text-white gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {saving ? 'Processing…' : 'Confirm Disposal'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
