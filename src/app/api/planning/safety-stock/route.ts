import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const rules = await (prisma as any).safetyStockRule.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(rules)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const rule = await (prisma as any).safetyStockRule.create({
      data: {
        productName: body.productName ?? null,
        locationName: body.locationName ?? null,
        calculationMethod: body.calculationMethod ?? 'fixed',
        fixedQty: Number(body.fixedQty ?? 0),
        daysOfSupply: Number(body.daysOfSupply ?? 7),
        serviceLevel: Number(body.serviceLevel ?? 0.95),
        currentStock: Number(body.currentStock ?? 0),
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json(rule, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
