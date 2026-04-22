import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const caseId = searchParams.get('caseId')

  const items = await prisma.sLAItem.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(caseId ? { caseId } : {}),
    },
    include: {
      policy: true,
      case: { include: { customer: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  return NextResponse.json(items)
}
