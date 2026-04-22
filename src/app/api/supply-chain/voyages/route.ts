import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const voyages = await prisma.voyage.findMany({
      include: { costLines: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(voyages)
  } catch (err) {
    console.error('GET /api/supply-chain/voyages', err)
    return NextResponse.json({ error: 'Failed to fetch voyages' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { voyageNo, description, vendorNo, shipDate, estimatedArrival, currency, lines } = body

    const voyage = await prisma.voyage.create({
      data: {
        voyageNo,
        description,
        vendorNo,
        currency: currency ?? 'USD',
        shipDate: shipDate ? new Date(shipDate) : null,
        estimatedArrival: estimatedArrival ? new Date(estimatedArrival) : null,
        totalAmountLCY: Array.isArray(lines)
          ? lines.reduce((s: number, l: { amount: string }) => s + (parseFloat(l.amount) || 0), 0)
          : 0,
        costLines: Array.isArray(lines) ? {
          create: lines.map((l: { costType: string; description: string; amount: string; allocationMethod: string }) => ({
            costType: l.costType ?? 'freight',
            description: l.description ?? null,
            amount: parseFloat(l.amount) || 0,
            allocationMethod: l.allocationMethod ?? 'by_value',
          })),
        } : undefined,
      },
      include: { costLines: true },
    })

    return NextResponse.json(voyage, { status: 201 })
  } catch (err) {
    console.error('POST /api/supply-chain/voyages', err)
    return NextResponse.json({ error: 'Failed to create voyage' }, { status: 500 })
  }
}
