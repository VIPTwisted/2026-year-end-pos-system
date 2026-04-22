import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const items = await prisma.catchWeightItem.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(items)
  } catch (err) {
    console.error('GET /api/inventory/catch-weight', err)
    return NextResponse.json({ error: 'Failed to fetch catch weight items' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { itemNo, description, nominalWeight, actualWeight, qty, unit, lotNo } = body

    const nom = parseFloat(nominalWeight) || 0
    const act = parseFloat(actualWeight) || 0
    const variancePct = nom > 0 ? ((act - nom) / nom) * 100 : 0

    const item = await prisma.catchWeightItem.create({
      data: {
        itemNo,
        description: description ?? null,
        nominalWeight: nom,
        actualWeight: act,
        qty: parseFloat(qty) || 0,
        variancePct,
        unit: unit ?? 'kg',
        lotNo: lotNo ?? null,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (err) {
    console.error('POST /api/inventory/catch-weight', err)
    return NextResponse.json({ error: 'Failed to create catch weight item' }, { status: 500 })
  }
}
