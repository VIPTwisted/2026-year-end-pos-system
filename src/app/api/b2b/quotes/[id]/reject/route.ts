import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { reason } = body

    const quote = await prisma.b2BQuote.update({
      where: { id },
      data: { status: 'rejected', rejectionReason: reason ?? null },
    })
    return NextResponse.json(quote)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to reject quote' }, { status: 500 })
  }
}
