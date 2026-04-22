import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const activity = await prisma.cRMActivity.update({
      where: { id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        outcome: body.outcome ?? null,
      },
    })
    return NextResponse.json(activity)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
