export const dynamic = 'force-dynamic'
import { TopBar } from '@/components/layout/TopBar'
import { prisma } from '@/lib/prisma'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { EnrollClient } from './EnrollClient'

export default async function EnrollPage() {
  const [allCustomers, programs, enrolledCards] = await Promise.all([
    prisma.customer.findMany({
      where: { isActive: true },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      select: { id: true, firstName: true, lastName: true, email: true, phone: true },
    }),
    prisma.loyaltyProgram.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        name: true,
        tiers: {
          orderBy: { sortOrder: 'asc' },
          select: { id: true, name: true, minimumPoints: true, color: true },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.loyaltyCard.findMany({ select: { customerId: true } }),
  ])

  const enrolledIds = new Set(enrolledCards.map(c => c.customerId))
  const customers = allCustomers.filter(c => !enrolledIds.has(c.id))

  return (
    <>
      <TopBar title="Enroll Member" />
      <main className="flex-1 p-6 overflow-auto bg-zinc-950 min-h-[100dvh]">
        <div className="max-w-xl mx-auto">
          <Link
            href="/loyalty"
            className="inline-flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Loyalty
          </Link>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-base font-semibold text-zinc-100 mb-1">Enroll Customer in Loyalty Program</h2>
            <p className="text-[13px] text-zinc-500 mb-5">
              Select a customer and program. A card number will be auto-generated.
              {customers.length === 0 && ' All active customers are already enrolled.'}
            </p>

            {programs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[13px] text-zinc-500 mb-3">No active loyalty programs found.</p>
                <Link href="/loyalty/programs/new" className="text-blue-400 hover:text-blue-300 text-[13px] transition-colors">
                  Create a program first →
                </Link>
              </div>
            ) : (
              <EnrollClient customers={customers} programs={programs} />
            )}
          </div>
        </div>
      </main>
    </>
  )
}
