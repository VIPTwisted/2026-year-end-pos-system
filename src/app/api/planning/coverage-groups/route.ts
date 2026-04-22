import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const groups = await (prisma as any).coverageGroup.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(groups)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const group = await (prisma as any).coverageGroup.create({
      data: {
        name: body.name,
        coverageType: body.coverageType ?? 'period',
        coverageDays: Number(body.coverageDays ?? 30),
        minQty: Number(body.minQty ?? 0),
        maxQty: Number(body.maxQty ?? 100),
        reorderPoint: Number(body.reorderPoint ?? 10),
        safetyStock: Number(body.safetyStock ?? 5),
        leadTimeDays: Number(body.leadTimeDays ?? 7),
        products: body.products ? JSON.stringify(body.products) : '[]',
      },
    })
    return NextResponse.json(group, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
