import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEFAULT_STEPS = [
  'Count Cash', 'Reconcile Cards', 'Review Voids', 'Review Discounts',
  'Submit Journal', 'Approve Transfers', 'Close Shift', 'Final Count',
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const storeId = searchParams.get('storeId')
  const status = searchParams.get('status')
  const businessDate = searchParams.get('businessDate')
  const where: Record<string, unknown> = {}
  if (storeId) where.storeId = storeId
  if (status) where.status = status
  if (businessDate) {
    const d = new Date(businessDate)
    const next = new Date(d); next.setDate(next.getDate() + 1)
    where.businessDate = { gte: d, lt: next }
  }
  const procedures = await prisma.dayEndProcedure.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(procedures)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const steps = DEFAULT_STEPS.map(name => ({ stepName: name, status: 'pending', completedBy: null, completedAt: null }))
  const procedure = await prisma.dayEndProcedure.create({
    data: {
      storeId: body.storeId, storeName: body.storeName,
      businessDate: new Date(body.businessDate),
      cashExpected: body.cashExpected ?? 0, cardTotal: body.cardTotal ?? 0,
      giftCardTotal: body.giftCardTotal ?? 0, totalSales: body.totalSales ?? 0,
      totalReturns: body.totalReturns ?? 0, totalDiscounts: body.totalDiscounts ?? 0,
      netSales: body.netSales ?? 0, steps: JSON.stringify(steps),
    },
  })
  return NextResponse.json(procedure, { status: 201 })
}
