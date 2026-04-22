export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { ArrowLeft } from 'lucide-react'
import { LoyaltyProgramClient } from './LoyaltyProgramClient'

export default async function LoyaltyProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const program = await prisma.loyaltyProgram.findUnique({
    where: { id },
    include: {
      tiers: { orderBy: { sortOrder: 'asc' } },
      _count: { select: { cards: true } },
    },
  })
  if (!program) notFound()

  // Points outstanding for this program
  const pointsAgg = await prisma.loyaltyCard.aggregate({
    where: { programId: id },
    _sum: { availablePoints: true, lifetimePoints: true },
  })

  return (
    <>
      <TopBar title={program.name} />
      <main className="flex-1 p-6 overflow-auto bg-zinc-950 min-h-[100dvh]">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/loyalty/programs"
            className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Programs
          </Link>

          <LoyaltyProgramClient
            program={program}
            tiers={program.tiers}
            memberCount={program._count.cards}
            pointsOutstanding={pointsAgg._sum.availablePoints ?? 0}
            lifetimePoints={pointsAgg._sum.lifetimePoints ?? 0}
          />
        </div>
      </main>
    </>
  )
}
