import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Plus } from 'lucide-react'

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <>
      <TopBar title="Customers" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Customer Database</h2>
            <p className="text-sm text-zinc-500">{customers.length} customers</p>
          </div>
          <Button><Plus className="w-4 h-4 mr-1" />Add Customer</Button>
        </div>
        {customers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-zinc-500">
              <Users className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-sm">No customers yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="text-left pb-3 font-medium">Customer</th>
                  <th className="text-left pb-3 font-medium">Email</th>
                  <th className="text-left pb-3 font-medium">Phone</th>
                  <th className="text-right pb-3 font-medium">Total Spent</th>
                  <th className="text-right pb-3 font-medium">Visits</th>
                  <th className="text-right pb-3 font-medium">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-zinc-900/50">
                    <td className="py-3 pr-4">
                      <div className="font-medium text-zinc-100">{c.firstName} {c.lastName}</div>
                    </td>
                    <td className="py-3 pr-4 text-zinc-400">{c.email || '-'}</td>
                    <td className="py-3 pr-4 text-zinc-400">{c.phone || '-'}</td>
                    <td className="py-3 pr-4 text-right font-semibold text-emerald-400">{formatCurrency(c.totalSpent)}</td>
                    <td className="py-3 pr-4 text-right text-zinc-400">{c.visitCount}</td>
                    <td className="py-3 text-right"><Badge variant="secondary">{c.loyaltyPoints} pts</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}
