import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const campaign = await prisma.marketingCampaign.findUnique({
    where: { id },
    include: { segment: true },
  })
  if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(campaign)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const updated = await prisma.marketingCampaign.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.campaignType !== undefined && { campaignType: body.campaignType }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.segmentId !== undefined && { segmentId: body.segmentId }),
      ...(body.subject !== undefined && { subject: body.subject }),
      ...(body.bodyTemplate !== undefined && { bodyTemplate: body.bodyTemplate }),
      ...(body.scheduledAt !== undefined && { scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null }),
      ...(body.totalRecipients !== undefined && { totalRecipients: body.totalRecipients }),
      ...(body.budget !== undefined && { budget: body.budget }),
      ...(body.utmSource !== undefined && { utmSource: body.utmSource }),
      ...(body.utmMedium !== undefined && { utmMedium: body.utmMedium }),
      ...(body.utmCampaign !== undefined && { utmCampaign: body.utmCampaign }),
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.marketingCampaign.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
