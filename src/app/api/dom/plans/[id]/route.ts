import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const plan = await prisma.fulfillmentPlan.findUnique({
    where: { id },
    include: {
      lines: {
        include: {
          product: { select: { id: true, name: true, sku: true } },
        },
      },
    },
  })
  if (!plan) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(plan)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  // Handle bulk line status updates on execute
  if (body.action === 'execute') {
    await prisma.fulfillmentPlanLine.updateMany({
      where: { planId: id },
      data: { status: 'picked' },
    })
    const plan = await prisma.fulfillmentPlan.update({
      where: { id },
      data: { status: 'executing' },
      include: { lines: true },
    })
    return NextResponse.json(plan)
  }

  if (body.action === 'complete') {
    await prisma.fulfillmentPlanLine.updateMany({
      where: { planId: id },
      data: { status: 'complete' },
    })
    const plan = await prisma.fulfillmentPlan.update({
      where: { id },
      data: { status: 'complete' },
      include: { lines: true },
    })
    return NextResponse.json(plan)
  }

  const allowed = ['status']
  const data = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)))
  const plan = await prisma.fulfillmentPlan.update({
    where: { id },
    data,
    include: { lines: true },
  })
  return NextResponse.json(plan)
}
