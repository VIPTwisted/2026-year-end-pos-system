import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const programs = await prisma.giftCardProgram.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { cards: true } } },
    })
    return NextResponse.json(programs)
  } catch (err) {
    console.error('[gc-programs GET]', err)
    return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, prefix, initialValue, isReloadable, expiryMonths, isActive } = body
    if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
    const program = await prisma.giftCardProgram.create({
      data: {
        name: name.trim(),
        prefix: prefix?.trim() || 'GC',
        initialValue: initialValue ? parseFloat(initialValue) : null,
        isReloadable: isReloadable !== false,
        expiryMonths: expiryMonths ? parseInt(expiryMonths) : null,
        isActive: isActive !== false,
      },
    })
    return NextResponse.json(program, { status: 201 })
  } catch (err) {
    console.error('[gc-programs POST]', err)
    return NextResponse.json({ error: 'Failed to create program' }, { status: 500 })
  }
}
