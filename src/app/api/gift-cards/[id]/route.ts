import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const card = await prisma.giftCard.findUnique({
      where: { id },
      include: {
        transactions: { orderBy: { createdAt: 'desc' } },
      },
    })
    if (!card) return NextResponse.json({ error: 'Gift card not found' }, { status: 404 })
    return NextResponse.json(card)
  } catch (err) {
    console.error('[gift-cards/[id] GET]', err)
    return NextResponse.json({ error: 'Failed to fetch gift card' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { status, expiresAt, customerId, notes, issuedBy } = body

    const card = await prisma.giftCard.findUnique({ where: { id } })
    if (!card) return NextResponse.json({ error: 'Gift card not found' }, { status: 404 })

    const updated = await prisma.giftCard.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        ...(customerId !== undefined && { customerId: customerId || null }),
        ...(notes !== undefined && { notes: notes || null }),
        ...(issuedBy !== undefined && { issuedBy: issuedBy || null }),
      },
    })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[gift-cards/[id] PATCH]', err)
    return NextResponse.json({ error: 'Failed to update gift card' }, { status: 500 })
  }
}
