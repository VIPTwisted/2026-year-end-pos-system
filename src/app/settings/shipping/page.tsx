export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Truck, Plus } from 'lucide-react'

export default async function ShippingMethodsPage() {
  const methods = await prisma.shippingMethod.findMany({
    orderBy: { name: 'asc' },
  })

  const activeCount = methods.filter(m => m.isActive).length

  return (
    <>
      <TopBar title="Shipping Methods" />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-0">
        <div className="px-6 py-4 space-y-5">

          {/* Page header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Settings</p>
              <h2 className="text-[18px] font-semibold text-zinc-100 leading-tight">Shipping Methods</h2>
              <p className="text-[12px] text-zinc-500 mt-0.5">Configure carriers, rates, and estimated delivery windows</p>
            </div>
            <Link href="/settings/shipping/new">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Add Method
              </Button>
            </Link>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Methods', value: methods.length.toString(),              color: 'text-zinc-100' },
              { label: 'Active',        value: activeCount.toString(),                 color: 'text-emerald-400' },
              { label: 'Inactive',      value: (methods.length - activeCount).toString(), color: 'text-zinc-500' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-3.5">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{label}</p>
                <p className={`text-[22px] font-bold tabular-nums ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Section divider */}
          <div className="flex items-center gap-3">
            <Truck className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 shrink-0">All Methods</span>
            <span className="text-[10px] text-zinc-600">({methods.length} configured)</span>
            <div className="flex-1 h-px bg-zinc-800/60" />
          </div>

          {/* Table */}
          {methods.length === 0 ? (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg flex flex-col items-center justify-center py-20 text-zinc-600">
              <Truck className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-[14px] font-medium text-zinc-400 mb-2">No shipping methods</p>
              <p className="text-[12px] mb-4">Configure your first shipping method</p>
              <Link href="/settings/shipping/new">
                <Button size="sm" className="gap-1.5">
                  <Plus className="w-3.5 h-3.5" />Add Method
                </Button>
              </Link>
            </div>
          ) : (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-zinc-800/60">
                    <tr>
                      {['Code', 'Name', 'Carrier', 'Service Type', 'Base Rate', 'Per Lb', 'Free Threshold', 'Est. Days', 'Status'].map(h => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-[10px] uppercase tracking-widest text-zinc-500 font-medium whitespace-nowrap ${
                            ['Base Rate', 'Per Lb', 'Free Threshold', 'Est. Days'].includes(h) ? 'text-right' : 'text-left'
                          } ${h === 'Status' ? 'text-center' : ''}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {methods.map(m => (
                      <tr key={m.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-[11px] text-zinc-500">{m.code}</td>
                        <td className="px-4 py-3 text-[13px] font-medium text-zinc-100">{m.name}</td>
                        <td className="px-4 py-3 text-[13px] text-zinc-400">
                          {m.carrier ?? <span className="text-zinc-700">—</span>}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-zinc-500">
                          {m.serviceType ?? <span className="text-zinc-700">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right text-[13px] text-zinc-300 tabular-nums">
                          {formatCurrency(m.baseRate)}
                        </td>
                        <td className="px-4 py-3 text-right text-[13px] text-zinc-400 tabular-nums">
                          {m.perLbRate > 0 ? formatCurrency(m.perLbRate) : <span className="text-zinc-700">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right text-[13px] text-zinc-400 tabular-nums">
                          {m.freeThreshold != null ? formatCurrency(m.freeThreshold) : <span className="text-zinc-700">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right text-[13px] text-zinc-400">
                          {m.estimatedDays != null ? `${m.estimatedDays}d` : <span className="text-zinc-700">—</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {m.isActive ? (
                            <Badge variant="success">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  )
}
