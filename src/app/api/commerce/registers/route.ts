import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const registers = await prisma.register.findMany({
      orderBy: { name: 'asc' },
      include: {
        channel: true,
        _count: { select: { shifts: true } },
      },
    })
    return NextResponse.json(registers)
  } catch (err) {
    console.error('[registers GET]', err)
    return NextResponse.json({ error: 'Failed to fetch registers' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      registerId,
      name,
      channelId,
      hardwareProfileId,
      screenLayoutId,
    } = body as {
      registerId: string
      name: string
      channelId: string
      hardwareProfileId?: string
      screenLayoutId?: string
    }

    if (!registerId?.trim()) return NextResponse.json({ error: 'registerId is required' }, { status: 400 })
    if (!name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 })
    if (!channelId?.trim()) return NextResponse.json({ error: 'channelId is required' }, { status: 400 })

    const register = await prisma.register.create({
      data: {
        registerId: registerId.trim().toUpperCase(),
        name: name.trim(),
        channelId,
        hardwareProfileId: hardwareProfileId || null,
        screenLayoutId: screenLayoutId || null,
        isActive: true,
      },
      include: { channel: true },
    })

    return NextResponse.json(register, { status: 201 })
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Register ID already exists' }, { status: 409 })
    }
    console.error('[registers POST]', err)
    return NextResponse.json({ error: 'Failed to create register' }, { status: 500 })
  }
}
