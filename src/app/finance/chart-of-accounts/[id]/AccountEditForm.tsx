'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AccountEditFormProps {
  id: string
  initialName: string
  initialSubtype: string
  initialIsActive: boolean
}

export function AccountEditForm({
  id,
  initialName,
  initialSubtype,
  initialIsActive,
}: AccountEditFormProps) {
  const router = useRouter()

  const [name, setName]         = useState(initialName)
  const [subtype, setSubtype]   = useState(initialSubtype)
  const [isActive, setIsActive] = useState(initialIsActive)
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  function notify(msg: string, type: 'ok' | 'err' = 'ok') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { notify('Account name is required', 'err'); return }

    setSaving(true)
    try {
      const res = await fetch(`/api/finance/gl-accounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    name.trim(),
          subtype: subtype.trim() || null,
          isActive,
        }),
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        notify(data.error ?? 'Failed to update account', 'err')
        return
      }

      notify('Account updated successfully')
      router.refresh()
    } catch {
      notify('Network error — please try again', 'err')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeactivate() {
    if (isActive) {
      setIsActive(false)
      return
    }
    // If already inactive, toggle back to active via the form save
    setIsActive(true)
  }

  return (
    <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-6">
      <h2 className="text-[13px] font-semibold text-zinc-200 mb-5">Edit Account</h2>

      <form onSubmit={handleSave} className="space-y-4">

        {/* Name */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
            Account Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        {/* Subtype */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1.5">
            Subtype <span className="text-zinc-700 normal-case font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={subtype}
            onChange={e => setSubtype(e.target.value)}
            placeholder="e.g. current, fixed, operating"
            className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* isActive toggle */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">
            Status
          </label>
          <button
            type="button"
            onClick={handleDeactivate}
            className={`flex items-center gap-2.5 px-3 py-2 rounded border text-[13px] font-medium transition-colors ${
              isActive
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
            {isActive ? 'Active — click to deactivate' : 'Inactive — click to reactivate'}
          </button>
          <p className="text-[11px] text-zinc-600 mt-1.5">
            Inactive accounts are hidden from new transactions but preserved for history.
          </p>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`rounded px-3 py-2 text-[13px] font-medium ${
            toast.type === 'ok'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
            {toast.msg}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => { setName(initialName); setSubtype(initialSubtype); setIsActive(initialIsActive) }}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 border border-zinc-700 hover:border-zinc-500 rounded transition-colors"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  )
}
