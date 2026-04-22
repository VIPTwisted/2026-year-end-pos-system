import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const campaign = await prisma.marketingCampaign.findUnique({ where: { id } })
  if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const total = campaign.totalRecipients || 1000
  const delivered = Math.floor(total * 0.97)
  const opened = Math.floor(delivered * 0.28)
  const clicked = Math.floor(opened * 0.15)
  const converted = Math.floor(clicked * 0.12)
  const revenue = converted * 45

  const updated = await prisma.marketingCampaign.update({
    where: { id },
    data: { status: 'completed', completedAt: new Date(), delivered, opened, clicked, converted, revenue, spend: campaign.budget * 0.85 },
  })
  return NextResponse.json(updated)
}
