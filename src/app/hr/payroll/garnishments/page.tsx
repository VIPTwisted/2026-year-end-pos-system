import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Banknote, Users, DollarSign, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function GarnishmentsPage() {
  const [garnishments, activeCount] = await Promise.all([
    prisma.garnishment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { employee: true },
    }),
    prisma.garnishment.count({ where: { status: 'active' } }),
  ])

  const activeGarnishments = garnishments.filter(g => g.status === 'active')
  const totalMonthlyFixed = activeGarnishments
    .filter(g => g.amountType === 'fixed')
    .reduce((sum, g) => sum + g.amount, 0)
  const employeesWithGarnishments = new Set(garnishments.map(g => g.employeeId)).size

  const kpis = [
    { label: 'Active Orders', value: activeCount, icon: Banknote, color: 'text-blue-400' },
    { label: 'Total Monthly Deductions', value: `$${totalMonthlyFixed.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-green-400' },
    { label: 'Employees Affected', value: employeesWithGarnishments, icon: Users, color: 'text-yellow-400' },
  ]

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-white">
      <TopBar title="Garnishments" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kpis.map((k) => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <k.icon className={`w-4 h-4 ${k.color}`} />
                <span className="text-xs text-zinc-400">{k.label}</span>
              </div>
              <p className="text-2xl font-bold">{k.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#16213e] border border-zinc-800/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-200">Garnishment Orders</h2>
            <Link href="/hr/payroll/garnishments/new"
              className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-3 h-3" /> New Garnishment
            </Link>
          </div>
          {garnishments.length === 0 ? (
            <p className="text-zinc-500 text-sm">No garnishments on file.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-500 border-b border-zinc-800">
                    <th className="pb-2 font-medium">Employee</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Amount</th>
                    <th className="pb-2 font-medium">Agency</th>
                    <th className="pb-2 font-medium">Start Date</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {garnishments.map((g) => (
                    <tr key={g.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                      <td className="py-3 text-zinc-200">
                        {g.employee.firstName} {g.employee.lastName}
                      </td>
                      <td className="py-3 capitalize text-zinc-300">{g.garnishType.replace(/_/g, ' ')}</td>
                      <td className="py-3 text-zinc-300">
                        {g.amountType === 'percent'
                          ? `${g.amount}%`
                          : `$${g.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                      </td>
                      <td className="py-3 text-zinc-400">{g.agency ?? '—'}</td>
                      <td className="py-3 text-zinc-400">{new Date(g.startDate).toLocaleDateString()}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          g.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          g.status === 'suspended' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-zinc-500/20 text-zinc-400'
                        }`}>{g.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
