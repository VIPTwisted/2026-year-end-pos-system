export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Receipt, XCircle, RefreshCw } from 'lucide-react'

const MOCK_SUB = {
  id: 'SUB-0001',
  contractNo: 'SUB-0001',
  customer: 'Acme Corp',
  customerId: 'CUST-001',
  item: 'PRO-PLAN-001',
  description: 'Pro Software License',
  billingPeriod: 'Monthly',
  startDate: '2026-01-01',
  nextInvoiceDate: '2026-05-01',
  endDate: null,
  status: 'Active',
  amount: 299.00,
  paymentTerms: 'Net 30',
  billingGroup: 'MONTHLY-BATCH',
  notes: 'Premier customer - priority support included.',
  lines: [
    { id: 'L1', itemNo: 'PRO-PLAN-001', description: 'Pro Software License', qty: 1, unitPrice: 249.00, lineTotal: 249.00 },
    { id: 'L2', itemNo: 'SUPPORT-PKG', description: 'Priority Support Package', qty: 1, unitPrice: 50.00, lineTotal: 50.00 },
  ],
  billingHistory: [
    { id: 'INV-2026-0041', date: '2026-04-01', amount: 299.00, status: 'Paid' },
    { id: 'INV-2026-0028', date: '2026-03-01', amount: 299.00, status: 'Paid' },
    { id: 'INV-2026-0015', date: '2026-02-01', amount: 299.00, status: 'Paid' },
    { id: 'INV-2026-0003', date: '2026-01-01', amount: 299.00, status: 'Paid' },
  ],
}

export default function SubscriptionDetailPage({ params }: { params: { id: string } }) {
  const sub = MOCK_SUB

  return (
    <>
      <TopBar title={`Contract ${sub.contractNo}`} />
      <main className="flex-1 p-6 overflow-auto space-y-5 max-w-6xl">

        {/* Breadcrumb + Actions */}
        <div className="flex items-center justify-between">
          <Link href="/billing/subscriptions" className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Billing Subscriptions
          </Link>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-2">
              <Receipt className="w-4 h-4" />
              Create Invoice
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Renew
            </Button>
            <Button size="sm" variant="outline" className="gap-2 text-red-400 hover:text-red-300 border-red-900/40">
              <XCircle className="w-4 h-4" />
              Terminate
            </Button>
          </div>
        </div>

        {/* Status header */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">{sub.contractNo}</h1>
            <p className="text-sm text-zinc-500">{sub.customer} · {sub.description}</p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {sub.status}
          </span>
        </div>

        {/* FastTab: General */}
        <Card>
          <div className="px-5 py-3 border-b border-zinc-800">
            <span className="text-sm font-semibold text-zinc-200">General</span>
          </div>
          <CardContent className="p-5 grid grid-cols-3 gap-5">
            <div><p className="text-xs text-zinc-500 mb-1">Contract No.</p><p className="text-sm font-mono text-zinc-300">{sub.contractNo}</p></div>
            <div><p className="text-xs text-zinc-500 mb-1">Customer</p><p className="text-sm text-zinc-300">{sub.customer}</p></div>
            <div><p className="text-xs text-zinc-500 mb-1">Status</p><p className="text-sm text-emerald-400 font-medium">{sub.status}</p></div>
            <div><p className="text-xs text-zinc-500 mb-1">Item No.</p><p className="text-sm font-mono text-zinc-300">{sub.item}</p></div>
            <div><p className="text-xs text-zinc-500 mb-1">Description</p><p className="text-sm text-zinc-300">{sub.description}</p></div>
            <div><p className="text-xs text-zinc-500 mb-1">Payment Terms</p><p className="text-sm text-zinc-300">{sub.paymentTerms}</p></div>
          </CardContent>
        </Card>

        {/* FastTab: Billing */}
        <Card>
          <div className="px-5 py-3 border-b border-zinc-800">
            <span className="text-sm font-semibold text-zinc-200">Billing</span>
          </div>
          <CardContent className="p-5 grid grid-cols-3 gap-5">
            <div><p className="text-xs text-zinc-500 mb-1">Billing Period</p><p className="text-sm text-blue-400 font-medium">{sub.billingPeriod}</p></div>
            <div><p className="text-xs text-zinc-500 mb-1">Start Date</p><p className="text-sm text-zinc-300">{sub.startDate}</p></div>
            <div><p className="text-xs text-zinc-500 mb-1">Next Invoice Date</p><p className="text-sm text-amber-400 font-medium">{sub.nextInvoiceDate}</p></div>
            <div><p className="text-xs text-zinc-500 mb-1">End Date</p><p className="text-sm text-zinc-300">{sub.endDate ?? '—'}</p></div>
            <div><p className="text-xs text-zinc-500 mb-1">Billing Amount</p><p className="text-sm font-bold text-zinc-100">${sub.amount.toFixed(2)}</p></div>
            <div><p className="text-xs text-zinc-500 mb-1">Billing Group</p><p className="text-sm text-zinc-300">{sub.billingGroup}</p></div>
          </CardContent>
        </Card>

        {/* FastTab: Lines */}
        <Card>
          <div className="px-5 py-3 border-b border-zinc-800">
            <span className="text-sm font-semibold text-zinc-200">Lines</span>
          </div>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-5 py-2.5 text-xs text-zinc-500 uppercase">Item No.</th>
                  <th className="text-left px-5 py-2.5 text-xs text-zinc-500 uppercase">Description</th>
                  <th className="text-right px-5 py-2.5 text-xs text-zinc-500 uppercase">Qty</th>
                  <th className="text-right px-5 py-2.5 text-xs text-zinc-500 uppercase">Unit Price</th>
                  <th className="text-right px-5 py-2.5 text-xs text-zinc-500 uppercase">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {sub.lines.map(line => (
                  <tr key={line.id} className="hover:bg-zinc-900/30">
                    <td className="px-5 py-2.5 font-mono text-xs text-zinc-400">{line.itemNo}</td>
                    <td className="px-5 py-2.5 text-zinc-300">{line.description}</td>
                    <td className="px-5 py-2.5 text-right text-zinc-400">{line.qty}</td>
                    <td className="px-5 py-2.5 text-right text-zinc-300">${line.unitPrice.toFixed(2)}</td>
                    <td className="px-5 py-2.5 text-right font-medium text-zinc-200">${line.lineTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-zinc-700">
                  <td colSpan={4} className="px-5 py-3 text-right text-sm font-medium text-zinc-400">Total</td>
                  <td className="px-5 py-3 text-right font-bold text-zinc-100">${sub.amount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>

        {/* FastTab: Billing History */}
        <Card>
          <div className="px-5 py-3 border-b border-zinc-800">
            <span className="text-sm font-semibold text-zinc-200">Billing History</span>
          </div>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-5 py-2.5 text-xs text-zinc-500 uppercase">Invoice No.</th>
                  <th className="text-left px-5 py-2.5 text-xs text-zinc-500 uppercase">Date</th>
                  <th className="text-right px-5 py-2.5 text-xs text-zinc-500 uppercase">Amount</th>
                  <th className="text-left px-5 py-2.5 text-xs text-zinc-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {sub.billingHistory.map(h => (
                  <tr key={h.id} className="hover:bg-zinc-900/30">
                    <td className="px-5 py-2.5 font-mono text-xs text-blue-400">{h.id}</td>
                    <td className="px-5 py-2.5 text-zinc-400">{h.date}</td>
                    <td className="px-5 py-2.5 text-right text-zinc-200">${h.amount.toFixed(2)}</td>
                    <td className="px-5 py-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
