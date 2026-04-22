import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    const shift = await prisma.posShift.findFirst({
      where: { status: 'open', ...(userId ? { userId } : {}) },
      orderBy: { openTime: 'desc' },
      include: { store: { select: { id: true, name: true } } },
    })
    return NextResponse.json({ shift })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, cashierName, storeId, registerId, openFloat, openDenominations } = body
    if (!userId || !cashierName || !storeId) {
      return NextResponse.json({ error: 'userId, cashierName, storeId required' }, { status: 400 })
    }
    const denomTotal = openDenominations
      ? Object.entries(openDenominations as Record<string, number>).reduce(
          (s, [k, v]) => s + parseFloat(k) * v,
          0
        )
      : null
    const finalFloat = denomTotal ?? parseFloat(openFloat ?? '0') ?? 200
    // Close any existing open shifts for this user first
    await prisma.posShift.updateMany({
      where: { userId, status: 'open' },
      data: { status: 'closed', closeTime: new Date() },
    })
    const shift = await prisma.posShift.create({
      data: {
        userId,
        cashierName,
        storeId,
        registerId: registerId || 'REG-01',
        openFloat: finalFloat,
        openDenominations: openDenominations ? JSON.stringify(openDenominations) : null,
        status: 'open',
      },
    })
    return NextResponse.json({ shift }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
