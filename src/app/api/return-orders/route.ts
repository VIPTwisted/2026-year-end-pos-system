import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function genReturnNumber() {
  return `RET-${Date.now().toString(36).toUpperCase()}`
}

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status') ?? ''
  const search = req.nextUrl.searchParams.get('search') ?? ''

  const returns = await prisma.returnOrder.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { returnNumber: { contains: search } },
              { customerId: { contains: search } },
            ],
          }
        : {}),
    },
    include: { lines: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  return NextResponse.json(returns)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { lines, ...returnData } = body

  const returnOrder = await prisma.returnOrder.create({
    data: {
      ...returnData,
      returnNumber: genReturnNumber(),
      lines: lines?.length ? { create: lines } : undefined,
    },
    include: { lines: true },
  })
  return NextResponse.json(returnOrder, { status: 201 })
}
