import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const books = await prisma.depreciationBook.findMany({
      orderBy: { code: 'asc' },
    })
    return NextResponse.json(books)
  } catch {
    return NextResponse.json({ error: 'Depreciation books unavailable' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const book = await prisma.depreciationBook.create({ data: body })
    return NextResponse.json(book, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create depreciation book' }, { status: 500 })
  }
}
