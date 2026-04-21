import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      contacts: {
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  }

  return NextResponse.json(campaign)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  const { status, targetCount, sentCount, openCount } = body

  const existing = await prisma.campaign.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  }

  const campaign = await prisma.campaign.update({
    where: { id },
    data: {
      ...(status !== undefined ? { status } : {}),
      ...(targetCount !== undefined ? { targetCount } : {}),
      ...(sentCount !== undefined ? { sentCount } : {}),
      ...(openCount !== undefined ? { openCount } : {}),
    },
    include: {
      contacts: { include: { customer: true } },
    },
  })

  return NextResponse.json(campaign)
}
