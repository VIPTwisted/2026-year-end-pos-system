export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import {
  Globe, Monitor, Cpu, Receipt, Clock, Activity,
  ArrowRight, TrendingUp, AlertTriangle,
} from 'lucide-react'

export default async function CommerceHQPage() {
  const [
    channelCount,
    registerCount,
    hardwareProfileCount,
    receiptProfileCount,
    openShifts,
    todayShifts,
  ] = await Promise.all([
    prisma.channel.count(),
    prisma.register.count(),
    prisma.hardwareProfile.count(),
    prisma.receiptProfile.count(),
    prisma.cashShift.findMany({
      where: { status: 'open' },
      include: { register: { include: { channel: true } } },
      orderBy: { openedAt: 'desc' },
    }),
    prisma.cashShift.findMany({
      where: {
        openedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ])

  const totalCashSalesToday = todayShifts.reduce((s, sh) => s + sh.cashSales, 0)
  const totalCardSalesToday = todayShifts.reduce((s, sh) => s + sh.cardSales, 0)
  const totalVariance = todayShifts
    .filter(sh => sh.variance !== null)
    .reduce((s, sh) => s + (sh.variance ?? 0), 0)

  const modules = [
    {
      title: 'Channels',
      description: 'Retail, online, and call center channel configuration',
      href: '/commerce/channels',
      icon: Globe,
      count: channelCount,
      countLabel: 'channels',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Registers',
      description: 'POS register setup and channel assignment',
      href: '/commerce/registers',
      icon: Monitor,
      count: registerCount,
      countLabel: 'registers',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Hardware Profiles',
      description: 'Printer, scanner, payment terminal, and display config',
      href: '/commerce/hardware-profiles',
      icon: Cpu,
      count: hardwareProfileCount,
      countLabel: 'profiles',
      color: 'text-violet-400',
      bg: 'bg-violet-500/10 border-violet-500/20',
    },
    {
      title: 'Receipt Profiles',
      description: 'Receipt templates: header, footer, barcode, email settings',
      href: '/commerce/receipt-profiles',
      icon: Receipt,
      count: receiptProfileCount,
      countLabel: 'profiles',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Shift Management',
      description: 'Open, manage, and close cash drawer shifts',
      href: '/commerce/shifts',
      icon: Clock,
      count: openShifts.length,
      countLabel: 'open',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      title: 'Open New Shift',
      description: 'Start a new shift with opening float and denomination count',
      href: '/commerce/shifts/new',
      icon: Activity,
      count: null,
      countLabel: '',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
    },
  ]

  return (
    <>
      <TopBar title="Commerce HQ" />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Open Shifts</p>
              <p className="text-3xl font-bold text-cyan-400">{openShifts.length}</p>
              <p className="text-xs text-zinc-600 mt-1">registers active now</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Cash Sales Today</p>
              <p className="text-3xl font-bold text-emerald-400">{formatCurrency(totalCashSalesToday)}</p>
              <p className="text-xs text-zinc-600 mt-1">across {todayShifts.length} shift(s)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Card Sales Today</p>
              <p className="text-3xl font-bold text-blue-400">{formatCurrency(totalCardSalesToday)}</p>
              <p className="text-xs text-zinc-600 mt-1">electronic tender</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Total Variance</p>
              <p className={`text-3xl font-bold ${Math.abs(totalVariance) > 0 ? 'text-rose-400' : 'text-zinc-300'}`}>
                {totalVariance >= 0 ? '+' : ''}{formatCurrency(totalVariance)}
              </p>
              <p className="text-xs text-zinc-600 mt-1">closed shifts today</p>
            </CardContent>
          </Card>
        </div>

        {/* Module grid */}
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Commerce Modules</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((mod) => (
              <Link key={mod.href} href={mod.href}>
                <Card className={`border ${mod.bg} hover:opacity-90 transition-opacity cursor-pointer`}>
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-lg ${mod.bg}`}>
                        <mod.icon className={`w-5 h-5 ${mod.color}`} />
                      </div>
                      {mod.count !== null && (
                        <span className={`text-2xl font-bold ${mod.color}`}>{mod.count}</span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-100 mb-1">{mod.title}</h3>
                    <p className="text-xs text-zinc-500 mb-3">{mod.description}</p>
                    <div className={`flex items-center gap-1 text-xs font-medium ${mod.color}`}>
                      {mod.count !== null && <span>{mod.count} {mod.countLabel}</span>}
                      {mod.count === null && <span>Open form</span>}
                      <ArrowRight className="w-3 h-3 ml-auto" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Active shifts snapshot */}
        {openShifts.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">Active Shifts</h2>
            <Card>
              <CardContent className="pt-4 pb-2 px-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-6 py-2">Shift #</th>
                        <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-2">Register</th>
                        <th className="text-left text-xs text-zinc-500 uppercase tracking-wide px-4 py-2">Channel</th>
                        <th className="text-right text-xs text-zinc-500 uppercase tracking-wide px-4 py-2">Opening Float</th>
                        <th className="text-right text-xs text-zinc-500 uppercase tracking-wide px-4 py-2">Cash Sales</th>
                        <th className="text-right text-xs text-zinc-500 uppercase tracking-wide px-4 py-2">Duration</th>
                        <th className="text-center text-xs text-zinc-500 uppercase tracking-wide px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {openShifts.map(shift => {
                        const dur = Math.floor((Date.now() - new Date(shift.openedAt).getTime()) / 60000)
                        const hours = Math.floor(dur / 60)
                        const mins = dur % 60
                        return (
                          <tr key={shift.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                            <td className="px-6 py-3 font-mono text-xs text-zinc-300">{shift.shiftNumber}</td>
                            <td className="px-4 py-3 text-zinc-200">{shift.register.name}</td>
                            <td className="px-4 py-3 text-zinc-400">{shift.register.channel.name}</td>
                            <td className="px-4 py-3 text-right tabular-nums text-zinc-300">{formatCurrency(shift.openingFloat)}</td>
                            <td className="px-4 py-3 text-right tabular-nums text-emerald-400">{formatCurrency(shift.cashSales)}</td>
                            <td className="px-4 py-3 text-right text-zinc-400 text-xs">
                              {hours > 0 ? `${hours}h ` : ''}{mins}m
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Link
                                href={`/commerce/shifts/${shift.id}`}
                                className="text-xs text-blue-400 hover:text-blue-300"
                              >
                                Manage
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {openShifts.length === 0 && (
          <Card className="border-zinc-800/50">
            <CardContent className="flex flex-col items-center justify-center py-10 text-zinc-600">
              <TrendingUp className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No shifts currently open.</p>
              <Link href="/commerce/shifts/new" className="text-xs text-blue-400 hover:text-blue-300 mt-2">
                Open a shift
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Variance warning */}
        {Math.abs(totalVariance) > 10 && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="pt-4 pb-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-300">Variance alert</p>
                <p className="text-xs text-amber-500/70">
                  Today&apos;s cumulative shift variance is {formatCurrency(Math.abs(totalVariance))}. Review shift details.
                </p>
              </div>
              <Link href="/commerce/shifts" className="ml-auto text-xs text-amber-400 hover:text-amber-300">
                View shifts →
              </Link>
            </CardContent>
          </Card>
        )}

      </main>
    </>
  )
}
