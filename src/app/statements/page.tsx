'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  FileText, DollarSign, AlertCircle, Plus, ChevronRight,
  CheckCircle, Clock, AlertTriangle,
} from 'lucide-react'

interface Statement {
  id: string
  statementNumber: string
  storeId: string | null
  fiscalPeriod: string | null
  startDate: string
  endDate: string
  status: string
  totalSales: number
  totalReturns: number
  variance: number
  transactionCount: number
  calculatedAt: string | null
  postedAt: string | null
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

export default function StatementsPage() {
  const [statements, setStatements] = useState<Statement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/statements')
      .then(r => r.json())
      .then(data => { setStatements(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const unposted = statements.filter(s => s.status !== 'posted' && s.status !== 'voided').length
  const todaySales = statements
    .filter(s => s.calculatedAt && new Date(s.calculatedAt).toDateString() === new Date().toDateString())
    .reduce((sum, s) => sum + s.totalSales, 0)
  const totalVariance = statements
    .filter(s => s.status === 'calculated')
    .reduce((sum, s) => sum + s.variance, 0)

  const kpis = [
    { label: 'Unposted Statements', value: unposted, icon: FileText, color: 'text-amber-400', bg: 'bg-amber-400/10', format: 'number' },
    { label: "Today's Sales", value: todaySales, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10', format: 'currency' },
    { label: 'Period Variance', value: totalVariance, icon: AlertCircle, color: Math.abs(totalVariance) > 10 ? 'text-red-400' : 'text-zinc-400', bg: Math.abs(totalVariance) > 10 ? 'bg-red-400/10' : 'bg-zinc-800', format: 'currency' },
  ]

  return (
    <>
      <TopBar title="Commerce Statements" />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {kpis.map(k => (
            <Card key={k.label}>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-zinc-500 font-medium">{k.label}</span>
                  <div className={`w-8 h-8 rounded-lg ${k.bg} flex items-center justify-center`}>
                    <k.icon className={`w-4 h-4 ${k.color}`} />
                  </div>
                </div>
                <div className={`text-2xl font-bold ${k.color}`}>
                  {loading ? '—' : k.format === 'currency' ? fmt(k.value) : k.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Statements</h2>
            <p className="text-sm text-zinc-500">D365-style calculate then post workflow</p>
          </div>
          <Link href="/statements/new">
            <Button className="gap-2"><Plus className="w-4 h-4" />New Statement</Button>
          </Link>
        </div>

        <div className="flex items-center gap-3 bg-blue-500/5 border border-blue-500/20 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 text-zinc-500"><Clock className="w-3.5 h-3.5" />Open</span>
            <span className="text-zinc-700">→</span>
            <span className="flex items-center gap-1.5 text-blue-400"><AlertTriangle className="w-3.5 h-3.5" />Calculate</span>
            <span className="text-zinc-700">→</span>
            <span className="flex items-center gap-1.5 text-emerald-400"><CheckCircle className="w-3.5 h-3.5" />Posted</span>
          </div>
          <span className="ml-auto text-xs text-zinc-600">Calculate before posting</span>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Statement #', 'Store', 'Period', 'Status', 'Sales', 'Returns', 'Transactions', 'Variance', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-zinc-500">Loading...</td></tr>
                ) : statements.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-zinc-500">No statements yet.</td></tr>
                ) : (
                  statements.map(stmt => (
                    <tr key={stmt.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs text-zinc-300">{stmt.statementNumber}</td>
                      <td className="px-4 py-3.5 text-zinc-400">{stmt.storeId ?? '—'}</td>
                      <td className="px-4 py-3.5">
                        <div className="text-xs text-zinc-400">
                          {new Date(stmt.startDate).toLocaleDateString()} — {new Date(stmt.endDate).toLocaleDateString()}
                        </div>
                        {stmt.fiscalPeriod && <div className="text-xs text-zinc-600 mt-0.5">{stmt.fiscalPeriod}</div>}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[stmt.status] ?? ''}`}>
                          {stmt.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-emerald-400 font-medium">{fmt(stmt.totalSales)}</td>
                      <td className="px-4 py-3.5 text-red-400">{fmt(stmt.totalReturns)}</td>
                      <td className="px-4 py-3.5 text-zinc-400">{stmt.transactionCount.toLocaleString()}</td>
                      <td className={`px-4 py-3.5 font-medium ${Math.abs(stmt.variance) > 10 ? 'text-red-400' : 'text-zinc-400'}`}>{fmt(stmt.variance)}</td>
                      <td className="px-4 py-3.5">
                        <Link href={`/statements/${stmt.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1.5">View <ChevronRight className="w-3 h-3" /></Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </>
  )
}
