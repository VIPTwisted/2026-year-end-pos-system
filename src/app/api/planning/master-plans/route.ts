import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const plans = await (prisma as any).masterPlan.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { plannedOrders: true, actionMessages: true } } },
    })
    return NextResponse.json(plans)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const plan = await (prisma as any).masterPlan.create({
      data: {
        name: body.name,
        planType: body.planType ?? 'static',
        horizon: Number(body.horizon ?? 90),
        fenceInside: Number(body.fenceInside ?? 7),
        status: 'draft',
      },
    })
    return NextResponse.json(plan, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
