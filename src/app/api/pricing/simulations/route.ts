import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sims = await prisma.priceSimulation.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(sims)
  } catch (err) {
    console.error('GET /api/pricing/simulations', err)
    return NextResponse.json({ error: 'Failed to fetch price simulations' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { simulationNo, description, simulationType, priceList, dateFrom, dateTo, lines } = body

    const totalImpact = Array.isArray(lines)
      ? lines.reduce((s: number, l: { originalPrice: string; newPrice: string }) => {
          const orig = parseFloat(l.originalPrice) || 0
          const np = parseFloat(l.newPrice) || 0
          return s + (np - orig)
        }, 0)
      : 0

    const sim = await prisma.priceSimulation.create({
      data: {
        simulationNo,
        description: description ?? null,
        simulationType: simulationType ?? 'what_if',
        priceList: priceList ?? null,
        dateFrom: dateFrom ? new Date(dateFrom) : null,
        dateTo: dateTo ? new Date(dateTo) : null,
        totalImpact,
        linesJson: lines ? JSON.stringify(lines) : null,
      },
    })

    return NextResponse.json(sim, { status: 201 })
  } catch (err) {
    console.error('POST /api/pricing/simulations', err)
    return NextResponse.json({ error: 'Failed to create price simulation' }, { status: 500 })
  }
}
