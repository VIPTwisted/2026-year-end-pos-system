import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { notFound } from 'next/navigation'
import PayrollActions from './PayrollActions'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PayrollPeriodPage({ params }: Props) {
  const { id } = await params

  const period = await prisma.payrollPeriod.findUnique({
    where: { id },
    include: {
      entries: {
        include: {
          employee: {
            include: { user: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!period) notFound()

  const totalGross      = period.entries.reduce((s, e) => s + e.grossPay, 0)
  const totalDeductions = period.entries.reduce(
    (s, e) => s + e.federalTax + e.stateTax + e.socialSecurity + e.medicare + e.otherDeductions,
    0
  )
  const totalNet = period.entries.reduce((s, e) => s + e.netPay, 0)

  const hasEntries  = period.entries.length > 0
  const allApproved = hasEntries && period.entries.every(e => e.status === 'approved' || e.status === 'paid')
  const anyDraft    = period.entries.some(e => e.status === 'draft')

  const statusBadge = (status: string) => {
    switch (status) {
      case 'open':       return <Badge variant="default">Open</Badge>
      case 'processing': return <Badge variant="warning">Processing</Badge>
      case 'posted':     return <Badge variant="success">Posted</Badge>
      case 'closed':     return <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700">Closed</Badge>
      default:           return <Badge variant="secondary">{status}</Badge>
    }
  }

  const entryStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':    return <Badge variant="secondary">Draft</Badge>
      case 'approved': return <Badge variant="warning">Approved</Badge>
      case 'paid':     return <Badge variant="success">Paid</Badge>
      default:         return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <>
      <TopBar title={period.name} />
      <main className="flex-1 p-6 space-y-5 overflow-auto">

        {/* Period Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-zinc-100">{period.name}</h1>
              {statusBadge(period.status)}
            </div>
            <div className="text-sm text-zinc-400">
              {new Date(period.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              {' — '}
              {new Date(period.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              <span className="mx-2 text-zinc-700">|</span>
              Pay Date:{' '}
              <span className="text-zinc-200">
                {new Date(period.payDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          <PayrollActions
            periodId={period.id}
            status={period.status}
            hasEntries={hasEntries}
            allApproved={allApproved}
            anyDraft={anyDraft}
          />
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Gross Pay</div>
              <div className="text-xl font-bold text-zinc-100">{formatCurrency(totalGross)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Deductions</div>
              <div className="text-xl font-bold text-red-400">{formatCurrency(totalDeductions)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Net Pay</div>
              <div className="text-xl font-bold text-emerald-400">{formatCurrency(totalNet)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Entries Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              Employee Payroll Entries
              <span className="ml-2 text-zinc-500 font-normal text-xs">({period.entries.length} employees)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {period.entries.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-zinc-500">
                No entries yet. Generate entries to populate this period.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[900px]">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-5 pb-3 pt-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">Employee</th>
                      <th className="text-right px-3 pb-3 pt-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">Reg Hrs</th>
                      <th className="text-right px-3 pb-3 pt-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">OT Hrs</th>
                      <th className="text-right px-3 pb-3 pt-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">Rate</th>
                      <th className="text-right px-3 pb-3 pt-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">Gross</th>
                      <th className="text-right px-3 pb-3 pt-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">Fed Tax</th>
                      <th className="text-right px-3 pb-3 pt-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">State</th>
                      <th className="text-right px-3 pb-3 pt-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">SS</th>
                      <th className="text-right px-3 pb-3 pt-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">Medicare</th>
                      <th className="text-right px-3 pb-3 pt-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">Other</th>
                      <th className="text-right px-3 pb-3 pt-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">Net Pay</th>
                      <th className="text-center px-5 pb-3 pt-1 text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {period.entries.map((entry) => (
                      <tr key={entry.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/20 transition-colors">
                        <td className="px-5 py-3">
                          <div className="font-medium text-zinc-100">
                            {entry.employee.firstName} {entry.employee.lastName}
                          </div>
                          <div className="text-xs text-zinc-500">{entry.employee.position}</div>
                        </td>
                        <td className="px-3 py-3 text-right text-zinc-300">{entry.regularHours}</td>
                        <td className="px-3 py-3 text-right text-zinc-300">{entry.overtimeHours}</td>
                        <td className="px-3 py-3 text-right text-zinc-400 font-mono text-xs">
                          {formatCurrency(entry.hourlyRate)}/hr
                        </td>
                        <td className="px-3 py-3 text-right font-medium text-zinc-200">
                          {formatCurrency(entry.grossPay)}
                        </td>
                        <td className="px-3 py-3 text-right text-red-400 text-xs">
                          {formatCurrency(entry.federalTax)}
                        </td>
                        <td className="px-3 py-3 text-right text-red-400 text-xs">
                          {formatCurrency(entry.stateTax)}
                        </td>
                        <td className="px-3 py-3 text-right text-red-400 text-xs">
                          {formatCurrency(entry.socialSecurity)}
                        </td>
                        <td className="px-3 py-3 text-right text-red-400 text-xs">
                          {formatCurrency(entry.medicare)}
                        </td>
                        <td className="px-3 py-3 text-right text-zinc-500 text-xs">
                          {formatCurrency(entry.otherDeductions)}
                        </td>
                        <td className="px-3 py-3 text-right font-bold text-emerald-400">
                          {formatCurrency(entry.netPay)}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {entryStatusBadge(entry.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

      </main>
    </>
  )
}
