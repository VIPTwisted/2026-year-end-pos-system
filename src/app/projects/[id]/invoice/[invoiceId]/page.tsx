export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, FileText } from 'lucide-react'

export default async function ProjectInvoicePage({
  params,
}: {
  params: Promise<{ id: string; invoiceId: string }>
}) {
  const { id, invoiceId } = await params

  const invoice = await prisma.projectInvoice.findUnique({
    where: { id: invoiceId },
    include: {
      project: {
        include: {
          customer: true,
          ledgerEntries: { where: { isInvoiced: true, isBillable: true } },
        },
      },
    },
  })

  if (!invoice || invoice.projectId !== id) notFound()

  return (
    <>
      <TopBar title={invoice.invoiceNo} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <Link href={`/projects/${id}`} className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to {invoice.project.projectNo}
        </Link>

        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold font-mono text-zinc-100">{invoice.invoiceNo}</span>
                  <Badge variant={invoice.status === 'posted' ? 'success' : 'secondary'} className="capitalize">
                    {invoice.status}
                  </Badge>
                </div>
                <p className="text-sm text-zinc-400">
                  Project: <Link href={`/projects/${id}`} className="text-blue-400 hover:underline">{invoice.project.projectNo}</Link>
                  {' — '}{invoice.project.description}
                </p>
                {invoice.project.customer && (
                  <p className="text-xs text-zinc-500">
                    Customer: <Link href={`/customers/${invoice.project.customer.id}`} className="text-blue-400 hover:underline">
                      {invoice.project.customer.firstName} {invoice.project.customer.lastName}
                    </Link>
                  </p>
                )}
                <p className="text-xs text-zinc-500">Invoice Date: {formatDate(invoice.invoiceDate)}</p>
                {invoice.dueDate && <p className="text-xs text-zinc-500">Due: {formatDate(invoice.dueDate)}</p>}
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Invoice Amount</p>
                <p className="text-3xl font-bold text-emerald-400">{formatCurrency(Number(invoice.amount))}</p>
              </div>
            </div>
            {invoice.notes && (
              <p className="mt-4 text-xs text-zinc-500 italic border-t border-zinc-800 pt-4">{invoice.notes}</p>
            )}
          </CardContent>
        </Card>

        {/* Ledger entries that make up this invoice */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-400" />
              Invoiced Ledger Entries
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {invoice.project.ledgerEntries.length === 0 ? (
              <p className="px-5 pb-5 text-xs text-zinc-600">No associated ledger entries.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    {['Date', 'Type', 'Description', 'Qty', 'Unit Price', 'Total'].map(h => (
                      <th key={h} className={`px-4 pb-2 pt-3 text-xs font-medium text-zinc-500 uppercase tracking-wide ${h === 'Description' ? 'text-left' : 'text-right'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoice.project.ledgerEntries.map(e => (
                    <tr key={e.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20">
                      <td className="px-4 py-2.5 text-right text-xs text-zinc-500">{formatDate(e.postingDate)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <Badge variant="secondary" className="text-xs capitalize">{e.entryType}</Badge>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-200">{e.description}</td>
                      <td className="px-4 py-2.5 text-right text-xs text-zinc-300">{Number(e.quantity)}</td>
                      <td className="px-4 py-2.5 text-right text-xs text-zinc-400">{formatCurrency(Number(e.unitPrice))}</td>
                      <td className="px-4 py-2.5 text-right text-xs text-emerald-400 font-semibold">{formatCurrency(Number(e.totalPrice))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-zinc-700">
                    <td colSpan={5} className="px-4 py-2.5 text-right text-xs text-zinc-500 uppercase tracking-wide">Invoice Total</td>
                    <td className="px-4 py-2.5 text-right font-bold text-zinc-100">{formatCurrency(Number(invoice.amount))}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </CardContent>
        </Card>

      </main>
    </>
  )
}
