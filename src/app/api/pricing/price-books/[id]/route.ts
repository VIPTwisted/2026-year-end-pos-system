import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const book = await prisma.priceBook.findUnique({
      where: { id },
      include: { entries: { orderBy: { createdAt: 'asc' } } },
    })
    if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(book)
  } catch (error) {
    console.error('GET /api/pricing/price-books/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch price book' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, description, currency, isDefault, isActive, validFrom, validTo } = body

    if (isDefault) {
      await prisma.priceBook.updateMany({ where: { isDefault: true }, data: { isDefault: false } })
    }

    const book = await prisma.priceBook.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(currency !== undefined && { currency }),
        ...(isDefault !== undefined && { isDefault }),
        ...(isActive !== undefined && { isActive }),
        ...(validFrom !== undefined && { validFrom: validFrom ? new Date(validFrom) : null }),
        ...(validTo !== undefined && { validTo: validTo ? new Date(validTo) : null }),
      },
    })
    return NextResponse.json(book)
  } catch (error) {
    console.error('PATCH /api/pricing/price-books/[id] error:', error)
    return NextResponse.json({ error: 'Failed to update price book' }, { status: 500 })
  }
}
