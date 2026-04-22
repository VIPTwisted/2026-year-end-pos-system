import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const CATEGORY_COLORS: Record<string, string> = {
  vacation: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  sick: 'bg-red-500/10 text-red-400 border-red-500/20',
  fmla: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  maternity: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  paternity: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  bereavement: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  jury_duty: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  military: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  personal: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  other: 'bg-zinc-500/10 text-zinc-400 border-zinc-600/20',
}

export default async function LeaveTypesPage() {
  const leaveTypes = await prisma.leaveType.findMany({
    include: { _count: { select: { requests: true } } },
    orderBy: { code: 'asc' },
  })

  return (
    <>
      <TopBar title="Leave Types" />
      <main className="flex-1 p-6 overflow-auto space-y-6 bg-[#0f0f1a]">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Leave Types</h1>
          <p className="text-sm text-zinc-500">{leaveTypes.length} types configured</p>
        </div>

        {leaveTypes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <p className="text-sm">No leave types configured. Use the API to seed defaults.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3">Code</th>
                  <th className="text-left pb-3">Name</th>
                  <th className="text-left pb-3">Category</th>
                  <th className="text-center pb-3">Paid</th>
                  <th className="text-center pb-3">Accrual</th>
                  <th className="text-right pb-3">Accrual Rate/Period</th>
                  <th className="text-right pb-3">Max Balance (hrs)</th>
                  <th className="text-center pb-3">Requires Approval</th>
                  <th className="text-right pb-3">Requests</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {leaveTypes.map(lt => (
                  <tr key={lt.id} className="hover:bg-zinc-900/50">
                    <td className="py-3 pr-4 font-mono text-blue-400">{lt.code}</td>
                    <td className="py-3 pr-4 font-medium text-zinc-100">{lt.name}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded text-xs border capitalize ${CATEGORY_COLORS[lt.category] ?? 'bg-zinc-700 text-zinc-300'}`}>
                        {lt.category.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-center">
                      <Badge variant={lt.isPaid ? 'success' : 'secondary'}>{lt.isPaid ? 'Paid' : 'Unpaid'}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-center">
                      <Badge variant={lt.accrualEnabled ? 'default' : 'secondary'}>{lt.accrualEnabled ? 'Yes' : 'No'}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-right text-zinc-300">{lt.accrualEnabled ? `${lt.accrualRate}h` : '—'}</td>
                    <td className="py-3 pr-4 text-right text-zinc-300">{lt.maxBalance != null ? `${lt.maxBalance}h` : 'Unlimited'}</td>
                    <td className="py-3 pr-4 text-center">
                      <Badge variant={lt.requiresApproval ? 'warning' : 'secondary'}>{lt.requiresApproval ? 'Yes' : 'No'}</Badge>
                    </td>
                    <td className="py-3 text-right text-zinc-400">{lt._count.requests}</td>
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
