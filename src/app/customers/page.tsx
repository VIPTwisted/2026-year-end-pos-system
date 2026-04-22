import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Plus, Star, TrendingUp, UserCheck, ChevronRight } from 'lucide-react'

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { totalSpent: 'desc' },
  })

  // Tier classification
  const vipCustomers    = customers.filter(c => c.loyaltyPoints > 500)
  const regularCustomers = customers.filter(c => c.loyaltyPoints >= 100 && c.loyaltyPoints <= 500)
  const newCustomers    = customers.filter(c => c.loyaltyPoints < 100)

  // Key accounts: top 3 by totalSpent (already sorted desc)
  const keyAccounts = customers.slice(0, 3)

  // Average visit count
  const avgVisits =
    customers.length > 0
      ? (customers.reduce((sum, c) => sum + c.visitCount, 0) / customers.length).toFixed(1)
      : '0.0'

  function getTierVariant(points: number): 'success' | 'default' | 'secondary' {
    if (points > 500) return 'success'
    if (points >= 100) return 'default'
    return 'secondary'
  }

  function getTierLabel(points: number): string {
    if (points > 500) return 'VIP'
    if (points >= 100) return 'Active'
    return 'New'
  }

  return (
    <>
      <TopBar title="Customers" />
      <main className="flex-1 p-6 overflow-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Customer Database</h2>
            <p className="text-sm text-zinc-500">{customers.length} customers</p>
          </div>
          <Link href="/customers/new">
            <Button><Plus className="w-4 h-4 mr-1" />Add Customer</Button>
          </Link>
        </div>

        {/* ── Customer Table ── */}
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
                  <th className="text-right pb-3 font-medium">Lifetime Value</th>
                  <th className="text-right pb-3 font-medium">Visits</th>
                  <th className="text-right pb-3 font-medium">Points</th>
                  <th className="text-center pb-3 font-medium">Tier</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-zinc-900/50 transition-colors group">
                    <td className="py-3 pr-4">
                      <Link href={`/customers/${c.id}`} className="font-medium text-zinc-100 group-hover:text-blue-300 transition-colors">
                        {c.firstName} {c.lastName}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-zinc-400">{c.email || '-'}</td>
                    <td className="py-3 pr-4 text-zinc-400">{c.phone || '-'}</td>
                    <td className="py-3 pr-4 text-right font-semibold text-emerald-400">
                      {formatCurrency(c.totalSpent)}
                    </td>
                    <td className="py-3 pr-4 text-right text-zinc-400">{c.visitCount}</td>
                    <td className="py-3 pr-4 text-right">
                      <Badge variant="secondary">{c.loyaltyPoints} pts</Badge>
                    </td>
                    <td className="py-3 text-center">
                      <Badge variant={getTierVariant(c.loyaltyPoints)}>
                        {getTierLabel(c.loyaltyPoints)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/customers/${c.id}`}>
                        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Sales Pipeline Overview ── */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">Sales Pipeline Overview</h2>
            <p className="text-sm text-zinc-500">NovaPOS-style CRM summary derived from loyalty & spend data</p>
          </div>

          {/* Tier breakdown + avg visits */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-emerald-400" />
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">VIP Customers</p>
                </div>
                <p className="text-2xl font-bold text-emerald-400">{vipCustomers.length}</p>
                <p className="text-xs text-zinc-600 mt-1">loyaltyPoints &gt; 500</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Regular</p>
                </div>
                <p className="text-2xl font-bold text-blue-400">{regularCustomers.length}</p>
                <p className="text-xs text-zinc-600 mt-1">100 – 500 pts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-zinc-400" />
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">New</p>
                </div>
                <p className="text-2xl font-bold text-zinc-300">{newCustomers.length}</p>
                <p className="text-xs text-zinc-600 mt-1">&lt; 100 pts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <p className="text-xs text-zinc-500 uppercase tracking-wide">Avg Visits</p>
                </div>
                <p className="text-2xl font-bold text-amber-400">{avgVisits}</p>
                <p className="text-xs text-zinc-600 mt-1">per customer</p>
              </CardContent>
            </Card>
          </div>

          {/* Key Accounts */}
          {keyAccounts.length > 0 && (
            <Card>
              <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-900/60 rounded-t-lg">
                <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">Key Accounts</h3>
                <span className="text-xs text-zinc-500">Top 3 by Lifetime Value</span>
              </div>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800/60 text-zinc-500 text-xs uppercase tracking-wide">
                      <th className="text-left px-5 py-2 font-medium">Rank</th>
                      <th className="text-left py-2 font-medium">Customer</th>
                      <th className="text-left py-2 font-medium">Tier</th>
                      <th className="text-right py-2 font-medium">Visits</th>
                      <th className="text-right px-5 py-2 font-medium">Lifetime Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {keyAccounts.map((c, i) => (
                      <tr key={c.id} className="hover:bg-zinc-900/40 transition-colors group">
                        <td className="px-5 py-3 text-zinc-500 font-mono text-xs">#{i + 1}</td>
                        <td className="py-3 pr-4 font-medium text-zinc-100">
                          <Link href={`/customers/${c.id}`} className="group-hover:text-blue-300 transition-colors">
                            {c.firstName} {c.lastName}
                          </Link>
                          {c.email && <span className="block text-xs text-zinc-500 font-normal">{c.email}</span>}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={getTierVariant(c.loyaltyPoints)}>
                            {getTierLabel(c.loyaltyPoints)}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-right text-zinc-400">{c.visitCount}</td>
                        <td className="px-5 py-3 text-right font-bold text-emerald-400 tabular-nums text-base">
                          {formatCurrency(c.totalSpent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </section>

      </main>
    </>
  )
}
