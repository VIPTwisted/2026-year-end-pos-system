import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        promotion: true,
        redemptions: {
          orderBy: { redeemedAt: 'desc' },
        },
        _count: { select: { redemptions: true } },
      },
    })
    if (!coupon) return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    return NextResponse.json(coupon)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json() as {
      isActive?: boolean
      maxUses?: number | null
      expiresAt?: string | null
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        isActive: body.isActive !== undefined ? body.isActive : undefined,
        usageLimit: body.maxUses !== undefined ? body.maxUses : undefined,
        expiresAt: body.expiresAt !== undefined
          ? (body.expiresAt ? new Date(body.expiresAt) : null)
          : undefined,
      },
      include: { promotion: true, _count: { select: { redemptions: true } } },
    })
    return NextResponse.json(coupon)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const coupon = await prisma.coupon.update({
      where: { id },
      data: { isActive: false },
    })
    return NextResponse.json(coupon)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
