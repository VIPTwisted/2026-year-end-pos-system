import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import ProformaActions from './ProformaActions'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  draft:     'bg-zinc-700/40 text-zinc-400',
  sent:      'bg-blue-500/20 text-blue-400',
  confirmed: 'bg-emerald-500/20 text-emerald-400',
  invoiced:  'bg-purple-500/20 text-purple-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

export default async function ProformaDetailPage({ params }: { params: { id: string } }) {
  const invoice = await prisma.proformaInvoice.findUnique({
    where: { id: params.id },
    include: {
      project:  { select: { projectNo: true, description: true } },
      customer: { select: { firstName: true, lastName: true } },
    },
  })

  if (!invoice) notFound()

  let lines: Array<{ description: string; quantity: number; rate: number; amount: number }> = []
  try { lines = JSON.parse(invoice.linesJson ?? '[]') } catch {}

  return (
    <>
      <TopBar title={`Proforma — ${invoice.invoiceNumber}`} />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5 max-w-4xl">

          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                <Link href="/projects/invoicing/proforma" className="hover:text-zinc-300">Proforma Invoices</Link> / {invoice.invoiceNumber}
              </p>
              <h2 className="text-[18px] font-semibold text-zinc-100">{invoice.invoiceNumber}</h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[invoice.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
              {invoice.status}
            </span>
          </div>

          {/* Header info */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Project</p>
              <p className="text-zinc-200">{invoice.project.projectNo} — {invoice.project.description}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Customer</p>
              <p className="text-zinc-200">{invoice.customer ? `${invoice.customer.firstName} ${invoice.customer.lastName}` : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Invoice Date</p>
              <p className="text-zinc-200">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
            </div>
            {invoice.notes && (
              <div className="col-span-3">
                <p className="text-xs text-zinc-500 mb-1">Notes</p>
                <p className="text-zinc-400">{invoice.notes}</p>
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800/50">
              <h3 className="text-sm font-semibold text-zinc-300">Line Items</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  <th className="text-left px-5 py-3 text-xs text-zinc-500">Description</th>
                  <th className="text-right px-5 py-3 text-xs text-zinc-500">Qty</th>
                  <th className="text-right px-5 py-3 text-xs text-zinc-500">Rate</th>
                  <th className="text-right px-5 py-3 text-xs text-zinc-500">Amount</th>
                </tr>
              </thead>
              <tbody>
                {lines.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-zinc-600">No line items</td></tr>
                )}
                {lines.map((line, i) => (
                  <tr key={i} className="border-b border-zinc-800/20">
                    <td className="px-5 py-3 text-zinc-300">{line.description}</td>
                    <td className="px-5 py-3 text-zinc-400 text-right">{line.quantity}</td>
                    <td className="px-5 py-3 text-zinc-400 text-right font-mono">${line.rate.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="px-5 py-3 text-zinc-200 text-right font-mono">${line.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-zinc-700">
                  <td colSpan={3} className="px-5 py-3 text-right text-xs text-zinc-500">Subtotal</td>
                  <td className="px-5 py-3 text-right text-zinc-300 font-mono">${invoice.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-5 py-2 text-right text-xs text-zinc-500">Tax</td>
                  <td className="px-5 py-2 text-right text-zinc-300 font-mono">${invoice.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr className="border-t border-zinc-700 bg-zinc-900/30">
                  <td colSpan={3} className="px-5 py-3 text-right text-sm font-semibold text-zinc-200">Total</td>
                  <td className="px-5 py-3 text-right text-white font-bold font-mono">${invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Actions */}
          <ProformaActions id={invoice.id} status={invoice.status} />
        </div>
      </main>
    </>
  )
}
