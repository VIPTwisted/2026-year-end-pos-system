import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, minPoints, multiplier, perksJson, colorHex, sortOrder } = body
    const tier = await prisma.loyaltyTier.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(minPoints !== undefined && { minPoints: parseInt(minPoints) }),
        ...(multiplier !== undefined && { multiplier: parseFloat(multiplier) }),
        ...(perksJson !== undefined && { perksJson }),
        ...(colorHex !== undefined && { colorHex }),
        ...(sortOrder !== undefined && { sortOrder: parseInt(sortOrder) }),
      },
    })
    return NextResponse.json(tier)
  } catch (err) {
    console.error('[loyalty-tiers PATCH]', err)
    return NextResponse.json({ error: 'Failed to update tier' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.loyaltyTier.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[loyalty-tiers DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete tier' }, { status: 500 })
  }
}
