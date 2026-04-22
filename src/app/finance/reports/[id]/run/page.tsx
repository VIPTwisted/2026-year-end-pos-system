'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils'
import { Play, ArrowLeft, Printer } from 'lucide-react'

type ReportRow = {
  rowNo: number
  description: string
  rowType: string
  amount: number | null
  bold: boolean
  underline: boolean
  indent: number
}

type ReportResult = {
  templateName: string
  type: string
  startDate: string
  endDate: string
  generatedAt: string
  rows: ReportRow[]
}

export default function RunReportPage() {
  const { id } = useParams<{ id: string }>()
  const [template, setTemplate] = useState<{ name: string; type: string } | null>(null)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setMonth(0, 1)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])
  const [result, setResult] = useState<ReportResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/financial-reports/templates/${id}`)
      .then(r => r.json())
      .then(t => setTemplate({ name: t.name, type: t.type }))
      .catch(() => setError('Template not found'))
  }, [id])

  async function runReport() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/financial-reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: id, startDate, endDate }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error generating report')
    } finally {
      setLoading(false)
    }
  }

  const indentMap = ['', 'pl-4', 'pl-8', 'pl-12', 'pl-16', 'pl-20']

  return (
    <>
      <TopBar title={template?.name ?? 'Financial Report'} />
      <main className="flex-1 p-6 overflow-auto space-y-6 max-w-4xl">

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/finance/reports"><ArrowLeft className="w-4 h-4 mr-1" />Back</Link>
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-4">Report Period</h2>
            <div className="flex items-end gap-4">
              <div className="space-y-1.5">
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-40" />
              </div>
              <div className="space-y-1.5">
                <Label>End Date</Label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-40" />
              </div>
              <Button onClick={runReport} disabled={loading}>
                <Play className="w-4 h-4 mr-1" />
                {loading ? 'Generating…' : 'Generate Report'}
              </Button>
            </div>
            {error && <p className="text-sm text-red-400 mt-3">{error}</p>}
          </CardContent>
        </Card>

        {result && (
          <Card>
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div>
                <h2 className="text-base font-semibold text-zinc-100">{result.templateName}</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {result.startDate} → {result.endDate} · Generated {new Date(result.generatedAt).toLocaleString()}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-1" />
                Print
              </Button>
            </div>
            <CardContent className="pt-4 pb-6">
              <table className="w-full text-sm">
                <tbody>
                  {result.rows.map((row, i) => {
                    if (row.rowType === 'blank') {
                      return <tr key={i}><td className="py-1" colSpan={2}>&nbsp;</td></tr>
                    }
                    return (
                      <tr
                        key={i}
                        className={`${row.underline ? 'border-b border-zinc-700' : ''}`}
                      >
                        <td className={`py-1.5 text-zinc-300 ${indentMap[row.indent] ?? ''} ${row.bold ? 'font-semibold text-zinc-100' : ''} ${row.rowType === 'heading' ? 'text-zinc-400 uppercase text-xs tracking-wide pt-4' : ''}`}>
                          {row.description}
                        </td>
                        <td className={`py-1.5 text-right tabular-nums ${row.bold ? 'font-semibold text-zinc-100' : 'text-zinc-400'} ${row.amount !== null && row.amount < 0 ? 'text-red-400' : ''}`}>
                          {row.amount !== null ? formatCurrency(row.amount) : ''}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}
