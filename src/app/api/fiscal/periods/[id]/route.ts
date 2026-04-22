import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const period = await prisma.fiscalPosSession.findUnique({ where: { id } })
    if (!period) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(period)
  } catch (error) {
    console.error('[GET /api/fiscal/periods/[id]]', error)
    return NextResponse.json({ error: 'Failed to fetch period' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const period = await prisma.fiscalPosSession.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.totalSales !== undefined ? { totalSales: body.totalSales } : {}),
        ...(body.totalReturns !== undefined ? { totalReturns: body.totalReturns } : {}),
        ...(body.totalTax !== undefined ? { totalTax: body.totalTax } : {}),
        ...(body.cashDrawer !== undefined ? { cashDrawer: body.cashDrawer } : {}),
        ...(body.variance !== undefined ? { variance: body.variance } : {}),
      },
    })
    return NextResponse.json(period)
  } catch (error) {
    console.error('[PATCH /api/fiscal/periods/[id]]', error)
    return NextResponse.json({ error: 'Failed to update period' }, { status: 500 })
  }
}
