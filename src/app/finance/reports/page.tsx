export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart3, Plus, FileText, Lock, Play } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const TYPE_LABEL: Record<string, string> = {
  income_statement: 'Income Statement',
  balance_sheet: 'Balance Sheet',
  cash_flow: 'Cash Flow',
  trial_balance: 'Trial Balance',
  custom: 'Custom',
}

export default async function FinancialReportsPage() {
  const templates = await prisma.financialReportTemplate.findMany({
    include: { rows: true },
    orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
  })

  const systemCount = templates.filter(t => t.isSystem).length
  const customCount = templates.filter(t => !t.isSystem).length

  return (
    <>
      <TopBar title="Financial Report Templates" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        {/* KPI row */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Templates</p>
              <p className="text-2xl font-bold text-zinc-100">{templates.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">System</p>
              <p className="text-2xl font-bold text-blue-400">{systemCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Custom</p>
              <p className="text-2xl font-bold text-emerald-400">{customCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Templates table */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Report Templates</h2>
              <p className="text-sm text-zinc-500">{templates.length} templates</p>
            </div>
            <Button asChild>
              <Link href="/finance/reports/new">
                <Plus className="w-4 h-4 mr-1" />
                New Template
              </Link>
            </Button>
          </div>

          {templates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-20 text-zinc-500">
                <BarChart3 className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-base font-medium text-zinc-300 mb-2">No templates yet</p>
                <p className="text-sm">Create report templates or seed the system defaults</p>
                <Button asChild className="mt-4" variant="outline">
                  <Link href="/api/seed/financial-reports">Seed System Templates</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Name</th>
                    <th className="text-left pb-3 font-medium">Type</th>
                    <th className="text-center pb-3 font-medium">Rows</th>
                    <th className="text-center pb-3 font-medium">System</th>
                    <th className="text-left pb-3 font-medium">Updated</th>
                    <th className="text-right pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {templates.map(t => (
                    <tr key={t.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-zinc-500 shrink-0" />
                          <Link
                            href={`/finance/reports/${t.id}/run`}
                            className="text-zinc-200 hover:text-blue-400 font-medium"
                          >
                            {t.name}
                          </Link>
                        </div>
                        {t.description && (
                          <p className="text-xs text-zinc-600 mt-0.5 ml-6">{t.description}</p>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="secondary" className="text-xs">
                          {TYPE_LABEL[t.type] ?? t.type}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-center text-zinc-400">
                        {t.rows.length}
                      </td>
                      <td className="py-3 pr-4 text-center">
                        {t.isSystem ? (
                          <Lock className="w-3.5 h-3.5 text-amber-500 mx-auto" />
                        ) : (
                          <span className="text-zinc-700">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-zinc-500 text-xs whitespace-nowrap">
                        {formatDate(t.updatedAt)}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button asChild size="sm" variant="outline" className="h-7 px-2 text-xs gap-1">
                            <Link href={`/finance/reports/${t.id}/run`}>
                              <Play className="w-3 h-3" />
                              Run
                            </Link>
                          </Button>
                          {!t.isSystem && (
                            <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
                              <Link href={`/finance/reports/${t.id}/edit`}>Edit</Link>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>
    </>
  )
}
