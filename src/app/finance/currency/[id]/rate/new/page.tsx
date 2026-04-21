import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AddRateForm } from './AddRateForm'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function NewRatePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const currency = await prisma.currency.findUnique({
    where: { id },
    include: {
      exchangeRates: { orderBy: { rateDate: 'desc' }, take: 5 },
    },
  })

  if (!currency) notFound()

  return (
    <>
      <TopBar title={`Add Rate — ${currency.code}`} />
      <main className="flex-1 p-6 overflow-auto space-y-6">
        <Link href="/finance/currency">
          <Button variant="outline" size="sm">← Back to Currencies</Button>
        </Link>

        <AddRateForm
          currencyId={currency.id}
          currencyCode={currency.code}
          currencyName={currency.name}
          symbol={currency.symbol}
          recentRates={currency.exchangeRates}
        />
      </main>
    </>
  )
}
