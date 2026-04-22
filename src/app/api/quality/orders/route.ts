import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const referenceType = searchParams.get('referenceType')

  const orders = await prisma.qualityOrder.findMany({
    where: {
      ...(status && status !== 'all' ? { status } : {}),
      ...(referenceType ? { referenceType } : {}),
    },
    include: {
      results: true,
      nonConformances: { select: { id: true, ncNumber: true, severity: true, status: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { productName, qty, sampleQty, referenceType, referenceId, productId, locationId, locationName, testGroupId, inspectedBy } = body

  if (!productName) {
    return NextResponse.json({ error: 'productName is required' }, { status: 400 })
  }

  const lastQO = await prisma.qualityOrder.findFirst({
    orderBy: { createdAt: 'desc' },
  })
  let seq = 1
  if (lastQO) {
    const parts = lastQO.orderNumber.split('-')
    const n = parseInt(parts[1] ?? '0', 10)
    if (!isNaN(n)) seq = n + 1
  }
  const orderNumber = `QO-${String(seq).padStart(6, '0')}`

  let resolvedTestGroupId = testGroupId || null
  if (!resolvedTestGroupId) {
    const plan = await prisma.qualityInspectionPlan.findFirst({
      where: { isActive: true, autoCreate: true, referenceType: referenceType ?? 'purchase' },
    })
    if (plan?.testGroupId) resolvedTestGroupId = plan.testGroupId
  }

  const order = await prisma.qualityOrder.create({
    data: {
      orderNumber,
      referenceType: referenceType ?? 'purchase',
      referenceId: referenceId ?? null,
      productId: productId ?? null,
      productName,
      qty: Number(qty) || 1,
      sampleQty: Number(sampleQty) || 1,
      locationId: locationId ?? null,
      locationName: locationName ?? null,
      status: 'open',
      testGroupId: resolvedTestGroupId,
      inspectedBy: inspectedBy ?? null,
    },
    include: { results: true, nonConformances: true },
  })

  return NextResponse.json(order, { status: 201 })
}
