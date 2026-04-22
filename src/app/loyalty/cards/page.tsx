import Link from 'next/link'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { Star } from 'lucide-react'
import { LoyaltyCardsClient } from './LoyaltyCardsClient'

export default async function LoyaltyCardsPage() {
  const [cards, tiers] = await Promise.all([
    prisma.loyaltyCard.findMany({
      orderBy: { enrolledAt: 'desc' },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
        tier: true,
        program: { select: { id: true, name: true } },
      },
    }),
    prisma.loyaltyTier.findMany({ orderBy: { sortOrder: 'asc' } }),
  ])

  return (
    <>
      <TopBar title="Loyalty Cards" />
      <main className="flex-1 p-6 overflow-auto bg-zinc-950 min-h-[100dvh]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Loyalty Cards</h1>
            <p className="text-[13px] text-zinc-500 mt-0.5">{cards.length} total cards</p>
          </div>
          <Link
            href="/loyalty/enroll"
            className="bg-blue-600 hover:bg-blue-500 text-white text-[13px] h-8 px-3 rounded inline-flex items-center gap-1.5 transition-colors"
          >
            <Star className="w-3.5 h-3.5" />
            Enroll Member
          </Link>
        </div>

        <LoyaltyCardsClient cards={cards} tiers={tiers} />
      </main>
    </>
  )
}
