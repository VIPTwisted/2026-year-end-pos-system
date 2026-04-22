import { prisma } from '@/lib/prisma'
import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { TierManager } from './TierManager'

export default async function TiersPage() {
  const program = await prisma.loyaltyProgram.findFirst({ orderBy: { createdAt: 'asc' } })
  if (!program) {
    return (
      <>
        <TopBar title="Tier Management" />
        <main className="flex-1 p-6">
          <p className="text-zinc-400">No loyalty program configured. Visit Program Settings first.</p>
        </main>
      </>
    )
  }

  const tiers = await prisma.loyaltyTier.findMany({
    where: { programId: program.id },
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { cards: true } } },
  })

  return (
    <>
      <TopBar title="Tier Management" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Loyalty Tiers</h2>
              <p className="text-sm text-zinc-500">{program.name} · {tiers.length} tiers</p>
            </div>
          </div>
          <Card className="bg-zinc-900 border-zinc-800 mb-6">
            <CardContent className="p-0">
              <TierManager programId={program.id} initialTiers={tiers} />
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
