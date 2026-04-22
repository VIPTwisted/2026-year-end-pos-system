'use client'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PackageCheck, Boxes } from 'lucide-react'

export function ReceiptActions({ receiptId, status }: { receiptId: string; status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function createPutAway() {
    setLoading('putaway')
    try {
      const res = await fetch(`/api/warehouse/receipts/${receiptId}/put-away`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed')
      const activity = await res.json()
      router.push(`/warehouse/activities/${activity.id}`)
    } catch {
      alert('Error creating put-away activity')
    } finally {
      setLoading(null)
    }
  }

  async function postReceipt() {
    if (!confirm('Post this receipt? This will update inventory quantities.')) return
    setLoading('post')
    try {
      const res = await fetch(`/api/warehouse/receipts/${receiptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'post' }),
      })
      if (!res.ok) throw new Error('Failed')
      router.refresh()
    } catch {
      alert('Error posting receipt')
    } finally {
      setLoading(null)
    }
  }

  if (status === 'posted') {
    return <p className="text-xs text-zinc-500 italic">Receipt posted</p>
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={createPutAway}
        disabled={loading !== null}
        className="gap-2"
      >
        <Boxes className="w-4 h-4" />
        {loading === 'putaway' ? 'Creating…' : 'Create Put-Away'}
      </Button>
      <Button
        size="sm"
        onClick={postReceipt}
        disabled={loading !== null}
        className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
      >
        <PackageCheck className="w-4 h-4" />
        {loading === 'post' ? 'Posting…' : 'Post Receipt'}
      </Button>
    </div>
  )
}
