import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const placement = searchParams.get('placement')
  const channelId = searchParams.get('channelId')

  const banners = await prisma.ecomBanner.findMany({
    where: {
      ...(placement && { placement }),
      ...(channelId && { channelId }),
    },
    orderBy: [{ placement: 'asc' }, { position: 'asc' }],
  })
  return NextResponse.json(banners)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const banner = await prisma.ecomBanner.create({
    data: {
      name: body.name,
      placement: body.placement ?? 'homepage-hero',
      imageUrl: body.imageUrl ?? null,
      linkUrl: body.linkUrl ?? null,
      title: body.title ?? null,
      subtitle: body.subtitle ?? null,
      ctaText: body.ctaText ?? null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      position: body.position ?? 0,
      isActive: body.isActive ?? true,
      channelId: body.channelId ?? null,
      channelName: body.channelName ?? null,
    },
  })
  return NextResponse.json(banner, { status: 201 })
}
