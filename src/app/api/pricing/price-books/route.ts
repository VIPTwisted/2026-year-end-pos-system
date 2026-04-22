import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const books = await prisma.priceBook.findMany({
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      include: { _count: { select: { entries: true } } },
    })
    return NextResponse.json(books)
  } catch (error) {
    console.error('GET /api/pricing/price-books error:', error)
    return NextResponse.json({ error: 'Failed to fetch price books' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, currency, isDefault, validFrom, validTo } = body
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

    if (isDefault) {
      await prisma.priceBook.updateMany({ where: { isDefault: true }, data: { isDefault: false } })
    }

    const book = await prisma.priceBook.create({
      data: {
        name,
        description: description ?? null,
        currency: currency ?? 'USD',
        isDefault: isDefault ?? false,
        validFrom: validFrom ? new Date(validFrom) : null,
        validTo: validTo ? new Date(validTo) : null,
      },
    })
    return NextResponse.json(book, { status: 201 })
  } catch (error) {
    console.error('POST /api/pricing/price-books error:', error)
    return NextResponse.json({ error: 'Failed to create price book' }, { status: 500 })
  }
}
