import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sub = await prisma.customerSubscription.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, firstName: true, lastName: true, email: true } },
        plan: true,
      },
    })
    if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(sub)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()

    const sub = await prisma.customerSubscription.findUnique({
      where: { id },
      include: { plan: { select: { billingCycle: true } } },
    })
    if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const action: string | undefined = body.action
    const data: Record<string, unknown> = {}

    if (action === 'cancel') {
      if (sub.status === 'cancelled') {
        return NextResponse.json({ error: 'Subscription is already cancelled' }, { status: 400 })
      }
      data.status = 'cancelled'
      data.cancelledAt = new Date()
      data.cancelReason = body.cancelReason?.trim() || null
      data.nextBillDate = null
    } else if (action === 'pause') {
      if (!['active', 'trial'].includes(sub.status)) {
        return NextResponse.json({ error: 'Only active or trial subscriptions can be paused' }, { status: 400 })
      }
      data.status = 'paused'
    } else if (action === 'reactivate') {
      if (sub.status !== 'paused') {
        return NextResponse.json({ error: 'Only paused subscriptions can be reactivated' }, { status: 400 })
      }
      const nextBill = new Date()
      switch (sub.plan.billingCycle) {
        case 'weekly':    nextBill.setDate(nextBill.getDate() + 7);   break
        case 'quarterly': nextBill.setMonth(nextBill.getMonth() + 3);  break
        case 'annual':    nextBill.setFullYear(nextBill.getFullYear() + 1); break
        default:          nextBill.setMonth(nextBill.getMonth() + 1);  break
      }
      data.status = 'active'
      data.nextBillDate = nextBill
    } else {
      // Generic patch: notes, endDate, nextBillDate
      if (body.notes !== undefined) data.notes = body.notes?.trim() || null
      if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null
      if (body.nextBillDate !== undefined) data.nextBillDate = body.nextBillDate ? new Date(body.nextBillDate) : null
      if (body.status !== undefined) data.status = body.status
    }

    const updated = await prisma.customerSubscription.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
