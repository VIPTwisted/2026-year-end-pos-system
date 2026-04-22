import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const campaign = await prisma.marketingCampaign.findUnique({ where: { id } })
  if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.marketingCampaign.update({
    where: { id },
    data: campaign.scheduledAt
      ? { status: 'scheduled' }
      : { status: 'active', startedAt: new Date() },
  })
  return NextResponse.json(updated)
}
