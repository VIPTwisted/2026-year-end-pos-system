import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/budget/plans/accounts — revenue + expense accounts for budget entry grid
export async function GET() {
  const accounts = await prisma.account.findMany({
    where: { type: { in: ['revenue', 'expense'] } },
    select: { id: true, code: true, name: true, type: true },
    orderBy: { code: 'asc' },
  })
  return NextResponse.json(accounts)
}
