import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; pid: string }> }) {
  const { pid } = await params
  const body = await req.json()
  const payout = await prisma.creatorPayout.update({
    where: { id: pid },
    data: {
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.status === 'paid' ? { paidAt: new Date() } : {}),
      ...(body.paymentMethod !== undefined ? { paymentMethod: body.paymentMethod } : {}),
      ...(body.paymentRef !== undefined ? { paymentRef: body.paymentRef } : {}),
      ...(body.adjustments !== undefined ? {
        adjustments: parseFloat(body.adjustments),
        netPayout: 0,
      } : {}),
    },
  })

  if (body.adjustments !== undefined) {
    const updated = await prisma.creatorPayout.update({
      where: { id: pid },
      data: { netPayout: payout.commission + parseFloat(body.adjustments) },
    })
    return NextResponse.json(updated)
  }

  return NextResponse.json(payout)
}
