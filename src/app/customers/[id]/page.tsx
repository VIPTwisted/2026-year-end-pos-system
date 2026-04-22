export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft, User, Edit, Trash2, Plus, BarChart2,
  BookOpen, Navigation, Mail,
} from 'lucide-react'

export default async function CustomerCardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        include: { store: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      arInvoices: {
        orderBy: { postingDate: 'desc' },
        take: 5,
      },
    },
  })

  if (!customer) notFound()

  const balance = customer.arInvoices.reduce(
    (s, i) => s + (Number(i.totalAmount) - Number(i.paidAmount)), 0
  )
  const balanceDue = customer.arInvoices
    .filter(i => new Date(i.dueDate) < new Date() && !['paid', 'cancelled'].includes(i.status))
    .reduce((s, i) => s + (Number(i.totalAmount) - Number(i.paidAmount)), 0)
  const outstandingOrders = customer.orders.filter(
    o => !['paid', 'cancelled', 'refunded', 'voided'].includes(o.status)
  ).length
  const salesLCY  = Number(customer.totalSpent)
  const profitLCY = salesLCY * 0.35
  const profitPct = salesLCY > 0 ? ((profitLCY / salesLCY) * 100).toFixed(1) : '0.0'

  function blockedLabel() {
    if (!customer.isActive)               return 'All'
    if (customer.creditStatus === 'hold') return 'Invoice'
    return 'None'
  }

  const tabCls = 'px-4 py-3 text-sm font-semibold text-zinc-200 cursor-pointer hover:bg-zinc-900/30 select-none list-none flex items-center gap-2'
  const gridCls = 'px-4 pb-4 grid grid-cols-2 gap-x-6 gap-y-3 pt-2 md:grid-cols-3'
  const lbl = 'text-[10px] uppercase tracking-widest text-zinc-500'
  const val = 'text-sm text-zinc-100'

  return (
    <>
      <TopBar title={`${customer.firstName} ${customer.lastName}`} />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* Breadcrumb */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-2 text-xs text-zinc-500 flex items-center gap-1.5">
          <Link href="/customers" className="hover:text-zinc-300 transition-colors">Customers</Link>
          <span>/</span>
          <span className="text-zinc-300">{customer.firstName} {customer.lastName}</span>
        </div>

        {/* Action Ribbon — Edit | Delete | New | Statistics | Ledger Entries | Navigate | Send Email */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-2 flex items-center gap-1.5 flex-wrap">
          <Link href={`/customers/${id}/edit`}>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-700 hover:bg-blue-600 border border-blue-600 rounded transition-colors">
              <Edit className="w-3 h-3" /> Edit
            </button>
          </Link>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
            <Trash2 className="w-3 h-3" /> Delete
          </button>
          <Link href="/customers/new">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
              <Plus className="w-3 h-3" /> New
            </button>
          </Link>
          <div className="w-px h-5 bg-zinc-700 mx-1" />
          <Link href={`/customers/${id}/statement`}>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
              <BarChart2 className="w-3 h-3" /> Statistics
            </button>
          </Link>
          <Link href={`/customers/${id}/ledger-entries`}>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
              <BookOpen className="w-3 h-3" /> Ledger Entries
            </button>
          </Link>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
            <Navigation className="w-3 h-3" /> Navigate
          </button>
          <div className="w-px h-5 bg-zinc-700 mx-1" />
          {customer.email && (
            <a href={`mailto:${customer.email}`}>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors">
                <Mail className="w-3 h-3" /> Send Email
              </button>
            </a>
          )}
        </div>

        {/* Page Title Band */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-3 flex items-center gap-3">
          <Link href="/customers" className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <User className="w-5 h-5 text-zinc-400" />
          <h1 className="text-lg font-bold text-zinc-100">{customer.firstName} {customer.lastName}</h1>
          {!customer.isActive && <Badge variant="destructive">Blocked</Badge>}
          {customer.creditStatus === 'hold'    && <Badge variant="destructive">Credit Hold</Badge>}
          {customer.creditStatus === 'warning' && (
            <Badge className="bg-amber-700 text-amber-100 border-amber-600">Credit Warning</Badge>
          )}
        </div>

        <div className="px-6 py-4 flex gap-4">

          {/* FastTabs */}
          <div className="flex-1 space-y-2">

            {/* General */}
            <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
              <summary className={tabCls}>
                <span className="text-zinc-500 text-xs">&#9654;</span> General
              </summary>
              <div className={gridCls}>
                <div>
                  <label className={lbl}>No.</label>
                  <p className="text-sm text-zinc-100 font-mono">{customer.id.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <label className={lbl}>Name</label>
                  <p className={val}>{customer.firstName} {customer.lastName}</p>
                </div>
                <div>
                  <label className={lbl}>Balance (LCY)</label>
                  <p className={`text-sm font-semibold ${balance < 0 ? 'text-red-400' : balance > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>
                    {formatCurrency(balance)}
                  </p>
                </div>
                <div>
                  <label className={lbl}>Balance Due (LCY)</label>
                  <p className={`text-sm font-semibold ${balanceDue > 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                    {formatCurrency(balanceDue)}
                  </p>
                </div>
                <div>
                  <label className={lbl}>Credit Limit (LCY)</label>
                  <p className={val}>{formatCurrency(Number(customer.creditLimit))}</p>
                </div>
                <div>
                  <label className={lbl}>Blocked</label>
                  <p className={val}>{blockedLabel()}</p>
                </div>
              </div>
            </details>

            {/* Address & Contact */}
            <details open className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
              <summary className={tabCls}>
                <span className="text-zinc-500 text-xs">&#9654;</span> Address &amp; Contact
              </summary>
              <div className={gridCls}>
                <div>
                  <label className={lbl}>Address</label>
                  <p className={val}>{customer.address || '—'}</p>
                </div>
                <div>
                  <label className={lbl}>Address 2</label>
                  <p className={val}>—</p>
                </div>
                <div>
                  <label className={lbl}>City</label>
                  <p className={val}>{customer.city || '—'}</p>
                </div>
                <div>
                  <label className={lbl}>State</label>
                  <p className={val}>{customer.state || '—'}</p>
                </div>
                <div>
                  <label className={lbl}>ZIP / Post Code</label>
                  <p className={val}>{customer.zip || '—'}</p>
                </div>
                <div>
                  <label className={lbl}>Country / Region</label>
                  <p className={val}>US</p>
                </div>
                <div>
                  <label className={lbl}>Phone No.</label>
                  <p className={val}>{customer.phone || '—'}</p>
                </div>
                <div>
                  <label className={lbl}>Email</label>
                  <p className={val}>{customer.email || '—'}</p>
                </div>
                <div>
                  <label className={lbl}>Fax No.</label>
                  <p className={val}>—</p>
                </div>
                <div>
                  <label className={lbl}>Contact</label>
                  <p className={val}>{customer.firstName} {customer.lastName}</p>
                </div>
              </div>
            </details>

            {/* Invoicing */}
            <details className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
              <summary className={tabCls}>
                <span className="text-zinc-500 text-xs">&#9654;</span> Invoicing
              </summary>
              <div className={gridCls}>
                <div>
                  <label className={lbl}>Bill-to Customer No.</label>
                  <p className="text-sm text-zinc-100 font-mono">{customer.id.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <label className={lbl}>Payment Terms Code</label>
                  <p className={val}>NET30</p>
                </div>
                <div>
                  <label className={lbl}>Payment Method Code</label>
                  <p className={val}>—</p>
                </div>
                <div>
                  <label className={lbl}>Customer Price Group</label>
                  <p className={val}>—</p>
                </div>
                <div>
                  <label className={lbl}>Tax Area Code</label>
                  <p className={val}>—</p>
                </div>
                <div>
                  <label className={lbl}>Tax Liable</label>
                  <p className={val}>Yes</p>
                </div>
                <div>
                  <label className={lbl}>VAT Registration No.</label>
                  <p className={val}>—</p>
                </div>
                <div>
                  <label className={lbl}>Currency Code</label>
                  <p className={val}>USD</p>
                </div>
                <div>
                  <label className={lbl}>Invoice Disc. Code</label>
                  <p className={val}>—</p>
                </div>
                <div>
                  <label className={lbl}>Language Code</label>
                  <p className={val}>ENU</p>
                </div>
              </div>
            </details>

            {/* Payments */}
            <details className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
              <summary className={tabCls}>
                <span className="text-zinc-500 text-xs">&#9654;</span> Payments
              </summary>
              <div className={gridCls}>
                <div>
                  <label className={lbl}>Application Method</label>
                  <p className={val}>Manual</p>
                </div>
                <div>
                  <label className={lbl}>Payment Terms</label>
                  <p className={val}>NET30</p>
                </div>
                <div>
                  <label className={lbl}>Payment Method</label>
                  <p className={val}>—</p>
                </div>
                <div>
                  <label className={lbl}>Cash Flow Payment Terms</label>
                  <p className={val}>—</p>
                </div>
                <div>
                  <label className={lbl}>Block Payment Tolerance</label>
                  <p className={val}>No</p>
                </div>
                <div>
                  <label className={lbl}>Preferred Bank Account</label>
                  <p className={val}>—</p>
                </div>
              </div>
            </details>

            {/* Shipping */}
            <details className="bg-[#16213e] border border-zinc-800/50 rounded-lg">
              <summary className={tabCls}>
                <span className="text-zinc-500 text-xs">&#9654;</span> Shipping
              </summary>
              <div className={gridCls}>
                <div>
                  <label className={lbl}>Ship-to Code</label>
                  <p className={val}>—</p>
                </div>
                <div>
                  <label className={lbl}>Location Code</label>
                  <p className={val}>—</p>
                </div>
                <div>
                  <label className={lbl}>Shipping Agent</label>
                  <p className={val}>—</p>
                </div>
                <div>
                  <label className={lbl}>Shipping Agent Service</label>
                  <p className={val}>—</p>
                </div>
                <div>
                  <label className={lbl}>Shipping Time</label>
                  <p className={val}>—</p>
                </div>
                <div>
                  <label className={lbl}>Base Calendar Code</label>
                  <p className={val}>—</p>
                </div>
              </div>
            </details>

          </div>

          {/* FactBox Sidebar — w-64 */}
          <div className="w-64 shrink-0 space-y-3">

            {/* Customer Statistics FactBox */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-zinc-900/40 border-b border-zinc-800/50">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Customer Statistics</span>
              </div>
              <div className="px-3 py-2 space-y-2">
                {[
                  { label: 'Balance',              val: formatCurrency(balance),       color: balance < 0 ? 'text-red-400' : balance > 0 ? 'text-amber-400' : 'text-zinc-400' },
                  { label: 'Outstanding Orders',   val: String(outstandingOrders),      color: 'text-zinc-200' },
                  { label: 'Shipped Not Invoiced', val: formatCurrency(0),              color: 'text-zinc-400' },
                  { label: 'Outstanding Invoices', val: formatCurrency(balanceDue),     color: balanceDue > 0 ? 'text-red-400' : 'text-zinc-400' },
                  { label: 'Total Sales (LCY)',    val: formatCurrency(salesLCY),       color: 'text-emerald-400' },
                  { label: 'Profit (LCY)',         val: formatCurrency(profitLCY),      color: 'text-emerald-400' },
                  { label: 'Profit %',             val: `${profitPct}%`,                color: 'text-zinc-200' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center">
                    <span className="text-[11px] text-zinc-500">{row.label}</span>
                    <span className={`text-[12px] font-semibold tabular-nums ${row.color}`}>{row.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions FactBox */}
            <div className="bg-[#16213e] border border-zinc-800/50 rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-zinc-900/40 border-b border-zinc-800/50">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Recent Transactions</span>
              </div>
              {customer.arInvoices.length === 0 ? (
                <p className="px-3 py-3 text-[11px] text-zinc-600">No transactions.</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/50">
                      <th className="px-3 py-1.5 text-left   text-[9px] uppercase tracking-widest text-zinc-600 font-medium">Date</th>
                      <th className="px-3 py-1.5 text-left   text-[9px] uppercase tracking-widest text-zinc-600 font-medium">Doc No.</th>
                      <th className="px-3 py-1.5 text-right  text-[9px] uppercase tracking-widest text-zinc-600 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.arInvoices.slice(0, 5).map(inv => (
                      <tr key={inv.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20">
                        <td className="px-3 py-1.5 text-[10px] text-zinc-500">
                          {new Date(inv.postingDate).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: '2-digit',
                          })}
                        </td>
                        <td className="px-3 py-1.5 font-mono text-[10px] text-zinc-300">
                          {inv.invoiceNumber.slice(-8)}
                        </td>
                        <td className="px-3 py-1.5 text-right text-[10px] font-semibold text-emerald-400 tabular-nums">
                          {formatCurrency(Number(inv.totalAmount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className="px-3 py-2 border-t border-zinc-800/50">
                <Link href={`/customers/${id}/ledger-entries`} className="text-[11px] text-blue-400 hover:underline">
                  View all ledger entries &rarr;
                </Link>
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  )
}
