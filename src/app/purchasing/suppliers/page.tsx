import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Building2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    include: {
      purchaseOrders: {
        include: { items: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  const openStatuses = new Set(['draft', 'sent', 'acknowledged', 'partial'])

  type SupplierRow = {
    id: string
    name: string
    contactName: string | null
    email: string | null
    phone: string | null
    paymentTerms: string | null
    isActive: boolean
    activePOCount: number
    totalSpend: number
    lastOrderDate: Date | null
  }

  const rows: SupplierRow[] = suppliers.map(s => {
    const activePOCount = s.purchaseOrders.filter(po => openStatuses.has(po.status)).length
    const totalSpend = s.purchaseOrders.reduce((sum, po) => sum + (po.totalAmount ?? 0), 0)
    const sorted = [...s.purchaseOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    return {
      id: s.id,
      name: s.name,
      contactName: s.contactName,
      email: s.email,
      phone: s.phone,
      paymentTerms: s.paymentTerms,
      isActive: s.isActive,
      activePOCount,
      totalSpend,
      lastOrderDate: sorted[0]?.createdAt ?? null,
    }
  })

  const totalSuppliers = suppliers.length
  const activeSuppliers = suppliers.filter(s => s.isActive).length
  const totalSpend = rows.reduce((sum, s) => sum + s.totalSpend, 0)

  return (
    <>
      <TopBar title="Suppliers" />
      <main className="flex-1 p-6 overflow-auto min-h-[100dvh] bg-[#0f0f1a] space-y-6">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Suppliers</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">{totalSuppliers} vendors on record</p>
          </div>
          <Link
            href="/purchasing/suppliers/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Supplier
          </Link>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Suppliers', value: totalSuppliers, color: 'text-zinc-100' },
            { label: 'Active', value: activeSuppliers, color: 'text-emerald-400' },
            { label: 'Total Spend', value: formatCurrency(totalSpend), color: 'text-emerald-400' },
          ].map(k => (
            <div key={k.label} className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">{k.label}</p>
              <p className={`text-2xl font-bold tabular-nums ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Suppliers table */}
        <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <Building2 className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-[13px] mb-3">No suppliers yet</p>
              <Link
                href="/purchasing/suppliers/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-700 text-zinc-300 hover:text-zinc-100 text-[13px] transition-colors"
              >
                Add First Supplier
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-zinc-800/80">
                    <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Supplier</th>
                    <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Contact</th>
                    <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Email</th>
                    <th className="text-left px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Phone</th>
                    <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Open POs</th>
                    <th className="text-right px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Total Spend</th>
                    <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s, idx) => (
                    <tr
                      key={s.id}
                      className={`hover:bg-zinc-800/20 transition-colors ${idx !== rows.length - 1 ? 'border-b border-zinc-800/30' : ''}`}
                    >
                      <td className="px-5 py-3">
                        <Link
                          href={`/purchasing/suppliers/${s.id}`}
                          className="font-semibold text-zinc-100 hover:text-blue-400 transition-colors"
                        >
                          {s.name}
                        </Link>
                        {s.paymentTerms && (
                          <p className="text-[11px] text-zinc-500 mt-0.5">{s.paymentTerms}</p>
                        )}
                      </td>
                      <td className="px-3 py-3 text-zinc-400">{s.contactName ?? '—'}</td>
                      <td className="px-3 py-3 text-zinc-400">
                        {s.email ? (
                          <a href={`mailto:${s.email}`} className="hover:text-blue-400 transition-colors">
                            {s.email}
                          </a>
                        ) : '—'}
                      </td>
                      <td className="px-3 py-3 text-zinc-400">{s.phone ?? '—'}</td>
                      <td className="px-3 py-3 text-center">
                        {s.activePOCount > 0 ? (
                          <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[11px] font-medium tabular-nums">
                            {s.activePOCount}
                          </span>
                        ) : (
                          <span className="text-zinc-600 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold tabular-nums text-emerald-400">
                        {s.totalSpend > 0 ? formatCurrency(s.totalSpend) : <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          s.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700 text-zinc-400'
                        }`}>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/purchasing/suppliers/${s.id}`}
                          className="text-[12px] text-zinc-500 hover:text-zinc-200 transition-colors"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </>
  )
}
