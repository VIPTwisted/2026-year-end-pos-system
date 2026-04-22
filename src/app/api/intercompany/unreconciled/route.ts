import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const transactions = await prisma.intercompanyTransaction.findMany({
    where: {
      status: 'posted',
      isEliminated: false,
    },
    orderBy: { postingDate: 'asc' },
    include: {
      partner: { select: { id: true, partnerCode: true, partnerName: true } },
    },
  })

  // Group by partner
  const grouped: Record<
    string,
    {
      partner: { id: string; partnerCode: string; partnerName: string }
      transactions: typeof transactions
      totalAmount: number
    }
  > = {}

  for (const tx of transactions) {
    if (!grouped[tx.partnerId]) {
      grouped[tx.partnerId] = {
        partner: tx.partner,
        transactions: [],
        totalAmount: 0,
      }
    }
    grouped[tx.partnerId].transactions.push(tx)
    grouped[tx.partnerId].totalAmount += tx.amountInBase
  }

  return NextResponse.json(Object.values(grouped))
}
