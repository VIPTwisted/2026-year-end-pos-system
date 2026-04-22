import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const dimensions = await prisma.finDimension.findMany({
      orderBy: { code: 'asc' },
      include: { _count: { select: { values: true } } },
    })
    return NextResponse.json(dimensions)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, name, description } = body as {
      code: string
      name: string
      description?: string
    }
    if (!code?.trim() || !name?.trim()) {
      return NextResponse.json({ error: 'code and name are required' }, { status: 400 })
    }
    const dimension = await prisma.finDimension.create({
      data: {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description?.trim() ?? null,
      },
    })
    return NextResponse.json(dimension, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
