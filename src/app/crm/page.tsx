import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Building2, Users, CheckSquare, FileText, AlertTriangle, ArrowRight, Phone, Mail, Calendar } from 'lucide-react'

async function getDashboardData() {
  const now = new Date()
  const [
    totalAccounts,
    totalContacts,
    openActivities,
    activeContracts,
    overdueActivities,
    recentActivities,
    accountsByType,
  ] = await Promise.all([
    prisma.cRMAccount.count(),
    prisma.cRMContact.count(),
    prisma.cRMActivity.count({ where: { status: 'open' } }),
    prisma.cRMServiceContract.count({ where: { status: 'active' } }),
    prisma.cRMActivity.count({ where: { status: 'open', dueDate: { lt: now } } }),
    prisma.cRMActivity.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        account: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    prisma.cRMAccount.groupBy({ by: ['accountType'], _count: { id: true } }),
  ])
  return { totalAccounts, totalContacts, openActivities, activeContracts, overdueActivities, recentActivities, accountsByType }
}

const TYPE_ICON: Record<string, React.ElementType> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  task: CheckSquare,
}

const TYPE_COLOR: Record<string, string> = {
  call: 'text-green-400',
  email: 'text-blue-400',
  meeting: 'text-purple-400',
  task: 'text-zinc-400',
}

export default async function CRMDashboardPage() {
  const data = await getDashboardData()

  const kpis = [
    { label: 'Total Accounts', value: data.totalAccounts, icon: Building2, color: 'text-blue-400', bg: 'bg-blue-500/10', href: '/crm/accounts' },
    { label: 'Total Contacts', value: data.totalContacts, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10', href: '/crm/contacts' },
    { label: 'Open Activities', value: data.openActivities, icon: CheckSquare, color: 'text-green-400', bg: 'bg-green-500/10', href: '/crm/activities' },
    { label: 'Active Contracts', value: data.activeContracts, icon: FileText, color: 'text-orange-400', bg: 'bg-orange-500/10', href: '/crm/contracts' },
    { label: 'Overdue', value: data.overdueActivities, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', href: '/crm/activities' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Customer Engagement</h1>
          <p className="text-zinc-400 text-sm mt-1">D365-style CRM — Accounts, Contacts, Activities &amp; Entitlements</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpis.map((k) => {
          const Icon = k.icon
          return (
            <Link key={k.label} href={k.href} className={`${k.bg} border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 transition-colors`}>
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-5 h-5 ${k.color}`} />
                <ArrowRight className="w-4 h-4 text-zinc-600" />
              </div>
              <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
              <div className="text-zinc-400 text-xs mt-1">{k.label}</div>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-white">Recent Activities</h2>
            <Link href="/crm/activities" className="text-xs text-zinc-400 hover:text-white transition-colors">View all →</Link>
          </div>
          <div className="divide-y divide-zinc-800">
            {data.recentActivities.length === 0 && (
              <div className="px-5 py-8 text-center text-zinc-500 text-sm">No activities yet</div>
            )}
            {data.recentActivities.map((a) => {
              const Icon = TYPE_ICON[a.activityType] ?? CheckSquare
              const color = TYPE_COLOR[a.activityType] ?? 'text-zinc-400'
              return (
                <div key={a.id} className="px-5 py-3 flex items-start gap-3 hover:bg-zinc-800/40 transition-colors">
                  <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{a.subject}</p>
                    <p className="text-xs text-zinc-500">
                      {a.account?.name ?? '—'}{a.contact ? ` · ${a.contact.firstName} ${a.contact.lastName}` : ''}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${
                    a.status === 'completed' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                    a.status === 'open' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                    'bg-zinc-800 border-zinc-700 text-zinc-400'
                  }`}>{a.status}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-white">Account Pipeline</h2>
            <Link href="/crm/accounts" className="text-xs text-zinc-400 hover:text-white transition-colors">View all →</Link>
          </div>
          <div className="p-5 space-y-3">
            {data.accountsByType.length === 0 && (
              <div className="text-center text-zinc-500 text-sm py-4">No accounts yet</div>
            )}
            {data.accountsByType.map((row) => {
              const pct = data.totalAccounts > 0 ? Math.round((row._count.id / data.totalAccounts) * 100) : 0
              const colors: Record<string, string> = {
                prospect: 'bg-yellow-500',
                customer: 'bg-green-500',
                partner: 'bg-blue-500',
                competitor: 'bg-red-500',
              }
              const barColor = colors[row.accountType] ?? 'bg-zinc-500'
              return (
                <div key={row.accountType}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-300 capitalize">{row.accountType}</span>
                    <span className="text-zinc-500">{row._count.id}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="border-t border-zinc-800 px-5 py-3 flex gap-4 text-xs">
            <Link href="/crm/entitlements" className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors">
              <FileText className="w-3.5 h-3.5" /> Entitlements
            </Link>
            <Link href="/crm/contracts" className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors">
              <FileText className="w-3.5 h-3.5" /> Contracts
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
