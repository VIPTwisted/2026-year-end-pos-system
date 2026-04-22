import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const data: Record<string, unknown> = { ...body }

  if (body.status === 'approved' && !data.approvedAt) {
    data.approvedAt = new Date()
  }

  const commission = await prisma.affiliateCommission.update({ where: { id }, data })
  return NextResponse.json(commission)
}
