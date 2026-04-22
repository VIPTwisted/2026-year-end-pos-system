import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const quote = await prisma.salesQuote.findUnique({
      where: { id },
      include: { items: true, opportunity: true, orders: true },
    })
    if (!quote) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(quote)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const quote = await prisma.salesQuote.update({
      where: { id },
      data: body,
      include: { items: true },
    })
    return NextResponse.json(quote)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 })
  }
}
