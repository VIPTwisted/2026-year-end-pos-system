import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Plus, FileText } from 'lucide-react'

function statusCls(s: string) {
  if (s === 'paid') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  if (s === 'submitted') return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
}

export default async function VatReturnsPage() {
  const allTx = await prisma.taxTransaction.findMany({
    include: { taxCode: { select: { taxType: true } } },
    orderBy: { taxDate: 'desc' },
  })

  const vatTx = allTx.filter(t => t.taxCode.taxType === 'vat')

  const outputVAT = vatTx
    .filter(t => ['order', 'customer_invoice'].includes(t.sourceType))
    .reduce((s, t) => s + Number(t.taxAmount), 0)

  const inputVAT = vatTx
    .filter(t => t.sourceType === 'vendor_invoice')
    .reduce((s, t) => s + Number(t.taxAmount), 0)

  // Synthetic returns list until a VatReturn model is added
  const returns = [
    { id: 'r1', period: 'Q1 2026', from: '2026-01-01', to: '2026-03-31', output: outputVAT * 0.40, input: inputVAT * 0.40, status: 'paid', submitted: '2026-04-15' },
    { id: 'r2', period: 'Q4 2025', from: '2025-10-01', to: '2025-12-31', output: outputVAT * 0.35, input: inputVAT * 0.35, status: 'submitted', submitted: '2026-01-14' },
    { id: 'r3', period: 'Q3 2025', from: '2025-07-01', to: '2025-09-30', output: outputVAT * 0.25, input: inputVAT * 0.25, status: 'paid', submitted: '2025-10-15' },
    { id: 'r4', period: 'Q2 2026', from: '2026-04-01', to: '2026-06-30', output: 0, input: 0, status: 'open', submitted: null },
  ]

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="VAT Returns" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/finance/vat-compliance"
              className="inline-flex items-center gap-1.5 text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              VAT Compliance
            </Link>
            <span className="text-zinc-700">/</span>
            <h2 className="text-[16px] font-semibold text-zinc-100">VAT Returns</h2>
          </div>
          <Link
            href="/finance/vat-compliance/returns/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white px-3 h-9 text-[13px] font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Return
          </Link>
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-[13px] font-semibold text-zinc-100">Filing History</span>
            <span className="ml-auto text-[11px] text-zinc-500">{returns.length} returns</span>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Period</th>
                <th className="text-left py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">From Date</th>
                <th className="text-left py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">To Date</th>
                <th className="text-right py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Output VAT</th>
                <th className="text-right py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Input VAT</th>
                <th className="text-right py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Net Payable</th>
                <th className="text-center py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                <th className="text-left py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Submitted</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {returns.map(r => {
                const net = r.output - r.input
                return (
                  <tr key={r.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-zinc-200 text-[13px]">{r.period}</td>
                    <td className="py-3.5 pr-4 text-zinc-400 text-[12px]">{r.from}</td>
                    <td className="py-3.5 pr-4 text-zinc-400 text-[12px]">{r.to}</td>
                    <td className="py-3.5 pr-4 text-right text-emerald-400 tabular-nums text-[13px]">{formatCurrency(r.output)}</td>
                    <td className="py-3.5 pr-4 text-right text-blue-400 tabular-nums text-[13px]">{formatCurrency(r.input)}</td>
                    <td className="py-3.5 pr-4 text-right font-bold text-zinc-100 tabular-nums text-[13px]">{formatCurrency(net)}</td>
                    <td className="py-3.5 text-center">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${statusCls(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-zinc-500 text-[12px]">{r.submitted ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      {r.status === 'open' && (
                        <button className="text-[12px] font-medium text-blue-400 hover:text-blue-300 transition-colors">
                          Submit
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  )
}
