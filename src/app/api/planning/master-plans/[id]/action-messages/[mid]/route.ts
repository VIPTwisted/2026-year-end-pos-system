import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; mid: string }> }) {
  try {
    const { mid } = await params
    const body = await req.json()
    const msg = await (prisma as any).actionMessage.update({
      where: { id: mid },
      data: { status: body.status },
    })
    return NextResponse.json(msg)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
