import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status')
  const rmas = await prisma.callCenterRMA.findMany({
    where: status ? { status } : {},
    include: { order: { select: { orderNumber: true, agentName: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(rmas)
}
