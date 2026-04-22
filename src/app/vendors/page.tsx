import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building2, Plus, AlertTriangle, DollarSign, Users, XCircle, ChevronRight } from 'lucide-react'

export default async function VendorsPage() {
  const now = new Date()

  const vendors = await prisma.vendor.findMany({
    include: {
      vendorGroup: true,
      invoices: {
        where: { status: { notIn: ['paid', 'cancelled'] } },
      },
    },
    orderBy: { name: 'asc' },
  })

  const vendorGroups = await prisma.vendorGroup.findMany({
    include: { vendors: true },
    orderBy: { name: 'asc' },
  })

  // Summary stats
  const activeVendors = vendors.filter(v => v.isActive)
  const onHold = vendors.filter(v => !v.isActive)

  const totalAPBalance = vendors.reduce((sum, v) => {
    const openBalance = v.invoices.reduce((s, inv) => {
      return s + (inv.totalAmount - inv.paidAmount)
    }, 0)
    return sum + openBalance
  }, 0)

  const overdueInvoices = vendors.reduce((count, v) => {
    return count + v.invoices.filter(inv => inv.dueDate < now).length
  }, 0)

  return (
    <>
      <TopBar title="Vendors" />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Vendor Management</h2>
            <p className="text-sm text-zinc-500">{vendors.length} vendors total</p>
          </div>
          <Link href="/vendors/new">
            <Button><Plus className="w-4 h-4 mr-1" />New Vendor</Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Active Vendors</p>
              </div>
              <p className="text-2xl font-bold text-blue-400">{activeVendors.length}</p>
              <p className="text-xs text-zinc-600 mt-1">of {vendors.length} total</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">AP Balance</p>
              </div>
              <p className="text-2xl font-bold text-amber-400">{formatCurrency(totalAPBalance)}</p>
              <p className="text-xs text-zinc-600 mt-1">open invoices</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Overdue</p>
              </div>
              <p className="text-2xl font-bold text-red-400">{overdueInvoices}</p>
              <p className="text-xs text-zinc-600 mt-1">invoices past due</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-zinc-500" />
                <p className="text-xs text-zinc-500 uppercase tracking-wide">On Hold</p>
              </div>
              <p className="text-2xl font-bold text-zinc-300">{onHold.length}</p>
              <p className="text-xs text-zinc-600 mt-1">inactive vendors</p>
            </CardContent>
          </Card>
        </div>

        {/* Vendor Groups */}
        {vendorGroups.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">Vendor Groups</h3>
            <div className="grid grid-cols-3 gap-3">
              {vendorGroups.map(group => (
                <Card key={group.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-zinc-100">{group.name}</span>
                      <Badge variant="secondary">{group.code}</Badge>
                    </div>
                    <p className="text-xs text-zinc-500 mb-2">{group.description || 'No description'}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-600">Terms: {group.defaultPayTerms || 'N/A'}</span>
                      <span className="text-zinc-400">{group.vendors.length} vendor{group.vendors.length !== 1 ? 's' : ''}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Vendors Table */}
        <section>
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">All Vendors</h3>

          {vendors.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
                <Building2 className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-sm">No vendors yet. Add your first vendor to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 font-medium">Code</th>
                    <th className="text-left pb-3 font-medium">Vendor</th>
                    <th className="text-left pb-3 font-medium">Group</th>
                    <th className="text-left pb-3 font-medium">Terms</th>
                    <th className="text-left pb-3 font-medium">Email</th>
                    <th className="text-left pb-3 font-medium">Phone</th>
                    <th className="text-right pb-3 font-medium">Open Inv.</th>
                    <th className="text-right pb-3 font-medium">Open Balance</th>
                    <th className="text-center pb-3 font-medium">Status</th>
                    <th className="pb-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {vendors.map(v => {
                    const openBalance = v.invoices.reduce(
                      (s, inv) => s + (inv.totalAmount - inv.paidAmount),
                      0
                    )
                    return (
                      <tr key={v.id} className="hover:bg-zinc-900/50 transition-colors group">
                        <td className="py-3 pr-4 font-mono text-xs text-zinc-500">{v.vendorCode}</td>
                        <td className="py-3 pr-4">
                          <Link href={`/vendors/${v.id}`} className="font-medium text-zinc-100 group-hover:text-blue-300 transition-colors">
                            {v.name}
                          </Link>
                          {v.city && (
                            <div className="text-xs text-zinc-500">{v.city}{v.state ? `, ${v.state}` : ''}</div>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-zinc-400">{v.vendorGroup?.name ?? <span className="text-zinc-600">—</span>}</td>
                        <td className="py-3 pr-4 text-zinc-400">{v.paymentTerms || '—'}</td>
                        <td className="py-3 pr-4 text-zinc-400">{v.email || '—'}</td>
                        <td className="py-3 pr-4 text-zinc-400">{v.phone || '—'}</td>
                        <td className="py-3 pr-4 text-right text-zinc-300">{v.invoices.length}</td>
                        <td className="py-3 pr-4 text-right font-semibold">
                          <span className={openBalance > 0 ? 'text-amber-400' : 'text-zinc-500'}>
                            {formatCurrency(openBalance)}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <Badge variant={v.isActive ? 'success' : 'destructive'}>
                            {v.isActive ? 'Active' : 'On Hold'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link href={`/vendors/${v.id}`}>
                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 inline" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>
    </>
  )
}
