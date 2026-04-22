import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const priceList = await prisma.priceList.findUnique({
    where: { id },
    include: {
      lines: {
        include: { product: { select: { id: true, name: true, sku: true, salePrice: true } } },
        orderBy: { minQuantity: 'asc' },
      },
    },
  })
  if (!priceList) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(priceList)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const data: Record<string, unknown> = {}
  if (body.name !== undefined) data.name = body.name
  if (body.description !== undefined) data.description = body.description
  if (body.currency !== undefined) data.currency = body.currency
  if (body.isDefault !== undefined) data.isDefault = body.isDefault
  if (body.isActive !== undefined) data.isActive = body.isActive
  if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(body.startDate) : null
  if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null
  if (body.customerGroups !== undefined) {
    data.customerGroups = body.customerGroups ? JSON.stringify(body.customerGroups) : null
  }

  const priceList = await prisma.priceList.update({ where: { id }, data })
  return NextResponse.json(priceList)
}
