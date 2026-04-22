import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const device = await prisma.fiscalDevice.update({
      where: { id },
      data: {
        lastHeartbeat: new Date(),
        status: 'active',
        errorMessage: null,
      },
    })
    return NextResponse.json(device)
  } catch (error) {
    console.error('[POST /api/fiscal/devices/[id]/heartbeat]', error)
    return NextResponse.json({ error: 'Failed to update heartbeat' }, { status: 500 })
  }
}
