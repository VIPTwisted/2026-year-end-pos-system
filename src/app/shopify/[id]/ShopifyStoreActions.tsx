'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, XCircle, Loader2 } from 'lucide-react'

export default function ShopifyStoreActions({ storeId, status }: { storeId: string; status: string }) {
  const router = useRouter()
  const [syncing, setSyncing] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  async function handleSync() {
    setSyncing(true)
    try {
      await fetch(`/api/shopify/${storeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync-now', syncType: 'full' }),
      })
      router.refresh()
    } finally {
      setSyncing(false)
    }
  }

  async function handleDisconnect() {
    if (!confirm('Disconnect this Shopify store? Sync will stop.')) return
    setDisconnecting(true)
    try {
      await fetch(`/api/shopify/${storeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect' }),
      })
      router.refresh()
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSync}
        disabled={syncing || status === 'syncing'}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        Sync Now
      </button>
      <button
        onClick={handleDisconnect}
        disabled={disconnecting || status === 'disconnected'}
        className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        {disconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
        Disconnect
      </button>
    </div>
  )
}
