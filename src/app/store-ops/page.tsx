'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Bell, BookOpen, Moon, Banknote, ShieldAlert,
  AlertTriangle, CheckCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StoreAlert {
  id: string
  title: string
  description: string
  severity: string
  alertType: string
  storeName?: string
  isRead: boolean
  resolvedAt: string | null
  createdAt: string
}

const SEVERITY_BADGE: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border border-red-500/40',
  high: 'bg-orange-500/20 text-orange-400 border border-orange-500/40',
  medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
  low: 'bg-zinc-700 text-zinc-400 border border-zinc-600',
}

export default function StoreOpsHub() {
  const [alerts, setAlerts] = useState<StoreAlert[]>([])
  const [kpis, setKpis] = useState({ unreadAlerts: 0, openDayEnd: 0, pendingJournals: 0, todayOverrides: 0 })

  useEffect(() => {
    async function load() {
      const [alertsRes, dayEndRes, journalsRes, overridesRes] = await Promise.all([
        fetch('/api/store-ops/alerts').then(r => r.json()),
        fetch('/api/store-ops/day-end?status=open').then(r => r.json()),
        fetch('/api/store-ops/journals?status=submitted').then(r => r.json()),
        fetch('/api/store-ops/overrides').then(r => r.json()),
      ])
      setAlerts(alertsRes.slice(0, 10))
      const today = new Date().toDateString()
      setKpis({
        unreadAlerts: alertsRes.filter((a: StoreAlert) => !a.isRead).length,
        openDayEnd: Array.isArray(dayEndRes) ? dayEndRes.length : 0,
        pendingJournals: Array.isArray(journalsRes) ? journalsRes.length : 0,
        todayOverrides: overridesRes.filter((o: { createdAt: string }) => new Date(o.createdAt).toDateString() === today).length,
      })
    }
    load()
  }, [])

  const criticalAlerts = alerts.filter(a => (a.severity === 'critical' || a.severity === 'high') && !a.resolvedAt)

  async function markRead(id: string) {
    await fetch(`/api/store-ops/alerts/${id}/read`, { method: 'POST' })
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a))
  }

  async function resolve(id: string) {
    await fetch(`/api/store-ops/alerts/${id}/resolve`, { method: 'POST' })
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolvedAt: new Date().toISOString(), isRead: true } : a))
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6">
      {criticalAlerts.length > 0 && (
        <div className="mb-6 bg-red-500/10 border border-red-500/40 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span className="text-red-400 font-semibold">{criticalAlerts.length} critical/high alert{criticalAlerts.length > 1 ? 's' : ''} require attention — {criticalAlerts.map(a => a.title).join(' · ')}</span>
        </div>
      )}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100 mb-1">Store Operations</h1>
        <p className="text-zinc-500 text-sm">Advanced store operations — journals, day-end, cash, overrides & alerts</p>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Unread Alerts', value: kpis.unreadAlerts, icon: Bell, color: 'text-red-400' },
          { label: 'Open Day-End', value: kpis.openDayEnd, icon: Moon, color: 'text-blue-400' },
          { label: 'Pending Approvals', value: kpis.pendingJournals, icon: BookOpen, color: 'text-yellow-400' },
          { label: "Today's Overrides", value: kpis.todayOverrides, icon: ShieldAlert, color: 'text-orange-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-zinc-500 text-sm">{label}</span>
              <Icon className={cn('w-5 h-5', color)} />
            </div>
            <div className="text-3xl font-bold text-zinc-100">{value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-100">Recent Alerts</h2>
            <Link href="/store-ops/alerts" className="text-xs text-blue-400 hover:text-blue-300">View all →</Link>
          </div>
          <div className="divide-y divide-zinc-800">
            {alerts.length === 0 && <p className="text-zinc-500 text-sm p-6 text-center">No alerts</p>}
            {alerts.map(alert => (
              <div key={alert.id} className={cn('p-4 flex items-start gap-3', alert.isRead && 'opacity-60')}>
                <div className={cn('w-2 h-2 rounded-full mt-2 shrink-0', alert.severity === 'critical' ? 'bg-red-500' : alert.severity === 'high' ? 'bg-orange-500' : alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-zinc-600')} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', SEVERITY_BADGE[alert.severity])}>{alert.severity}</span>
                    <span className="text-sm font-medium text-zinc-200 truncate">{alert.title}</span>
                  </div>
                  <p className="text-xs text-zinc-500 truncate">{alert.description}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">{alert.storeName && `${alert.storeName} · `}{new Date(alert.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!alert.isRead && <button onClick={() => markRead(alert.id)} className="text-xs text-zinc-400 hover:text-zinc-100 border border-zinc-700 rounded px-2 py-1">Read</button>}
                  {!alert.resolvedAt && <button onClick={() => resolve(alert.id)} className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-800 rounded px-2 py-1">Resolve</button>}
                  {alert.resolvedAt && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h2 className="font-semibold text-zinc-100 mb-4">Quick Links</h2>
          <div className="space-y-2">
            {[
              { label: 'Store Journal', href: '/store-ops/journal', icon: BookOpen, desc: 'Review & approve journal entries' },
              { label: 'Day-End Procedures', href: '/store-ops/day-end', icon: Moon, desc: 'Close and reconcile shifts' },
              { label: 'Cash Management', href: '/store-ops/cash', icon: Banknote, desc: 'Count & declare cash' },
              { label: 'Manager Overrides', href: '/store-ops/overrides', icon: ShieldAlert, desc: 'Log & audit overrides' },
              { label: 'Store Alerts', href: '/store-ops/alerts', icon: Bell, desc: 'All store alerts' },
            ].map(({ label, href, icon: Icon, desc }) => (
              <Link key={href} href={href} className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 transition-colors group">
                <Icon className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-zinc-200">{label}</div>
                  <div className="text-xs text-zinc-600">{desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
