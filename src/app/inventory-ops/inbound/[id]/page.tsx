'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { PackageCheck, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type ShipmentLine = {
  id: string
  productName: string
  sku: string | null
  expectedQty: number
  receivedQty: number
  damagedQty: number
  putawayZone: string | null
  status: string
}

type CrossDockLine = {
  id: string
  productName: string
  qty: number
  destinationName: string | null
  status: string
}

type Shipment = {
  id: string
  shipmentNumber: string
  vendorName: string | null
  poNumber: string | null
  status: string
  expectedDate: string | null
  locationName: string | null
  lines: ShipmentLine[]
  crossDockLines: CrossDockLine[]
}

export default function InboundDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [activeTab, setActiveTab] = useState<'receiving' | 'crossdock'>('receiving')
  const [receiveData, setReceiveData] = useState<Record<string, { receivedQty: number; damagedQty: number }>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/inventory/inbound/${id}`)
      .then(r => r.json())
      .then((data: Shipment) => {
        setShipment(data)
        const init: Record<string, { receivedQty: number; damagedQty: number }> = {}
        data.lines.forEach(l => { init[l.id] = { receivedQty: l.receivedQty, damagedQty: l.damagedQty } })
        setReceiveData(init)
      })
  }, [id])

  const completeReceiving = async () => {
    if (!shipment) return
    setSubmitting(true)
    const lines = shipment.lines.map(l => ({
      lineId: l.id,
      expectedQty: l.expectedQty,
      receivedQty: receiveData[l.id]?.receivedQty ?? l.receivedQty,
      damagedQty: receiveData[l.id]?.damagedQty ?? l.damagedQty,
    }))
    await fetch(`/api/inventory/inbound/${id}/receive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines }),
    })
    setSubmitting(false)
    router.push('/inventory-ops/inbound')
  }

  if (!shipment) return <div className="p-6 text-zinc-500">Loading...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory-ops/inbound" className="text-zinc-500 hover:text-zinc-300">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <PackageCheck className="w-6 h-6 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold text-zinc-100">{shipment.shipmentNumber}</h1>
            <p className="text-sm text-zinc-500">{shipment.vendorName} {shipment.poNumber ? `· PO: ${shipment.poNumber}` : ''}</p>
          </div>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium capitalize ${
          shipment.status === 'discrepancy' ? 'bg-red-500/20 text-red-400' :
          shipment.status === 'received' ? 'bg-green-500/20 text-green-400' :
          'bg-blue-500/20 text-blue-400'
        }`}>{shipment.status}</span>
      </div>

      <div className="flex gap-2">
        {(['receiving', 'crossdock'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${activeTab === t ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}>
            {t === 'crossdock' ? 'Cross-Dock' : 'Receiving'}
          </button>
        ))}
      </div>

      {activeTab === 'receiving' && (
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Product', 'SKU', 'Expected', 'Received', 'Damaged', 'Variance', 'Putaway Zone', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-zinc-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shipment.lines.map(line => {
                  const rd = receiveData[line.id] || { receivedQty: line.receivedQty, damagedQty: line.damagedQty }
                  const variance = rd.receivedQty - line.expectedQty
                  return (
                    <tr key={line.id} className="border-b border-zinc-800/50">
                      <td className="px-4 py-3 text-zinc-200">{line.productName}</td>
                      <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{line.sku || '—'}</td>
                      <td className="px-4 py-3 text-zinc-300">{line.expectedQty}</td>
                      <td className="px-4 py-3">
                        <input type="number" value={rd.receivedQty}
                          onChange={e => setReceiveData(prev => ({ ...prev, [line.id]: { ...prev[line.id], receivedQty: parseInt(e.target.value) || 0 } }))}
                          className="w-20 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" value={rd.damagedQty}
                          onChange={e => setReceiveData(prev => ({ ...prev, [line.id]: { ...prev[line.id], damagedQty: parseInt(e.target.value) || 0 } }))}
                          className="w-20 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                      </td>
                      <td className={`px-4 py-3 font-medium ${variance < 0 ? 'text-red-400' : variance > 0 ? 'text-green-400' : 'text-zinc-500'}`}>
                        {variance > 0 ? '+' : ''}{variance}
                      </td>
                      <td className="px-4 py-3 text-zinc-500">{line.putawayZone || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs capitalize ${
                          line.status === 'received' ? 'bg-green-500/20 text-green-400' :
                          line.status === 'discrepancy' ? 'bg-red-500/20 text-red-400' :
                          'bg-zinc-700 text-zinc-400'
                        }`}>{line.status}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end">
            <button onClick={completeReceiving} disabled={submitting}
              className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors">
              {submitting ? 'Processing...' : 'Complete Receiving'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'crossdock' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Product', 'Qty', 'Destination', 'Status', 'Dispatched'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-zinc-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shipment.crossDockLines.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-600">No cross-dock lines</td></tr>
              ) : shipment.crossDockLines.map(line => (
                <tr key={line.id} className="border-b border-zinc-800/50">
                  <td className="px-4 py-3 text-zinc-200">{line.productName}</td>
                  <td className="px-4 py-3 text-zinc-300">{line.qty}</td>
                  <td className="px-4 py-3 text-zinc-400">{line.destinationName || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs capitalize ${
                      line.status === 'dispatched' ? 'bg-green-500/20 text-green-400' : 'bg-zinc-700 text-zinc-400'
                    }`}>{line.status}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
