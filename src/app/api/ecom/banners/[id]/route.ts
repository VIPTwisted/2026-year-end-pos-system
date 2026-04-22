import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const banner = await prisma.ecomBanner.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.placement !== undefined && { placement: body.placement }),
      ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
      ...(body.linkUrl !== undefined && { linkUrl: body.linkUrl }),
      ...(body.title !== undefined && { title: body.title }),
      ...(body.subtitle !== undefined && { subtitle: body.subtitle }),
      ...(body.ctaText !== undefined && { ctaText: body.ctaText }),
      ...(body.startDate !== undefined && { startDate: body.startDate ? new Date(body.startDate) : null }),
      ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
      ...(body.position !== undefined && { position: body.position }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.channelId !== undefined && { channelId: body.channelId }),
      ...(body.channelName !== undefined && { channelName: body.channelName }),
    },
  })
  return NextResponse.json(banner)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.ecomBanner.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
