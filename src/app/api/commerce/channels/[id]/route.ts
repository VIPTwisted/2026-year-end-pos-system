import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const channel = await prisma.channel.findUnique({
      where: { id },
      include: {
        registers: {
          orderBy: { name: 'asc' },
          include: {
            _count: { select: { shifts: true } },
          },
        },
      },
    })
    if (!channel) return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    return NextResponse.json(channel)
  } catch (err) {
    console.error('[channel GET]', err)
    return NextResponse.json({ error: 'Failed to fetch channel' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const {
      name,
      channelType,
      storeId,
      defaultWarehouse,
      currency,
      timeZone,
      isActive,
    } = body as {
      name?: string
      channelType?: string
      storeId?: string
      defaultWarehouse?: string
      currency?: string
      timeZone?: string
      isActive?: boolean
    }

    const channel = await prisma.channel.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(channelType !== undefined && { channelType }),
        ...(storeId !== undefined && { storeId: storeId || null }),
        ...(defaultWarehouse !== undefined && { defaultWarehouse: defaultWarehouse || null }),
        ...(currency !== undefined && { currency }),
        ...(timeZone !== undefined && { timeZone }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        registers: { orderBy: { name: 'asc' } },
      },
    })

    return NextResponse.json(channel)
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }
    console.error('[channel PATCH]', err)
    return NextResponse.json({ error: 'Failed to update channel' }, { status: 500 })
  }
}
