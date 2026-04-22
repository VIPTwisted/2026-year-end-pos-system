import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const referrals = await prisma.affiliateReferral.findMany({
    where: { affiliateId: id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(referrals)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const affiliate = await prisma.affiliate.findUnique({
    where: { id },
    include: { program: true },
  })
  if (!affiliate) return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 })

  const rate = affiliate.program.commissionRate
  const commissionAmount = parseFloat((body.saleAmount * rate).toFixed(2))

  const referral = await prisma.affiliateReferral.create({
    data: {
      affiliateId: id,
      orderId: body.orderId ?? null,
      customerName: body.customerName ?? null,
      saleAmount: body.saleAmount,
      commissionRate: rate,
      commissionAmount,
      status: 'pending',
    },
  })

  await prisma.affiliateCommission.create({
    data: {
      affiliateId: id,
      commissionType: 'direct',
      amount: commissionAmount,
      referralId: referral.id,
      description: `Referral from ${body.customerName ?? body.orderId ?? 'unknown'}`,
      status: 'pending',
    },
  })

  await prisma.affiliate.update({
    where: { id },
    data: {
      totalSales: { increment: body.saleAmount },
      totalCommission: { increment: commissionAmount },
    },
  })

  return NextResponse.json(referral, { status: 201 })
}
