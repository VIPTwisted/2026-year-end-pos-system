'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Radio, TimerOff, Pencil } from 'lucide-react'

export function AssortmentActions({ id, status }: { id: string; status: string }) {
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  async function publish() {
    setBusy(true)
    await fetch(`/api/assortments/${id}/publish`, { method: 'POST' })
    setBusy(false)
    router.refresh()
  }

  async function expire() {
    setBusy(true)
    await fetch(`/api/assortments/${id}/expire`, { method: 'POST' })
    setBusy(false)
    router.refresh()
  }

  return (
    <div className="flex gap-1 items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
      <Link href={`/assortments/${id}`}>
        <button className="p-1.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors">
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </Link>
      {status !== 'active' && (
        <button
          onClick={publish}
          disabled={busy}
          className="p-1.5 rounded hover:bg-emerald-900/40 text-zinc-400 hover:text-emerald-400 transition-colors"
          title="Publish"
        >
          <Radio className="w-3.5 h-3.5" />
        </button>
      )}
      {status === 'active' && (
        <button
          onClick={expire}
          disabled={busy}
          className="p-1.5 rounded hover:bg-red-900/40 text-zinc-400 hover:text-red-400 transition-colors"
          title="Expire"
        >
          <TimerOff className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
