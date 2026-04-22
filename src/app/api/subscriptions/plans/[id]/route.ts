import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id },
      include: { _count: { select: { subscriptions: true } } },
    })
    if (!plan) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(plan)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const existing = await prisma.subscriptionPlan.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const data: Record<string, unknown> = {}
    if (body.name !== undefined) data.name = body.name.trim()
    if (body.description !== undefined) data.description = body.description?.trim() || null
    if (body.price !== undefined) data.price = parseFloat(body.price)
    if (body.billingCycle !== undefined) data.billingCycle = body.billingCycle
    if (body.trialDays !== undefined) data.trialDays = parseInt(body.trialDays)
    if (body.isActive !== undefined) data.isActive = body.isActive
    if (body.features !== undefined) {
      data.features = body.features ? JSON.stringify(body.features) : null
    }

    const plan = await prisma.subscriptionPlan.update({ where: { id }, data })
    return NextResponse.json(plan)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const existing = await prisma.subscriptionPlan.findUnique({
      where: { id },
      include: { _count: { select: { subscriptions: true } } },
    })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (existing._count.subscriptions > 0) {
      return NextResponse.json(
        { error: 'Cannot delete plan with active subscriptions. Deactivate it instead.' },
        { status: 400 },
      )
    }
    await prisma.subscriptionPlan.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
