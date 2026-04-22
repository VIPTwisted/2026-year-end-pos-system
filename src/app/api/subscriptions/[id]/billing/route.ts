import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cycles = await prisma.subscriptionBilling.findMany({
    where: { subscriptionId: id },
    orderBy: { cycleNumber: 'asc' },
  })
  return NextResponse.json(cycles)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const lastCycle = await prisma.subscriptionBilling.findFirst({
    where: { subscriptionId: id },
    orderBy: { cycleNumber: 'desc' },
  })

  const cycleNumber = (lastCycle?.cycleNumber ?? 0) + 1

  const cycle = await prisma.subscriptionBilling.create({
    data: {
      subscriptionId: id,
      cycleNumber,
      ...body,
    },
  })

  if (body.status === 'paid') {
    await prisma.subscription.update({
      where: { id },
      data: { totalBilled: { increment: body.amount ?? 0 } },
    })
  }

  return NextResponse.json(cycle, { status: 201 })
}
