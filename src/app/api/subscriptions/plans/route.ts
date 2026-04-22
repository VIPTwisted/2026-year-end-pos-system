import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { createdAt: 'asc' },
      include: { _count: { select: { subscriptions: true } } },
    })
    return NextResponse.json(plans)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Plan name is required' }, { status: 400 })
    }
    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: body.name.trim(),
        description: body.description?.trim() || null,
        price: parseFloat(body.price ?? 0),
        billingCycle: body.billingCycle ?? 'monthly',
        trialDays: parseInt(body.trialDays ?? 0),
        isActive: body.isActive !== false,
        features: body.features ? JSON.stringify(body.features) : null,
      },
    })
    return NextResponse.json(plan, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
