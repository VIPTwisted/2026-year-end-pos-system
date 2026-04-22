'use client'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const METHODS = [
  { value: 'none', label: 'None' },
  { value: 'serial', label: 'Serial Number' },
  { value: 'lot', label: 'Lot Number' },
  { value: 'lot_and_serial', label: 'Lot + Serial' },
]

export function TrackingMethodForm({ productId, currentMethod }: { productId: string; currentMethod: string }) {
  const router = useRouter()
  const [method, setMethod] = useState(currentMethod)
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      await fetch(`/api/warehouse/item-tracking/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingMethod: method }),
      })
      router.refresh()
    } catch {
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-zinc-500">Tracking Method:</span>
      <select
        value={method}
        onChange={e => setMethod(e.target.value)}
        className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
      >
        {METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
      </select>
      <Button size="sm" onClick={save} disabled={saving || method === currentMethod}
        className="bg-blue-600 hover:bg-blue-500 text-white">
        {saving ? 'Saving…' : 'Save'}
      </Button>
    </div>
  )
}
