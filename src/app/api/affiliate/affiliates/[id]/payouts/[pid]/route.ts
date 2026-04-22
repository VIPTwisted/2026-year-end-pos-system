import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; pid: string }> }
) {
  const { pid } = await params
  const body = await req.json()
  const data: Record<string, unknown> = { ...body }

  if (body.status === 'paid' && !data.paidAt) {
    data.paidAt = new Date()
  }

  const payout = await prisma.affiliatePayout.update({ where: { id: pid }, data })
  return NextResponse.json(payout)
}
