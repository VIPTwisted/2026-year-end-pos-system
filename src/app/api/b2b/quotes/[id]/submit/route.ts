import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const quote = await prisma.b2BQuote.update({
      where: { id },
      data: { status: 'submitted' },
    })
    return NextResponse.json(quote)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to submit quote' }, { status: 500 })
  }
}
