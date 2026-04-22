import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status')
  const workflowId = req.nextUrl.searchParams.get('workflowId')
  const from = req.nextUrl.searchParams.get('from')
  const to = req.nextUrl.searchParams.get('to')
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '100')

  const runs = await prisma.workflowRun.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(workflowId ? { workflowId } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  return NextResponse.json(runs)
}
