import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function calcNextBillDate(startDate: Date, billingCycle: string, trialDays = 0): Date {
  const base = trialDays > 0
    ? new Date(startDate.getTime() + trialDays * 86400000)
    : new Date(startDate)

  switch (billingCycle) {
    case 'weekly':    base.setDate(base.getDate() + 7);   break
    case 'monthly':   base.setMonth(base.getMonth() + 1);  break
    case 'quarterly': base.setMonth(base.getMonth() + 3);  break
    case 'annual':    base.setFullYear(base.getFullYear() + 1); break
    default:          base.setMonth(base.getMonth() + 1);  break
  }
  return base
}

async function nextSubNo(): Promise<string> {
  const last = await prisma.customerSubscription.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { subNo: true },
  })
  if (!last) return 'SUB-0001'
  const num = parseInt(last.subNo.replace('SUB-', ''), 10) || 0
  return `SUB-${String(num + 1).padStart(4, '0')}`
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const status = sp.get('status')
    const planId = sp.get('planId')
    const customerId = sp.get('customerId')

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (planId) where.planId = planId
    if (customerId) where.customerId = customerId

    const subs = await prisma.customerSubscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
        plan: { select: { id: true, name: true, price: true, billingCycle: true } },
      },
    })
    return NextResponse.json(subs)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.customerId) return NextResponse.json({ error: 'customerId is required' }, { status: 400 })
    if (!body.planId) return NextResponse.json({ error: 'planId is required' }, { status: 400 })

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: body.planId } })
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

    const startDate = body.startDate ? new Date(body.startDate) : new Date()
    const trialDays = body.trialDays !== undefined ? parseInt(body.trialDays) : plan.trialDays
    const status = trialDays > 0 ? 'trial' : 'active'
    const nextBillDate = calcNextBillDate(startDate, plan.billingCycle, trialDays)
    const subNo = await nextSubNo()

    const sub = await prisma.customerSubscription.create({
      data: {
        subNo,
        customerId: body.customerId,
        planId: body.planId,
        status,
        startDate,
        nextBillDate,
        notes: body.notes?.trim() || null,
      },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
        plan: { select: { id: true, name: true, price: true, billingCycle: true } },
      },
    })
    return NextResponse.json(sub, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
