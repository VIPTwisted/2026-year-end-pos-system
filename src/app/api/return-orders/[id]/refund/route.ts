import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const ret = await prisma.returnOrder.update({
    where: { id },
    data: {
      status: 'refunded',
      refundMethod: body.refundMethod ?? undefined,
      totalRefund: body.totalRefund ?? undefined,
      restockFee: body.restockFee ?? undefined,
      notes: body.notes ?? undefined,
    },
    include: { lines: true },
  })
  return NextResponse.json(ret)
}
