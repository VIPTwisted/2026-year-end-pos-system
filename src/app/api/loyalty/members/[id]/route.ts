import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const member = await prisma.loyaltyMember.findUnique({
      where: { id },
      include: {
        tier: true,
        transactions: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    })
    if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(member)
  } catch (err) {
    console.error('[loyalty-members [id] GET]', err)
    return NextResponse.json({ error: 'Failed to fetch member' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { customerName, customerEmail, tierId } = body
    const member = await prisma.loyaltyMember.update({
      where: { id },
      data: {
        ...(customerName !== undefined && { customerName }),
        ...(customerEmail !== undefined && { customerEmail }),
        ...(tierId !== undefined && { tierId }),
      },
      include: { tier: true },
    })
    return NextResponse.json(member)
  } catch (err) {
    console.error('[loyalty-members [id] PATCH]', err)
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
  }
}
