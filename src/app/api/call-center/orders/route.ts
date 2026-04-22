import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const status = searchParams.get('status')
  const channel = searchParams.get('channel')
  const agentId = searchParams.get('agentId')
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = parseInt(searchParams.get('limit') ?? '25')
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (channel) where.channel = channel
  if (agentId) where.agentId = agentId

  const [orders, total] = await Promise.all([
    prisma.callCenterOrder.findMany({
      where,
      include: {
        lines: true,
        holds: { where: { status: 'active' } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.callCenterOrder.count({ where }),
  ])

  return NextResponse.json({ orders, total, page, limit })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { lines = [], ...orderData } = body

  const fraudRules = await prisma.callCenterFraudRule.findMany({ where: { isActive: true } })
  let fraudScore = 0
  const fraudFlags: string[] = []

  for (const rule of fraudRules) {
    let triggered = false
    if (rule.ruleType === 'order-amount' && rule.threshold != null) {
      if ((orderData.total ?? 0) >= rule.threshold) triggered = true
    } else if (rule.ruleType === 'new-customer' && !orderData.customerId) {
      triggered = true
    } else if (rule.ruleType === 'multiple-cards' && orderData.paymentMethod === 'gift_card') {
      triggered = true
    } else if (rule.ruleType === 'shipping-mismatch') {
      if (!orderData.customerId) triggered = true
    } else if (rule.ruleType === 'velocity') {
      if (rule.threshold != null && (orderData.total ?? 0) >= rule.threshold) triggered = true
    }
    if (triggered) {
      fraudScore += rule.points
      fraudFlags.push(rule.ruleName)
    }
  }

  const computedStatus = fraudScore >= 50 ? 'fraud-hold' : (orderData.status ?? 'draft')

  const order = await prisma.callCenterOrder.create({
    data: {
      ...orderData,
      fraudScore,
      fraudFlags: JSON.stringify(fraudFlags),
      status: computedStatus,
      lines: {
        create: lines.map((l: Record<string, unknown>) => ({
          productId: l.productId as string | undefined,
          productName: l.productName as string,
          sku: l.sku as string | undefined,
          qty: (l.qty as number) ?? 1,
          unitPrice: l.unitPrice as number,
          discount: (l.discount as number) ?? 0,
          lineTotal: l.lineTotal as number,
          overrideBy: l.overrideBy as string | undefined,
          overrideReason: l.overrideReason as string | undefined,
        })),
      },
    },
    include: { lines: true, holds: true },
  })

  if (fraudScore >= 50) {
    await prisma.callCenterHold.create({
      data: {
        orderId: order.id,
        holdType: 'fraud',
        reason: `Automated fraud hold — score ${fraudScore}. Flags: ${fraudFlags.join(', ')}`,
        placedBy: 'system',
        status: 'active',
      },
    })
  }

  return NextResponse.json(order, { status: 201 })
}
