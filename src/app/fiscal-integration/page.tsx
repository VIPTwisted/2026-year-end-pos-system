import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
  Printer, FileCheck, Calendar, Eye, Mail, Layout,
  Shield, CheckCircle, AlertCircle, Clock, ChevronRight,
} from 'lucide-react'

function StatusDot({ status }: { status: string }) {
  const color =
    status === 'active' ? 'bg-emerald-500' :
    status === 'error' ? 'bg-red-500' :
    status === 'maintenance' ? 'bg-amber-500' :
    'bg-zinc-500'
  return <span className={`inline-block w-2 h-2 rounded-full ${color} shrink-0`} />
}

export default async function FiscalIntegrationPage() {
  const [devices, pendingDocs, openPeriods] = await Promise.all([
    prisma.fiscalDevice.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.fiscalDocument.count({ where: { status: 'pending' } }),
    prisma.fiscalPosSession.count({ where: { status: 'open' } }),
  ])

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const [eReceiptsSentToday, auditEvents24h] = await Promise.all([
    prisma.electronicReceipt.count({ where: { sentAt: { gte: todayStart } } }),
    prisma.auditEvent.count({ where: { createdAt: { gte: new Date(Date.now() - 86400000) } } }),
  ])

  const connectedDevices = devices.filter(d => d.status === 'active').length

  const kpis = [
    { label: 'Connected Devices', value: connectedDevices, total: devices.length, icon: Printer, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Pending Fiscal Docs', value: pendingDocs, icon: FileCheck, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'E-Receipts Sent Today', value: eReceiptsSentToday, icon: Mail, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Open Fiscal Periods', value: openPeriods, icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Audit Events (24h)', value: auditEvents24h, icon: Eye, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ]

  const quickLinks = [
    { label: 'Fiscal Devices', href: '/fiscal-integration/devices', icon: Printer, desc: 'Printers, ESDRs & fiscal units' },
    { label: 'Fiscal Documents', href: '/fiscal-integration/documents', icon: FileCheck, desc: 'Receipts, returns, X/Z-reports' },
    { label: 'Fiscal Periods', href: '/fiscal-integration/periods', icon: Calendar, desc: 'Session management & close' },
    { label: 'Audit Trail', href: '/fiscal-integration/audit', icon: Eye, desc: 'Full compliance event log' },
    { label: 'E-Receipts', href: '/fiscal-integration/receipts', icon: Mail, desc: 'Email, SMS & QR delivery' },
    { label: 'Receipt Templates', href: '/fiscal-integration/receipt-templates', icon: Layout, desc: 'Print & email layout config' },
  ]

  const formatHeartbeat = (dt: Date | null) => {
    if (!dt) return 'Never'
    const diff = Date.now() - new Date(dt).getTime()
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return new Date(dt).toLocaleDateString()
  }

  return (
    <>
      <TopBar title="Fiscal Integration & E-Receipts" />
      <main className="flex-1 p-6 overflow-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Fiscal Integration Hub</h2>
            <p className="text-xs text-zinc-500">D365 Commerce-grade fiscal compliance &amp; electronic receipts</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-zinc-300 font-medium">Compliance Active</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {kpis.map(kpi => (
            <div key={kpi.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center mb-3`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className="text-2xl font-bold text-zinc-100">
                {kpi.value}
                {'total' in kpi && <span className="text-sm text-zinc-500 font-normal ml-1">/ {kpi.total}</span>}
              </p>
              <p className="text-xs text-zinc-500 mt-1">{kpi.label}</p>
            </div>
          ))}
        </div>

        {devices.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">Device Health</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {devices.map(device => (
                <div key={device.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-start gap-3">
                  <div className="mt-0.5"><StatusDot status={device.status} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-100 truncate">{device.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{device.deviceType} {device.manufacturer ? `· ${device.manufacturer}` : ''}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-zinc-600" />
                      <span className="text-[10px] text-zinc-600">{formatHeartbeat(device.lastHeartbeat)}</span>
                    </div>
                    {device.status === 'error' && device.errorMessage && (
                      <p className="text-[10px] text-red-400 mt-1 truncate">{device.errorMessage}</p>
                    )}
                  </div>
                  <div>
                    {device.status === 'active' ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                      : device.status === 'error' ? <AlertCircle className="w-4 h-4 text-red-500" />
                      : <AlertCircle className="w-4 h-4 text-zinc-600" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-zinc-300 mb-3">Modules</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickLinks.map(link => (
              <Link key={link.href} href={link.href}
                className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 flex items-center gap-4 transition-colors">
                <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-zinc-700 transition-colors">
                  <link.icon className="w-5 h-5 text-zinc-400 group-hover:text-zinc-100 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-100">{link.label}</p>
                  <p className="text-xs text-zinc-500 truncate">{link.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
