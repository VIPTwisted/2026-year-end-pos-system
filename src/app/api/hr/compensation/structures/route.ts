import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type')

  try {
    const structures = await prisma.compensationStructure.findMany({
      where: { ...(type ? { type } : {}) },
      include: { _count: { select: { grades: true } } },
      orderBy: { code: 'asc' },
    })
    return NextResponse.json(structures)
  } catch {
    return NextResponse.json({ error: 'Structures unavailable' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const structure = await prisma.compensationStructure.create({ data: body })
    return NextResponse.json(structure, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create structure' }, { status: 500 })
  }
}
