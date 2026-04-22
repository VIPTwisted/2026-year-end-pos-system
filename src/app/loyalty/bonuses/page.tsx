import { TopBar } from '@/components/layout/TopBar'
import { Card, CardContent } from '@/components/ui/card'
import { Zap } from 'lucide-react'

// LoyaltyBonus model was consolidated into LoyaltyTransaction.
// Bonus campaigns are now configured per-program via tiers and earning rates.
export default function BonusesPage() {
  return (
    <>
      <TopBar title="Bonus Campaigns" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-zinc-100">Bonus Campaigns</h2>
          <p className="text-sm text-zinc-500">Bonus multipliers are now managed through loyalty tier earning rates.</p>
        </div>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <Zap className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-base font-medium text-zinc-300 mb-2">Bonus system consolidated</p>
            <p className="text-sm text-center max-w-sm">
              Point multipliers and bonus rules are now configured through tier earning rates on each loyalty program.
              Navigate to <span className="text-zinc-200 font-medium">Loyalty › Programs</span> to adjust rates per tier.
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
