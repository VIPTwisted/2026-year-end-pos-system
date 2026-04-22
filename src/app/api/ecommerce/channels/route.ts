import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const channels = await prisma.eCommerceChannel.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { onlineOrders: true } },
    },
  })
  return NextResponse.json(channels)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const channel = await prisma.eCommerceChannel.create({
    data: {
      name: body.name,
      domain: body.domain || undefined,
      description: body.description || undefined,
      currency: body.currency || 'USD',
      language: body.language || 'en-US',
      allowGuestCheckout: body.allowGuestCheckout ?? true,
      requiresEmailVerification: body.requiresEmailVerification ?? false,
      isActive: body.isActive ?? true,
    },
  })
  return NextResponse.json(channel, { status: 201 })
}
