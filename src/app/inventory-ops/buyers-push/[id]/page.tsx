'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send } from 'lucide-react'

type PushLine = {
  id: string
  productName: string
  sku: string | null
  totalQty: number
  unitCost: number
  lineValue: number
  status: string
}

type Push = {
  id: string
  pushNumber: string
  name: string
  season: string | null
  status: string
  totalUnits: number
  totalValue: number
  lines: PushLine[]
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  approved: 'bg-blue-500/20 text-blue-400',
  distributed: 'bg-green-500/20 text-green-400',
  complete: 'bg-emerald-500/20 text-emerald-400',
}

export default function BuyersPushDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [push, setPush] = useState<Push | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const load = () => fetch(`/api/inventory/buyers-push/${id}`).then(r => r.json()).then(setPush)
  useEffect(() => { load() }, [id])

  const approve = async () => {
    setActionLoading(true)
    await fetch(`/api/inventory/buyers-push/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    })
    setActionLoading(false)
    load()
  }

  const distribute = async () => {
    setActionLoading(true)
    await fetch(`/api/inventory/buyers-push/${id}/distribute`, { method: 'POST' })
    setActionLoading(false)
    load()
  }

  if (!push) return <div className="p-6 text-zinc-500">Loading...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory-ops/buyers-push" className="text-zinc-500 hover:text-zinc-300"><ArrowLeft className="w-5 h-5" /></Link>
        <Send className="w-6 h-6 text-green-400" />
        <div>
          <h1 className="text-xl font-bold text-zinc-100">{push.name}</h1>
          <p className="text-sm text-zinc-500">{push.pushNumber} {push.season ? `· ${push.season}` : ''}</p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[push.status] || 'bg-zinc-700 text-zinc-300'}`}>
          {push.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Units', value: push.totalUnits.toLocaleString() },
          { label: 'Total Value', value: `$${push.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}` },
          { label: 'Lines', value: push.lines.length },
        ].map(f => (
          <div key={f.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">{f.label}</div>
            <div className="text-xl font-bold text-zinc-100">{f.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {['Product', 'SKU', 'Total Qty', 'Unit Cost', 'Line Value', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-zinc-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {push.lines.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-zinc-600">No line items</td></tr>
            ) : push.lines.map(line => (
              <tr key={line.id} className="border-b border-zinc-800/50">
                <td className="px-4 py-3 text-zinc-200">{line.productName}</td>
                <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{line.sku || '—'}</td>
                <td className="px-4 py-3 text-zinc-300">{line.totalQty}</td>
                <td className="px-4 py-3 text-zinc-400">${line.unitCost.toFixed(2)}</td>
                <td className="px-4 py-3 text-zinc-400">${line.lineValue.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs capitalize ${
                    line.status === 'distributed' ? 'bg-green-500/20 text-green-400' : 'bg-zinc-700 text-zinc-400'
                  }`}>{line.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-3">
        {push.status === 'draft' && (
          <button onClick={approve} disabled={actionLoading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors">
            Approve Push
          </button>
        )}
        {push.status === 'approved' && (
          <button onClick={distribute} disabled={actionLoading}
            className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors">
            Distribute to Stores
          </button>
        )}
      </div>
    </div>
  )
}
