import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const quote = await prisma.b2BQuote.findUnique({
      where: { id },
      include: {
        lines: { orderBy: { createdAt: 'asc' } },
        org: true,
      },
    })
    if (!quote) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(quote)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { contactName, validUntil, notes, status, rejectionReason, discount, tax } = body

    const quote = await prisma.b2BQuote.update({
      where: { id },
      data: {
        ...(contactName !== undefined ? { contactName } : {}),
        ...(validUntil !== undefined ? { validUntil: validUntil ? new Date(validUntil) : null } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(rejectionReason !== undefined ? { rejectionReason } : {}),
        ...(discount !== undefined ? { discount } : {}),
        ...(tax !== undefined ? { tax } : {}),
      },
      include: { lines: true, org: true },
    })
    return NextResponse.json(quote)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 })
  }
}
