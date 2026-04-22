import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const type = searchParams.get('type')

  const where: Record<string, string> = {}
  if (status && status !== 'all') where.status = status
  if (type && type !== 'all') where.campaignType = type

  const campaigns = await prisma.marketingCampaign.findMany({
    where,
    include: { segment: { select: { id: true, name: true, memberCount: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(campaigns)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const campaign = await prisma.marketingCampaign.create({
    data: {
      name: body.name,
      campaignType: body.campaignType ?? 'email',
      status: 'draft',
      segmentId: body.segmentId ?? null,
      subject: body.subject ?? null,
      bodyTemplate: body.bodyTemplate ?? null,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      totalRecipients: body.totalRecipients ?? 0,
      budget: body.budget ?? 0,
      utmSource: body.utmSource ?? null,
      utmMedium: body.utmMedium ?? null,
      utmCampaign: body.utmCampaign ?? null,
    } as Parameters<typeof prisma.marketingCampaign.create>[0]['data'],
  })
  return NextResponse.json(campaign, { status: 201 })
}
