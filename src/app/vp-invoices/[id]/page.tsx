'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Receipt, CheckCircle, AlertTriangle, DollarSign, Save } from 'lucide-react'

type InvLine = { id: string; description: string; qty: number; unitPrice: number; lineTotal: number }
type Invoice = {
  id: string; invoiceNumber: string; invoiceDate: string; dueDate: string | null
  subtotal: number; tax: number; total: number; paidAmount: number; status: string
  disputeReason: string | null; approvedBy: string | null; approvedAt: string | null
  paidAt: string | null; paymentMethod: string | null; paymentRef: string | null; notes: string | null
  vendor: { id: string; name: string; vendorNumber: string }
  po: { id: string; poNumber: string } | null
  lines: InvLine[]
}

function StatusBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    received:'text-zinc-400','under-review':'text-blue-400',approved:'text-emerald-400',
    disputed:'text-red-400',paid:'text-emerald-300','partial-paid':'text-amber-400',
  }
  return <span className={`text-sm font-medium capitalize ${map[s] ?? 'text-zinc-400'}`}>{s.replace(/-/g,' ')}</span>
}

export default function VpInvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [invoice, setInvoice]   = useState<Invoice | null>(null)
  const [notes, setNotes]       = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  // Action forms
  const [disputeReason, setDisputeReason] = useState('')
  const [showDispute, setShowDispute]     = useState(false)
  const [payAmount, setPayAmount]   = useState('')
  const [payMethod, setPayMethod]   = useState('ACH')
  const [payRef, setPayRef]         = useState('')
  const [showPay, setShowPay]       = useState(false)
  const [acting, setActing]         = useState(false)

  const load = useCallback(async () => {
    const res = await fetch(`/api/vp-invoices/${id}`)
    const data = await res.json()
    setInvoice(data)
    setNotes(data.notes ?? '')
    setPayAmount(String((data.total - data.paidAmount).toFixed(2)))
  }, [id])

  useEffect(() => { load() }, [load])

  async function saveNotes() {
    setSavingNotes(true)
    await fetch(`/api/vp-invoices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    })
    setSavingNotes(false)
  }

  async function approve() {
    setActing(true)
    const approvedBy = prompt('Approved by:') ?? 'Admin'
    await fetch(`/api/vp-invoices/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedBy }),
    })
    setActing(false)
    load()
  }

  async function submitDispute(e: React.FormEvent) {
    e.preventDefault()
    setActing(true)
    await fetch(`/api/vp-invoices/${id}/dispute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: disputeReason }),
    })
    setActing(false)
    setShowDispute(false)
    load()
  }

  async function submitPayment(e: React.FormEvent) {
    e.preventDefault()
    setActing(true)
    await fetch(`/api/vp-invoices/${id}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseFloat(payAmount), method: payMethod, ref: payRef }),
    })
    setActing(false)
    setShowPay(false)
    load()
  }

  if (!invoice) return <div className="p-6 text-zinc-500 text-sm">Loading...</div>

  const balance = invoice.total - invoice.paidAmount
  const canApprove  = ['received','under-review'].includes(invoice.status)
  const canDispute  = ['received','under-review','approved'].includes(invoice.status)
  const canPay      = invoice.status === 'approved' && balance > 0
  const isOverdue   = invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid'

  return (
    <>
      <TopBar title={invoice.invoiceNumber} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <Link href="/vp-invoices" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300">
          <ArrowLeft className="w-3.5 h-3.5" />Back to Invoices
        </Link>

        {/* Header */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Receipt className="w-5 h-5 text-zinc-500" />
                  <span className="font-mono text-xl font-bold text-zinc-100">{invoice.invoiceNumber}</span>
                  <StatusBadge s={invoice.status} />
                </div>
                <Link href={`/vp-vendors/${invoice.vendor.id}`} className="text-zinc-400 hover:text-blue-400">
                  {invoice.vendor.name} <span className="text-zinc-600">({invoice.vendor.vendorNumber})</span>
                </Link>
                {invoice.po && (
                  <div className="mt-1 text-xs text-zinc-500">
                    Linked PO: <Link href={`/vp-pos/${invoice.po.id}`} className="text-blue-400 hover:text-blue-300">{invoice.po.poNumber}</Link>
                  </div>
                )}
                <div className="flex gap-6 mt-3 text-xs text-zinc-500">
                  <span>Invoice Date: {new Date(invoice.invoiceDate).toLocaleDateString()}</span>
                  {invoice.dueDate && (
                    <span className={isOverdue ? 'text-red-400 font-medium' : ''}>
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}{isOverdue ? ' (OVERDUE)' : ''}
                    </span>
                  )}
                  {invoice.approvedBy && <span>Approved by: {invoice.approvedBy}</span>}
                  {invoice.paymentMethod && <span>Paid via: {invoice.paymentMethod} {invoice.paymentRef ? `(${invoice.paymentRef})` : ''}</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-6">
          {/* Lines + Totals */}
          <div className="col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6 pb-6">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-4">Line Items</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                      <th className="text-left pb-3 font-medium">Description</th>
                      <th className="text-right pb-3 font-medium">Qty</th>
                      <th className="text-right pb-3 font-medium">Unit Price</th>
                      <th className="text-right pb-3 font-medium">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {invoice.lines.map(l => (
                      <tr key={l.id} className="hover:bg-zinc-900/30">
                        <td className="py-3 pr-4 text-zinc-100">{l.description}</td>
                        <td className="py-3 pr-4 text-right text-zinc-400">{l.qty}</td>
                        <td className="py-3 pr-4 text-right text-zinc-400">{formatCurrency(l.unitPrice)}</td>
                        <td className="py-3 text-right font-semibold text-zinc-100">{formatCurrency(l.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
                  {[
                    ['Subtotal',  formatCurrency(invoice.subtotal), 'text-zinc-300'],
                    ['Tax',       formatCurrency(invoice.tax),      'text-zinc-300'],
                    ['Total',     formatCurrency(invoice.total),    'text-zinc-100 font-bold text-base'],
                    ['Paid',      formatCurrency(invoice.paidAmount), 'text-emerald-400'],
                    ['Balance Due', formatCurrency(balance),        balance > 0 ? 'text-amber-400 font-bold' : 'text-zinc-500'],
                  ].map(([label, value, cls]) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm text-zinc-500">{label}</span>
                      <span className={`text-sm ${cls}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            {invoice.paidAt && (
              <Card>
                <CardContent className="pt-5 pb-5">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">Payment History</h3>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <span className="text-zinc-300">Payment recorded</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-emerald-400">{formatCurrency(invoice.paidAmount)}</div>
                      <div className="text-xs text-zinc-500">
                        {invoice.paymentMethod}
                        {invoice.paymentRef ? ` · ${invoice.paymentRef}` : ''}
                        {' · '}{new Date(invoice.paidAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Action Panel */}
          <div className="space-y-4">
            {/* Approve */}
            {canApprove && (
              <Card>
                <CardContent className="pt-5 pb-5">
                  <h3 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />Approve Invoice
                  </h3>
                  <p className="text-xs text-zinc-500 mb-3">Mark this invoice as approved for payment.</p>
                  <Button onClick={approve} disabled={acting} className="w-full">
                    Approve Invoice
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Dispute */}
            {canDispute && (
              <Card>
                <CardContent className="pt-5 pb-5">
                  <h3 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />Dispute Invoice
                  </h3>
                  {!showDispute ? (
                    <Button variant="outline" onClick={() => setShowDispute(true)} className="w-full border-red-800 text-red-400 hover:bg-red-900/20">
                      Open Dispute
                    </Button>
                  ) : (
                    <form onSubmit={submitDispute} className="space-y-3">
                      <textarea
                        required
                        value={disputeReason}
                        onChange={e => setDisputeReason(e.target.value)}
                        placeholder="Describe the dispute reason..."
                        rows={4}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-red-500"
                      />
                      <div className="flex gap-2">
                        <Button type="submit" disabled={acting} className="flex-1 bg-red-900 hover:bg-red-800 text-red-100">
                          Submit Dispute
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowDispute(false)}>Cancel</Button>
                      </div>
                    </form>
                  )}
                  {invoice.disputeReason && (
                    <p className="text-xs text-red-400 mt-2">{invoice.disputeReason}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Pay */}
            {canPay && (
              <Card>
                <CardContent className="pt-5 pb-5">
                  <h3 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-400" />Record Payment
                  </h3>
                  {!showPay ? (
                    <Button onClick={() => setShowPay(true)} className="w-full">Record Payment</Button>
                  ) : (
                    <form onSubmit={submitPayment} className="space-y-3">
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">Amount</label>
                        <input type="number" step="0.01" required value={payAmount}
                          onChange={e => setPayAmount(e.target.value)}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">Method</label>
                        <select value={payMethod} onChange={e => setPayMethod(e.target.value)}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500">
                          <option>ACH</option><option>Check</option><option>Wire</option><option>Cash</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">Reference #</label>
                        <input value={payRef} onChange={e => setPayRef(e.target.value)}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500" />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit" disabled={acting} className="flex-1">{acting ? 'Processing...' : 'Record Payment'}</Button>
                        <Button type="button" variant="outline" onClick={() => setShowPay(false)}>Cancel</Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            <Card>
              <CardContent className="pt-5 pb-5">
                <h3 className="text-sm font-semibold text-zinc-400 mb-3">Notes</h3>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={4}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                />
                <Button onClick={saveNotes} disabled={savingNotes} size="sm" variant="outline" className="mt-2 w-full">
                  <Save className="w-3.5 h-3.5 mr-1" />{savingNotes ? 'Saving...' : 'Save Notes'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
