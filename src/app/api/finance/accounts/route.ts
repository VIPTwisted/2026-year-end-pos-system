import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        type: true,
        subtype: true,
        balance: true,
      },
    })
    return NextResponse.json({ accounts })
  } catch (err) {
    console.error('[GET /api/finance/accounts]', err)
    return NextResponse.json({ error: 'Failed to load accounts' }, { status: 500 })
  }
}
