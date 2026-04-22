import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const items = await prisma.productLifecycle.findMany({
      orderBy: { effectiveDate: 'desc' },
    })
    return NextResponse.json(items)
  } catch (err) {
    console.error('GET /api/products/lifecycle', err)
    return NextResponse.json({ error: 'Failed to fetch lifecycle records' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { itemNo, description, lifecyclePhase, effectiveDate, notes } = body

    const item = await prisma.productLifecycle.create({
      data: {
        itemNo,
        description: description ?? null,
        lifecyclePhase: lifecyclePhase ?? 'introduction',
        effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
        notes: notes ?? null,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (err) {
    console.error('POST /api/products/lifecycle', err)
    return NextResponse.json({ error: 'Failed to create lifecycle record' }, { status: 500 })
  }
}
