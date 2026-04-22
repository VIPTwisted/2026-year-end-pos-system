import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; rid: string }> }
) {
  const { rid } = await params
  const now = new Date()

  const referral = await prisma.affiliateReferral.update({
    where: { id: rid },
    data: { status: 'confirmed', confirmedAt: now },
  })

  await prisma.affiliateCommission.updateMany({
    where: { referralId: rid, status: 'pending' },
    data: { status: 'approved', approvedAt: now },
  })

  return NextResponse.json(referral)
}
