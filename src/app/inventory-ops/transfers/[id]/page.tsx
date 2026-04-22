'use client'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowLeftRight } from 'lucide-react'

type TransferLine = {
  id: string
  productName: string
  sku: string | null
  requestedQty: number
  pickedQty: number
  shippedQty: number
  receivedQty: number
  status: string
}

type Transfer = {
  id: string
  transferNumber: string
  fromLocation: string | null
  toLocation: string | null
  priority: string
  status: string
  requestedBy: string | null
  approvedBy: string | null
  createdAt: string
  lines: TransferLine[]
}

const WORKFLOW = ['draft', 'approved', 'shipped', 'received']

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  approved: 'bg-blue-500/20 text-blue-400',
  shipped: 'bg-purple-500/20 text-purple-400',
  received: 'bg-green-500/20 text-green-400',
}

export default function TransferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [transfer, setTransfer] = useState<Transfer | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const load = () => fetch(`/api/inventory/outbound-transfers/${id}`).then(r => r.json()).then(setTransfer)
  useEffect(() => { load() }, [id])

  const doApprove = async () => {
    setActionLoading(true)
    await fetch(`/api/inventory/outbound-transfers/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedBy: 'Manager' }),
    })
    setActionLoading(false)
    load()
  }

  const doShip = async () => {
    setActionLoading(true)
    await fetch(`/api/inventory/outbound-transfers/${id}/ship`, { method: 'POST' })
    setActionLoading(false)
    load()
  }

  const doReceive = async () => {
    setActionLoading(true)
    await fetch(`/api/inventory/outbound-transfers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'received' }),
    })
    setActionLoading(false)
    load()
  }

  if (!transfer) return <div className="p-6 text-zinc-500">Loading...</div>

  const currentStep = WORKFLOW.indexOf(transfer.status)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory-ops/transfers" className="text-zinc-500 hover:text-zinc-300"><ArrowLeft className="w-5 h-5" /></Link>
        <ArrowLeftRight className="w-6 h-6 text-purple-400" />
        <div>
          <h1 className="text-xl font-bold text-zinc-100">{transfer.transferNumber}</h1>
          <p className="text-sm text-zinc-500">{transfer.fromLocation || 'N/A'} → {transfer.toLocation || 'N/A'}</p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[transfer.status] || 'bg-zinc-700 text-zinc-300'}`}>
          {transfer.status}
        </span>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <div className="flex items-center gap-2">
          {WORKFLOW.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium capitalize ${
                i < currentStep ? 'bg-green-500/20 text-green-400' :
                i === currentStep ? 'bg-blue-500/20 text-blue-400' :
                'bg-zinc-800 text-zinc-600'
              }`}>
                {i < currentStep ? '✓ ' : ''}{step}
              </div>
              {i < WORKFLOW.length - 1 && <div className={`w-8 h-0.5 ${i < currentStep ? 'bg-green-600' : 'bg-zinc-700'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Priority', value: transfer.priority },
          { label: 'Requested By', value: transfer.requestedBy || '—' },
          { label: 'Approved By', value: transfer.approvedBy || '—' },
        ].map(f => (
          <div key={f.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">{f.label}</div>
            <div className="text-sm text-zinc-200 capitalize">{f.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {['Product', 'SKU', 'Requested', 'Picked', 'Shipped', 'Received'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-zinc-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transfer.lines.map(line => (
              <tr key={line.id} className="border-b border-zinc-800/50">
                <td className="px-4 py-3 text-zinc-200">{line.productName}</td>
                <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{line.sku || '—'}</td>
                <td className="px-4 py-3 text-zinc-300">{line.requestedQty}</td>
                <td className="px-4 py-3 text-zinc-400">{line.pickedQty}</td>
                <td className="px-4 py-3 text-zinc-400">{line.shippedQty}</td>
                <td className="px-4 py-3 text-zinc-400">{line.receivedQty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-3">
        {transfer.status === 'draft' && (
          <button onClick={doApprove} disabled={actionLoading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors">
            Approve Transfer
          </button>
        )}
        {transfer.status === 'approved' && (
          <button onClick={doShip} disabled={actionLoading}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors">
            Mark Shipped
          </button>
        )}
        {transfer.status === 'shipped' && (
          <button onClick={doReceive} disabled={actionLoading}
            className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors">
            Mark Received
          </button>
        )}
      </div>
    </div>
  )
}
