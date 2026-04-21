import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ShoppingCart, DollarSign, Users, Package, TrendingUp,
  AlertTriangle, CheckCircle, Clock
} from 'lucide-react'

const STATS = [
  { label: "Today's Sales", value: '$0.00', sub: '0 transactions', icon: DollarSign, color: 'text-emerald-400' },
  { label: 'Open Orders', value: '0', sub: 'Pending processing', icon: ShoppingCart, color: 'text-blue-400' },
  { label: 'Total Customers', value: '0', sub: 'Active accounts', icon: Users, color: 'text-violet-400' },
  { label: 'Products', value: '0', sub: 'In catalog', icon: Package, color: 'text-amber-400' },
]

const MODULES = [
  { name: 'POS Terminal', desc: 'Sales, checkout, receipts', href: '/pos', color: 'bg-blue-600' },
  { name: 'Inventory', desc: 'Stock levels, adjustments', href: '/inventory', color: 'bg-emerald-600' },
  { name: 'Customers / CRM', desc: 'Customer database, history', href: '/customers', color: 'bg-violet-600' },
  { name: 'Purchasing', desc: 'Purchase orders, suppliers', href: '/purchasing', color: 'bg-amber-600' },
  { name: 'Customer Service', desc: 'Cases, tickets, SLA', href: '/service', color: 'bg-rose-600' },
  { name: 'Finance', desc: 'GL, AP/AR, journal entries', href: '/finance', color: 'bg-cyan-600' },
  { name: 'Marketing', desc: 'Campaigns, email, segmentation', href: '/marketing', color: 'bg-pink-600' },
  { name: 'Field Service', desc: 'Work orders, scheduling', href: '/field-service', color: 'bg-orange-600' },
  { name: 'HR & Shifts', desc: 'Employees, scheduling', href: '/hr', color: 'bg-teal-600' },
  { name: 'Stores / HQ', desc: 'Multi-store management', href: '/stores', color: 'bg-indigo-600' },
]

export default function Dashboard() {
  return (
    <>
      <TopBar title="Dashboard" />
      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* KPI Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(s => (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-zinc-400 font-medium uppercase tracking-wide">{s.label}</span>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div className="text-2xl font-bold text-zinc-100">{s.value}</div>
                <div className="text-xs text-zinc-500 mt-1">{s.sub}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* System Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-zinc-300">Database initialized and ready</span>
                <Badge variant="success" className="ml-auto">OK</Badge>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-zinc-300">Seed data — run <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded">npm run db:seed</code> to populate demo data</span>
                <Badge variant="warning" className="ml-auto">Pending</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module Grid */}
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-4">Platform Modules</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {MODULES.map(m => (
              <a key={m.name} href={m.href} className="group block">
                <Card className="hover:border-zinc-600 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className={`w-8 h-8 ${m.color} rounded-lg mb-3 flex items-center justify-center`}>
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-sm font-semibold text-zinc-100 group-hover:text-white mb-1">{m.name}</div>
                    <div className="text-xs text-zinc-500">{m.desc}</div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
