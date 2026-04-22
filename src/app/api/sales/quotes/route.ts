import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const where = status && status !== 'all' ? { status } : {}
    const quotes = await prisma.salesQuote.findMany({
      where,
      include: { items: true, opportunity: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(quotes)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const quote = await prisma.salesQuote.create({
      data: body,
      include: { items: true },
    })
    return NextResponse.json(quote, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create quote' }, { status: 500 })
  }
}
