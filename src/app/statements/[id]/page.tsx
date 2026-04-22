'use client'
import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Calculator, CheckCircle, Building2, Calendar, Hash,
  DollarSign, TrendingDown, Percent, CreditCard, Banknote,
  Gift, AlertTriangle, ExternalLink,
} from 'lucide-react'

interface Statement {
  id: string
  statementNumber: string
  storeId: string | null
  channelId: string | null
  fiscalPeriod: string | null
  startDate: string
  endDate: string
  status: string
  totalSales: number
  totalReturns: number
  totalDiscounts: number
  totalTax: number
  totalCash: number
  totalCard: number
  totalGiftCard: number
  transactionCount: number
  variance: number
  calculatedAt: string | null
  postedAt: string | null
  notes: string | null
}

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  calculated: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  posted: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  voided: 'bg-red-400/10 text-red-400 border-red-400/20',
}

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export default function StatementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [stmt, setStmt] = useState<Statement | null>(null)
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const res = await fetch(`/api/statements/${id}`)
    if (res.ok) setStmt(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  async function handleCalculate() {
    setCalculating(true); setError('')
    const res = await fetch(`/api/statements/${id}/calculate`, { method: 'POST' })
    if (!res.ok) { const err = await res.json(); setError(err.error ?? 'Calculation failed') }
    else await load()
    setCalculating(false)
  }

  async function handlePost() {
    setPosting(true); setError('')
    const res = await fetch(`/api/statements/${id}/post`, { method: 'POST' })
    if (!res.ok) { const err = await res.json(); setError(err.error ?? 'Posting failed') }
    else await load()
    setPosting(false)
  }

  if (loading) return (
    <>
      <TopBar title="Statement" />
      <main className="flex-1 p-6 flex items-center justify-center"><span className="text-zinc-500">Loading...</span></main>
    </>
  )

  if (!stmt) return (
    <>
      <TopBar title="Statement" />
      <main className="flex-1 p-6"><div className="text-red-400">Statement not found</div></main>
    </>
  )

  const netSales = stmt.totalSales - stmt.totalReturns
  const expectedCash = netSales - stmt.totalCard - stmt.totalGiftCard
  const tenderTotal = stmt.totalCash + stmt.totalCard + stmt.totalGiftCard

  return (
    <>
      <TopBar title={`Statement ${stmt.statementNumber}`} />
      <main className="flex-1 p-6 overflow-auto space-y-6 max-w-5xl mx-auto">
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">{error}</div>}

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg font-bold text-zinc-100">{stmt.statementNumber}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[stmt.status]}`}>{stmt.status}</span>
                </div>
                <div className="flex items-center gap-5 text-sm text-zinc-500">
                  {stmt.storeId && <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{stmt.storeId}</span>}
                  {stmt.channelId && <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" />{stmt.channelId}</span>}
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{new Date(stmt.startDate).toLocaleDateString()} — {new Date(stmt.endDate).toLocaleDateString()}</span>
                  {stmt.fiscalPeriod && <span className="text-blue-400">{stmt.fiscalPeriod}</span>}
                </div>
                {stmt.notes && <p className="text-sm text-zinc-500">{stmt.notes}</p>}
                {stmt.calculatedAt && <p className="text-xs text-zinc-600">Calculated: {new Date(stmt.calculatedAt).toLocaleString()}</p>}
                {stmt.postedAt && <p className="text-xs text-emerald-600">Posted: {new Date(stmt.postedAt).toLocaleString()}</p>}
              </div>

              <div className="flex flex-col gap-2 items-end">
                {stmt.status !== 'posted' && stmt.status !== 'voided' && (
                  <Button onClick={handleCalculate} disabled={calculating} variant="outline" className="gap-2">
                    <Calculator className="w-4 h-4" />
                    {calculating ? 'Calculating...' : 'Calculate'}
                  </Button>
                )}
                {stmt.status === 'calculated' && (
                  <Button onClick={handlePost} disabled={posting} variant="success" className="gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {posting ? 'Posting...' : 'Post Statement'}
                  </Button>
                )}
                <Link href={`/orders?storeId=${stmt.storeId ?? ''}`}>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                    <ExternalLink className="w-3 h-3" />Transaction Audit
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Gross Sales', value: stmt.totalSales, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
            { label: 'Returns', value: stmt.totalReturns, icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-400/10' },
            { label: 'Discounts', value: stmt.totalDiscounts, icon: Percent, color: 'text-amber-400', bg: 'bg-amber-400/10' },
            { label: 'Tax Collected', value: stmt.totalTax, icon: DollarSign, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          ].map(k => (
            <Card key={k.label}>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-500">{k.label}</span>
                  <div className={`w-7 h-7 rounded-lg ${k.bg} flex items-center justify-center`}>
                    <k.icon className={`w-3.5 h-3.5 ${k.color}`} />
                  </div>
                </div>
                <div className={`text-xl font-bold ${k.color}`}>{fmt(k.value)}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold text-zinc-100 mb-4">Tender Breakdown</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2.5 text-xs font-medium text-zinc-500 uppercase">Tender</th>
                  <th className="text-right py-2.5 text-xs font-medium text-zinc-500 uppercase">Expected</th>
                  <th className="text-right py-2.5 text-xs font-medium text-zinc-500 uppercase">Actual</th>
                  <th className="text-right py-2.5 text-xs font-medium text-zinc-500 uppercase">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                <tr>
                  <td className="py-3 flex items-center gap-2 text-zinc-300"><Banknote className="w-4 h-4 text-emerald-400" />Cash</td>
                  <td className="py-3 text-right text-zinc-400">{fmt(expectedCash)}</td>
                  <td className="py-3 text-right text-zinc-300 font-medium">{fmt(stmt.totalCash)}</td>
                  <td className={`py-3 text-right font-medium ${Math.abs(stmt.variance) > 1 ? 'text-red-400' : 'text-zinc-500'}`}>{fmt(stmt.totalCash - expectedCash)}</td>
                </tr>
                <tr>
                  <td className="py-3 flex items-center gap-2 text-zinc-300"><CreditCard className="w-4 h-4 text-blue-400" />Card</td>
                  <td className="py-3 text-right text-zinc-400">{fmt(stmt.totalCard)}</td>
                  <td className="py-3 text-right text-zinc-300 font-medium">{fmt(stmt.totalCard)}</td>
                  <td className="py-3 text-right text-zinc-500">{fmt(0)}</td>
                </tr>
                <tr>
                  <td className="py-3 flex items-center gap-2 text-zinc-300"><Gift className="w-4 h-4 text-purple-400" />Gift Card</td>
                  <td className="py-3 text-right text-zinc-400">{fmt(stmt.totalGiftCard)}</td>
                  <td className="py-3 text-right text-zinc-300 font-medium">{fmt(stmt.totalGiftCard)}</td>
                  <td className="py-3 text-right text-zinc-500">{fmt(0)}</td>
                </tr>
                <tr className="border-t-2 border-zinc-700">
                  <td className="py-3 font-semibold text-zinc-100">Total</td>
                  <td className="py-3 text-right font-semibold text-zinc-300">{fmt(netSales)}</td>
                  <td className="py-3 text-right font-semibold text-zinc-100">{fmt(tenderTotal)}</td>
                  <td className={`py-3 text-right font-bold ${Math.abs(stmt.variance) > 1 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {fmt(stmt.variance)}{Math.abs(stmt.variance) > 10 && <AlertTriangle className="inline w-3.5 h-3.5 ml-1 mb-0.5" />}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
              <span>{stmt.transactionCount.toLocaleString()} transactions</span>
              <span>Net Sales: <span className="text-zinc-300 font-medium">{fmt(netSales)}</span></span>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
