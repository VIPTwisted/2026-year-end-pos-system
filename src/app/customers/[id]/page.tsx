export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, User, Star, ShoppingCart, DollarSign,
  CreditCard, Phone, MapPin, Mail, FileText,
} from 'lucide-react'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  paid: 'success', pending: 'warning', refunded: 'destructive', voided: 'secondary',
}
const CREDIT_VARIANT: Record<string, 'success' | 'warning' | 'destructive'> = {
  good: 'success', warning: 'warning', hold: 'destructive',
}
const INV_VARIANT: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  paid: 'success', partial: 'warning', overdue: 'destructive', draft: 'secondary', sent: 'default',
}

function getTier(points: number) {
  if (points > 500) return { label: 'VIP', variant: 'success' as const }
  if (points >= 100) return { label: 'Active', variant: 'default' as const }
  return { label: 'New', variant: 'secondary' as const }
}

function FastTabHeader({ label, count }: { label: string; count?: number }) {
  return (
    <div className="border-b border-zinc-800/40 py-2.5 px-4 flex justify-between items-center bg-zinc-900/40">
      <span className="text-[12px] font-semibold uppercase tracking-wide text-zinc-300">
        {label}{count !== undefined ? ` (${count})` : ''}
      </span>
    </div>
  )
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-[13px] text-zinc-100">{value ?? '—'}</p>
    </div>
  )
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        include: { items: true, store: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      arInvoices: { orderBy: { dueDate: 'desc' }, take: 5 },
      cases: { orderBy: { createdAt: 'desc' }, take: 3 },
      customerGroup: { select: { id: true, name: true, discountPct: true } },
    },
  })

  if (!customer) notFound()

  const tier = getTier(customer.loyaltyPoints)
  const openAR = customer.arInvoices
    .filter(i => !['paid', 'cancelled'].includes(i.status))
    .reduce((s, i) => s + (Number(i.totalAmount) - Number(i.paidAmount)), 0)

  return (
    <>
      <TopBar title={`${customer.firstName} ${customer.lastName}`} />
      <main className="flex-1 overflow-auto bg-[#0f0f1a] min-h-[100dvh]">

        {/* D365 Header Band */}
        <div className="bg-[#16213e] border-b border-zinc-800/50 px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/customers"
                className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Customers
              </Link>
              <span className="text-zinc-700">/</span>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-400" />
                <span className="font-bold text-lg text-zinc-100">
                  {customer.firstName} {customer.lastName}
                </span>
              </div>
              <Badge variant={tier.variant}>{tier.label}</Badge>
              <Badge variant={CREDIT_VARIANT[customer.creditStatus] ?? 'secondary'} className="capitalize">
                Credit: {customer.creditStatus}
              </Badge>
              {!customer.isActive && <Badge variant="destructive">Inactive</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/customers/${id}/statement`}>
                <Button variant="outline" size="sm">
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  Statement
                </Button>
              </Link>
              <Link href={`/customers/${id}/edit`}>
                <Button variant="outline" size="sm">Edit</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">

          {/* General FastTab */}
          <div className="border border-zinc-800/60 rounded-md overflow-hidden bg-zinc-900/20">
            <FastTabHeader label="General" />
            <div className="px-4 py-3 grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-4">
              {customer.email && (
                <Field
                  label="Email"
                  value={
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-zinc-500" />{customer.email}
                    </span>
                  }
                />
              )}
              {customer.phone && (
                <Field
                  label="Phone"
                  value={
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-zinc-500" />{customer.phone}
                    </span>
                  }
                />
              )}
              {customer.city && (
                <Field
                  label="Location"
                  value={
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-zinc-500" />
                      {[customer.city, customer.state].filter(Boolean).join(', ')}
                    </span>
                  }
                />
              )}
              <Field label="Credit Limit" value={formatCurrency(customer.creditLimit)} />
              <Field label="Address" value={[customer.address, customer.city, customer.state, customer.zip].filter(Boolean).join(', ') || '—'} />
              <Field label="Tags" value={customer.tags ?? '—'} />
              <Field label="Member Since" value={formatDate(customer.createdAt)} />
              <Field
                label="Price Group"
                value={
                  customer.customerGroup ? (
                    <span className="flex items-center gap-2">
                      <Link
                        href={`/settings/customer-groups/${customer.customerGroup.id}`}
                        className="text-blue-400 hover:underline text-[13px]"
                      >
                        {customer.customerGroup.name}
                      </Link>
                      <span className="text-[11px] text-amber-400 font-mono">
                        {Number(customer.customerGroup.discountPct).toFixed(1)}% off
                      </span>
                    </span>
                  ) : (
                    <Link
                      href="/settings/customer-groups"
                      className="text-zinc-600 hover:text-zinc-400 text-[13px] italic"
                    >
                      No group — assign one
                    </Link>
                  )
                }
              />
              {customer.notes && <Field label="Notes" value={<span className="italic text-zinc-400">{customer.notes}</span>} />}
            </div>
          </div>

          {/* KPI FastTab */}
          <div className="border border-zinc-800/60 rounded-md overflow-hidden bg-zinc-900/20">
            <FastTabHeader label="Statistics" />
            <div className="px-4 py-3 grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-4">
              {[
                { label: 'Total Spent', value: formatCurrency(customer.totalSpent), icon: DollarSign, color: 'text-emerald-400' },
                { label: 'Open AR', value: formatCurrency(openAR), icon: CreditCard, color: openAR > 0 ? 'text-amber-400' : 'text-zinc-400' },
                { label: 'Loyalty Points', value: customer.loyaltyPoints.toLocaleString(), icon: Star, color: 'text-violet-400' },
                { label: 'Visit Count', value: customer.visitCount.toString(), icon: ShoppingCart, color: 'text-blue-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label}>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-0.5">{label}</p>
                  <p className={`text-[18px] font-bold ${color} flex items-center gap-1`}>
                    <Icon className={`w-4 h-4 ${color}`} />{value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders FastTab */}
          <div className="border border-zinc-800/60 rounded-md overflow-hidden bg-zinc-900/20">
            <FastTabHeader label="Recent Orders" count={customer.orders.length} />
            {customer.orders.length === 0 ? (
              <p className="px-4 py-3 text-[13px] text-zinc-600">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                      {['Order #', 'Date', 'Store', 'Amount', 'Status'].map(h => (
                        <th key={h} className="px-4 py-2 text-left text-[10px] uppercase text-zinc-500 font-medium tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {customer.orders.map(order => (
                      <tr key={order.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                        <td className="px-4 py-2">
                          <Link href={`/orders/${order.id}`} className="font-mono text-[11px] text-blue-400 hover:underline">
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-2 text-[13px] text-zinc-500">{formatDate(order.createdAt)}</td>
                        <td className="px-4 py-2 text-[13px] text-zinc-400">{order.store.name}</td>
                        <td className="px-4 py-2 text-[13px] text-emerald-400 font-semibold">
                          {formatCurrency(Number(order.totalAmount))}
                        </td>
                        <td className="px-4 py-2">
                          <Badge variant={STATUS_VARIANT[order.status] ?? 'secondary'} className="capitalize text-xs">
                            {order.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* AR Invoices FastTab */}
          {customer.arInvoices.length > 0 && (
            <div className="border border-zinc-800/60 rounded-md overflow-hidden bg-zinc-900/20">
              <FastTabHeader label="AR Invoices" count={customer.arInvoices.length} />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                      {['Invoice #', 'Due Date', 'Status', 'Amount'].map(h => (
                        <th key={h} className={`px-4 py-2 text-[10px] uppercase text-zinc-500 font-medium tracking-wide ${h === 'Amount' ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {customer.arInvoices.map(inv => (
                      <tr key={inv.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                        <td className="px-4 py-2 font-mono text-[11px] text-zinc-300">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3 text-zinc-500" />{inv.invoiceNumber}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-[13px] text-zinc-500">Due {formatDate(inv.dueDate)}</td>
                        <td className="px-4 py-2">
                          <Badge variant={INV_VARIANT[inv.status] ?? 'secondary'} className="capitalize text-xs">
                            {inv.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 text-right text-[13px] text-emerald-400 font-semibold">
                          {formatCurrency(Number(inv.totalAmount))}
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
