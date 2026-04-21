import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    },
  })

  if (!customer) notFound()

  const tier = getTier(customer.loyaltyPoints)
  const openAR = customer.arInvoices
    .filter(i => !['paid','cancelled'].includes(i.status))
    .reduce((s, i) => s + (Number(i.totalAmount) - Number(i.paidAmount)), 0)

  return (
    <>
      <TopBar title={`${customer.firstName} ${customer.lastName}`} />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <Link
          href="/customers"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Customers
        </Link>

        {/* Header */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-zinc-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge variant={tier.variant}>{tier.label}</Badge>
                  <Badge variant={CREDIT_VARIANT[customer.creditStatus] ?? 'secondary'} className="capitalize">
                    Credit: {customer.creditStatus}
                  </Badge>
                  {!customer.isActive && <Badge variant="destructive">Inactive</Badge>}
                </div>
                <h1 className="text-xl font-bold text-zinc-100">
                  {customer.firstName} {customer.lastName}
                </h1>
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-zinc-500">
                  {customer.email && (
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{customer.email}</span>
                  )}
                  {customer.phone && (
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{customer.phone}</span>
                  )}
                  {customer.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {[customer.city, customer.state].filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>
              </div>
              <Link href={`/customers/${id}/edit`}>
                <Button variant="outline" size="sm">Edit</Button>
              </Link>
            </div>

            {/* KPI Row */}
            <div className="mt-6 pt-5 border-t border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Spent', value: formatCurrency(customer.totalSpent), icon: DollarSign, color: 'text-emerald-400' },
                { label: 'Open AR', value: formatCurrency(openAR), icon: CreditCard, color: openAR > 0 ? 'text-amber-400' : 'text-zinc-400' },
                { label: 'Loyalty Points', value: customer.loyaltyPoints.toLocaleString(), icon: Star, color: 'text-violet-400' },
                { label: 'Visit Count', value: customer.visitCount.toString(), icon: ShoppingCart, color: 'text-blue-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="text-center">
                  <div className="flex justify-center mb-1"><Icon className={`w-4 h-4 ${color}`} /></div>
                  <p className={`text-lg font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">{label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-zinc-400" />
                  Recent Orders
                  <span className="ml-auto text-xs text-zinc-500 font-normal">{customer.orders.length} shown</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {customer.orders.length === 0 ? (
                  <p className="px-5 pb-5 text-sm text-zinc-600">No orders yet.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800">
                        {['Order #','Date','Store','Amount','Status'].map(h => (
                          <th key={h} className="text-left px-4 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {customer.orders.map(order => (
                        <tr key={order.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors">
                          <td className="px-4 py-2.5">
                            <Link href={`/orders/${order.id}`} className="font-mono text-xs text-blue-400 hover:underline">
                              {order.orderNumber}
                            </Link>
                          </td>
                          <td className="px-4 py-2.5 text-xs text-zinc-500">{formatDate(order.createdAt)}</td>
                          <td className="px-4 py-2.5 text-xs text-zinc-400">{order.store.name}</td>
                          <td className="px-4 py-2.5 text-xs text-emerald-400 font-semibold">
                            {formatCurrency(Number(order.totalAmount))}
                          </td>
                          <td className="px-4 py-2.5">
                            <Badge variant={STATUS_VARIANT[order.status] ?? 'secondary'} className="capitalize text-xs">
                              {order.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: info + AR invoices */}
          <div className="space-y-4">
            {/* Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Contact Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {[
                  ['Address', [customer.address, customer.city, customer.state, customer.zip].filter(Boolean).join(', ')],
                  ['Credit Limit', formatCurrency(customer.creditLimit)],
                  ['Tags', customer.tags ?? '—'],
                  ['Notes', customer.notes ?? '—'],
                  ['Member Since', formatDate(customer.createdAt)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-zinc-500 uppercase tracking-wide mb-0.5">{label}</p>
                    <p className="text-zinc-300">{value || '—'}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AR Invoices */}
            {customer.arInvoices.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                    AR Invoices
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {customer.arInvoices.map(inv => (
                    <div key={inv.id} className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/50 last:border-0">
                      <div>
                        <p className="text-xs font-mono text-zinc-300">{inv.invoiceNumber}</p>
                        <p className="text-xs text-zinc-600">Due {formatDate(inv.dueDate)}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={INV_VARIANT[inv.status] ?? 'secondary'} className="capitalize text-xs mb-0.5">
                          {inv.status}
                        </Badge>
                        <p className="text-xs text-emerald-400 font-semibold">{formatCurrency(Number(inv.totalAmount))}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

      </main>
    </>
  )
}
