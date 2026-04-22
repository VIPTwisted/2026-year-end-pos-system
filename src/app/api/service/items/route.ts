import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const customerId = searchParams.get('customerId')
  const contractId = searchParams.get('contractId')
  const status = searchParams.get('status')

  const items = await prisma.serviceItem.findMany({
    where: {
      ...(customerId ? { customerId } : {}),
      ...(contractId ? { contractId } : {}),
      ...(status ? { status } : {}),
    },
    include: {
      customer: true,
      product: true,
      contract: true,
      serviceCases: { orderBy: { createdAt: 'desc' }, take: 3 },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    customerId, contractId, productId, serialNumber, description,
    status, warrantyStart, warrantyEnd, lastServiceDate, nextServiceDate, notes,
  } = body

  if (!customerId || !description) {
    return NextResponse.json({ error: 'customerId and description are required' }, { status: 400 })
  }

  const item = await prisma.serviceItem.create({
    data: {
      customerId,
      contractId: contractId ?? null,
      productId: productId ?? null,
      serialNumber: serialNumber ?? null,
      description,
      status: status ?? 'active',
      warrantyStart: warrantyStart ? new Date(warrantyStart) : null,
      warrantyEnd: warrantyEnd ? new Date(warrantyEnd) : null,
      lastServiceDate: lastServiceDate ? new Date(lastServiceDate) : null,
      nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : null,
      notes: notes ?? null,
    },
    include: { customer: true, product: true },
  })

  return NextResponse.json(item, { status: 201 })
}
