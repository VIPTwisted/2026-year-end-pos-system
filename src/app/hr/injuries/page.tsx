export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Plus } from 'lucide-react'

const SEVERITY_COLORS: Record<string, string> = {
  near_miss: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  first_aid: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  minor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  lost_time: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  fatality: 'bg-red-500/10 text-red-400 border-red-500/20',
}
const TYPE_COLORS: Record<string, string> = {
  laceration: 'bg-red-500/10 text-red-400',
  strain: 'bg-amber-500/10 text-amber-400',
  fracture: 'bg-orange-500/10 text-orange-400',
  burn: 'bg-red-600/10 text-red-500',
  illness: 'bg-purple-500/10 text-purple-400',
  near_miss: 'bg-zinc-500/10 text-zinc-400',
  other: 'bg-zinc-500/10 text-zinc-400',
}
const STATUS_VARIANT: Record<string, 'warning' | 'default' | 'success'> = {
  open: 'warning', investigating: 'default', closed: 'success',
}

export default async function InjuriesPage() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const cases = await prisma.injuryCase.findMany({ orderBy: { incidentDate: 'desc' } })

  const openCases = cases.filter(c => c.status === 'open').length
  const recordableThisMonth = cases.filter(c => c.recordable && new Date(c.incidentDate) >= monthStart).length
  const closedWithDaysLost = cases.filter(c => c.status === 'closed' && c.daysLost > 0)
  const avgDaysLost = closedWithDaysLost.length > 0
    ? closedWithDaysLost.reduce((s, c) => s + c.daysLost, 0) / closedWithDaysLost.length
    : 0
  const oshaRecordable = cases.filter(c => c.oshaRecordable).length

  const SEVERITIES = ['near_miss', 'first_aid', 'minor', 'lost_time', 'fatality']
  const severityBreakdown = SEVERITIES.map(s => ({
    s, count: cases.filter(c => c.severity === s).length,
  }))

  const empIds = [...new Set(cases.map(c => c.employeeId))]
  const employees = await prisma.employee.findMany({
    where: { id: { in: empIds } },
    select: { id: true, firstName: true, lastName: true },
  })
  const empMap = Object.fromEntries(employees.map(e => [e.id, `${e.lastName}, ${e.firstName}`]))

  return (
    <>
      <TopBar title="Injury & Illness" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Injury &amp; Illness</h1>
            <p className="text-sm text-zinc-500">Incident tracking, OSHA recordables, investigation management</p>
          </div>
          <Link href="/hr/injuries/new">
            <Button size="sm"><Plus className="w-4 h-4 mr-1.5" />Report Incident</Button>
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Open Cases', value: openCases, color: openCases > 0 ? 'text-amber-400' : 'text-zinc-100' },
            { label: 'Recordable This Month', value: recordableThisMonth, color: recordableThisMonth > 0 ? 'text-orange-400' : 'text-zinc-100' },
            { label: 'Avg Days Lost', value: avgDaysLost.toFixed(1), color: 'text-blue-400' },
            { label: 'OSHA Recordable', value: oshaRecordable, color: oshaRecordable > 0 ? 'text-red-400' : 'text-zinc-100' },
          ].map(k => (
            <Card key={k.label}>
              <CardContent className="pt-5 pb-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">{k.label}</p>
                <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Severity breakdown */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <h3 className="text-sm font-semibold text-zinc-200 mb-3">Severity Breakdown</h3>
            <div className="flex items-center gap-4 flex-wrap">
              {severityBreakdown.map(({ s, count }) => (
                <div key={s} className="text-center">
                  <span className={`px-3 py-1.5 rounded-lg text-xs border font-medium block mb-1 capitalize ${SEVERITY_COLORS[s]}`}>
                    {s.replace(/_/g, ' ')}
                  </span>
                  <p className="text-xl font-bold text-zinc-100">{count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cases table */}
        {cases.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <AlertTriangle className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">No injury cases — a safe workplace!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3">Case #</th>
                  <th className="text-left pb-3">Employee</th>
                  <th className="text-left pb-3">Incident Date</th>
                  <th className="text-left pb-3">Type</th>
                  <th className="text-left pb-3">Severity</th>
                  <th className="text-right pb-3">Days Lost</th>
                  <th className="text-center pb-3">OSHA</th>
                  <th className="text-center pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {cases.map(c => (
                  <tr key={c.id} className="hover:bg-zinc-900/50">
                    <td className="py-3 pr-4">
                      <Link href={`/hr/injuries/${c.id}`} className="font-mono text-blue-400 hover:underline text-xs">{c.caseNo}</Link>
                    </td>
                    <td className="py-3 pr-4 font-medium text-zinc-100">{empMap[c.employeeId] ?? c.employeeId}</td>
                    <td className="py-3 pr-4 text-xs text-zinc-500">{new Date(c.incidentDate).toLocaleDateString()}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded text-xs capitalize ${TYPE_COLORS[c.injuryType] ?? 'bg-zinc-700 text-zinc-300'}`}>
                        {c.injuryType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded text-xs border capitalize ${SEVERITY_COLORS[c.severity] ?? 'bg-zinc-700 text-zinc-300'}`}>
                        {c.severity.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right text-zinc-300">{c.daysLost}</td>
                    <td className="py-3 pr-4 text-center">
                      {c.oshaRecordable && <span className="px-1.5 py-0.5 rounded text-xs bg-red-500/20 text-red-400 border border-red-500/30 font-medium">OSHA</span>}
                    </td>
                    <td className="py-3 text-center">
                      <Badge variant={STATUS_VARIANT[c.status] ?? 'secondary'}>{c.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
