import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function VendorCardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      vendorGroup: true,
      invoices: {
        orderBy: { invoiceDate: 'desc' },
        take: 5,
      },
      purchaseOrders: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      payments: {
        orderBy: { paymentDate: 'desc' },
        take: 5,
      },
    },
  })

  if (!vendor) notFound()

  const balance    = vendor.invoices.reduce((s, i) => s + i.totalAmount - i.paidAmount, 0)
  const outstanding = vendor.purchaseOrders
    .filter(po => po.status !== 'received' && po.status !== 'cancelled')
    .reduce((s, po) => s + po.totalAmt, 0)
  const totalPaid  = vendor.payments.reduce((s, p) => s + p.amount, 0)

  return (
    <div className="min-h-[100dvh] bg-[#0f0f1a] text-zinc-100">
      <TopBar
        title={`Vendor · ${vendor.name}`}
        breadcrumb={[
          { label: 'NovaPOS', href: '/' },
          { label: 'Purchasing', href: '/purchasing' },
          { label: 'Vendors', href: '/purchasing/vendors' },
        ]}
      />

      {/* Action Ribbon */}
      <div className="border-b border-zinc-800 bg-[#16213e] px-4 py-2 flex items-center gap-2">
        <button className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-medium">Edit</button>
        <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium">New Purchase Order</button>
        <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium">Make Payment</button>
        <button className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded font-medium">Apply Entries</button>
        <div className="w-px h-4 bg-zinc-700 mx-1" />
        <button className="px-3 py-1.5 text-xs bg-red-900 hover:bg-red-800 text-red-200 rounded font-medium">Block</button>
        <span className={`ml-4 inline-block px-2.5 py-0.5 rounded text-xs font-semibold ${vendor.isActive ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'}`}>
          {vendor.isActive ? 'Active' : 'Blocked'}
        </span>
      </div>

      <div className="flex gap-6 p-6">
        <div className="flex-1 space-y-4 min-w-0">

          {/* General FastTab */}
          <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
            <summary className="px-4 py-3 font-semibold text-zinc-200 cursor-pointer">General</summary>
            <div className="px-4 pb-4 grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">No.</p>
                <p className="font-mono text-zinc-100">{vendor.vendorCode}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-zinc-500 mb-0.5">Name</p>
                <p className="text-zinc-100 font-semibold text-base">{vendor.name}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Vendor Group</p>
                <p className="text-zinc-300">{vendor.vendorGroup?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Address</p>
                <p className="text-zinc-300">{vendor.address ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">City / State / ZIP</p>
                <p className="text-zinc-300">{[vendor.city, vendor.state, vendor.zip].filter(Boolean).join(', ') || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Tax ID</p>
                <p className="font-mono text-zinc-300">{vendor.taxId ?? '—'}</p>
              </div>
            </div>
          </details>

          {/* Communications FastTab */}
          <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
            <summary className="px-4 py-3 font-semibold text-zinc-200 cursor-pointer">Communications</summary>
            <div className="px-4 pb-4 grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Phone No.</p>
                <p className="text-zinc-300">{vendor.phone ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Email</p>
                <p className="text-zinc-300">{vendor.email ?? '—'}</p>
              </div>
            </div>
          </details>

          {/* Invoicing FastTab */}
          <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
            <summary className="px-4 py-3 font-semibold text-zinc-200 cursor-pointer">Invoicing</summary>
            <div className="px-4 pb-4 grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Payment Terms Code</p>
                <p className="text-zinc-300">{vendor.paymentTerms ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Currency Code</p>
                <p className="font-mono text-zinc-300">{vendor.currency}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Credit Limit (LCY)</p>
                <p className="text-zinc-300">{vendor.creditLimit != null ? formatCurrency(vendor.creditLimit) : '—'}</p>
              </div>
            </div>
          </details>

          {/* Payments FastTab */}
          <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
            <summary className="px-4 py-3 font-semibold text-zinc-200 cursor-pointer">Payments</summary>
            <div className="px-4 pb-4 grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Payment Method Code</p>
                <p className="text-zinc-300">{vendor.paymentMethod ?? '—'}</p>
              </div>
            </div>
          </details>

          {/* Receiving FastTab */}
          <details className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
            <summary className="px-4 py-3 font-semibold text-zinc-200 cursor-pointer">Receiving</summary>
            <div className="px-4 pb-4 text-sm text-zinc-400">
              <p>No receiving configuration set.</p>
            </div>
          </details>

          {/* Foreign Trade FastTab */}
          <details className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
            <summary className="px-4 py-3 font-semibold text-zinc-200 cursor-pointer">Foreign Trade</summary>
            <div className="px-4 pb-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Currency Code</p>
                <p className="font-mono text-zinc-300">{vendor.currency}</p>
              </div>
            </div>
          </details>

        </div>

        {/* FactBox Sidebar */}
        <aside className="w-72 shrink-0 space-y-4">

          {/* Vendor Statistics */}
          <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Vendor Statistics</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Balance (LCY)</dt>
                <dd className={`font-semibold tabular-nums ${balance > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>{formatCurrency(balance)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Outstanding POs</dt>
                <dd className="text-zinc-200 tabular-nums">{formatCurrency(outstanding)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Total Payments</dt>
                <dd className="text-emerald-400 tabular-nums">{formatCurrency(totalPaid)}</dd>
              </div>
              <div className="flex justify-between border-t border-zinc-700 pt-2">
                <dt className="text-zinc-500">Total Invoices</dt>
                <dd className="text-zinc-300">{vendor.invoices.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">Total POs</dt>
                <dd className="text-zinc-300">{vendor.purchaseOrders.length}</dd>
              </div>
            </dl>
          </div>

          {/* Latest Invoices */}
          {vendor.invoices.length > 0 && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Latest Invoices</h3>
              <ul className="space-y-2">
                {vendor.invoices.slice(0, 5).map(inv => (
                  <li key={inv.id} className="flex items-center justify-between text-xs">
                    <Link href={`/purchasing/invoices/${inv.id}`} className="font-mono text-blue-400 hover:underline truncate mr-2">
                      {inv.invoiceNumber}
                    </Link>
                    <span className="text-emerald-400 tabular-nums shrink-0">{formatCurrency(inv.totalAmount)}</span>
                  </li>
                ))}
              </ul>
              <Link href={`/purchasing/invoices?vendor=${vendor.id}`} className="mt-3 block text-xs text-zinc-500 hover:text-zinc-300">
                View all invoices
              </Link>
            </div>
          )}

          {/* Latest POs */}
          {vendor.purchaseOrders.length > 0 && (
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg p-4">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Latest Purchase Orders</h3>
              <ul className="space-y-2">
                {vendor.purchaseOrders.slice(0, 5).map(po => (
                  <li key={po.id} className="flex items-center justify-between text-xs">
                    <Link href={`/purchasing/orders/${po.id}`} className="font-mono text-blue-400 hover:underline truncate mr-2">
                      {po.poNumber.substring(0, 16)}
                    </Link>
                    <span className={`capitalize shrink-0 text-xs ${po.status === 'received' ? 'text-emerald-400' : 'text-zinc-400'}`}>
                      {po.status}
                    </span>
                  </li>
                ))}
              </ul>
              <Link href={`/purchasing/orders?vendor=${vendor.id}`} className="mt-3 block text-xs text-zinc-500 hover:text-zinc-300">
                View all orders
              </Link>
            </div>
          )}

        </aside>
      </div>
    </div>
  )
}
