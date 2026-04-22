export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { ArrowLeft } from 'lucide-react'
import { LoyaltyCardClient } from './LoyaltyCardClient'

export default async function LoyaltyCardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const card = await prisma.loyaltyCard.findUnique({
    where: { id },
    include: {
      customer: true,
      tier: true,
      program: {
        include: { tiers: { orderBy: { sortOrder: 'asc' } } },
      },
      transactions: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!card) notFound()

  return (
    <>
      <TopBar title={`Card ${card.cardNumber}`} />
      <main className="flex-1 p-6 overflow-auto bg-zinc-950 min-h-[100dvh]">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/loyalty/cards"
            className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Cards
          </Link>

          <LoyaltyCardClient card={card} />
        </div>
      </main>
    </>
  )
}
