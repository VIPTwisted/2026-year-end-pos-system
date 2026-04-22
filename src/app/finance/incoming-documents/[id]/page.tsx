export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckSquare, FileText, Scan, Eye } from 'lucide-react'

const MOCK_DOC = {
  id: 'INC-001',
  no: 'INC-001',
  description: 'Vendor Invoice - Office Supplies',
  createdDate: '2026-04-20',
  status: 'Released',
  vendorInvoiceNo: 'VI-5521',
  amount: 1245.50,
  vendor: 'Office Depot',
  vendorId: 'VEN-042',
  documentDate: '2026-04-18',
  notes: 'Monthly office supply order - approved by Mgmt.',
  // OCR extracted fields
  extracted: {
    vendor: 'Office Depot Inc.',
    invoiceDate: '2026-04-18',
    dueDate: '2026-05-18',
    subtotal: 1100.00,
    tax: 145.50,
    total: 1245.50,
    lines: [
      { description: 'Copy Paper 8.5x11 - 5 Cases', qty: 5, unitPrice: 89.99, total: 449.95 },
      { description: 'Pens Black Medium 12pk', qty: 10, unitPrice: 8.99, total: 89.90 },
      { description: 'Toner Cartridge HP 26A', qty: 2, unitPrice: 279.99, total: 559.98 },
    ]
  }
}

export default function IncomingDocumentDetailPage({ params }: { params: { id: string } }) {
  const doc = MOCK_DOC

  return (
    <>
      <TopBar title={`Incoming Document ${doc.no}`} />
      <main className="flex-1 p-6 overflow-auto space-y-5 max-w-6xl">

        <div className="flex items-center justify-between">
          <Link href="/finance/incoming-documents" className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Incoming Documents
          </Link>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-2">
              <Scan className="w-4 h-4" />
              Run OCR
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <CheckSquare className="w-4 h-4" />
              Release
            </Button>
            <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-500">
              <FileText className="w-4 h-4" />
              Create Purchase Invoice
            </Button>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-zinc-100">{doc.no}</h1>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            {doc.status}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {/* Main detail */}
          <div className="col-span-2 space-y-5">
            {/* Document Info */}
            <Card>
              <div className="px-5 py-3 border-b border-zinc-800">
                <span className="text-sm font-semibold text-zinc-200">Document Info</span>
              </div>
              <CardContent className="p-5 grid grid-cols-2 gap-4">
                <div><p className="text-xs text-zinc-500 mb-1">No.</p><p className="text-sm font-mono text-zinc-300">{doc.no}</p></div>
                <div><p className="text-xs text-zinc-500 mb-1">Status</p><p className="text-sm text-amber-400 font-medium">{doc.status}</p></div>
                <div><p className="text-xs text-zinc-500 mb-1">Vendor</p><p className="text-sm text-zinc-300">{doc.vendor}</p></div>
                <div><p className="text-xs text-zinc-500 mb-1">Vendor Invoice No.</p><p className="text-sm font-mono text-zinc-300">{doc.vendorInvoiceNo}</p></div>
                <div><p className="text-xs text-zinc-500 mb-1">Created Date</p><p className="text-sm text-zinc-300">{doc.createdDate}</p></div>
                <div><p className="text-xs text-zinc-500 mb-1">Document Date</p><p className="text-sm text-zinc-300">{doc.documentDate}</p></div>
              </CardContent>
            </Card>

            {/* OCR Extracted Fields */}
            <Card>
              <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-200">Extracted Fields (OCR)</span>
                <Eye className="w-4 h-4 text-zinc-500" />
              </div>
              <CardContent className="p-5 grid grid-cols-3 gap-4 mb-4">
                <div><p className="text-xs text-zinc-500 mb-1">Vendor (Extracted)</p><p className="text-sm text-zinc-300">{doc.extracted.vendor}</p></div>
                <div><p className="text-xs text-zinc-500 mb-1">Invoice Date</p><p className="text-sm text-zinc-300">{doc.extracted.invoiceDate}</p></div>
                <div><p className="text-xs text-zinc-500 mb-1">Due Date</p><p className="text-sm text-zinc-300">{doc.extracted.dueDate}</p></div>
                <div><p className="text-xs text-zinc-500 mb-1">Subtotal</p><p className="text-sm text-zinc-300">${doc.extracted.subtotal.toFixed(2)}</p></div>
                <div><p className="text-xs text-zinc-500 mb-1">Tax</p><p className="text-sm text-zinc-300">${doc.extracted.tax.toFixed(2)}</p></div>
                <div><p className="text-xs text-zinc-500 mb-1">Total</p><p className="text-sm font-bold text-zinc-100">${doc.extracted.total.toFixed(2)}</p></div>
              </CardContent>

              {/* Line Items */}
              <div className="border-t border-zinc-800">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-5 py-2.5 text-xs text-zinc-500 uppercase">Description</th>
                      <th className="text-right px-5 py-2.5 text-xs text-zinc-500 uppercase">Qty</th>
                      <th className="text-right px-5 py-2.5 text-xs text-zinc-500 uppercase">Unit Price</th>
                      <th className="text-right px-5 py-2.5 text-xs text-zinc-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {doc.extracted.lines.map((line, idx) => (
                      <tr key={idx} className="hover:bg-zinc-900/30">
                        <td className="px-5 py-2.5 text-zinc-300">{line.description}</td>
                        <td className="px-5 py-2.5 text-right text-zinc-400">{line.qty}</td>
                        <td className="px-5 py-2.5 text-right text-zinc-400">${line.unitPrice.toFixed(2)}</td>
                        <td className="px-5 py-2.5 text-right font-medium text-zinc-200">${line.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Preview panel */}
          <div>
            <Card className="h-full">
              <div className="px-4 py-3 border-b border-zinc-800">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Document Preview</span>
              </div>
              <CardContent className="p-4">
                <div className="bg-zinc-900 rounded border border-zinc-800 h-80 flex items-center justify-center">
                  <div className="text-center text-zinc-600">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">PDF Preview</p>
                    <p className="text-xs mt-1">{doc.vendorInvoiceNo}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">File type</span>
                    <span className="text-zinc-400">PDF</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Pages</span>
                    <span className="text-zinc-400">1</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Amount</span>
                    <span className="text-zinc-200 font-medium">${doc.amount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
