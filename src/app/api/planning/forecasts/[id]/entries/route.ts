import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const entries = await (prisma as any).forecastEntry.findMany({
      where: { modelId: id },
      orderBy: { period: 'asc' },
    })
    return NextResponse.json(entries)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const entries = Array.isArray(body) ? body : [body]
    const created = await (prisma as any).forecastEntry.createMany({
      data: entries.map((e: any) => ({
        modelId: id,
        productName: e.productName ?? null,
        productId: e.productId ?? null,
        period: e.period,
        forecastQty: Number(e.forecastQty ?? 0),
        actualQty: e.actualQty != null ? Number(e.actualQty) : null,
        variance: e.variance != null ? Number(e.variance) : null,
        confidence: e.confidence != null ? Number(e.confidence) : null,
      })),
    })
    return NextResponse.json(created, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
