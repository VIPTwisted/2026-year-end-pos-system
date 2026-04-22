'use client'

import { useState, useEffect, use } from 'react'
import { ChevronDown, ArrowLeft, FileText, XCircle, Printer } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type InvoiceItem = {
  id: string
  lineType: string
  itemNo: string | null
  description: string
  productName: string
  quantity: number
  unitPrice: number
  discountPct: number
  lineTotal: number
}

type SalesInvoice = {
  id: string
  invoiceNumber: string
  sellToCustomerName: string | null
  accountName: string | null
  billToCustomerName: string | null
  postingDate: string
  dueDate: string | null
  externalDocNo: string | null
  salespersonCode: string | null
  status: string
  subtotal: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  remainingAmount: number
  paidAmount: number
  notes: string | null
  items: InvoiceItem[]
  order: { id: string; orderNumber: string } | null
}

const STATUS_COLORS: Record<string, string> = {
  Open: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  Released: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
  Posted: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  Cancelled: 'bg-red-500/20 text-red-400 border border-red-500/30',
}

function FastTab({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
      <summary className="px-4 py-3 text-sm font-semibold text-zinc-200 cursor-pointer hover:bg-zinc-900/30 flex items-center justify-between list-none">
        {title} <ChevronDown className="w-4 h-4 text-zinc-500" />
      </summary>
      <div className="px-4 pb-4 grid grid-cols-2 gap-4">{children}</div>
    </details>
  )
}

function FactField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-sm text-zinc-200 mt-0.5">{value || '—'}</p>
    </div>
  )
}

function fmtDate(s: string | null | undefined) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function SalesInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [invoice, setInvoice] = useState<SalesInvoice | null>(null)
  const [working, setWorking] = useState('')

  async function load() {
    const res = await fetch(`/api/sales/invoices/${id}`)
    setInvoice(await res.json())
  }

  useEffect(() => { load() }, [id])

  async function doAction(action: string) {
    setWorking(action)
    await fetch(`/api/sales/invoices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    await load()
    setWorking('')
  }

  if (!invoice) return <div className="min-h-[100dvh] bg-[#0f0f1a] flex items-center justify-center text-zinc-500">Loading...</div>

  const subtotal = invoice.subtotal || invoice.items.reduce((s, l) => s + l.lineTotal, 0)
  const tax = invoice.taxAmount || subtotal * 0.0825
  const total = invoice.totalAmount || subtotal + tax
  const remaining = invoice.remainingAmount || (total - invoice.paidAmount)

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      <div className="border-b border-zinc-800 bg-[#0f0f1a] px-6 py-3 flex items-center gap-2 text-sm text-zinc-400">
        <Link href="/sales" className="hover:text-zinc-200">Sales</Link>
        <span>/</span>
        <Link href="/sales/invoices" className="hover:text-zinc-200">Sales Invoices</Link>
        <span>/</span>
        <span className="text-zinc-200 font-mono">{invoice.invoiceNumber.slice(-12)}</span>
      </div>

      <div className="border-b border-zinc-800 bg-[#16213e] px-6 py-3">
        <div className="flex items-center gap-1 mb-2 flex-wrap">
          <Link href="/sales/invoices" className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] rounded text-xs font-medium text-zinc-200 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
          <div className="h-4 w-px bg-zinc-700 mx-1" />
          {invoice.status !== 'Posted' && invoice.status !== 'Cancelled' && (
            <button onClick={() => doAction('post')} disabled={!!working}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 disabled:opacity-40 rounded text-xs font-medium text-white transition-colors">
              <FileText className="w-3.5 h-3.5" /> {working === 'post' ? 'Posting...' : 'Post'}
            </button>
          )}
          {invoice.status !== 'Cancelled' && invoice.status !== 'Posted' && (
            <button onClick={() => doAction('cancel')} disabled={!!working}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] disabled:opacity-40 rounded text-xs font-medium text-zinc-200 transition-colors">
              <XCircle className="w-3.5 h-3.5" /> Cancel
            </button>
          )}
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e2d4a] hover:bg-[#243558] rounded text-xs font-medium text-zinc-200 transition-colors">
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <div className="ml-3">
            <span className={cn('px-2 py-0.5 rounded text-xs font-medium', STATUS_COLORS[invoice.status] ?? 'bg-zinc-700/50 text-zinc-400')}>
              {invoice.status}
            </span>
          </div>
        </div>
        <h1 className="text-base font-semibold text-zinc-100">Sales Invoice — {invoice.invoiceNumber.slice(-12)}</h1>
      </div>

      <div className="flex gap-6 p-6">
        <div className="flex-1 space-y-4">
          <FastTab title="General">
            <FactField label="Sell-to Customer Name" value={invoice.sellToCustomerName ?? invoice.accountName} />
            <FactField label="Posting Date" value={fmtDate(invoice.postingDate)} />
            <FactField label="Due Date" value={fmtDate(invoice.dueDate)} />
            <FactField label="External Document No." value={invoice.externalDocNo} />
            <FactField label="Salesperson Code" value={invoice.salespersonCode} />
            <FactField label="Bill-to Customer" value={invoice.billToCustomerName ?? invoice.sellToCustomerName ?? invoice.accountName} />
          </FastTab>

          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800">
              <span className="text-sm font-semibold text-zinc-200">Lines</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 bg-[#0f1829]">
                    <th className="text-left px-3 py-2 text-zinc-500 font-medium">Type</th>
                    <th className="text-left px-3 py-2 text-zinc-500 font-medium">No.</th>
                    <th className="text-left px-3 py-2 text-zinc-500 font-medium">Description</th>
                    <th className="text-right px-3 py-2 text-zinc-500 font-medium">Qty</th>
                    <th className="text-right px-3 py-2 text-zinc-500 font-medium">Unit Price</th>
                    <th className="text-right px-3 py-2 text-zinc-500 font-medium">Disc %</th>
                    <th className="text-right px-3 py-2 text-zinc-500 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {invoice.items.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center text-zinc-600">No lines</td></tr>}
                  {invoice.items.map(l => (
                    <tr key={l.id} className="hover:bg-zinc-800/20">
                      <td className="px-3 py-2 text-zinc-400">{l.lineType}</td>
                      <td className="px-3 py-2 text-zinc-300 font-mono">{l.itemNo || '—'}</td>
                      <td className="px-3 py-2 text-zinc-200">{l.description || l.productName}</td>
                      <td className="px-3 py-2 text-right text-zinc-300">{l.quantity}</td>
                      <td className="px-3 py-2 text-right text-zinc-300 font-mono">${l.unitPrice.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right text-zinc-400">{l.discountPct}%</td>
                      <td className="px-3 py-2 text-right text-zinc-200 font-mono">${l.lineTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-zinc-800 px-4 py-3 flex justify-end">
              <div className="w-56 space-y-1 text-xs">
                <div className="flex justify-between text-zinc-400"><span>Subtotal</span><span className="font-mono">${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-zinc-400"><span>Tax</span><span className="font-mono">${tax.toFixed(2)}</span></div>
                <div className="flex justify-between text-zinc-200 font-semibold text-sm border-t border-zinc-700 pt-1">
                  <span>Total</span><span className="font-mono">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Paid</span><span className="font-mono">${invoice.paidAmount.toFixed(2)}</span>
                </div>
                <div className={cn('flex justify-between font-semibold text-sm', remaining > 0 ? 'text-amber-400' : 'text-emerald-400')}>
                  <span>Remaining</span><span className="font-mono">${remaining.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FactBox */}
        <div className="w-64 space-y-3">
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4 space-y-3">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Invoice Details</p>
            <FactField label="Invoice No." value={invoice.invoiceNumber.slice(-12)} />
            <FactField label="Status" value={invoice.status} />
            <FactField label="Total" value={`$${total.toFixed(2)}`} />
            <FactField label="Remaining" value={`$${remaining.toFixed(2)}`} />
          </div>
          {invoice.order && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Source Order</p>
              <Link href={`/sales/orders/${invoice.order.id}`} className="text-xs text-blue-400 hover:text-blue-300 font-mono">
                {invoice.order.orderNumber.slice(-12)}
              </Link>
            </div>
          )}
          {invoice.notes && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Notes</p>
              <p className="text-xs text-zinc-300">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
