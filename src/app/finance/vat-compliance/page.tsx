import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Percent, TrendingUp, TrendingDown, DollarSign, FileText, Plus, BookOpen, ClipboardList } from 'lucide-react'

type TabKey = 'entries' | 'returns' | 'codes'

const TAB_META: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'entries', label: 'VAT Entries', icon: <FileText className="w-3.5 h-3.5" /> },
  { key: 'returns', label: 'VAT Returns', icon: <ClipboardList className="w-3.5 h-3.5" /> },
  { key: 'codes', label: 'Tax Codes', icon: <BookOpen className="w-3.5 h-3.5" /> },
]

function statusCls(s: string) {
  if (s === 'paid') return 'bg-emerald-500/20 text-emerald-400'
  if (s === 'submitted') return 'bg-blue-500/20 text-blue-400'
  return 'bg-amber-500/20 text-amber-400'
}

export default async function VatCompliancePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const sp = await searchParams
  const activeTab: TabKey = (sp.tab as TabKey) ?? 'entries'

  const [vatTx, taxCodes] = await Promise.all([
    prisma.taxTransaction.findMany({
      include: { taxCode: { select: { code: true, name: true, taxType: true } } },
      orderBy: { taxDate: 'desc' },
      take: 50,
    }),
    prisma.taxCode.findMany({ orderBy: { code: 'asc' } }),
  ])

  const vatTxOnly = vatTx.filter(t => t.taxCode.taxType === 'vat')

  const outputVAT = vatTxOnly
    .filter(t => ['order', 'customer_invoice'].includes(t.sourceType))
    .reduce((s, t) => s + Number(t.taxAmount), 0)

  const inputVAT = vatTxOnly
    .filter(t => t.sourceType === 'vendor_invoice')
    .reduce((s, t) => s + Number(t.taxAmount), 0)

  const netVAT = outputVAT - inputVAT

  const vatCodes = taxCodes.filter(c => c.taxType === 'vat')

  // Mock VAT returns derived from tx groupings
  const returnPeriods = [
    { period: 'Q1 2026', from: '2026-01-01', to: '2026-03-31', output: outputVAT * 0.4, input: inputVAT * 0.4, status: 'paid' },
    { period: 'Q4 2025', from: '2025-10-01', to: '2025-12-31', output: outputVAT * 0.35, input: inputVAT * 0.35, status: 'submitted' },
    { period: 'Q3 2025', from: '2025-07-01', to: '2025-09-30', output: outputVAT * 0.25, input: inputVAT * 0.25, status: 'paid' },
  ]

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#0f0f1a]">
      <TopBar title="VAT / Tax Compliance" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-semibold text-zinc-100">VAT Compliance Hub</h2>
            <p className="text-[13px] text-zinc-500">VAT entries, returns, and tax code management</p>
          </div>
          <Link
            href="/finance/vat-compliance/returns/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white px-3 h-9 text-[13px] font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Return
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <p className="text-[11px] text-zinc-500 uppercase tracking-wide">VAT Payable</p>
              </div>
              <p className="text-2xl font-bold text-emerald-400 tabular-nums">{formatCurrency(outputVAT)}</p>
              <p className="text-[11px] text-zinc-600 mt-1">output VAT collected</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-blue-400" />
                <p className="text-[11px] text-zinc-500 uppercase tracking-wide">VAT Receivable</p>
              </div>
              <p className="text-2xl font-bold text-blue-400 tabular-nums">{formatCurrency(inputVAT)}</p>
              <p className="text-[11px] text-zinc-600 mt-1">input VAT reclaimable</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className={`w-4 h-4 ${netVAT >= 0 ? 'text-red-400' : 'text-emerald-400'}`} />
                <p className="text-[11px] text-zinc-500 uppercase tracking-wide">Net VAT</p>
              </div>
              <p className={`text-2xl font-bold tabular-nums ${netVAT >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {formatCurrency(netVAT)}
              </p>
              <p className="text-[11px] text-zinc-600 mt-1">{netVAT >= 0 ? 'amount owed' : 'refund due'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="w-4 h-4 text-amber-400" />
                <p className="text-[11px] text-zinc-500 uppercase tracking-wide">Last Filing</p>
              </div>
              <p className="text-[18px] font-bold text-amber-400">
                {returnPeriods[0]?.period ?? '—'}
              </p>
              <p className="text-[11px] text-zinc-600 mt-1 capitalize">{returnPeriods[0]?.status ?? 'no filings'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-zinc-800 pb-0">
          {TAB_META.map(tab => (
            <Link
              key={tab.key}
              href={`/finance/vat-compliance?tab=${tab.key}`}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px
                ${activeTab === tab.key
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            >
              {tab.icon}
              {tab.label}
            </Link>
          ))}
        </div>

        {/* VAT Entries Tab */}
        {activeTab === 'entries' && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Date</th>
                  <th className="text-left py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Tax Code</th>
                  <th className="text-left py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Source</th>
                  <th className="text-right py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Taxable</th>
                  <th className="text-right py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">VAT Amount</th>
                  <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {vatTxOnly.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-zinc-500 text-[13px]">No VAT transactions found</td>
                  </tr>
                ) : vatTxOnly.map(tx => (
                  <tr key={tx.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3 text-[12px] text-zinc-400">{formatDate(tx.taxDate)}</td>
                    <td className="py-3 pr-4">
                      <span className="text-zinc-200 font-medium">{tx.taxCode.name}</span>
                      <span className="ml-1.5 font-mono text-[11px] text-zinc-500">{tx.taxCode.code}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="bg-zinc-800 text-zinc-300 rounded px-2 py-0.5 text-[11px] capitalize">
                        {tx.sourceType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right text-zinc-300 tabular-nums text-[13px]">
                      {formatCurrency(Number(tx.taxableAmount))}
                    </td>
                    <td className="py-3 pr-4 text-right font-semibold text-emerald-400 tabular-nums text-[13px]">
                      {formatCurrency(Number(tx.taxAmount))}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize
                        ${['order','customer_invoice'].includes(tx.sourceType) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {['order','customer_invoice'].includes(tx.sourceType) ? 'Output' : 'Input'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VAT Returns Tab */}
        {activeTab === 'returns' && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Period</th>
                  <th className="text-left py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">From</th>
                  <th className="text-left py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">To</th>
                  <th className="text-right py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Output VAT</th>
                  <th className="text-right py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Input VAT</th>
                  <th className="text-right py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Net Payable</th>
                  <th className="text-center py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {returnPeriods.map(r => (
                  <tr key={r.period} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3 font-semibold text-zinc-200 text-[13px]">{r.period}</td>
                    <td className="py-3 pr-4 text-zinc-400 text-[12px]">{r.from}</td>
                    <td className="py-3 pr-4 text-zinc-400 text-[12px]">{r.to}</td>
                    <td className="py-3 pr-4 text-right text-emerald-400 tabular-nums text-[13px]">{formatCurrency(r.output)}</td>
                    <td className="py-3 pr-4 text-right text-blue-400 tabular-nums text-[13px]">{formatCurrency(r.input)}</td>
                    <td className="py-3 pr-4 text-right font-bold text-zinc-100 tabular-nums text-[13px]">{formatCurrency(r.output - r.input)}</td>
                    <td className="py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${statusCls(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {r.status === 'open' && (
                        <button className="text-[12px] text-blue-400 hover:text-blue-300 transition-colors">Submit</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tax Codes Tab */}
        {activeTab === 'codes' && (
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Code</th>
                  <th className="text-left py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Name</th>
                  <th className="text-right py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Rate</th>
                  <th className="text-left py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Type</th>
                  <th className="text-left py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Description</th>
                  <th className="text-center px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {taxCodes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-zinc-500 text-[13px]">No tax codes configured</td>
                  </tr>
                ) : taxCodes.map(tc => (
                  <tr key={tc.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-[12px] text-zinc-400">{tc.code}</td>
                    <td className="py-3 pr-4 text-zinc-200 font-medium text-[13px]">{tc.name}</td>
                    <td className="py-3 pr-4 text-right tabular-nums text-zinc-300 font-semibold text-[13px]">{Number(tc.rate).toFixed(2)}%</td>
                    <td className="py-3 pr-4">
                      <Badge variant={tc.taxType === 'vat' ? 'success' : 'secondary'} className="capitalize text-[11px]">{tc.taxType}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-zinc-500 text-[12px] max-w-[200px] truncate">{tc.description ?? '—'}</td>
                    <td className="px-5 py-3 text-center">
                      <Badge variant={tc.isActive ? 'success' : 'secondary'} className="text-[11px]">
                        {tc.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>
    </div>
  )
}
