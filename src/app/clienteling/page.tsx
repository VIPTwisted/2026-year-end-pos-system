'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users2, List, User, CheckSquare, Mail, Phone, MessageSquare, StickyNote, Store, Clock, ArrowRight, AlertCircle } from 'lucide-react'

interface KPIs {
  activeLists: number
  customersAssigned: number
  openTasks: number
  activitiesToday: number
  vipCustomers: number
}

interface Task {
  id: string
  subject: string
  customerName: string | null
  taskType: string
  priority: string
  dueDate: string | null
  status: string
}

interface Activity {
  id: string
  activityType: string
  customerName: string | null
  notes: string
  outcome: string | null
  createdAt: string
}

const ACTIVITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  email: Mail,
  sms: MessageSquare,
  note: StickyNote,
  'in-store-visit': Store,
}

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  normal: 'bg-zinc-700/50 text-zinc-300 border-zinc-600',
  low: 'bg-zinc-800/50 text-zinc-500 border-zinc-700',
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function ClientelingHub() {
  const [kpis, setKpis] = useState<KPIs>({ activeLists: 0, customersAssigned: 0, openTasks: 0, activitiesToday: 0, vipCustomers: 0 })
  const [tasks, setTasks] = useState<Task[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [listsRes, tasksRes, activitiesRes, customersRes] = await Promise.all([
        fetch('/api/clienteling/lists?status=active'),
        fetch('/api/clienteling/tasks?status=open'),
        fetch('/api/clienteling/activities'),
        fetch('/api/clienteling/customers'),
      ])
      const [lists, taskData, actData, customers] = await Promise.all([
        listsRes.json(), tasksRes.json(), activitiesRes.json(), customersRes.json(),
      ])
      const today = new Date().toDateString()
      const activitiesToday = actData.filter((a: Activity) => new Date(a.createdAt).toDateString() === today).length
      const vipCustomers = customers.filter((c: { tier: string }) => c.tier === 'vip').length
      setKpis({
        activeLists: lists.length,
        customersAssigned: customers.length,
        openTasks: taskData.length,
        activitiesToday,
        vipCustomers,
      })
      setTasks(taskData.slice(0, 8))
      setActivities(actData.slice(0, 10))
      setLoading(false)
    }
    load()
  }, [])

  const KPICard = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className={`text-3xl font-bold ${color}`}>{loading ? '—' : value}</div>
      <div className="text-sm text-zinc-400 mt-1">{label}</div>
    </div>
  )

  return (
    <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100 p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Clienteling Hub</h1>
        <p className="text-sm text-zinc-500 mt-1">Store Commerce Associate — D365 Clienteling</p>
      </div>
      <div className="grid grid-cols-5 gap-4">
        <KPICard label="Active Lists" value={kpis.activeLists} color="text-blue-400" />
        <KPICard label="Customers Assigned" value={kpis.customersAssigned} color="text-zinc-100" />
        <KPICard label="Open Associate Tasks" value={kpis.openTasks} color="text-amber-400" />
        <KPICard label="Activities Today" value={kpis.activitiesToday} color="text-green-400" />
        <KPICard label="VIP Customers" value={kpis.vipCustomers} color="text-yellow-400" />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[
          { href: '/clienteling/lists', icon: List, label: 'Client Lists', desc: 'Manage outreach lists' },
          { href: '/clienteling/customers', icon: User, label: 'Customer 360', desc: 'Full customer profiles' },
          { href: '/clienteling/tasks', icon: CheckSquare, label: 'Associate Tasks', desc: 'My open tasks' },
          { href: '/clienteling/templates', icon: Mail, label: 'Outreach Templates', desc: 'Email, SMS, notes' },
        ].map(({ href, icon: Icon, label, desc }) => (
          <Link key={href} href={href} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-blue-500/50 hover:bg-zinc-800/50 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <Icon className="w-5 h-5 text-blue-400" />
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-blue-400 transition-colors" />
            </div>
            <div className="font-medium text-zinc-100 text-sm">{label}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{desc}</div>
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-[1fr_380px] gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-100">Recent Activity</h2>
            <span className="text-xs text-zinc-500">Last 10 records</span>
          </div>
          <div className="divide-y divide-zinc-800">
            {loading ? (
              <div className="p-8 text-center text-zinc-500 text-sm">Loading...</div>
            ) : activities.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">No activities yet</div>
            ) : activities.map((a) => {
              const Icon = ACTIVITY_ICONS[a.activityType] || StickyNote
              return (
                <div key={a.id} className="px-5 py-3 flex items-start gap-3">
                  <div className="mt-0.5 w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-200 truncate">{a.customerName || 'Unknown'}</span>
                      <span className="text-xs text-zinc-600 capitalize">{a.activityType.replace('-', ' ')}</span>
                    </div>
                    <p className="text-xs text-zinc-500 truncate">{a.notes}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {a.outcome && (
                      <span className={`text-xs px-1.5 py-0.5 rounded border ${
                        a.outcome === 'converted' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                        a.outcome === 'interested' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                        a.outcome === 'not-interested' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        'bg-zinc-700/50 text-zinc-400 border-zinc-600'
                      }`}>{a.outcome}</span>
                    )}
                    <span className="text-xs text-zinc-600">{timeAgo(a.createdAt)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-100">My Tasks</h2>
            <Link href="/clienteling/tasks" className="text-xs text-blue-400 hover:text-blue-300">View all</Link>
          </div>
          <div className="divide-y divide-zinc-800">
            {loading ? (
              <div className="p-8 text-center text-zinc-500 text-sm">Loading...</div>
            ) : tasks.length === 0 ? (
              <div className="p-8 text-center">
                <AlertCircle className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">No open tasks</p>
              </div>
            ) : tasks.map((t) => (
              <div key={t.id} className="px-4 py-3">
                <div className="flex items-start gap-2">
                  <span className={`mt-0.5 text-xs px-1.5 py-0.5 rounded border ${PRIORITY_COLORS[t.priority] || PRIORITY_COLORS.normal}`}>
                    {t.priority}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-zinc-200 truncate">{t.subject}</div>
                    {t.customerName && <div className="text-xs text-zinc-500">{t.customerName}</div>}
                    {t.dueDate && (
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3 text-zinc-600" />
                        <span className="text-xs text-zinc-600">Due {new Date(t.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
