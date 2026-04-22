export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Mail, Server, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react'

export default async function EmailPage() {
  const [metrics, smtpProfiles, recentLogs] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000'}/api/email/metrics`).then(r => r.json()).catch(() => ({ total: 0, sent: 0, failed: 0, openRate: '0.0' })),
    prisma.sMTPProfile.findMany({ orderBy: { isDefault: 'desc' }, take: 3 }),
    prisma.emailLog.findMany({ orderBy: { sentAt: 'desc' }, take: 10 }),
  ])

  const kpis = [
    { label: 'Total Sent', value: metrics.sent ?? 0, icon: Mail, color: 'text-blue-400' },
    { label: 'Failed', value: metrics.failed ?? 0, icon: AlertCircle, color: 'text-red-400' },
    { label: 'Open Rate', value: `${metrics.openRate ?? '0.0'}%`, icon: CheckCircle, color: 'text-emerald-400' },
  ]

  return (
    <main className="flex-1 p-6 bg-zinc-950 overflow-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Email & Notifications</h2>
          <p className="text-xs text-zinc-500 mt-0.5">SMTP profiles, templates, and delivery logs</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {kpis.map(kpi => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${kpi.color}`} />
                <span className="text-xs text-zinc-500">{kpi.label}</span>
              </div>
              <div className="text-2xl font-bold text-zinc-100">{kpi.value}</div>
            </div>
          )
        })}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { href: '/email/smtp', label: 'SMTP Profiles', icon: Server, desc: `${smtpProfiles.length} configured` },
          { href: '/email/templates', label: 'Email Templates', icon: FileText, desc: 'Manage templates' },
          { href: '/email/logs', label: 'Delivery Logs', icon: Clock, desc: 'View all logs' },
        ].map(link => {
          const Icon = link.icon
          return (
            <Link key={link.href} href={link.href} className="block bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
              <Icon className="w-5 h-5 text-zinc-500 mb-2" />
              <div className="text-sm font-medium text-zinc-200">{link.label}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{link.desc}</div>
            </Link>
          )
        })}
      </div>

      {/* SMTP Cards */}
      {smtpProfiles.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">SMTP Profiles</p>
            <Link href="/email/smtp" className="text-xs text-blue-400 hover:text-blue-300">View all</Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {smtpProfiles.map(p => (
              <div key={p.id} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-200">{p.profileName}</span>
                  {p.isDefault && <span className="text-xs bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">Default</span>}
                </div>
                <div className="text-xs text-zinc-500">{p.host}:{p.port}</div>
                <div className="text-xs text-zinc-500">{p.fromEmail}</div>
                <div className="mt-2">
                  <span className={`text-xs ${p.testStatus === 'success' ? 'text-emerald-400' : p.testStatus ? 'text-red-400' : 'text-zinc-600'}`}>
                    {p.testStatus ? `Test: ${p.testStatus}` : 'Not tested'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Logs */}
      {recentLogs.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Recent Logs</p>
            <Link href="/email/logs" className="text-xs text-blue-400 hover:text-blue-300">View all</Link>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">To</th>
                  <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Subject</th>
                  <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Status</th>
                  <th className="text-left px-4 py-2 font-medium uppercase tracking-widest">Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {recentLogs.map(log => (
                  <tr key={log.id} className={`hover:bg-zinc-800/30 ${log.status === 'failed' ? 'border-l-2 border-red-500/50' : ''}`}>
                    <td className="px-4 py-2.5 text-zinc-300">{log.toEmail}</td>
                    <td className="px-4 py-2.5 text-zinc-400 truncate max-w-xs">{log.subject}</td>
                    <td className="px-4 py-2.5">
                      <span className={`${log.status === 'sent' ? 'text-emerald-400' : log.status === 'failed' ? 'text-red-400' : 'text-zinc-400'}`}>{log.status}</span>
                    </td>
                    <td className="px-4 py-2.5 text-zinc-500">{new Date(log.sentAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  )
}
