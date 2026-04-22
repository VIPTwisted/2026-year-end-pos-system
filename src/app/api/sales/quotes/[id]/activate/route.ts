import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const quote = await prisma.salesQuote.update({
      where: { id },
      data: { status: 'active' },
    })
    return NextResponse.json(quote)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to activate quote' }, { status: 500 })
  }
}
