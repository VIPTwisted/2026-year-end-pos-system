import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const plan = await (prisma as any).masterPlan.findUnique({
      where: { id },
      include: {
        plannedOrders: { orderBy: { needDate: 'asc' } },
        actionMessages: { orderBy: { createdAt: 'desc' } },
      },
    })
    if (!plan) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(plan)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const plan = await (prisma as any).masterPlan.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.planType !== undefined && { planType: body.planType }),
        ...(body.horizon !== undefined && { horizon: Number(body.horizon) }),
        ...(body.fenceInside !== undefined && { fenceInside: Number(body.fenceInside) }),
        ...(body.status !== undefined && { status: body.status }),
      },
    })
    return NextResponse.json(plan)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
