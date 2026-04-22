'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Truck, CheckCircle, Send, PackageCheck } from 'lucide-react'

type POLine = { id: string; productName: string; sku: string | null; qty: number; unitCost: number; lineTotal: number; receivedQty: number; status: string }
type LinkedInvoice = { id: string; invoiceNumber: string; status: string; total: number }
type PO = {
  id: string; poNumber: string; status: string; orderDate: string
  expectedDate: string | null; totalAmount: number; currency: string; notes: string | null
  ackBy: string | null; ackAt: string | null
  vendor: { id: string; name: string; vendorNumber: string }
  lines: POLine[]; invoices: LinkedInvoice[]
}

const WORKFLOW = ['draft','sent','acknowledged','partial','received']

function StatusBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    draft:'text-zinc-400', sent:'text-blue-400', acknowledged:'text-cyan-400',
    partial:'text-amber-400', received:'text-emerald-400', closed:'text-zinc-500', cancelled:'text-red-400',
    open:'text-zinc-400',
  }
  return <span className={`text-xs font-medium capitalize ${map[s] ?? 'text-zinc-400'}`}>{s}</span>
}

export default function VpPODetailPage() {
  const { id } = useParams<{ id: string }>()
  const [po, setPo]           = useState<PO | null>(null)
  const [receivedQtys, setReceivedQtys] = useState<Record<string, number>>({})
  const [saving, setSaving]   = useState(false)

  const load = useCallback(async () => {
    const res = await fetch(`/api/vp-pos/${id}`)
    const data = await res.json()
    setPo(data)
    const init: Record<string, number> = {}
    data.lines?.forEach((l: POLine) => { init[l.id] = l.receivedQty })
    setReceivedQtys(init)
  }, [id])

  useEffect(() => { load() }, [load])

  async function sendPO() {
    setSaving(true)
    await fetch(`/api/vp-pos/${id}/send`, { method: 'POST' })
    setSaving(false)
    load()
  }

  async function ackPO() {
    const ackBy = prompt('Acknowledged by (name):')
    if (ackBy === null) return
    await fetch(`/api/vp-pos/${id}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ackBy }),
    })
    load()
  }

  async function completeReceiving() {
    setSaving(true)
    const body = Object.entries(receivedQtys).map(([lineId, receivedQty]) => ({ lineId, receivedQty }))
    await fetch(`/api/vp-pos/${id}/receive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSaving(false)
    load()
  }

  if (!po) return <div className="p-6 text-zinc-500 text-sm">Loading...</div>

  const workflowIdx = WORKFLOW.indexOf(po.status)

  return (
    <>
      <TopBar title={po.poNumber} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <Link href="/vp-pos" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300">
          <ArrowLeft className="w-3.5 h-3.5" />Back to Purchase Orders
        </Link>

        {/* Header */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-lg font-bold text-zinc-100">{po.poNumber}</span>
                  <StatusBadge s={po.status} />
                </div>
                <Link href={`/vp-vendors/${po.vendor.id}`} className="text-zinc-400 hover:text-blue-400 text-sm">
                  {po.vendor.name} <span className="text-zinc-600">({po.vendor.vendorNumber})</span>
                </Link>
                <div className="flex gap-6 mt-3 text-xs text-zinc-500">
                  <span>Ordered: {new Date(po.orderDate).toLocaleDateString()}</span>
                  {po.expectedDate && <span>Expected: {new Date(po.expectedDate).toLocaleDateString()}</span>}
                  {po.ackBy && <span>Ack&apos;d by: {po.ackBy}</span>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-zinc-100">{formatCurrency(po.totalAmount)}</p>
                <p className="text-xs text-zinc-500">{po.currency}</p>
              </div>
            </div>

            {/* Workflow Bar */}
            <div className="mt-6 flex items-center gap-0">
              {WORKFLOW.map((step, i) => {
                const done    = i < workflowIdx || po.status === 'received'
                const current = i === workflowIdx
                return (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className={`flex items-center gap-1.5 text-xs font-medium ${
                      done ? 'text-emerald-400' : current ? 'text-blue-400' : 'text-zinc-600'
                    }`}>
                      {done && <CheckCircle className="w-4 h-4" />}
                      {!done && <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${current ? 'border-blue-500' : 'border-zinc-700'}`} />}
                      <span className="capitalize">{step}</span>
                    </div>
                    {i < WORKFLOW.length - 1 && (
                      <div className={`flex-1 h-px mx-2 ${i < workflowIdx ? 'bg-emerald-600' : 'bg-zinc-800'}`} />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex gap-3">
              {po.status === 'draft' && (
                <Button onClick={sendPO} disabled={saving}>
                  <Send className="w-4 h-4 mr-1" />Send to Vendor
                </Button>
              )}
              {po.status === 'sent' && (
                <Button onClick={ackPO}>
                  <CheckCircle className="w-4 h-4 mr-1" />Mark Acknowledged
                </Button>
              )}
              {po.status === 'acknowledged' && (
                <Button onClick={completeReceiving} disabled={saving}>
                  <PackageCheck className="w-4 h-4 mr-1" />{saving ? 'Saving...' : 'Complete Receiving'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lines Table */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-4">Line Items</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Product</th>
                  <th className="text-left pb-3 font-medium">SKU</th>
                  <th className="text-right pb-3 font-medium">Ordered Qty</th>
                  <th className="text-right pb-3 font-medium">Unit Cost</th>
                  <th className="text-right pb-3 font-medium">Line Total</th>
                  <th className="text-right pb-3 font-medium">Received Qty</th>
                  <th className="text-center pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {po.lines.map(line => (
                  <tr key={line.id} className="hover:bg-zinc-900/30">
                    <td className="py-3 pr-4 text-zinc-100">{line.productName}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-zinc-500">{line.sku ?? '—'}</td>
                    <td className="py-3 pr-4 text-right text-zinc-300">{line.qty}</td>
                    <td className="py-3 pr-4 text-right text-zinc-300">{formatCurrency(line.unitCost)}</td>
                    <td className="py-3 pr-4 text-right font-semibold text-zinc-100">{formatCurrency(line.lineTotal)}</td>
                    <td className="py-3 pr-4 text-right">
                      {po.status === 'acknowledged' ? (
                        <input
                          type="number"
                          min={0}
                          max={line.qty}
                          step={0.01}
                          value={receivedQtys[line.id] ?? 0}
                          onChange={e => setReceivedQtys(prev => ({ ...prev, [line.id]: parseFloat(e.target.value) || 0 }))}
                          className="w-20 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 text-right focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        <span className={line.receivedQty > 0 ? 'text-emerald-400' : 'text-zinc-500'}>{line.receivedQty}</span>
                      )}
                    </td>
                    <td className="py-3 text-center"><StatusBadge s={line.status} /></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-zinc-800">
                  <td colSpan={4} className="pt-3 text-right text-xs text-zinc-500 font-medium uppercase tracking-wide">Total</td>
                  <td className="pt-3 pr-4 text-right font-bold text-zinc-100">{formatCurrency(po.totalAmount)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        {/* Linked Invoices */}
        {po.invoices.length > 0 && (
          <Card>
            <CardContent className="pt-6 pb-6">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-4">Linked Invoices</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-2 font-medium">Invoice #</th>
                    <th className="text-right pb-2 font-medium">Total</th>
                    <th className="text-center pb-2 font-medium">Status</th>
                    <th className="text-right pb-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {po.invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-zinc-900/30">
                      <td className="py-2 pr-4 font-mono text-xs text-zinc-300">{inv.invoiceNumber}</td>
                      <td className="py-2 pr-4 text-right text-zinc-100">{formatCurrency(inv.total)}</td>
                      <td className="py-2 pr-4 text-center"><StatusBadge s={inv.status} /></td>
                      <td className="py-2 text-right">
                        <Link href={`/vp-invoices/${inv.id}`}>
                          <Button size="sm" variant="outline">View</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {po.notes && (
          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-zinc-400">{po.notes}</p>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}
