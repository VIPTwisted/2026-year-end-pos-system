import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate, isOverdue, getDaysOverdue, getStatusColor } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, Building2, Mail, Phone, MapPin, CreditCard,
  Clock, FileText, DollarSign, AlertTriangle, Plus, Receipt,
} from 'lucide-react'

export default async function VendorDetailPage({ params }: { params: { id: string } }) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: params.id },
    include: {
      vendorGroup: true,
      invoices: {
        include: { lines: true, settlements: true },
        orderBy: { invoiceDate: 'desc' },
      },
      payments: {
        include: { settlements: true },
        orderBy: { paymentDate: 'desc' },
      },
    },
  })

  if (!vendor) notFound()

  const now = new Date()

  // AP Summary calculations
  const totalInvoiced = vendor.invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
  const totalPaid = vendor.invoices.reduce((sum, inv) => sum + inv.paidAmount, 0)
  const openBalance = totalInvoiced - totalPaid
  const overdueAmount = vendor.invoices
    .filter(inv => isOverdue(inv.dueDate, inv.status))
    .reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0)

  return (
    <>
      <TopBar title={vendor.name} />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* Back link */}
        <div>
          <Link href="/vendors" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Vendors
          </Link>
        </div>

        {/* Vendor Header Card */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-zinc-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="font-mono text-xs">{vendor.vendorCode}</Badge>
                    <Badge variant={vendor.isActive ? 'success' : 'destructive'}>
                      {vendor.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {vendor.vendorGroup && (
                      <Badge variant="outline">{vendor.vendorGroup.name}</Badge>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold text-zinc-100">{vendor.name}</h1>
                  {vendor.vendorGroup && (
                    <p className="text-sm text-zinc-500 mt-0.5">Group: {vendor.vendorGroup.name}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <Link href={`/vendors/invoices/new?vendorId=${vendor.id}`}>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    New Invoice
                  </Button>
                </Link>
                <Link href={`/vendors/${vendor.id}/payments/new`}>
                  <Button size="sm" variant="outline">
                    <Receipt className="w-4 h-4 mr-1" />
                    Record Payment
                  </Button>
                </Link>
              </div>
            </div>

            {/* Contact + Terms Grid */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-zinc-800">
              {vendor.email && (
                <div className="flex items-start gap-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Email</p>
                    <p className="text-sm text-zinc-300 break-all">{vendor.email}</p>
                  </div>
                </div>
              )}
              {vendor.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Phone</p>
                    <p className="text-sm text-zinc-300">{vendor.phone}</p>
                  </div>
                </div>
              )}
              {(vendor.address || vendor.city) && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Address</p>
                    <p className="text-sm text-zinc-300">
                      {vendor.address && <span>{vendor.address}, </span>}
                      {vendor.city}{vendor.state ? `, ${vendor.state}` : ''}{vendor.zip ? ` ${vendor.zip}` : ''}
                    </p>
                  </div>
                </div>
              )}
              {vendor.paymentTerms && (
                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Payment Terms</p>
                    <p className="text-sm text-zinc-300">{vendor.paymentTerms}</p>
                  </div>
                </div>
              )}
              {vendor.paymentMethod && (
                <div className="flex items-start gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Payment Method</p>
                    <p className="text-sm text-zinc-300">{vendor.paymentMethod}</p>
                  </div>
                </div>
              )}
              {vendor.creditLimit !== null && (
                <div className="flex items-start gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Credit Limit</p>
                    <p className="text-sm text-zinc-300">{formatCurrency(vendor.creditLimit)}</p>
                  </div>
                </div>
              )}
              {vendor.currency && vendor.currency !== 'USD' && (
                <div className="flex items-start gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wide mb-0.5">Currency</p>
                    <p className="text-sm text-zinc-300">{vendor.currency}</p>
                  </div>
                </div>
              )}
            </div>

            {vendor.notes && (
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Notes</p>
                <p className="text-sm text-zinc-400">{vendor.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AP Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Invoiced</p>
              </div>
              <p className="text-2xl font-bold text-blue-400">{formatCurrency(totalInvoiced)}</p>
              <p className="text-xs text-zinc-600 mt-1">{vendor.invoices.length} invoice{vendor.invoices.length !== 1 ? 's' : ''}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Total Paid</p>
              </div>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalPaid)}</p>
              <p className="text-xs text-zinc-600 mt-1">{vendor.payments.length} payment{vendor.payments.length !== 1 ? 's' : ''}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Open Balance</p>
              </div>
              <p className={`text-2xl font-bold ${openBalance > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>
                {formatCurrency(openBalance)}
              </p>
              <p className="text-xs text-zinc-600 mt-1">outstanding</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Overdue</p>
              </div>
              <p className={`text-2xl font-bold ${overdueAmount > 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                {formatCurrency(overdueAmount)}
              </p>
              <p className="text-xs text-zinc-600 mt-1">past due date</p>
            </CardContent>
          </Card>
        </div>

        {/* Invoices Table */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">Invoices</h2>
            <Link href={`/vendors/invoices/new?vendorId=${vendor.id}`}>
              <Button size="sm" variant="outline">
                <Plus className="w-3.5 h-3.5 mr-1" />
                New Invoice
              </Button>
            </Link>
          </div>

          {vendor.invoices.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-zinc-500">
                <FileText className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">No invoices found for this vendor.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Invoice #</th>
                    <th className="text-left pb-3 font-medium">Invoice Date</th>
                    <th className="text-left pb-3 font-medium">Due Date</th>
                    <th className="text-right pb-3 font-medium">Total</th>
                    <th className="text-right pb-3 font-medium">Paid</th>
                    <th className="text-right pb-3 font-medium">Balance</th>
                    <th className="text-center pb-3 font-medium">Status</th>
                    <th className="text-center pb-3 font-medium">Matching</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {vendor.invoices.map(inv => {
                    const balance = inv.totalAmount - inv.paidAmount
                    const overdue = isOverdue(inv.dueDate, inv.status)
                    const daysOver = overdue ? getDaysOverdue(inv.dueDate) : 0

                    return (
                      <tr key={inv.id} className="hover:bg-zinc-900/50">
                        <td className="py-3 pr-4 font-mono text-xs text-zinc-300">{inv.invoiceNumber}</td>
                        <td className="py-3 pr-4 text-zinc-400 text-xs">
                          {new Date(inv.invoiceDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                        </td>
                        <td className="py-3 pr-4 text-xs">
                          <span className={overdue ? 'text-red-400 font-medium' : 'text-zinc-400'}>
                            {new Date(inv.dueDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                          </span>
                          {overdue && (
                            <div className="text-red-500 text-xs">{daysOver}d overdue</div>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-right text-zinc-300 font-medium">
                          {formatCurrency(inv.totalAmount)}
                        </td>
                        <td className="py-3 pr-4 text-right text-emerald-400">
                          {formatCurrency(inv.paidAmount)}
                        </td>
                        <td className="py-3 pr-4 text-right font-semibold">
                          <span className={balance > 0 ? (overdue ? 'text-red-400' : 'text-amber-400') : 'text-zinc-500'}>
                            {formatCurrency(balance)}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-center">
                          <span className={`text-xs font-medium ${getStatusColor(inv.status)}`}>
                            {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <span className="text-xs text-zinc-500 capitalize">
                            {inv.matchingStatus.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Payments Table */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">Payments</h2>
            <Link href={`/vendors/${vendor.id}/payments/new`}>
              <Button size="sm" variant="outline">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Record Payment
              </Button>
            </Link>
          </div>

          {vendor.payments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-zinc-500">
                <Receipt className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">No payments recorded for this vendor.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Payment #</th>
                    <th className="text-left pb-3 font-medium">Date</th>
                    <th className="text-left pb-3 font-medium">Method</th>
                    <th className="text-left pb-3 font-medium">Check #</th>
                    <th className="text-right pb-3 font-medium">Amount</th>
                    <th className="text-center pb-3 font-medium">Status</th>
                    <th className="text-right pb-3 font-medium">Applied To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {vendor.payments.map(pmt => (
                    <tr key={pmt.id} className="hover:bg-zinc-900/50">
                      <td className="py-3 pr-4 font-mono text-xs text-zinc-300">{pmt.paymentNumber}</td>
                      <td className="py-3 pr-4 text-zinc-400 text-xs">
                        {new Date(pmt.paymentDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                      </td>
                      <td className="py-3 pr-4 text-zinc-400 capitalize">{pmt.paymentMethod.replace('_', ' ')}</td>
                      <td className="py-3 pr-4 text-zinc-500 font-mono text-xs">
                        {pmt.checkNumber ?? <span className="text-zinc-700">—</span>}
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold text-emerald-400">
                        {formatCurrency(pmt.amount)}
                      </td>
                      <td className="py-3 pr-4 text-center">
                        <span className={`text-xs font-medium ${getStatusColor(pmt.status)}`}>
                          {pmt.status.charAt(0).toUpperCase() + pmt.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 text-right text-xs text-zinc-500">
                        {pmt.settlements.length > 0
                          ? `${pmt.settlements.length} invoice${pmt.settlements.length !== 1 ? 's' : ''}`
                          : <span className="text-zinc-700">Unapplied</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>
    </>
  )
}
