import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const channels = await prisma.channel.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { registers: true } },
      },
    })
    return NextResponse.json(channels)
  } catch (err) {
    console.error('[channels GET]', err)
    return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      channelCode,
      name,
      channelType,
      storeId,
      defaultWarehouse,
      currency = 'USD',
      timeZone = 'America/New_York',
    } = body as {
      channelCode: string
      name: string
      channelType: string
      storeId?: string
      defaultWarehouse?: string
      currency?: string
      timeZone?: string
    }

    if (!channelCode?.trim()) return NextResponse.json({ error: 'channelCode is required' }, { status: 400 })
    if (!name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 })
    if (!channelType?.trim()) return NextResponse.json({ error: 'channelType is required' }, { status: 400 })

    const channel = await prisma.channel.create({
      data: {
        channelCode: channelCode.trim().toUpperCase(),
        name: name.trim(),
        channelType,
        storeId: storeId || null,
        defaultWarehouse: defaultWarehouse || null,
        currency,
        timeZone,
        isActive: true,
      },
    })

    return NextResponse.json(channel, { status: 201 })
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Channel code already exists' }, { status: 409 })
    }
    console.error('[channels POST]', err)
    return NextResponse.json({ error: 'Failed to create channel' }, { status: 500 })
  }
}
