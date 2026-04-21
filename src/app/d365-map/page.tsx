import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, Circle } from 'lucide-react'

type ModuleStatus = 'built' | 'coming_soon'

interface ModuleMapping {
  d365: string
  ours: string
  route: string
  status: ModuleStatus
  features: string[]
}

const modules: ModuleMapping[] = [
  {
    d365: 'D365 Commerce',
    ours: 'POS Terminal',
    route: '/pos',
    status: 'built',
    features: ['Cart & checkout', 'Payment processing', 'Receipt generation', 'Tax calculation'],
  },
  {
    d365: 'D365 Commerce',
    ours: 'Products',
    route: '/products',
    status: 'built',
    features: ['Product catalog', 'SKU/barcode', 'Category tree', 'Pricing'],
  },
  {
    d365: 'D365 Sales',
    ours: 'Customers / CRM',
    route: '/customers',
    status: 'built',
    features: ['Customer profiles', 'Loyalty tiers', 'LTV tracking', 'Visit history'],
  },
  {
    d365: 'D365 Supply Chain',
    ours: 'Inventory',
    route: '/inventory',
    status: 'built',
    features: ['Multi-store stock', 'DDMRP reorder alerts', 'Stock valuation', 'Demand intelligence'],
  },
  {
    d365: 'D365 Supply Chain',
    ours: 'Purchasing',
    route: '/purchasing',
    status: 'built',
    features: ['Purchase orders', 'Supplier management', 'Receiving', 'PO status tracking'],
  },
  {
    d365: 'D365 Customer Service',
    ours: 'Customer Service',
    route: '/service',
    status: 'built',
    features: ['Case management', 'SLA tracking', 'Priority routing', 'Resolution analytics'],
  },
  {
    d365: 'D365 Finance',
    ours: 'Finance',
    route: '/finance',
    status: 'built',
    features: ['Chart of accounts', 'Journal entries', 'AR aging', 'GL balances'],
  },
  {
    d365: 'D365 Marketing',
    ours: 'Marketing',
    route: '/marketing',
    status: 'built',
    features: ['Campaign management', 'Email/SMS/Social', 'Open rate tracking', 'Audience targeting'],
  },
  {
    d365: 'D365 Field Service',
    ours: 'Field Service',
    route: '/field-service',
    status: 'built',
    features: ['Work orders', 'Dispatch board', 'Technician scheduling', 'Efficiency tracking'],
  },
  {
    d365: 'D365 Human Resources',
    ours: 'HR & Workforce',
    route: '/hr',
    status: 'built',
    features: ['Employee profiles', 'Shift scheduling', 'Compensation planning', 'Dept analytics'],
  },
  {
    d365: 'Business Central',
    ours: 'Stores / HQ',
    route: '/stores',
    status: 'built',
    features: ['Multi-store management', 'Per-store KPIs', 'Tax configuration', 'Platform config'],
  },
  {
    d365: 'D365 Supply Chain (WMS)',
    ours: 'Warehouse',
    route: '/warehouse',
    status: 'built',
    features: ['5-level bin hierarchy', 'Location/zone/rack/bin', 'Movement journal', 'Inventory states'],
  },
  {
    d365: 'D365 Contact Center',
    ours: 'Contact Center',
    route: '/contact-center',
    status: 'coming_soon',
    features: ['Omnichannel routing', 'Skill-based assignment', 'IVR integration', 'Sentiment analysis'],
  },
  {
    d365: 'D365 Project Operations',
    ours: 'Project Operations',
    route: '/projects',
    status: 'coming_soon',
    features: ['Project tracking', 'Resource scheduling', 'Time & expense', 'Revenue recognition'],
  },
]

const builtCount = modules.filter(m => m.status === 'built').length
const plannedCount = modules.filter(m => m.status === 'coming_soon').length

export default async function D365MapPage() {
  return (
    <>
      <TopBar title="Platform Architecture — D365 Reference Map" />
      <main className="flex-1 p-6 overflow-auto">

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Modules Built</p>
              <p className="text-2xl font-bold text-emerald-400">{builtCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Planned</p>
              <p className="text-2xl font-bold text-zinc-400">{plannedCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Prisma Models</p>
              <p className="text-2xl font-bold text-sky-400">27</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Stack</p>
              <p className="text-sm font-semibold text-zinc-100 mt-1">Next.js 15 + TypeScript</p>
            </CardContent>
          </Card>
        </div>

        {/* Subtitle Card */}
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-zinc-100">Microsoft Dynamics 365 Coverage</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-zinc-400">
              This platform is a full-stack clone of Microsoft Dynamics 365. Each module below maps to an official D365
              product. Built on Next.js 15, Prisma ORM, and PostgreSQL — replacing a $180K+/year enterprise license with
              a self-hosted, fully customizable alternative.
            </p>
          </CardContent>
        </Card>

        {/* Module Map Table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide sticky top-0 z-10">
                <th className="text-left px-4 py-3 font-medium">D365 Product</th>
                <th className="text-left px-4 py-3 font-medium">Our Module</th>
                <th className="text-left px-4 py-3 font-medium">Route</th>
                <th className="text-center px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Key Features Implemented</th>
              </tr>
            </thead>
            <tbody>
              {modules.map((mod, idx) => (
                <tr
                  key={mod.route}
                  className={idx % 2 === 0 ? 'bg-zinc-950' : 'bg-zinc-900'}
                >
                  <td className="px-4 py-3 text-zinc-400 whitespace-nowrap text-xs font-mono">
                    {mod.d365}
                  </td>
                  <td className="px-4 py-3 text-zinc-100 font-semibold whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {mod.status === 'built' ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      )}
                      {mod.ours}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-sky-400 whitespace-nowrap">
                    {mod.route}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {mod.status === 'built' ? (
                      <Badge variant="success">✓ Live</Badge>
                    ) : (
                      <Badge variant="secondary">Planned</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ul className="space-y-0.5">
                      {mod.features.map(f => (
                        <li key={f} className="text-xs text-zinc-400 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-zinc-600 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        <p className="text-xs text-zinc-600 mt-4 text-center">
          D365 Commerce · D365 Sales · D365 Supply Chain · D365 Customer Service · D365 Finance · D365 Marketing ·
          D365 Field Service · D365 Human Resources · Business Central · D365 Contact Center · D365 Project Operations
        </p>
      </main>
    </>
  )
}
