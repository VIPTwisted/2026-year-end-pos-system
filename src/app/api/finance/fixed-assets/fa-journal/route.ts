import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const postingType = searchParams.get('postingType')
  const book        = searchParams.get('book')
  const posted      = searchParams.get('posted')

  try {
    const lines = await prisma.fixedAssetJournalLine.findMany({
      where: {
        ...(postingType ? { postingType } : {}),
        ...(book        ? { depreciationBookCode: book } : {}),
        ...(posted !== null ? { isPosted: posted === 'true' } : {}),
      },
      include: { asset: { select: { assetNumber: true, name: true } } },
      orderBy: { postingDate: 'desc' },
      take: 300,
    })
    return NextResponse.json(lines)
  } catch {
    return NextResponse.json({ error: 'FA journal unavailable' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const line = await prisma.fixedAssetJournalLine.create({ data: body })
    return NextResponse.json(line, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create journal line' }, { status: 500 })
  }
}
