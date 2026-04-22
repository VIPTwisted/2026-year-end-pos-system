export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileSearch, CheckSquare, Eye, FileText, ChevronRight, Scan } from 'lucide-react'

const STATUS_BADGE: Record<string, string> = {
  New: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Released: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Assigned: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Posted: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Failed: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const MOCK_DOCS = [
  { id: 'INC-001', no: 'INC-001', description: 'Vendor Invoice - Office Supplies', createdDate: '2026-04-20', status: 'Released', vendorInvoiceNo: 'VI-5521', amount: 1245.50, vendor: 'Office Depot' },
  { id: 'INC-002', no: 'INC-002', description: 'Vendor Invoice - IT Equipment', createdDate: '2026-04-19', status: 'New', vendorInvoiceNo: 'IT-9982', amount: 8750.00, vendor: 'TechWorld' },
  { id: 'INC-003', no: 'INC-003', description: 'Freight Invoice April', createdDate: '2026-04-18', status: 'Assigned', vendorInvoiceNo: 'FRT-0041', amount: 560.25, vendor: 'FastFreight LLC' },
  { id: 'INC-004', no: 'INC-004', description: 'Utility Bill March', createdDate: '2026-04-15', status: 'Posted', vendorInvoiceNo: 'UTIL-03-26', amount: 342.80, vendor: 'City Power' },
  { id: 'INC-005', no: 'INC-005', description: 'Marketing Services', createdDate: '2026-04-12', status: 'New', vendorInvoiceNo: '', amount: 3200.00, vendor: 'BrandAgency Inc.' },
]

export default function IncomingDocumentsPage() {
  const newCount = MOCK_DOCS.filter(d => d.status === 'New').length
  const releasedCount = MOCK_DOCS.filter(d => d.status === 'Released').length
  const postedCount = MOCK_DOCS.filter(d => d.status === 'Posted').length

  return (
    <>
      <TopBar title="Incoming Documents" />
      <main className="flex-1 p-6 overflow-auto space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">New</p>
            <p className="text-2xl font-bold text-blue-400">{newCount}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Released</p>
            <p className="text-2xl font-bold text-amber-400">{releasedCount}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Posted</p>
            <p className="text-2xl font-bold text-emerald-400">{postedCount}</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 pb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Documents</p>
            <p className="text-2xl font-bold text-zinc-100">{MOCK_DOCS.length}</p>
          </CardContent></Card>
        </div>

        {/* Action Ribbon */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-500" asChild>
            <Link href="/finance/incoming-documents/new">
              <Plus className="w-4 h-4" />
              New
            </Link>
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <Scan className="w-4 h-4" />
            OCR Extract
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <CheckSquare className="w-4 h-4" />
            Release
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <FileText className="w-4 h-4" />
            Create Document
          </Button>
        </div>

        {/* Filter pane */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-500 font-medium">Status:</span>
          {['All', 'New', 'Released', 'Assigned', 'Posted'].map(s => (
            <Link
              key={s}
              href={s === 'All' ? '/finance/incoming-documents' : `/finance/incoming-documents?status=${s}`}
              className="px-2.5 py-1 rounded text-xs font-medium border bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500 transition-colors"
            >
              {s}
            </Link>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">No.</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Description</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Vendor</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Created Date</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Vendor Invoice No.</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 uppercase">Amount</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {MOCK_DOCS.map(doc => (
                    <tr key={doc.id} className="hover:bg-zinc-900/40 transition-colors group">
                      <td className="px-4 py-3 font-mono text-xs">
                        <Link href={`/finance/incoming-documents/${doc.id}`} className="text-blue-400 hover:text-blue-300">
                          {doc.no}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-300">{doc.description}</td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{doc.vendor}</td>
                      <td className="px-4 py-3 text-xs text-zinc-400">{doc.createdDate}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${STATUS_BADGE[doc.status] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-zinc-500">{doc.vendorInvoiceNo || '—'}</td>
                      <td className="px-4 py-3 text-right font-medium text-zinc-200">
                        ${doc.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/finance/incoming-documents/${doc.id}`}>
                          <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 inline" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
