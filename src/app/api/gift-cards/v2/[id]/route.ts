import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const card = await prisma.giftCard.findUnique({
      where: { id },
      include: {
        program: true,
        transactions: { orderBy: { createdAt: 'desc' } },
      },
    })
    if (!card) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(card)
  } catch (err) {
    console.error('[gc v2 [id] GET]', err)
    return NextResponse.json({ error: 'Failed to fetch card' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { customerName, customerId, expiresAt, status } = body
    const card = await prisma.giftCard.update({
      where: { id },
      data: {
        ...(customerName !== undefined && { customerName }),
        ...(customerId !== undefined && { customerId }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        ...(status !== undefined && { status }),
      },
    })
    return NextResponse.json(card)
  } catch (err) {
    console.error('[gc v2 [id] PATCH]', err)
    return NextResponse.json({ error: 'Failed to update card' }, { status: 500 })
  }
}
