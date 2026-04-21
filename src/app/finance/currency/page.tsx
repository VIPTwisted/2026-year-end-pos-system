import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Globe, Star } from 'lucide-react'

export default async function CurrencyPage() {
  const currencies = await prisma.currency.findMany({
    include: {
      exchangeRates: {
        orderBy: { rateDate: 'desc' },
        take: 5,
      },
    },
    orderBy: [{ isBase: 'desc' }, { code: 'asc' }],
  })

  const baseCurrency = currencies.find(c => c.isBase)

  return (
    <>
      <TopBar title="Multi-Currency" />
      <main className="flex-1 p-6 overflow-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            {baseCurrency ? (
              <p className="text-xs text-zinc-500">
                Base currency: <span className="text-emerald-400 font-semibold">{baseCurrency.code} ({baseCurrency.symbol})</span>
              </p>
            ) : (
              <p className="text-xs text-amber-500">No base currency set. Add one and mark it as base.</p>
            )}
          </div>
          <Link href="/finance/currency/new">
            <Button size="sm">+ Add Currency</Button>
          </Link>
        </div>

        {currencies.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-14 text-zinc-600">
              <Globe className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-sm">No currencies configured yet.</p>
              <Link href="/finance/currency/new" className="mt-3">
                <Button size="sm" variant="outline">Add First Currency</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {currencies.map(curr => {
              const latestRate = curr.exchangeRates[0]
              return (
                <Card key={curr.id}>
                  <CardContent className="pt-5 pb-5">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                      {/* Currency Info */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-center text-lg font-bold text-zinc-300">
                          {curr.symbol}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-100 font-mono">{curr.code}</span>
                            <span className="text-sm text-zinc-400">{curr.name}</span>
                            {curr.isBase && (
                              <Badge variant="success" className="text-xs flex items-center gap-1">
                                <Star className="w-2.5 h-2.5" />
                                Base
                              </Badge>
                            )}
                            <Badge variant={curr.isActive ? 'default' : 'secondary'}>
                              {curr.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          {latestRate ? (
                            <p className="text-xs text-zinc-500 mt-0.5">
                              Current rate: <span className="text-zinc-300 font-mono">{latestRate.rate.toFixed(6)}</span>
                              <span className="ml-2 text-zinc-600">({latestRate.source} · {formatDate(latestRate.rateDate)})</span>
                            </p>
                          ) : (
                            <p className="text-xs text-zinc-600 mt-0.5">No exchange rate set</p>
                          )}
                        </div>
                      </div>

                      {/* Rate History + Actions */}
                      <div className="flex items-start gap-6 shrink-0">
                        {curr.exchangeRates.length > 1 && (
                          <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Last {curr.exchangeRates.length} Rates</p>
                            <div className="space-y-1">
                              {curr.exchangeRates.map(r => (
                                <div key={r.id} className="flex items-center gap-3 text-xs">
                                  <span className="font-mono text-zinc-300 tabular-nums w-20">{r.rate.toFixed(6)}</span>
                                  <span className="text-zinc-600">{formatDate(r.rateDate)}</span>
                                  <span className="text-zinc-700 capitalize">{r.source}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex flex-col gap-2">
                          <Link href={`/finance/currency/${curr.id}/rate/new`}>
                            <Button variant="outline" size="sm" className="w-full">Add Rate</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
