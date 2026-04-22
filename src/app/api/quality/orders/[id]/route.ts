import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.qualityOrder.findUnique({
    where: { id },
    include: {
      results: { orderBy: { createdAt: 'asc' } },
      nonConformances: {
        include: { correctiveActions: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let testGroup = null
  if (order.testGroupId) {
    testGroup = await prisma.qualityTestGroup.findUnique({
      where: { id: order.testGroupId },
      include: { tests: true },
    })
  }

  return NextResponse.json({ ...order, testGroup })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { status, inspectedBy, testGroupId, locationName } = body

  const updated = await prisma.qualityOrder.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(inspectedBy !== undefined ? { inspectedBy } : {}),
      ...(testGroupId !== undefined ? { testGroupId } : {}),
      ...(locationName !== undefined ? { locationName } : {}),
    },
    include: { results: true, nonConformances: true },
  })

  return NextResponse.json(updated)
}
